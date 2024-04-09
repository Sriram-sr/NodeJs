import { Document } from 'mongoose';

interface UserDocument extends Document {
    email: string;
    mobile: string;
    password: string;
    resetToken: string;
    resetTokenExpiry: Date;
}