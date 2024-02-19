import { Document, Schema, model } from 'mongoose';
import { HttpError, HttpStatus } from '../utils/error-handlers';

interface CounterDocument extends Document {
  modelName: string;
  field: string;
  count: number;
}

const counterSchema = new Schema<CounterDocument>({
  modelName: {
    type: String,
    required: true
  },
  field: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    default: 0,
    required: true
  }
});

const Counter = model<CounterDocument>('Counter', counterSchema);

const initializeCounter = async (model: string, field: string) => {
  try {
    const counter = await Counter.findOne({ modelName: model, field: field });
    if (!counter) {
      await Counter.create({ modelName: model, field, counter: 0 });
    }
  } catch (err) {
    console.log(err); // dev
    const error = new HttpError(
      'Somthing went wrong, could not complete this request currently',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
    throw error;
  }
};

export { Counter, initializeCounter }
