import { Request, RequestHandler } from 'express';
import { verify } from 'jsonwebtoken';
import { errorHandler, HTTP_STATUS } from '../utils/error-handlers';
import { JWT_SECURE_KEY } from '../utils/env-variables';

export interface customReqBody extends Request {
  email?: string;
  userId?: string;
}

const isAuthenticated: RequestHandler = (req: customReqBody, _, next) => {
  const [bearer, token] = req.get('Authorization')?.split(' ') ?? [];
  if (bearer !== 'Bearer' || !token) {
    return errorHandler(
      'Invalid authorization header',
      HTTP_STATUS.UNAUTHORIZED,
      next
    );
  }
  let decodedTokenObj;
  try {
    decodedTokenObj = verify(token, JWT_SECURE_KEY) as {
      email: string;
      userId: string;
    };
  } catch (err) {
    return errorHandler(
      'Something went wrong, could not complete the request currently',
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
  if (!decodedTokenObj) {
    return errorHandler(
      'Invalid token or token may be expired',
      HTTP_STATUS.UNAUTHORIZED,
      next
    );
  }
  req.userId = decodedTokenObj.userId;
  req.email = decodedTokenObj.email;

  next();
};

export default isAuthenticated;
