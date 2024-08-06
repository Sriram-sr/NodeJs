import { model, Schema } from 'mongoose';

const counterSchema = new Schema({
  modelName: {
    type: String,
    unique: true,
    required: true
  },
  fieldName: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    default: 0
  }
});

const Counter = model('Counter', counterSchema);

const initialiseCounter: (model: string, field: string) => void = async (
  model,
  field
) => {
  const existingCounter = await Counter.findOne({
    modelName: model,
    fieldName: field
  });
  if (!existingCounter) {
    await Counter.create({ modelName: model, fieldName: field, count: 0 });
  }
};

export { Counter, initialiseCounter };
