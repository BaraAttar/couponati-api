import dotenv from 'dotenv';
if (process.env.NODE_ENV === 'test') {
    dotenv.config({ quiet: true });
} else {
    dotenv.config();
}

import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import type { Server } from 'node:http';
import { connectDB } from './database/connection.js';

// Routes
import authRoutes from "./routes/auth.routes.js"
import bannerRoutes from "./routes/banner.routes.js"
import categoryRoutes from "./routes/category.routes.js"
import storeRoutes from "./routes/store.routes.js"
import couponRoutes from "./routes/coupon.routes.js"

// VARIABLES
const port = process.env.PORT || 3000;
const app = express();

// Security & Middleware
app.use(helmet({}));
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req: Request, res: Response) => {
    res.send('Hello Express + TypeScript');
});

app.get('/error-test', () => {
    throw new Error('Forced error');
});

app.use("/auth", authRoutes);
app.use("/banner", bannerRoutes);
app.use("/category", categoryRoutes);
app.use("/store", storeRoutes);
app.use("/coupon", couponRoutes);

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
    connectDB().then(() => {
        app.listen(port, () => {
            console.log(`🟢 Server running on http://localhost:${port}`);
        });
    });
}