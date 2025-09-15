import { Schema, model, Document, Types } from 'mongoose';

export interface Coupon extends Document {
    _id: Types.ObjectId;
    code: string;
    discount: number;
    usedCount?: number;
    description?: string;
    expiryDate?: Date;
    active: boolean;
    store: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const couponSchema = new Schema<Coupon>(
    {
        code: { type: String, required: true, trim: true },
        discount: { type: Number, required: true, min: 0, max: 100 },
        usedCount: { type: Number, default: 0 },
        description: { type: String, trim: true, default: '' },
        expiryDate: { type: Date },
        active: { type: Boolean, default: true },
        store: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
    },
    { timestamps: true }
);

export const Coupon = model<Coupon>('Coupon', couponSchema);
