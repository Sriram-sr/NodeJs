import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import { compare, hash } from 'bcryptjs';
import { verify, TokenExpiredError } from 'jsonwebtoken';
import {
  HttpStatus,
  validationHandler,
  errorHandler
} from '../utils/error-handlers';
import User, { UserDocument } from '../models/User';
import {
  ACCESS_TOKEN_EXPIRATION,
  REFRESH_TOKEN_EXPIRATION,
  JWTSECUREKEY
} from '../utils/env-variables';
import { customRequest } from '../middlewares/is-auth';

export const signupUser: RequestHandler = async (req, res, next) => {
  if (!validationResult(req).isEmpty()) {
    return validationHandler(validationResult(req).array(), next);
  }
  const { email, mobile, password, role } = req.body as {
    email: string;
    mobile: string;
    password: string;
    role: string;
  };

  try {
    const existingUser = await User.findOne({
      $or: [{ email: email }, { mobile: mobile }]
    });
    if (existingUser) {
      return errorHandler(
        'User already exists with this email/mobile',
        HttpStatus.CONFLICT,
        next
      );
    }
    const hashedPassword = await hash(password, 2);
    const user = await User.create({
      email,
      mobile,
      password: hashedPassword,
      role
    });
    res.status(HttpStatus.CREATED).json({
      message: 'Successfully registered user',
      user
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not signup currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

export const signinUser: RequestHandler = async (req, res, next) => {
  if (!validationResult(req).isEmpty()) {
    return validationHandler(validationResult(req).array(), next);
  }
  const { email, mobile, password } = req.body as {
    email?: string;
    mobile?: string;
    password: string;
  };

  try {
    const user = await User.findOne({
      $or: [{ email: email }, { mobile: mobile }]
    });
    if (!user) {
      return errorHandler(
        'User not found with this email/mobile',
        HttpStatus.NOT_FOUND,
        next
      );
    }

    const isMatch = compare(password, user.password);
    if (!isMatch) {
      return errorHandler(
        'Password do not match',
        HttpStatus.UNAUTHORIZED,
        next
      );
    }

    const accessToken = user.getJwtToken(ACCESS_TOKEN_EXPIRATION);
    const refreshToken = user.getJwtToken(REFRESH_TOKEN_EXPIRATION);
    res.status(HttpStatus.OK).json({
      message: 'Successfully logged in',
      accessToken,
      refreshToken
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not signin currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

export const getAccessToken: RequestHandler = async (
  req: customRequest,
  res,
  next
) => {
  const { token } = req.body as { token: string };
  if (!token) {
    return errorHandler(
      'Refresh token is required',
      HttpStatus.UNPROCESSABLE_ENTITY,
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
    const { userId } = decodedToken as { userId: UserDocument };
    const user = await User.findById(userId);
    const accessToken = user?.getJwtToken(ACCESS_TOKEN_EXPIRATION);
    res.status(HttpStatus.OK).json({
      message: 'Successfully generated access token',
      accessToken
    });
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      return errorHandler(
        'Refresh token got expired',
        HttpStatus.UNAUTHORIZED,
        next
      );
    }
    errorHandler(
      'Something went wrong, could not get token currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};
