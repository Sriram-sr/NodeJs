import { NextFunction } from 'express';
import { ValidationError } from 'express-validator';

export class HttpError extends Error {
  statusCode: number;
  data: any[] = [];

  constructor(message: string, errorCode: number) {
    super(message);
    this.statusCode = errorCode;
  }
}

export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503
}

export const validationHandler = (
  errors: ValidationError[],
  next: NextFunction
) => {
  const validationError = new HttpError(
    'Input validation error',
    HttpStatus.UNPROCESSABLE_ENTITY
  );
  validationError.data = errors;
  next(validationError);
};

export const errorHandler = (
  message: string,
  errorCode: number,
  next: NextFunction,
  err?: any
) => {
  if (err) console.log(err);
  const error = new HttpError(message, errorCode);
  next(error);
};
