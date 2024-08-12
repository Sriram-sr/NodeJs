import { Request, RequestHandler } from 'express';
import { verify, TokenExpiredError } from 'jsonwebtoken';
import { errorHandler, HttpStatus } from '../utils/error-handlers';
import { JWT_SECURE_KEY } from '../utils/constants';
import { UserDocument } from '../models/User';
import { ProjectDocument } from '../models/Project';

interface customRequest extends Request {
  email?: string;
  _id?: UserDocument;
  projectPrefix?: string;
  project?: ProjectDocument;
}

const isAuthenticated: RequestHandler = (req: customRequest, _, next) => {
  const [bearer, token] = req.headers.authorization?.split(' ') || [];
  if (!bearer || !token || bearer !== 'Bearer') {
    return errorHandler(
      'Authorization headers not found',
      HttpStatus.UNAUTHORIZED,
      next
    );
  }
  try {
    const decodedToken = verify(token, JWT_SECURE_KEY) as {
      email: string;
      _id: UserDocument;
    };
    if (!decodedToken) {
      return errorHandler(
        'Invalid JWT token or token may be expired',
        HttpStatus.UNAUTHORIZED,
        next
      );
    }
    req.email = decodedToken.email;
    req._id = decodedToken._id;
    next();
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      return errorHandler('JWT token expired', HttpStatus.UNAUTHORIZED, next);
    }
    errorHandler(
      'Something went wrong, cannot process this request',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

export { isAuthenticated as isAuth, customRequest };
