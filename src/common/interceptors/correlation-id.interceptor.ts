import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { randomUUID } from 'crypto';
import { Response } from 'express';
import { TenantRequest } from '../types/tenant-context.type';

@Injectable()
export class CorrelationIdInterceptor implements NestInterceptor<unknown> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<TenantRequest>();
    const response = context.switchToHttp().getResponse<Response>();

    const headerValue = request.headers['x-correlation-id'];
    const correlationId =
      typeof headerValue === 'string' ? headerValue : randomUUID();
    request.correlationId = correlationId;
    response.setHeader('x-correlation-id', correlationId);

    return next.handle().pipe(
      tap(() => {
        response.setHeader('x-correlation-id', correlationId);
      }),
    );
  }
}
