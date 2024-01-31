import { RequestHandler } from 'express';
import { hash } from 'bcryptjs';
import {
  checkValidationErrors,
  errorHandler,
  HTTP_STATUS
} from '../utils/error-handlers';
import User, { UserProto } from '../models/User';

// @route   /api/v1/auth/signup
// @desc    Registers user
// @access  Public
export const signupUser: RequestHandler = (req, res, next) => {
  checkValidationErrors(req);
  const serverErrorMsg = 'Something went wrong, could not signup currently';
  const { email, username, password, role } = req.body as UserProto;

  User.findOne({ $or: [{ email: email }, { username: username }] })
    .then(existingUser => {
      if (existingUser) {
        return errorHandler('User already exists', HTTP_STATUS.CONFLICT, next);
      }
      hash(password, 2)
        .then(hashedPassword => {
          return User.create({
            email,
            username,
            password: hashedPassword,
            role
          });
        })
        .then(newUser => {
          res.status(HTTP_STATUS.CREATED).json({
            message: 'Successfully registered user',
            newUser
          });
        })
        .catch(err =>
          errorHandler(
            serverErrorMsg,
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            next,
            err
          )
        );
    })
    .catch(err =>
      errorHandler(serverErrorMsg, HTTP_STATUS.INTERNAL_SERVER_ERROR, next, err)
    );
};
