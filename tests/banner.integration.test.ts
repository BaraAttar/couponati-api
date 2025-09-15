import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../src/server.js';
import { Banner } from '../src/models/Banner.model.js';

let mongoServer: MongoMemoryServer;

const createBanner = async (overrides = {}) => {
  const data = {
    name: `Banner-${Math.random()}`,
    image: 'https://example.com/banner.jpg',
    active: true,
    order: 1,
    ...overrides,
  };
  return Banner.create(data);
};

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
  await Banner.deleteMany({});
});

describe('Banner API', () => {

  describe('Create Banner', () => {
    it('should create a new banner', async () => {
      const res = await request(app).post('/banner').send({
        name: 'Test Banner',
        image: 'https://example.com/banner.jpg',
        active: true,
        order: 1
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should fail if name or image missing', async () => {
      const res = await request(app).post('/banner').send({ name: '' });
      expect(res.status).toBe(400);
    });

    it('should fail if image URL invalid', async () => {
      const res = await request(app).post('/banner').send({
        name: 'B',
        image: 'not-a-url'
      });
      expect(res.status).toBe(400);
    });

    it('should fail if name duplicated', async () => {
      await createBanner({ name: 'DupBanner' });
      const res = await request(app).post('/banner').send({
        name: 'DupBanner',
        image: 'https://example.com/banner.jpg'
      });
      expect(res.status).toBe(400);
    });
  });

  describe('Read Banners', () => {
    it('should return all banners', async () => {
      await createBanner({ name: 'B1' });
      await createBanner({ name: 'B2' });
      const res = await request(app).get('/banner');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
    });

    it('should return a banner by ID', async () => {
      const banner = await createBanner();
      const res = await request(app).get(`/banner/${banner._id}`);
      expect(res.status).toBe(200);
    });

    it('should fail with invalid ID format', async () => {
      const res = await request(app).get('/banner/123');
      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existing ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/banner/${fakeId}`);
      expect(res.status).toBe(404);
    });
  });

  describe('Update Banner', () => {
    it('should update a banner', async () => {
      const banner = await createBanner({ name: 'OldName' });
      const res = await request(app).put(`/banner/${banner._id}`).send({ name: 'NewName' });
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('NewName');
    });

    it('should fail if new name duplicated', async () => {
      const b1 = await createBanner({ name: 'B1' });
      const b2 = await createBanner({ name: 'B2' });
      const res = await request(app).put(`/banner/${b2._id}`).send({ name: 'B1' });
      expect(res.status).toBe(400);
    });

    it('should fail with invalid ID', async () => {
      const res = await request(app).put('/banner/123').send({ name: 'X' });
      expect(res.status).toBe(400);
    });
  });

  describe('Delete Banner', () => {
    it('should delete a banner', async () => {
      const banner = await createBanner();
      const res = await request(app).delete(`/banner/${banner._id}`);
      expect(res.status).toBe(200);
      const found = await Banner.findById(banner._id);
      expect(found).toBeNull();
    });

    it('should fail with invalid ID', async () => {
      const res = await request(app).delete('/banner/123');
      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existing banner', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).delete(`/banner/${fakeId}`);
      expect(res.status).toBe(404);
    });
  });

});
