import { config } from 'dotenv';

config();

export const MONGODB_URI = process.env.MONGODB_URI as string;
export const PORT = process.env.PORT;
export const ServerErrorCode = process.env.SERVERERRORCODE;
export const JWT_SECURE_KEY = process.env.JWTSECUREKEY || 'SuperComplexToken';
export const JWT_EXPIRY_TIME = process.env.JWTEXPIRESIN;
