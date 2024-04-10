import { Document, Schema, model } from 'mongoose';
import { ProductDocument } from './Product';

interface CategoryDocument extends Document {
  categoryName: string;
  products?: Array<ProductDocument>;
}

const categorySchema = new Schema<CategoryDocument>({
  categoryName: {
    type: String,
    required: true
  },
  products: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Product'
    }
  ]
});

export default model<CategoryDocument>('Category', categorySchema);
