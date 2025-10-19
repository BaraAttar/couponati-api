import dotenv from 'dotenv';
dotenv.config({ quiet: true });

if (!process.env.JWT_SECRET) {
    throw new Error("FATAL ERROR: JWT_SECRET is not defined.");
}

if (!process.env.MONGODB_URI) {
    throw new Error("FATAL ERROR: MONGODB_URI is not defined.");
}

if (!process.env.GOOGLE_WEB_CLIENT_ID) {
    throw new Error("FATAL ERROR: GOOGLE_WEB_CLIENT_ID is not defined.");
}

if (!process.env.GOOGLE_ANDROID_CLIENT_ID) {
    throw new Error("FATAL ERROR: GOOGLE_ANDROID_CLIENT_ID is not defined.");
}

if (!process.env.GOOGLE_IOS_CLIENT_ID) {
    throw new Error("FATAL ERROR: GOOGLE_IOS_CLIENT_ID is not defined.");
}

export { };
