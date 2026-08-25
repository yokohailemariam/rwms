import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponseDto } from '../dto/api-response.dto';

@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponseDto<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponseDto<T>> {
    const request = context.switchToHttp().getRequest();
    const correlationId = request.correlationId;

    return next.handle().pipe(
      map((data) => {
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
          return data;
        }
        return ApiResponseDto.success(data, undefined, correlationId);
      }),
    );
  }
}
