import { Schema, model, Document, Types } from 'mongoose';

export interface Category extends Document {
    _id: Types.ObjectId;
    name: {
        ar: string;
        en: string;
    };
    active: boolean;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

const categorySchema = new Schema<Category>(
    {
        name: {
            ar: { type: String, trim: true, required: [true, 'Arabic name is required'] },
            en: { type: String, trim: true, required: [true, 'English name is required'] },
        },
        active: { type: Boolean, default: true },
        order: { type: Number, default: 0 },
    },
    { timestamps: true }
);

categorySchema.pre('validate', function (next) {
    const ar = this.name?.ar?.trim() || '';
    const en = this.name?.en?.trim() || '';

    if (!ar || !en) {
        this.invalidate('name', 'Arabic and English names are both required.');
    }
    next();
});

// Pre-save middleware to set order automatically for new categories
categorySchema.pre<Category>('save', async function (next) {
    if (this.isNew && (this.order === undefined || this.order === 0)) {
        try {
            // Using this.constructor to avoid issues
            const CategoryModel = this.constructor as any;
            const lastCategory = await CategoryModel.findOne()
            .sort({ order: -1 })
            .select('order')
            .lean();

            this.order = lastCategory ? lastCategory.order + 1 : 1;
            next();
        } catch (err) {
            next(err as Error);
        }
    } else {
        next();
    }
});


// Add indexes for better performance
categorySchema.index({ active: 1, order: 1 });

export const Category = model<Category>('Category', categorySchema);