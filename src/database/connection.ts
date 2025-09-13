import mongoose from 'mongoose';
import dotenv from 'dotenv';

if (process.env.NODE_ENV === 'test') {
    dotenv.config({ quiet: true });
} else {
    dotenv.config();
}

interface DbConnectionOptions {
    uri: string;
    options?: mongoose.ConnectOptions;
}

let uri: string;
if (process.env.NODE_ENV === 'test') {
    uri = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/couponati_test';
} else {
    uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/couponati';
}

const dbConfig: DbConnectionOptions = {
    uri: uri,
    options: {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4,
    },
};

mongoose.set('strictQuery', true);

let isConnected = false;

export const connectDB = async (): Promise<void> => {
    if (isConnected) {
        return;
    }

    try {
        await mongoose.connect(dbConfig.uri, dbConfig.options);
        isConnected = true;
        console.log('🟢 Connected to the database successfully');
    } catch (error) {
        console.error('🔴 DB connection failed:', error);
        process.exit(1);
    }
};

export const disconnectDB = async (): Promise<void> => {
    if (!isConnected) {
        return;
    }

    try {
        await mongoose.connection.close();
        isConnected = false;
        console.log('🔌 Disconnected from the database');
    } catch (error) {
        console.error('🔴 Failed to disconnect from the database:', error);
    }
};

export const clearDB = async (): Promise<void> => {
    if (!isConnected) {
        return;
    }

    const collections = mongoose.connection.collections;

    await Promise.all(
        Object.values(collections).map(async (collection) => {
            if (collection) {
                await collection.deleteMany({});
            }
        })
    );
};