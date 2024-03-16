import { RequestHandler, Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { UserInput } from '../models/User';

export const signupUser: RequestHandler = (
  req: Request,
  res: Response,
  _: NextFunction
) => {
  if (!validationResult(req).isEmpty()) {
    res.status(422).json({
      message: 'Input validation failed',
      data: validationResult(req).array()
    });
  }
  const { email, username, password } = req.body as UserInput;

  res.status(200).json({
    message: 'Input validation successful',
    inputFields: {
      email,
      username,
      password
    }
  });
};
