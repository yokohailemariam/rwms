import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // Extract tenantId from JWT claim (set by Passport after auth)
    const user = request.user;
    const tenantIdFromJwt = user?.tenantId;

    // Fall back to X-Tenant-ID header
    const tenantIdFromHeader = request.headers['x-tenant-id'];

    const tenantId = tenantIdFromJwt || tenantIdFromHeader;

    if (tenantId && !request.tenantContext) {
      request.tenantContext = { tenantId };
    }

    return next.handle();
  }
}
