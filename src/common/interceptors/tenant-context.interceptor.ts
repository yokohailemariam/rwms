import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { TenantRequest } from '../types/tenant-context.type';

@Injectable()
export class TenantContextInterceptor implements NestInterceptor<unknown> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<TenantRequest>();

    // Extract tenantId from JWT claim (set by Passport after auth)
    const user = request.user;
    const tenantIdFromJwt = user?.tenantId;

    // Fall back to X-Tenant-ID header
    const tenantIdFromHeader = request.headers['x-tenant-id'];

    const tenantId =
      tenantIdFromJwt ||
      (typeof tenantIdFromHeader === 'string' ? tenantIdFromHeader : undefined);

    if (tenantId && !request.tenantContext) {
      request.tenantContext = { tenantId };
    }

    return next.handle();
  }
}
