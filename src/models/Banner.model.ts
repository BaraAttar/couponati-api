import { Schema, model, Document, Types } from 'mongoose';

export interface Banner extends Document {
  _id: Types.ObjectId;
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

// auto-increment order
bannerSchema.pre<Banner>('save', async function (next) {
  if (!this.isNew || (this.order && this.order > 0)) return next();

  try {
    const BannerModel = this.constructor as typeof Banner;
    const last = await BannerModel.findOne().sort({ order: -1 }).select('order').lean();
    this.order = last ? last.order + 1 : 1;
    next();
  } catch (err) {
    next(err as Error);
  }
});

export const Banner = model<Banner>('Banner', bannerSchema);
