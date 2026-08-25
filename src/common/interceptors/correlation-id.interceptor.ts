import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { randomUUID } from 'crypto';

@Injectable()
export class CorrelationIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const correlationId = request.headers['x-correlation-id'] || randomUUID();
    request.correlationId = correlationId;
    response.setHeader('x-correlation-id', correlationId);

    return next.handle().pipe(
      tap(() => {
        response.setHeader('x-correlation-id', correlationId);
      }),
    );
  }
}
