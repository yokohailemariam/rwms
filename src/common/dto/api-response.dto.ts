import { randomUUID } from 'crypto';

export interface PaginationMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  nextCursor?: string;
  hasMore?: boolean;
}

export class ApiResponseDto<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: unknown };
  meta?: PaginationMeta;
  correlationId: string;
  timestamp: string;

  constructor() {
    this.correlationId = randomUUID();
    this.timestamp = new Date().toISOString();
  }

  static success<T>(
    data: T,
    meta?: PaginationMeta,
    correlationId?: string,
  ): ApiResponseDto<T> {
    const response = new ApiResponseDto<T>();
    response.success = true;
    response.data = data;
    if (meta) response.meta = meta;
    if (correlationId) response.correlationId = correlationId;
    return response;
  }

  static error(
    code: string,
    message: string,
    details?: unknown,
    correlationId?: string,
  ): ApiResponseDto<never> {
    const response = new ApiResponseDto<never>();
    response.success = false;
    response.error = { code, message, ...(details ? { details } : {}) };
    if (correlationId) response.correlationId = correlationId;
    return response;
  }
}
