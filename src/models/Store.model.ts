import { Schema, model, Document, Types } from 'mongoose';

export interface Store extends Document {
    _id: Types.ObjectId;
    name: {
        ar: string;
        en: string;
    };
    icon?: string;
    banner?: string;
    description?: {
        ar: string;
        en: string;
    };
    link?: string;
    active: boolean;
    order: number;
    category: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const storeSchema = new Schema<Store>(
    {
        name: {
            ar: { type: String, trim: true, required: [true, 'Arabic name is required'] },
            en: { type: String, trim: true, required: [true, 'English name is required'] },
        }, 
        icon: { type: String, trim: true, default: null },
        banner: { type: String, trim: true, default: null },
        description: {
            ar: { type: String, trim: true, default: '' },
            en: { type: String, trim: true, default: '' },
        },
        link: { type: String, trim: true, default: null },
        active: { type: Boolean, default: true },
        order: { type: Number, default: 0 },
        category: [{ type: Schema.Types.ObjectId, ref: 'Category', required: true }]

    },
    { timestamps: true }
);

// ✅ تحقق من الحقول اللغوية
storeSchema.pre('validate', function (next) {
    const ar = this.name?.ar?.trim() || '';
    const en = this.name?.en?.trim() || '';

    // الاسم: يجب أن يكون كلاهما موجودين
    if (!ar || !en) {
        this.invalidate('name', 'Arabic and English names are both required.');
    }

    // الوصف: كلاهما فارغ أو كلاهما ممتلئ
    const descAr = this.description?.ar?.trim() || '';
    const descEn = this.description?.en?.trim() || '';
    if ((descAr && !descEn) || (!descAr && descEn)) {
        this.invalidate('description', 'Both Arabic and English descriptions must be filled or both empty.');
    }

    next();
});

// توليد رقم ترتيب (order) تلقائي لكل متجر جديد
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
storeSchema.index({ 'name.ar': 1, 'name.en': 1, category: 1 });

export const Store = model<Store>('Store', storeSchema);