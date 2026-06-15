import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from 'src/infrastructure/database/database.service';

@Injectable()
export class OrganizationContextGuard implements CanActivate {
  constructor(private readonly databaseService: DatabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { user } = request;
    
    if (!user) {
      // Must be run after JwtAuthGuard
      return true;
    }

    const orgId =
      request.headers['x-organization-id'] ||
      request.headers['X-Organization-Id'] ||
      request.params.orgId;

    if (orgId && typeof orgId === 'string') {
      const membership = await this.databaseService.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: orgId,
            userId: user.id,
          },
        },
        include: {
          organization: true,
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      if (!membership) {
        throw new ForbiddenException('You do not have access to this organization scope');
      }

      // Attach context to request
      request.organizationContext = {
        type: 'ORGANIZATION',
        organizationId: orgId,
        organization: membership.organization,
        role: membership.role,
      };
    } else {
      // Default to personal scope
      request.organizationContext = {
        type: 'PERSONAL',
        organizationId: null,
        organization: null,
        role: null,
      };
    }

    return true;
  }
}
