// File Path: server/src/models/Sweet.ts

import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISweet extends Document {
  name: string;
  category: string;
  price: number;
  quantity: number;
}

const sweetSchema = new Schema<ISweet>({
  name: {
    type: String,
    required: [true, 'Please add a sweet name'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
  },
  quantity: {
    type: Number,
    required: [true, 'Please add a quantity'],
    default: 0,
  },
}, {
  timestamps: true,
});

export default mongoose.model<ISweet>('Sweet', sweetSchema);
