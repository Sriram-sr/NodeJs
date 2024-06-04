import { config } from 'dotenv';

config();

export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jira';
export const PORT = process.env.PORT;