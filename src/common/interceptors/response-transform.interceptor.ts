import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponseDto } from '../dto/api-response.dto';
import { TenantRequest } from '../types/tenant-context.type';

@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponseDto<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponseDto<T>> {
    const request = context.switchToHttp().getRequest<TenantRequest>();
    const correlationId = request.correlationId;

    return next.handle().pipe(
      map((data: T): ApiResponseDto<T> => {
        // If already an ApiResponseDto, pass through
        if (data instanceof ApiResponseDto) {
          return data;
        }
        // If data has success property, it's already formatted
        if (
          data &&
          typeof data === 'object' &&
          'success' in data &&
          'timestamp' in data
        ) {
          return data as unknown as ApiResponseDto<T>;
        }
        return ApiResponseDto.success(data, undefined, correlationId);
      }),
    );
  }
}
