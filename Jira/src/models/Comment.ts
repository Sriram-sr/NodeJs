import { Document, Schema, model } from 'mongoose';
import { UserDocument } from './User';
import { TaskDocument } from './Task';

interface CommentDocument extends Document {
    user: UserDocument;
    task: TaskDocument;
    content: string;
}

const commentSchema = new Schema<CommentDocument>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        task: {
            type: Schema.Types.ObjectId,
            ref: 'Task',
            required: true
        },
        content: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

const Comment = model<CommentDocument>('Comment', commentSchema);

export { Comment, CommentDocument };