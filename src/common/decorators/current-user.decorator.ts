import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser } from '../types/jwt-payload.type';
import { TenantRequest } from '../types/tenant-context.type';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser | undefined => {
    const request = ctx.switchToHttp().getRequest<TenantRequest>();
    const user = request.user;
    return user ? { ...user, userId: user.sub } : undefined;
  },
);
