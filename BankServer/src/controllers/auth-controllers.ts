import { RequestHandler, Request, Response, NextFunction } from 'express';

export const signupUser: RequestHandler = (
  _: Request,
  res: Response,
  _1: NextFunction
) => {
  res.status(200).json({
    message: 'Router and everything works fine'
  });
};
