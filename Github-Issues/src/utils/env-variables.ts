import { config } from 'dotenv';

config();

export const MONGODB_URI = process.env.MONGODB_URI as string;
export const PORT = process.env.PORT;