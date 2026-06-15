import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/infrastructure/database/database.service';
import { CreatePermissionDto } from './dto/create-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createPermission(dto: CreatePermissionDto) {
    return this.databaseService.permission.upsert({
      where: { name: dto.name },
      update: {
        module: dto.module,
        description: dto.description,
      },
      create: {
        name: dto.name,
        module: dto.module,
        description: dto.description,
      },
    });
  }

  async findAll() {
    return this.databaseService.permission.findMany({
      include: {
        rolePermissions: {
          include: {
            role: true,
          },
        },
        userPermissions: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async assignPermissionsToRole(roleId: string, permissions: string[]) {
    const role = await this.databaseService.role.findUnique({
      where: { id: roleId },
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const permRecords = await this.databaseService.permission.findMany({
      where: { name: { in: permissions } },
    });

    const data = permRecords.map((p) => ({
      roleId,
      permissionId: p.id,
    }));

    await this.databaseService.rolePermission.createMany({
      data,
      skipDuplicates: true,
    });

    return this.databaseService.role.findUnique({
      where: { id: roleId },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async removePermissionsFromRole(roleId: string, permissions: string[]) {
    const role = await this.databaseService.role.findUnique({
      where: { id: roleId },
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const permRecords = await this.databaseService.permission.findMany({
      where: { name: { in: permissions } },
    });

    await this.databaseService.rolePermission.deleteMany({
      where: {
        roleId,
        permissionId: {
          in: permRecords.map((p) => p.id),
        },
      },
    });

    return this.databaseService.role.findUnique({
      where: { id: roleId },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async assignPermissionsToUser(userId: string, permissions: string[]) {
    const user = await this.databaseService.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const permRecords = await this.databaseService.permission.findMany({
      where: { name: { in: permissions } },
    });

    const data = permRecords.map((p) => ({
      userId,
      permissionId: p.id,
    }));

    await this.databaseService.userPermission.createMany({
      data,
      skipDuplicates: true,
    });

    return this.databaseService.user.findUnique({
      where: { id: userId },
      include: {
        userPermissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async removePermissionsFromUser(userId: string, permissions: string[]) {
    const user = await this.databaseService.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const permRecords = await this.databaseService.permission.findMany({
      where: { name: { in: permissions } },
    });

    await this.databaseService.userPermission.deleteMany({
      where: {
        userId,
        permissionId: {
          in: permRecords.map((p) => p.id),
        },
      },
    });

    return this.databaseService.user.findUnique({
      where: { id: userId },
      include: {
        userPermissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }
}
