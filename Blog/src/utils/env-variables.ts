import { config } from 'dotenv';

config();

export const MONGODB_URI = process.env.MONGODB_URI as string;
export const PORT = process.env.PORT || 8080;
export const JWTSECUREKEY = process.env.JWTSECUREKEY as string;
export const JWTEXPIRYTIME = process.env.JWTEXPIRYTIME;