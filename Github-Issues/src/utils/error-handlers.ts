import { NextFunction } from 'express';
import { ValidationError } from 'express-validator';

export class HttpError extends Error {
  statusCode: number;
  data: object = {};

  constructor(message: string, errorCode: number) {
    super(message);
    this.statusCode = errorCode;
  }
}

export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  UNPROCESSABLE_ENTITY = 422
}

export const errorHandler = (
  message: string,
  errorCode: number,
  next: NextFunction,
  err?: unknown
) => {
  if (err) {
    console.log(err);
  }
  const error = new HttpError(message, errorCode);
  next(error);
};

export const validationErrorHandler = (
  errors: ValidationError[],
  next: NextFunction
) => {
  const error = new HttpError(
    'Input fields validation failed',
    HttpStatus.UNPROCESSABLE_ENTITY
  );
  error.data = errors;
  next(error);
};
