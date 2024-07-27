import { config } from 'dotenv';

config();

const MONGODB_URI = process.env.MOGODB_URI || 'mongodb://localhost:2017/jira';
const PORT = process.env.PORT || 8080;

export { MONGODB_URI, PORT };
