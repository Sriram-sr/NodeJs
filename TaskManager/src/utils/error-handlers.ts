import { NextFunction } from 'express';
import { ValidationError } from 'express-validator';

export enum HTTP_STATUS {
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

export class HttpError extends Error {
  statusCode: number;
  data: object = {};

  constructor(message: string, errorCode: number) {
    super(message);
    this.statusCode = errorCode;
  }
}

export const errorHandler = (
  message: string,
  errorCode: number,
  next: NextFunction,
  err?: any
) => {
  if (err) {
    console.log(err);
  }
  const error = new HttpError(message, errorCode);
  next(error);
};

export const checkValidationErrors = (
  next: NextFunction,
  errors: ValidationError[]
) => {
  const error = new HttpError(
    'Input field validation failure',
    HTTP_STATUS.UNPROCESSABLE_ENTITY
  );
  error.data = errors;
  next(error);
};
