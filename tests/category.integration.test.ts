import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../src/server.js';
import { Category } from '../src/models/Category.model.js';

let mongoServer: MongoMemoryServer;

// Helper لإنشاء categories بسرعة
const createCategory = async (overrides = {}) => {
  const data = {
    name: `Category-${Math.random()}`,
    active: true,
    order: 1,
    ...overrides,
  };
  return Category.create(data);
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
  await Category.deleteMany({});
});

describe('Category API', () => {

  describe('Create Category', () => {
    it('should create a new category', async () => {
      const res = await request(app).post('/category').send({
        name: 'Test Category',
        active: true,
        order: 1
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should fail if name duplicated', async () => {
      await createCategory({ name: 'DupCategory' });
      const res = await request(app).post('/category').send({ name: 'DupCategory', active: true, order: 1 });
      expect(res.status).toBe(400);
    });
  });

  describe('Read Categories', () => {
    it('should return all categories', async () => {
      await createCategory({ name: 'C1' });
      await createCategory({ name: 'C2' });
      const res = await request(app).get('/category');
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(2);
    });

    it('should return a category by ID', async () => {
      const category = await createCategory();
      const res = await request(app).get(`/category/${category._id}`);
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe(category.name);
    });

    it('should fail with invalid ID', async () => {
      const res = await request(app).get('/category/123');
      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existing ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/category/${fakeId}`);
      expect(res.status).toBe(404);
    });
  });

  describe('Update Category', () => {
    it('should update a category', async () => {
      const category = await createCategory({ name: 'OldName' });
      const res = await request(app).put(`/category/${category._id}`).send({ name: 'NewName' });
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('NewName');
    });

    it('should fail with invalid ID', async () => {
      const res = await request(app).put('/category/123').send({ name: 'X' });
      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existing category', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).put(`/category/${fakeId}`).send({ name: 'X' });
      expect(res.status).toBe(404);
    });
  });

  describe('Delete Category', () => {
    it('should delete a category with correct name', async () => {
      const category = await createCategory({ name: 'DelCat' });
      const res = await request(app).delete(`/category/${category._id}`).send({ name: 'DelCat' });
      expect(res.status).toBe(200);
      const found = await Category.findById(category._id);
      expect(found).toBeNull();
    });

    it('should fail if name does not match', async () => {
      const category = await createCategory({ name: 'DelCat' });
      const res = await request(app).delete(`/category/${category._id}`).send({ name: 'WrongName' });
      expect(res.status).toBe(400);
    });

    it('should fail with invalid ID', async () => {
      const res = await request(app).delete('/category/123').send({ name: 'X' });
      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existing category', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).delete(`/category/${fakeId}`).send({ name: 'X' });
      expect(res.status).toBe(404);
    });
  });

});
