import type { Request, Response } from "express";
import { getDashboardChartData } from "../../services/analytics.service.js";
import { Store } from "../../models/Store.model.js";
import { Coupon } from "../../models/Coupon.model.js";
import { User } from "../../models/User.model.js";
import { DailyStat } from "../../models/DailyStat.model.js";

// GET /admin/report/dashboard
export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        // 1. إحصائيات عامة (KPI Cards) + بيانات الشارت
        const [
            storesCount,
            activeCouponsCount,
            usersCount,
            chartData
        ] = await Promise.all([
            Store.countDocuments({ active: true }),
            Coupon.countDocuments({ active: true }),
            User.countDocuments({}),
            getDashboardChartData(90)
        ]);

        // حساب إجمالي التفاعلات من بيانات الشارت
        const totalActions = chartData.reduce((acc, curr) => acc + curr.totalActions, 0);

        return res.status(200).json({
            success: true,
            data: {
                kpi: {
                    stores: storesCount,
                    coupons: activeCouponsCount,
                    users: usersCount,
                    totalActions: totalActions
                },
                chart: chartData
            }
        });
    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// GET /admin/report/dashboard/top-coupons
export const getTopCoupons = async (req: Request, res: Response) => {
    try {
        const lang = req.language || 'en';
        const limit = Math.min(Number(req.query.limit) || 5, 20);

        const month = req.query.month ? String(req.query.month).padStart(2, '0') : null;
        const year = req.query.year ? String(req.query.year) : null;

        const matchQuery: any = {
            targetType: 'Coupon'
        };

        if (year && month) {
            matchQuery.date = { $regex: `^${year}-${month}` };
        }

        const aggregatedStats = await DailyStat.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: "$targetId",
                    totalActions: { $sum: "$actions" }
                }
            },
            { $sort: { totalActions: -1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: "coupons",
                    localField: "_id",
                    foreignField: "_id",
                    as: "couponInfo"
                }
            },
            {
                $unwind: {
                    path: "$couponInfo",
                    preserveNullAndEmptyArrays: true
                }
            }, {
                $lookup: {
                    from: "stores",
                    localField: "couponInfo.store",
                    foreignField: "_id",
                    as: "storeInfo"
                }
            },
            {
                $unwind: {
                    path: "$storeInfo",
                    preserveNullAndEmptyArrays: true
                }
            }, {
                $project: {
                    _id: 0,
                    id: "$_id",
                    code: "$couponInfo.code",
                    totalActions: 1,
                    storeIcon: { $ifNull: ["$storeInfo.icon", null] },
                    storeName: {
                        $ifNull: [
                            `$storeInfo.name.${lang}`,
                            { $ifNull: ["$storeInfo.name.en", "Unknown Store"] }
                        ]
                    }
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            message: "Top coupons retrieved successfully",
            meta: {
                filter: month && year ? `${year}-${month}` : 'all-time'
            },
            data: aggregatedStats
        });

    } catch (error) {
        console.error("getTopCoupons Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            ...(process.env.NODE_ENV === "development" && {
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        });
    }
};