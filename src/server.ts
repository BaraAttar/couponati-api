import './config/env.js';

import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { apiRateLimiter } from "./middleware/rateLimiter.js";
import cors from 'cors';
import helmet from 'helmet';
import { connectDB } from './database/connection.js';
import { languageMiddleware } from './middleware/languageMiddleware.js';

// 🔵 Auth Routes
import adminAuthRoutes from "./routes/admin/admin.auth.routes.js"
import authRoutes from "./routes/user/user.auth.routes.js"

// 🔴 Admin Routes (Dashboard)
import adminBannerRoutes from "./routes/admin/admin.banner.routes.js";
import adminCategoryRoutes from "./routes/admin/admin.category.routes.js";
import adminStoreRoutes from "./routes/admin/admin.store.routes.js";
import adminCouponRoutes from "./routes/admin/admin.coupon.routes.js";

// 🌐 Public Routes (General Access)
import bannerRoutes from "./routes/public/banner.routes.js"
import categoryRoutes from "./routes/public/category.routes.js"
import storeRoutes from "./routes/public/store.routes.js"
import couponRoutes from "./routes/public/coupon.routes.js"

// 🟢 User Routes (Protected)
import userStoreRoutes from "./routes/user/user.store.routes.js"

// Reports & Analytics Routes
import adminReportRoutes from "./routes/admin/admin.report.routes.js";
import analyticsRoutes from "./routes/public/analytics.routes.js";

// VARIABLES
const port = process.env.PORT || 3000;
const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');

// Security & Middleware
app.use(express.json());
app.use(helmet({}));
app.use(cors());
app.use(languageMiddleware)
app.use("/", apiRateLimiter);

// Routes
app.get('/', (req: Request, res: Response) => {
    res.send('Hello Express + TypeScript');
});

app.get('/error-test', (req: Request, res: Response) => {
    throw new Error('Forced error');
});

// 🔵 Auth Routes
app.use("/admin/auth", adminAuthRoutes);
app.use("/auth", authRoutes);

// 🔴 Admin Routes (Dashboard)
app.use("/admin/banner", adminBannerRoutes);
app.use("/admin/category", adminCategoryRoutes);
app.use("/admin/store", adminStoreRoutes);
app.use("/admin/coupon", adminCouponRoutes);
app.use("/admin/report", adminReportRoutes);

// 🌐 Public Routes (General Access)
app.use("/banner", bannerRoutes);
app.use("/category", categoryRoutes);
app.use("/store", storeRoutes);
app.use("/coupon", couponRoutes);
app.use("/analytics", analyticsRoutes);


// 🟢 User Routes (Protected)
app.use("/user/store", userStoreRoutes);

// Error handling middleware 
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError && "body" in err) {
        return res.status(400).json({
            success: false,
            message: "Invalid JSON in request body",
        });
    }

    console.error("🔥 Unexpected error:", err);
    res.status(500).json({
        success: false,
        message: "Internal server error",
    });
});

export { app };

if (process.env.NODE_ENV != "test") {
    connectDB()
        .then(() => {
            app.listen(port, () => {
                console.log(`🟢 Server running on http://localhost:${port}`);
            });
        }).catch(err => {
            console.error("DB connection failed:", err);
            process.exit(1);
        });
}