import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import { compare, hash } from 'bcryptjs';
import { verify, TokenExpiredError } from 'jsonwebtoken';
import {
  HttpStatus,
  validationHandler,
  errorHandler
} from '../utils/error-handlers';
import User, { UserDocument, generateToken } from '../models/User';
import {
  ACCESS_TOKEN_EXPIRATION,
  REFRESH_TOKEN_EXPIRATION,
  JWTSECUREKEY
} from '../utils/env-variables';
import { customRequest } from '../middlewares/is-auth';

const signupUser: RequestHandler = async (req, res, next) => {
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

const signinUser: RequestHandler = async (req, res, next) => {
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

    const isMatch = await compare(password, user.password);
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

const getAccessToken: RequestHandler = async (
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

const forgotPasswordHanldler: RequestHandler = async (req, res, next) => {
  if (!validationResult(req).isEmpty()) {
    return validationHandler(validationResult(req).array(), next);
  }
  const { email, mobile } = req.body as { email?: string; mobile?: string };

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
    const token = await generateToken(32);
    user.resetToken = token;
    user.resetTokenExpiry = new Date(Date.now() + 3600000);
    await user.save();
    res.status(HttpStatus.OK).json({
      message: 'Successfully generated token for resetting password',
      token
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not reset password currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

const resetPassword: RequestHandler = async (req, res, next) => {
  if (!validationResult(req).isEmpty()) {
    return validationHandler(validationResult(req).array(), next);
  }
  const { token, password } = req.body as { token: string; password: string };

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date(Date.now()) }
    });
    if (!user) {
      return errorHandler(
        'User not found with this token or token may be expired',
        HttpStatus.UNAUTHORIZED,
        next
      );
    }
    const updatedPassword = await hash(password, 2);
    user.password = updatedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    const updatedUser = await user.save();
    res.status(HttpStatus.OK).json({
      message: 'Successfully changed password',
      updatedUser
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not reset password currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

const getUserProfile: RequestHandler = async (req, res, next) => {
  if (!validationResult(req).isEmpty()) {
    return validationHandler(validationResult(req).array(), next);
  }
  const { mobile } = req.params as { mobile: string };

  try {
    const user = await User.findOne({ mobile: mobile }).select(
      'email mobile role'
    );
    // TODO: Need to populate shopping history
    if (!user) {
      return errorHandler(
        'User not found with this mobile',
        HttpStatus.NOT_FOUND,
        next
      );
    }
    res.status(HttpStatus.OK).json({
      message: 'Successfully fetched user profile',
      user
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not get profile currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

const getStaffs: RequestHandler = async (req, res, next) => {
  const { page } = req.query as { page?: number };
  const currentPage = page || 1;
  const perPage = 10;

  try {
    const staffs = await User.find({ role: 'staff' })
      .select('email mobile')
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
    res.status(HttpStatus.OK).json({
      message: 'Successfully fetched the staffs',
      staffs
    });
  } catch (err) {
    errorHandler(
      'Something went wrong, could not get staffs currently',
      HttpStatus.INTERNAL_SERVER_ERROR,
      next,
      err
    );
  }
};

export {
  signinUser,
  signupUser,
  getAccessToken,
  forgotPasswordHanldler,
  resetPassword,
  getUserProfile,
  getStaffs
};
