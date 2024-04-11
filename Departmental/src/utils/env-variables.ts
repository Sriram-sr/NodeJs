import { config } from 'dotenv';

config();

export const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/defaultdb';
export const PORT = process.env.PORT || 8080;
export const JWTSECUREKEY = process.env.JWTSECUREKEY || 'SuperComplexToken';
export const ACCESS_TOKEN_EXPIRATION =
  process.env.ACCESS_TOKEN_EXPIRATION || '15m';
export const REFRESH_TOKEN_EXPIRATION =
  process.env.REFRESH_TOKEN_EXPIRATION || '7d';
