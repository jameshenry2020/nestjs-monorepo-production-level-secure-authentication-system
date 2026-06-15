import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { DatabaseService } from 'src/infrastructure/database/database.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly databaseService: DatabaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const { user, organizationContext } = request;
    if (!user) {
      return false;
    }

    const permissionsSet = new Set<string>();

    // Evaluate permissions based on scope context
    if (organizationContext && organizationContext.type === 'ORGANIZATION') {
      // ORGANIZATION SCOPE: Only check organization-specific permissions from membership
      const role = organizationContext.role;
      if (role && role.rolePermissions) {
        role.rolePermissions.forEach((rp: any) => {
          if (rp.permission) permissionsSet.add(rp.permission.name);
        });
      }
    } else {
      // PERSONAL SCOPE: Check user's direct permissions and global role permissions
      const dbUser = await this.databaseService.user.findUnique({
        where: { id: user.id },
        include: {
          userPermissions: {
            include: {
              permission: true,
            },
          },
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

      if (dbUser) {
        // Add global role permissions
        if (dbUser.role && dbUser.role.rolePermissions) {
          dbUser.role.rolePermissions.forEach((rp) => {
            if (rp.permission) permissionsSet.add(rp.permission.name);
          });
        }
        // Add direct user permissions
        if (dbUser.userPermissions) {
          dbUser.userPermissions.forEach((up) => {
            if (up.permission) permissionsSet.add(up.permission.name);
          });
        }
      }
    }

    // Evaluate required permissions
    return requiredPermissions.every((permission) => {
      let permissionToCheck = permission;
      if (organizationContext && organizationContext.type === 'ORGANIZATION') {
        if (permission === 'project.create') permissionToCheck = 'org.projects.create';
        if (permission === 'project.read') permissionToCheck = 'org.projects.read';
      }
      return permissionsSet.has(permissionToCheck);
    });
  }
}
