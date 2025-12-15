import { DailyStat } from "../models/DailyStat.model.js";
import { Coupon } from "../models/Coupon.model.js";

export type EntityType = 'Store' | 'Coupon';
export type ActionType = 'view' | 'action';

/**
 * تسجيل حدث جديد (مشاهدة أو تفاعل)
 */
export const trackEvent = async (
    entityId: string,
    entityType: EntityType,
    action: ActionType
) => {
    const today = new Date().toISOString().split('T')[0]; // "2023-10-27"

    const updateQuery = {
        $inc: action === 'view' ? { views: 1 } : { actions: 1 }
    };

    const analyticsPromise = DailyStat.findOneAndUpdate(
        { targetId: entityId, targetType: entityType, date: today },
        updateQuery,
        { upsert: true, new: true }
    );

    // إذا كان الحدث "تفاعل" (نسخ كود) والكائن "كوبون"، نزيد العداد التراكمي في جدول الكوبون نفسه
    let mainModelPromise;
    if (action === 'action' && entityType === 'Coupon') {
        mainModelPromise = Coupon.findByIdAndUpdate(entityId, { $inc: { usedCount: 1 } });
    }

    await Promise.all([analyticsPromise, mainModelPromise]);
};

/**
 * جلب بيانات الرسم البياني لآخر X أيام (للداشبورد)
 */
export const getDashboardChartData = async (days = 30) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    const stats = await DailyStat.aggregate([
        {
            $match: {
                date: { $gte: startStr, $lte: endStr }
            }
        },
        {
            $group: {
                _id: "$date",
                totalViews: { $sum: "$views" },
                totalActions: { $sum: "$actions" }
            }
        },
        {
            $project: {
                _id: 0,
                date: "$_id",
                totalViews: 1,
                totalActions: 1
            }
        },
        { $sort: { date: 1 } }
    ]);

    return stats;
};