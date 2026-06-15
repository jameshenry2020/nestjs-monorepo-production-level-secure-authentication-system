import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/infrastructure/database/database.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { EMAIL_JOBS, EMAIL_QUEUE } from 'src/infrastructure/messaging/queues/queue.constant';
import { Queue } from 'bullmq';
import * as crypto from 'crypto';

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly databaseService: DatabaseService,
    @InjectQueue(EMAIL_QUEUE) private readonly emailQueue: Queue,
  ) {}

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  async create(userId: string, dto: CreateOrganizationDto) {
    const baseSlug = this.generateSlug(dto.name);
    let slug = baseSlug;
    let count = 0;

    // Ensure slug is unique
    while (true) {
      const existing = await this.databaseService.organization.findUnique({
        where: { slug },
      });
      if (!existing) break;
      count++;
      slug = `${baseSlug}-${count}`;
    }

    return this.databaseService.$transaction(async (tx) => {
      // 1. Create Organization
      const org = await tx.organization.create({
        data: {
          name: dto.name,
          slug,
        },
      });

      // 2. Retrieve pre-seeded organization-level permissions
      const orgPermissionsList = [
        'organisation.read',
        'organisation.update',
        'org.members.invite',
        'org.members.update',
        'org.members.delete',
        'org.projects.create',
        'org.projects.read',
        'org.projects.update',
        'org.projects.delete',
      ];

      const dbPerms = await tx.permission.findMany({
        where: {
          name: { in: orgPermissionsList },
        },
      });

      // 3. Create organization-specific 'owner' and 'member' roles
      const ownerRole = await tx.role.create({
        data: {
          name: 'owner',
          organizationId: org.id,
        },
      });

      const memberRole = await tx.role.create({
        data: {
          name: 'member',
          organizationId: org.id,
        },
      });

      // Link owner role permissions (Owner gets all organization permissions)
      await tx.rolePermission.createMany({
        data: dbPerms.map((p) => ({
          roleId: ownerRole.id,
          permissionId: p.id,
        })),
      });

      // Link member role permissions (Member gets a subset: read organization and read projects)
      const memberPermNames = ['organisation.read', 'org.projects.read'];
      const memberPerms = dbPerms.filter((p) => memberPermNames.includes(p.name));

      if (memberPerms.length > 0) {
        await tx.rolePermission.createMany({
          data: memberPerms.map((p) => ({
            roleId: memberRole.id,
            permissionId: p.id,
          })),
        });
      }

      // 4. Associate the creator user as 'owner'
      await tx.organizationMember.create({
        data: {
          organizationId: org.id,
          userId,
          roleId: ownerRole.id,
        },
      });

      return {
        ...org,
        roles: [ownerRole, memberRole],
      };
    });
  }

  async findAllForUser(userId: string) {
    return this.databaseService.organization.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            role: true,
          },
        },
      },
    });
  }

  async findMembers(orgId: string, userId: string) {
    // Check membership first
    const isMember = await this.databaseService.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: orgId,
          userId,
        },
      },
    });
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this organization');
    }

    return this.databaseService.organizationMember.findMany({
      where: { organizationId: orgId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        role: true,
      },
    });
  }

  async invite(inviterId: string, orgId: string, email: string) {
    // Check if inviter is owner
    const inviterMember = await this.databaseService.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: orgId,
          userId: inviterId,
        },
      },
      include: {
        role: true,
        user: true,
      },
    });

    if (!inviterMember || inviterMember.role.name !== 'owner') {
      throw new ForbiddenException('Only organization owners can invite new members');
    }

    const org = await this.databaseService.organization.findUnique({
      where: { id: orgId },
    });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    // Get the organization-specific 'member' role
    const memberRole = await this.databaseService.role.findFirst({
      where: {
        organizationId: orgId,
        name: 'member',
      },
    });
    if (!memberRole) {
      throw new NotFoundException('Organization member role not configured');
    }

    // Check if target is already a member
    const targetUser = await this.databaseService.user.findUnique({
      where: { email },
    });
    if (targetUser) {
      const alreadyMember = await this.databaseService.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: orgId,
            userId: targetUser.id,
          },
        },
      });
      if (alreadyMember) {
        throw new BadRequestException('User is already a member of this organization');
      }
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const invitation = await this.databaseService.organizationInvitation.upsert({
      where: {
        organizationId_email: {
          organizationId: orgId,
          email,
        },
      },
      update: {
        token,
        status: 'PENDING',
        expiresAt,
        invitedById: inviterId,
        roleId: memberRole.id,
      },
      create: {
        organizationId: orgId,
        email,
        token,
        expiresAt,
        invitedById: inviterId,
        roleId: memberRole.id,
      },
    });

    // Enqueue email invitation send job
    await this.emailQueue.add(EMAIL_JOBS.SEND_INVITATION_EMAIL, {
      email,
      orgName: org.name,
      inviterName: inviterMember.user.name || inviterMember.user.email,
      token,
    });

    return invitation;
  }

  async acceptInvite(userId: string, token: string) {
    const invite = await this.databaseService.organizationInvitation.findUnique({
      where: { token },
      include: {
        organization: true,
      },
    });

    if (!invite) {
      throw new NotFoundException('Invitation not found or invalid');
    }

    if (invite.status !== 'PENDING') {
      throw new BadRequestException(`Invitation is already ${invite.status.toLowerCase()}`);
    }

    if (new Date() > invite.expiresAt) {
      throw new BadRequestException('Invitation has expired');
    }

    // Find the user accepting it
    const user = await this.databaseService.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.email !== invite.email) {
      throw new ForbiddenException('This invitation was sent to a different email address');
    }

    return this.databaseService.$transaction(async (tx) => {
      // Create organization member
      const member = await tx.organizationMember.create({
        data: {
          organizationId: invite.organizationId,
          userId,
          roleId: invite.roleId,
        },
      });

      // Update invitation status
      await tx.organizationInvitation.update({
        where: { id: invite.id },
        data: { status: 'ACCEPTED' },
      });

      return member;
    });
  }

  async rejectInvite(userId: string, token: string) {
    const invite = await this.databaseService.organizationInvitation.findUnique({
      where: { token },
      include: {
        organization: true,
      },
    });

    if (!invite) {
      throw new NotFoundException('Invitation not found or invalid');
    }

    if (invite.status !== 'PENDING') {
      throw new BadRequestException(`Invitation is already ${invite.status.toLowerCase()}`);
    }

    const user = await this.databaseService.user.findUnique({
      where: { id: userId },
    });
    if (!user || user.email !== invite.email) {
      throw new ForbiddenException('This invitation was sent to a different email address');
    }

    return this.databaseService.organizationInvitation.update({
      where: { id: invite.id },
      data: { status: 'REJECTED' },
    });
  }

  async updateMemberRole(orgId: string, actorId: string, memberUserId: string, roleName: string) {
    // Check if actor is owner
    const actorMember = await this.databaseService.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: orgId,
          userId: actorId,
        },
      },
      include: {
        role: true,
      },
    });

    if (!actorMember || actorMember.role.name !== 'owner') {
      throw new ForbiddenException('Only organization owners can modify member roles');
    }

    // Find organization-specific role
    const targetRole = await this.databaseService.role.findFirst({
      where: {
        organizationId: orgId,
        name: roleName,
      },
    });
    if (!targetRole) {
      throw new NotFoundException(`Role ${roleName} not found in this organization`);
    }

    // Check if target member exists
    const targetMember = await this.databaseService.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: orgId,
          userId: memberUserId,
        },
      },
    });
    if (!targetMember) {
      throw new NotFoundException('Member not found in this organization');
    }

    // Prevent changing the last owner
    if (targetMember.roleId !== targetRole.id && actorId === memberUserId) {
      const ownerCount = await this.databaseService.organizationMember.count({
        where: {
          organizationId: orgId,
          role: {
            name: 'owner',
          },
        },
      });
      if (ownerCount <= 1) {
        throw new BadRequestException('Cannot change the role of the only owner');
      }
    }

    return this.databaseService.organizationMember.update({
      where: {
        organizationId_userId: {
          organizationId: orgId,
          userId: memberUserId,
        },
      },
      data: {
        roleId: targetRole.id,
      },
      include: {
        role: true,
      },
    });
  }

  async removeMember(orgId: string, actorId: string, memberUserId: string) {
    // Check if actor is owner or removing themselves
    const actorMember = await this.databaseService.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: orgId,
          userId: actorId,
        },
      },
      include: {
        role: true,
      },
    });

    const isSelf = actorId === memberUserId;

    if (!isSelf && (!actorMember || actorMember.role.name !== 'owner')) {
      throw new ForbiddenException('Only organization owners can remove other members');
    }

    // Check if target member exists
    const targetMember = await this.databaseService.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: orgId,
          userId: memberUserId,
        },
      },
      include: {
        role: true,
      },
    });
    if (!targetMember) {
      throw new NotFoundException('Member not found in this organization');
    }

    // Prevent removing the last owner
    if (targetMember.role.name === 'owner') {
      const ownerCount = await this.databaseService.organizationMember.count({
        where: {
          organizationId: orgId,
          role: {
            name: 'owner',
          },
        },
      });
      if (ownerCount <= 1) {
        throw new BadRequestException('Cannot remove the only owner of the organization');
      }
    }

    return this.databaseService.organizationMember.delete({
      where: {
        organizationId_userId: {
          organizationId: orgId,
          userId: memberUserId,
        },
      },
    });
  }
}
