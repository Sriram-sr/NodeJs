import { Document, Schema, model } from 'mongoose';
import { UserDocument } from './User';
import { ProductDocument } from './Product';

type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  product: ProductDocument;
  qty: number;
  price: number;
}

interface Address {
  houseNo: string;
  street: string;
  city: string;
  landmark?: string;
  zip: number;
}

export interface OrderDocument extends Document {
  user: UserDocument;
  items: Array<OrderItem>;
  totalPrice: number;
  orderStatus: OrderStatus;
  shippingInfo?: Address;
}

const orderSchema = new Schema<OrderDocument>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    {
      product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      qty: {
        type: Number,
        required: true
      },
      price: {
        type: Number,
        required: true
      }
    }
  ],
  totalPrice: {
    type: Number,
    required: true
  },
  orderStatus: {
    type: String,
    default: 'processing',
    required: true
  },
  shippingInfo: {
    houseNo: {
      type: String,
      required: true
    },
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    landmark: String,
    zip: {
      type: Number,
      required: true
    }
  }
}, {
  timestamps: true
});

export default model<OrderDocument>('Order', orderSchema);
