export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad Request', details = null, code = 'BAD_REQUEST') {
    super(message, 400, code, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', details = null, code = 'UNAUTHORIZED') {
    super(message, 401, code, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', details = null, code = 'FORBIDDEN') {
    super(message, 403, code, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', details = null, code = 'NOT_FOUND') {
    super(message, 404, code, details);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict', details = null, code = 'CONFLICT') {
    super(message, 409, code, details);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details = null) {
    super(message, 422, 'VALIDATION_ERROR', details);
  }
}
