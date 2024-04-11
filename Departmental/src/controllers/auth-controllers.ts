import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import { compare, hash } from 'bcryptjs';
import {
  HttpStatus,
  validationHandler,
  errorHandler
} from '../utils/error-handlers';
import User from '../models/User';
import {
  ACCESS_TOKEN_EXPIRATION,
  REFRESH_TOKEN_EXPIRATION
} from '../utils/env-variables';

export const signupUser: RequestHandler = (req, res, next) => {
  if (!validationResult(req).isEmpty()) {
    return validationHandler(validationResult(req).array(), next);
  }
  const serverErrMsg = 'Something went wrong, could not signup currently';

  const { email, mobile, password, role } = req.body as {
    email: string;
    mobile: string;
    password: string;
    role: string;
  };

  User.findOne({ $or: [{ email: email }, { mobile: mobile }] })
    .then(existingUser => {
      if (existingUser) {
        return errorHandler(
          'User already exists with this email/mobile',
          HttpStatus.CONFLICT,
          next
        );
      }
      hash(password, 2)
        .then(hashedPassword => {
          return User.create({
            email,
            mobile,
            password: hashedPassword,
            role
          });
        })
        .then(user => {
          res.status(HttpStatus.CREATED).json({
            message: 'Successfully registered user',
            user
          });
        })
        .catch(err => {
          errorHandler(
            serverErrMsg,
            HttpStatus.INTERNAL_SERVER_ERROR,
            next,
            err
          );
        });
    })
    .catch(err => {
      errorHandler(serverErrMsg, HttpStatus.INTERNAL_SERVER_ERROR, next, err);
    });
};

export const signinUser: RequestHandler = (req, res, next) => {
  if (!validationResult(req).isEmpty()) {
    return validationHandler(validationResult(req).array(), next);
  }
  const serverErrMsg = 'Something went wrong, could not signin currently';

  const { email, mobile, password } = req.body as {
    email?: string;
    mobile?: string;
    password: string;
  };
  User.findOne({ $or: [{ email: email }, { mobile: mobile }] })
    .then(user => {
      if (!user) {
        return errorHandler(
          'User not found with this email/mobile',
          HttpStatus.NOT_FOUND,
          next
        );
      }
      compare(password, user.password)
        .then(isMatch => {
          if (!isMatch) {
            return errorHandler(
              'Password do not match',
              HttpStatus.UNAUTHORIZED,
              next
            );
          }
          try {
            const accessToken = user.getJwtToken(ACCESS_TOKEN_EXPIRATION);
            const refreshToken = user.getJwtToken(REFRESH_TOKEN_EXPIRATION);
            
            res.status(HttpStatus.OK).json({
              message: 'Successfully logged in',
              accessToken,
              refreshToken
            });
          } catch (err) {
            errorHandler(
              serverErrMsg,
              HttpStatus.INTERNAL_SERVER_ERROR,
              next,
              err
            );
          }
        })
        .catch(err => {
          errorHandler(
            serverErrMsg,
            HttpStatus.INTERNAL_SERVER_ERROR,
            next,
            err
          );
        });
    })
    .catch(err => {
      errorHandler(serverErrMsg, HttpStatus.INTERNAL_SERVER_ERROR, next, err);
    });
};
