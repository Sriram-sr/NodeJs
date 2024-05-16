import { RequestHandler } from 'express';
import { customRequest } from './is-auth';
import User from '../models/User';
import { HttpStatus, errorHandler } from '../utils/error-handlers';

export const isAdminOrStaff: RequestHandler = async (
  req: customRequest,
  _,
  next
) => {
  const user = await User.findById(req.userId);
  if (!(user?.role === 'staff' || user?.role === 'admin')) {
    return errorHandler(
      'Only staff or admins can process this request',
      HttpStatus.FORBIDDEN,
      next
    );
  }
  next();
};
