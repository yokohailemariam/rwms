import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  Permission,
  PERMISSIONS_KEY,
  ROLE_PERMISSIONS,
} from '../constants/permissions.constant';
import { UserRole } from '../types/roles.enum';
import { ForbiddenException } from '../exceptions/domain.exception';
import { ERROR_CODES } from '../constants/error-codes.constant';
import { TenantRequest } from '../types/tenant-context.type';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<TenantRequest>();
    const user = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException(
        ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS,
        'You do not have permission to access this resource',
      );
    }

    const userPermissions = ROLE_PERMISSIONS[user.role as UserRole] || [];
    const hasPermission = requiredPermissions.every((perm) =>
      userPermissions.includes(perm),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS,
        'You do not have permission to access this resource',
      );
    }

    return true;
  }
}
