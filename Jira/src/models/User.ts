import { Document } from 'mongoose';

interface UserDocument extends Document {
    email: string;
    password: string;
}