import { Request, RequestHandler } from 'express';
import { HttpStatus, errorHandler } from '../utils/error-handlers';
import { verify, TokenExpiredError } from 'jsonwebtoken';
import { JWTSECUREKEY } from '../utils/env-variables';
import { UserDocument, UserRole } from '../models/User';

export interface customRequest extends Request {
  userId?: UserDocument;
  role?: UserRole;
}

const isAuthenticated: RequestHandler = (req: customRequest, _, next) => {
  const [bearer, token] = req.headers.authorization?.split(' ') || [];
  if (!bearer || !token || bearer !== 'Bearer') {
    return errorHandler(
      'Authentication headers not found',
      HttpStatus.UNAUTHORIZED,
      next
    );
  }

  try {
    const decodedToken = verify(token, JWTSECUREKEY);
    if (!decodedToken) {
      return errorHandler(
        'Jwt token may be expired/invalid',
        HttpStatus.UNAUTHORIZED,
        next
      );
    }
    const { userId, role } = decodedToken as {
      userId: UserDocument;
      role: UserRole;
    };
    req.userId = userId;
    req.role = role;
    next();
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      return errorHandler('JWT token expired', HttpStatus.UNAUTHORIZED, next);
    }
    errorHandler(
      'Something went wrong, could not process this request currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

export default isAuthenticated;
