import mongoose from 'mongoose';
import dotenv from 'dotenv';

if (process.env.NODE_ENV === 'test') {
    dotenv.config({ quiet: true });
} else {
    dotenv.config();
}

mongoose.set('strictQuery', true);

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/couponati';

export const connectDB = async (): Promise<void> => {
    try {
        await mongoose.connect(uri);
        console.log('🟢 Connected to the database successfully');
    } catch (error) {
        console.error('🔴 DB connection failed:', error);
        process.exit(1);
    }
};