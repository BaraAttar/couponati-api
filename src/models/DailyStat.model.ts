import { Schema, model, Document, Types } from 'mongoose';

export interface DailyStat extends Document {
    targetId: Types.ObjectId;
    targetType: 'Store' | 'Coupon';
    date: string;
    views: number;
    actions: number;
}

const dailyStatSchema = new Schema<DailyStat>(
    {
        targetId: { type: Schema.Types.ObjectId, required: true, index: true },
        targetType: { type: String, required: true, enum: ['Store', 'Coupon'] },
        date: { type: String, required: true, index: true },
        views: { type: Number, default: 0 },
        actions: { type: Number, default: 0 }
    },
    { timestamps: false }
);

dailyStatSchema.index({ targetId: 1, targetType: 1, date: 1 }, { unique: true });

export const DailyStat = model<DailyStat>('DailyStat', dailyStatSchema);