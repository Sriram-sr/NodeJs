import { Document, Types } from 'mongoose';
import { UserDocument } from './User';

interface IssueDocument extends Document {
  title: string;
  description: string;
  status: string;
  createdBy: UserDocument;
  fixedBy: Types.ObjectId;
  // TODO: More fields to add
}
