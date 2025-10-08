// تعيين بيئة الاختبار قبل تحميل أي ملفات
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';

import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import { app } from '../../src/server.js';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// إخفاء رسائل dotenv و console.log
const originalConsoleLog = console.log;
console.log = jest.fn();

describe('Google Login Integration Test', () => {
    let mongoServer: MongoMemoryServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        
        await mongoose.connect(mongoUri, {
            retryWrites: true,
            w: 'majority',
            serverSelectionTimeoutMS: 10000
        });
    });

    afterAll(async () => {
        await mongoose.connection.close();
        await mongoServer.stop();
    });

    it('should return 400 when no idToken provided', async () => {
        const response = await request(app)
            .post('/auth/google/token')
            .send({});

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('No idToken provided');
    });

    it('should return 500 when idToken is invalid', async () => {
        // قمع console.error لهذا الاختبار
        const originalConsoleError = console.error;
        console.error = jest.fn();
        
        const response = await request(app)
            .post('/auth/google/token')
            .send({
                idToken: 'invalid_token'
            });

        // استعادة console.error
        console.error = originalConsoleError;

        expect(response.status).toBe(500);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Server error');
    });
});
