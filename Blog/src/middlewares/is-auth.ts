import { RequestHandler, Request } from 'express';
import { verify } from 'jsonwebtoken';
import { HttpStatus, errorHandler } from '../utils/error-handlers';
import { JWTSECUREKEY } from '../utils/env-variables';
import { UserDocument } from '../models/User';

export interface CustomRequest extends Request {
  userId?: UserDocument;
  email?: string;
  username?: string;
  followUser?: UserDocument;
}

const isAuthenticated: RequestHandler = (req: CustomRequest, _, next) => {
  const [bearer, token] = req.headers.authorization?.split(' ') || [];

  if (!bearer || !token || bearer !== 'Bearer') {
    return errorHandler(
      'Authorization headers not found',
      HttpStatus.UNAUTHORIZED,
      next
    );
  }

  try {
    const decodedToken = verify(token, JWTSECUREKEY) as {
      userId: UserDocument;
      email: string;
      username: string;
    };
    if (!decodedToken) {
      return errorHandler(
        'Invalid token or token may be expired',
        HttpStatus.UNAUTHORIZED,
        next
      );
    }
    req.userId = decodedToken.userId;
    req.email = decodedToken.email;
    req.username = decodedToken.username;
    next();
  } catch (err) {
    errorHandler(
      'Something went wrong, could not process this request',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

export default isAuthenticated;
