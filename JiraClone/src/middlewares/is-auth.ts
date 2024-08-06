import { Request, RequestHandler } from 'express';
import { verify } from 'jsonwebtoken';
import { errorHandler, HttpStatus } from '../utils/error-handlers';
import { JWT_SECURE_KEY } from '../utils/constants';
import { UserDocument } from '../models/User';

interface customRequest extends Request {
  email?: string;
  _id?: UserDocument;
  projectPrefix?: string;
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
    errorHandler(
      'Something went wrong, cannot process this request',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

export { isAuthenticated as isAuth, customRequest };
