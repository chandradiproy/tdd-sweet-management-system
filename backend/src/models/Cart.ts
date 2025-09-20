// File Path: backend/src/models/Cart.ts
import mongoose, { Document, Schema, Types } from 'mongoose';

interface ICartItem {
  sweetId: Types.ObjectId;
  quantity: number;
}

export interface ICart extends Document {
  userId: Types.ObjectId;
  items: ICartItem[];
}

const CartItemSchema = new Schema<ICartItem>({
  sweetId: {
    type: Schema.Types.ObjectId,
    ref: 'Sweet',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
}, { _id: false }); // _id: false because this is a subdocument

const CartSchema = new Schema<ICart>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // Each user has only one cart
  },
  items: [CartItemSchema],
}, {
  timestamps: true,
});

export default mongoose.model<ICart>('Cart', CartSchema);