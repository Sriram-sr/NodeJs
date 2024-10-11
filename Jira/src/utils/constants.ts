import { config } from 'dotenv';
config();
export const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jira';
export const PORT = process.env.PORT || 8080;
export const JWT_SECURE_KEY = process.env.JWTSECUREKEY || 'SuperComplexToken';
export const JWT_EXPIRY_TIME = process.env.JWTEXPIRESIN || '7d';
