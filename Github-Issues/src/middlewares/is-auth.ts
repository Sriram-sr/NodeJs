import { Request, RequestHandler } from 'express';
import { verify } from 'jsonwebtoken';
import { HttpStatus, errorHandler } from '../utils/error-handlers';
import { JWTSECUREKEY } from '../utils/env-variables';
import { UserDocument } from '../models/User';
import { LabelDocument } from '../models/Label';
import { IssueDocument } from '../models/Issue';

export interface customRequest extends Request {
  email?: string;
  username?: string;
  userId?: UserDocument;
  reviewers?: Array<UserDocument>;
  assignees?: Array<UserDocument>;
  labelIds?: Array<LabelDocument>;
  issue?: IssueDocument;
  assignee?: UserDocument;
  labelNames?: Array<string>;
}

const isAuthenticated: RequestHandler = (req: customRequest, _, next) => {
  const [bearer, token] = req.get('Authorization')?.split(' ') || [];
  if (bearer !== 'Bearer' || !token) {
    return errorHandler(
      'Authorization headers not found',
      HttpStatus.UNAUTHORIZED,
      next
    );
  }
  try {
    const decodedToken = verify(token, JWTSECUREKEY) as {
      email: string;
      username: string;
      userId: UserDocument;
    };
    if (!decodedToken) {
      return errorHandler(
        'Invalid auth token or token may be expired',
        HttpStatus.UNAUTHORIZED,
        next
      );
    }
    req.email = decodedToken.email;
    req.username = decodedToken.username;
    req.userId = decodedToken.userId;
  } catch (err) {
    errorHandler(
      'Something went wrong, could not process this request currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }

  next();
};

export default isAuthenticated;
