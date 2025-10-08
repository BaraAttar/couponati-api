import dotenv from 'dotenv';
dotenv.config({ quiet: true });

if (!process.env.JWT_SECRET) {
    throw new Error("FATAL ERROR: JWT_SECRET is not defined.");
}

export { };
