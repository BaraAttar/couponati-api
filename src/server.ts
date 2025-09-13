import dotenv from 'dotenv';
import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import { connectDB } from './database/connection.js'

if (process.env.NODE_ENV === 'test') {
    dotenv.config({ quiet: true });
} else {
    dotenv.config();
}

// Routes
import bannersRoutes from "./routes/bannersRoutes.js"
import type { Server } from 'node:http';

// VARIABLES Variables
const port = process.env.PORT || 3000;
const app = express();

// Middleware
app.use(express.json());
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError && "body" in err) {
        return res.status(400).json({
            success: false,
            message: "Invalid JSON in request body",
        });
    }
    next();
});

app.get('/', (req: Request, res: Response) => {
    res.send('Hello Express + TypeScript');
});

app.use("/banners", bannersRoutes);

let server: Server; // هنا نخزن السيرفر

connectDB().then(() => {
    server = app.listen(port, () => {
        console.log(`🟢 Server running on http://localhost:${port}`);
    });
});

export const closeServer = async () => {
    if (server) {
        await new Promise<void>((resolve, reject) => {
            server.close((err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }
};

export default app;
