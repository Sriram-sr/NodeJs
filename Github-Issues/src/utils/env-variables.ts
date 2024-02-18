import { config } from 'dotenv';

config();

export const MONGODB_URI = process.env.MONGODB_URI as string;
export const PORT = process.env.PORT;
export const JWTSECUREKEY = process.env.JWTSECUREKEY || 'SuperComplexToken';
export const JWT_EXPIRY_TIME = process.env.JWTEXPIRESIN;
export const INTERNAL_SERVER_ERROR_CODE = process.env
  .SERVERERRORCODE as unknown as number;
