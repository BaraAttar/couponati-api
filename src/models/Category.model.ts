import { Schema, model, Document, Types } from 'mongoose';

export interface Category extends Document {
    _id: Types.ObjectId;
    name: string;
    active: boolean;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

const categorySchema = new Schema<Category>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },
        active: { type: Boolean, default: true },
        order: { type: Number, default: 0 },
    },
    { timestamps: true }
);

// Pre-save middleware to set order automatically for new categories
categorySchema.pre<Category>('save', async function (next) {
    if (this.isNew && (this.order === undefined || this.order === 0)) {
        try {
            // Using this.constructor to avoid issues
            const CategoryModel = this.constructor as any;
            const lastCategory = await CategoryModel.findOne({}, { order: 1 })
                .sort({ order: -1 })
                .lean()
                .exec();

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