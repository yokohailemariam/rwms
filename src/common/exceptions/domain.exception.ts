export class DomainException extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(code: string, message: string, statusCode: number = 400) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class NotFoundException extends DomainException {
  constructor(code: string, message: string) {
    super(code, message, 404);
  }
}

export class ConflictException extends DomainException {
  constructor(code: string, message: string) {
    super(code, message, 409);
  }
}

export class ForbiddenException extends DomainException {
  constructor(code: string, message: string) {
    super(code, message, 403);
  }
}

export class ValidationException extends DomainException {
  public readonly details?: any;

  constructor(code: string, message: string, details?: any) {
    super(code, message, 400);
    this.details = details;
  }
}

export class UnauthorizedException extends DomainException {
  constructor(code: string, message: string) {
    super(code, message, 401);
  }
}
