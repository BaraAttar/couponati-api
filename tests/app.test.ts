import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../src/server.js';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key]?.deleteMany({});
  }
});

describe('Express App Tests', () => {
  it('should return 200 for the root endpoint', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Hello Express + TypeScript');
  });

  it('should return 400 for invalid JSON body', async () => {
    const response = await request(app)
      .post('/store') // أي راوت يقبل body
      .set('Content-Type', 'application/json')
      .send('{"name": "Test Store"'); // JSON ناقص الأقواس
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid JSON in request body");
  });

  it('should return 500 for unexpected errors', async () => {
    const response = await request(app).get('/error-test');
    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Internal server error");
  });

});
