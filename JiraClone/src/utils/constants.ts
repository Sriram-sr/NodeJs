import { config } from 'dotenv';

config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jira';
const PORT = process.env.PORT || 8080;
const JWT_SECURE_KEY = process.env.JWTSECUREKEY || 'SuperComplexToken';
const JWT_EXPIRY_TIME = process.env.JWTEXPIRY || '7d';

export { MONGODB_URI, PORT, JWT_SECURE_KEY, JWT_EXPIRY_TIME };
