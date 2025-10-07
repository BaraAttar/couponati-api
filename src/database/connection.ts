import mongoose from 'mongoose';
import dotenv from 'dotenv';

if (process.env.NODE_ENV === 'test') {
    dotenv.config({ quiet: true });
} else {
    dotenv.config();
}

mongoose.set('strictQuery', true);
mongoose.set('sanitizeFilter', true);

let uri = process.env.MONGODB_URI;
if (!uri) {
    if (process.env.NODE_ENV === 'production') {
        console.error('❌ MONGODB_URI is required in production');
        process.exit(1);
    }
    uri = 'mongodb://localhost:27017/couponati';
}

export const connectDB = async (): Promise<void> => {
    try {
        await mongoose.connect(uri, {
            retryWrites: true,
            w: 'majority',
            serverSelectionTimeoutMS: 10000
        });
        console.log('🟢 Connected to the database successfully');
    } catch (error) {
        console.error('🔴 DB connection failed:', error);
        process.exit(1);
    }
};