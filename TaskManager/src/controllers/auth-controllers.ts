import { RequestHandler } from 'express';
import { hash, compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import {
  checkValidationErrors,
  errorHandler,
  HTTP_STATUS
} from '../utils/error-handlers';
import User, { UserDocument } from '../models/User';
import { JWT_SECURE_KEY, JWT_EXPIRY_TIME } from '../utils/env-variables';

// @route   /api/v1/auth/signup
// @desc    Registers user
// @access  Public
export const signupUser: RequestHandler = (req, res, next) => {
  checkValidationErrors(req);
  const serverErrorMsg = 'Something went wrong, could not signup currently';
  const { email, username, password } = req.body as UserDocument;

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
            password: hashedPassword
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

// @route   /api/v1/auth/signin
// @desc    Logins user
// @access  Public
export const signinUser: RequestHandler = (req, res, next) => {
  checkValidationErrors(req);
  const serverErrorMsg = 'Something went wrong, could not signin currently';
  const { email, username, password } = req.body as {
    email?: string;
    username?: string;
    password: string;
  };

  User.findOne({ $or: [{ email: email }, { username: username }] })
    .then(user => {
      if (!user) {
        return errorHandler(
          'User not found with this email/username',
          HTTP_STATUS.UNAUTHORIZED,
          next
        );
      }
      compare(password, user.password)
        .then(isMatch => {
          if (!isMatch) {
            return errorHandler(
              'Enter a valid password',
              HTTP_STATUS.UNAUTHORIZED,
              next
            );
          }
          let token;
          try {
            token = sign(
              { email: user.email, userId: user._id.toString() },
              JWT_SECURE_KEY,
              { expiresIn: JWT_EXPIRY_TIME }
            );
          } catch (err) {
            return errorHandler(
              serverErrorMsg,
              HTTP_STATUS.INTERNAL_SERVER_ERROR,
              next,
              err
            );
          }
          res.status(HTTP_STATUS.OK).json({
            message: 'Successfully logged in user',
            user,
            token
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
