import { config } from 'dotenv';

config();

const MONGODB_URI = process.env.MOGODB_URI || 'mongodb://localhost:2017/jira';
const PORT = process.env.PORT || 8080;
const JWT_SECURE_KEY = process.env.JWTSECUREKEY || 'SuperComplexToken';
const JWT_EXPIRY_TIME = process.env.JWTEXPIRY || '10h';

export { MONGODB_URI, PORT, JWT_SECURE_KEY, JWT_EXPIRY_TIME };
