import { Schema, model, Document } from 'mongoose';

export interface Banner extends Document {
  name: string;
  image: string;
  link?: string;
  active: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const bannerSchema = new Schema<Banner>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
      trim: true,
      default: null,
    },
    active: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, 
  }
);

export const Banner = model<Banner>('Banner', bannerSchema);
