import { NextFunction } from 'express';
import { ValidationError } from 'express-validator';

const HttpStatus = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

class HttpError extends Error {
  statusCode: number;
  data: any = {};

  constructor(message: string, errorCode: number) {
    super();
    this.message = message;
    this.statusCode = errorCode;
  }
}

const inputValidationHandler = (
  errors: ValidationError[],
  next: NextFunction
) => {
  const error = new HttpError(
    'Input validation failed',
    HttpStatus.UNPROCESSABLE_ENTITY
  );
  error.data = errors;
  next(error);
};

const errorHandler: (
  message: string,
  errorCode: number,
  next: NextFunction,
  err?: any
) => void = (message, errorCode, next, err) => {
  if (err) {
    console.log(err);
  }
  const error = new HttpError(message, errorCode);
  next(error);
};

export { HttpStatus, inputValidationHandler, HttpError, errorHandler };