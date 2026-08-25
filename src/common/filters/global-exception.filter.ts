import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponseDto } from '../dto/api-response.dto';
import { DomainException } from '../exceptions/domain.exception';
import { ERROR_CODES } from '../constants/error-codes.constant';
import { TenantRequest } from '../types/tenant-context.type';
import { getErrorStack } from '../utils/error.util';

interface HttpExceptionBody {
  message?: string | string[];
  error?: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<TenantRequest>();
    const correlationId = request.correlationId;
    const isProduction = process.env.NODE_ENV === 'production';

    let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode: string = ERROR_CODES.INTERNAL_ERROR;
    let message = 'An unexpected error occurred';
    let details: unknown = undefined;

    if (exception instanceof DomainException) {
      statusCode = exception.statusCode;
      errorCode = exception.code;
      message = exception.message;
      details =
        'details' in exception
          ? (exception as { details?: unknown }).details
          : undefined;
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as HttpExceptionBody;
        const responseMessage =
          typeof resp.message === 'string' || Array.isArray(resp.message)
            ? resp.message
            : exception.message;
        if (Array.isArray(responseMessage)) {
          details = responseMessage;
          message = 'Validation failed';
          errorCode = ERROR_CODES.VALIDATION_ERROR;
        } else {
          message = responseMessage;
          errorCode =
            typeof resp.error === 'string'
              ? resp.error
              : ERROR_CODES.BAD_REQUEST;
        }
      } else {
        message = String(exceptionResponse);
      }
      if (statusCode === Number(HttpStatus.NOT_FOUND))
        errorCode = ERROR_CODES.NOT_FOUND;
      if (statusCode === Number(HttpStatus.FORBIDDEN))
        errorCode = ERROR_CODES.FORBIDDEN;
      if (statusCode === Number(HttpStatus.UNAUTHORIZED))
        errorCode = ERROR_CODES.AUTH_TOKEN_INVALID;
    } else if (exception instanceof Error) {
      if (statusCode >= 500) {
        this.logger.error(
          `Unhandled error: ${exception.message}`,
          isProduction ? undefined : getErrorStack(exception),
          { correlationId, path: request.url, method: request.method },
        );
      }
      message = isProduction
        ? 'An unexpected error occurred'
        : exception.message;
    }

    if (statusCode >= 500) {
      this.logger.error(`${statusCode} ${request.method} ${request.url}`, {
        correlationId,
        errorCode,
        message,
      });
    }

    const errorResponse = ApiResponseDto.error(
      errorCode,
      message,
      details,
      correlationId,
    );

    response.status(statusCode).json(errorResponse);
  }
}
