import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TenantContext, TenantRequest } from '../types/tenant-context.type';

export const CurrentTenant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): TenantContext | undefined => {
    const request = ctx.switchToHttp().getRequest<TenantRequest>();
    return request.tenantContext;
  },
);
