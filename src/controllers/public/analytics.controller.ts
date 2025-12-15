import type { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { trackEvent } from "../../services/analytics.service.js";

// POST /analytics/track
export const trackUserAction = async (req: Request, res: Response) => {
    try {
        const { id, type, action } = req.body;

        if (!id || !isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: "Invalid ID" });
        }

        if (!['Store', 'Coupon'].includes(type)) {
            return res.status(400).json({ success: false, message: "Invalid type" });
        }

        if (!['view', 'action'].includes(action)) {
            return res.status(400).json({ success: false, message: "Invalid action" });
        }

        // تنفيذ التسجيل في الخلفية (بدون await) لعدم تأخير استجابة السيرفر
        trackEvent(id, type, action).catch(err => console.error("Track Error:", err));

        return res.status(200).json({ success: true, message: "Tracked" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};