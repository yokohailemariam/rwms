import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../types/roles.enum';
import { ROLES_KEY } from '../constants/permissions.constant';
import { ForbiddenException } from '../exceptions/domain.exception';
import { ERROR_CODES } from '../constants/error-codes.constant';
import { TenantRequest } from '../types/tenant-context.type';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
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

    const userRole = user.role as UserRole;
    const hasRole = requiredRoles.includes(userRole);
    if (!hasRole) {
      throw new ForbiddenException(
        ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS,
        'You do not have permission to access this resource',
      );
    }

    return true;
  }
}
