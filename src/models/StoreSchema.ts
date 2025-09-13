import { Schema, model, Document, Types } from 'mongoose';

export interface Store extends Document {
    name: string;
    icon?: string;
    banner?: string;
    description?: string;
    link?: string;
    active: boolean;
    order: number;
    category: Types.ObjectId; // reference to Category
    coupons: Types.ObjectId[]; // array of coupon references
    createdAt: Date;
    updatedAt: Date;
}

const storeSchema = new Schema<Store>(
    {
        name: { type: String, required: true, trim: true },
        icon: { type: String, trim: true, default: null },
        banner: { type: String, trim: true, default: null },
        link: { type: String, trim: true, default: null },
        active: { type: Boolean, default: true },
        order: { type: Number, default: 0 },
        category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
        coupons: [{ type: Schema.Types.ObjectId, ref: 'Coupon' }],
    },
    { timestamps: true }
);

// Indexes for faster queries
storeSchema.index({ active: 1, order: 1 });
storeSchema.index({ category: 1 });

export const Store = model<Store>('Store', storeSchema);
