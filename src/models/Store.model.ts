import { Schema, model, Document, Types } from 'mongoose';

export interface Store extends Document {
    _id: Types.ObjectId;
    name: string;
    icon?: string;
    banner?: string;
    description?: string;
    link?: string;
    active: boolean;
    order: number;
    category: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const storeSchema = new Schema<Store>(
    {
        name: { type: String, required: true, trim: true },
        icon: { type: String, trim: true, default: null },
        banner: { type: String, trim: true, default: null },
        description: { type: String, trim: true, default: '' },
        link: { type: String, trim: true, default: null },
        active: { type: Boolean, default: true },
        order: { type: Number, default: 0 },
        category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    },
    { timestamps: true }
);

// Pre-save middleware محسن لتجنب المشاكل
storeSchema.pre<Store>('save', async function (next) {
    if (this.isNew && (this.order === undefined || this.order === 0)) {
        try {
            // استخدام this.constructor بدلاً من Store لتجنب المشاكل
            const StoreModel = this.constructor as any;
            const lastStore = await StoreModel.findOne({}, { order: 1 })
                .sort({ order: -1 })
                .lean()
                .exec();

            this.order = lastStore ? lastStore.order + 1 : 1;
            next();
        } catch (err) {
            next(err as Error);
        }
    } else {
        next();
    }
});

storeSchema.virtual('coupons', {
    ref: 'Coupon',
    localField: '_id',
    foreignField: 'store',
});

storeSchema.set('toJSON', { virtuals: true });
storeSchema.set('toObject', { virtuals: true });

// إضافة index مركب للأداء الأفضل
storeSchema.index({ active: 1, order: 1 });
storeSchema.index({ category: 1, active: 1 });
storeSchema.index({ name: 1, category: 1 }, { unique: true }); // منع التكرار

export const Store = model<Store>('Store', storeSchema);