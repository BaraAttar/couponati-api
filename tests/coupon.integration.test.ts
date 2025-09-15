import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../src/server.js';
import { Coupon } from '../src/models/Coupon.model.js';
import { Store } from '../src/models/Store.model.js';
import { Category } from '../src/models/Category.model.js';

let mongoServer: MongoMemoryServer;

// Helper لإنشاء stores بسرعة
const createStore = async (overrides = {}) => {
  const category = await Category.create({
    name: `Category-${Math.random()}`,
    active: true,
    order: 1
  });

  const data = {
    name: `Store-${Math.random()}`,
    active: true,
    order: 1,
    category: category._id,
    ...overrides,
  };
  return Store.create(data);
};

// Helper لإنشاء coupons بسرعة
const createCoupon = async (overrides = {}) => {
  const store = await createStore();
  const data = {
    code: `COUPON-${Math.random().toString(36).substr(2, 9)}`,
    discount: 20,
    description: 'Test coupon',
    active: true,
    store: store._id,
    ...overrides,
  };
  return Coupon.create(data);
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
  await Coupon.deleteMany({});
  await Store.deleteMany({});
  await Category.deleteMany({});
});

describe('Coupon API', () => {

  describe('Create Coupon', () => {
    it('should create a new coupon', async () => {
      const store = await createStore();
      const res = await request(app).post('/coupon').send({
        code: 'SAVE20',
        discount: 20,
        description: '20% off everything',
        active: true,
        store: store._id
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.code).toBe('SAVE20');
    });

    it('should fail if required fields missing', async () => {
      const res = await request(app).post('/coupon').send({
        code: 'SAVE20'
      });
      expect(res.status).toBe(400);
    });

    it('should fail if store ID invalid', async () => {
      const res = await request(app).post('/coupon').send({
        code: 'SAVE20',
        discount: 20,
        store: 'invalid-id'
      });
      expect(res.status).toBe(400);
    });

    it('should fail if store not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).post('/coupon').send({
        code: 'SAVE20',
        discount: 20,
        store: fakeId
      });
      expect(res.status).toBe(404);
    });

    it('should create coupon with optional fields', async () => {
      const store = await createStore();
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);

      const res = await request(app).post('/coupon').send({
        code: 'SAVE30',
        discount: 30,
        description: '30% off with expiry',
        expiryDate: expiryDate,
        active: false,
        store: store._id
      });
      expect(res.status).toBe(201);
      expect(res.body.data.discount).toBe(30);
      expect(res.body.data.active).toBe(false);
    });
  });

  describe('Read Coupons', () => {
    it('should return all coupons', async () => {
      await createCoupon({ code: 'COUPON1' });
      await createCoupon({ code: 'COUPON2' });
      const res = await request(app).get('/coupon');
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(2);
    });

    it('should filter by store', async () => {
      const store1 = await createStore();
      const store2 = await createStore();
      await createCoupon({ store: store1._id, code: 'COUPON1' });
      await createCoupon({ store: store2._id, code: 'COUPON2' });

      const res = await request(app).get(`/coupon?store=${store1._id}`);
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].code).toBe('COUPON1');
    });

    it('should filter by active status', async () => {
      await createCoupon({ active: true, code: 'ACTIVE1' });
      await createCoupon({ active: false, code: 'INACTIVE1' });

      const res = await request(app).get('/coupon?active=true');
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].code).toBe('ACTIVE1');
    });

    it('should return empty array for invalid store filter', async () => {
      const res = await request(app).get('/coupon?store=invalid-id');
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.count).toBe(0);
    });

    it('should sort by usedCount descending', async () => {
      const coupon1 = await createCoupon({ code: 'COUPON1', usedCount: 5 });
      const coupon2 = await createCoupon({ code: 'COUPON2', usedCount: 10 });

      const res = await request(app).get('/coupon');
      expect(res.status).toBe(200);
      expect(res.body.data[0].code).toBe('COUPON2');
      expect(res.body.data[1].code).toBe('COUPON1');
    });
  });

  describe('Update Coupon', () => {
    it('should update a coupon', async () => {
      const coupon = await createCoupon({ code: 'OLDCODE' });
      const res = await request(app).put(`/coupon/${coupon._id}`).send({
        code: 'NEWCODE',
        discount: 50
      });
      expect(res.status).toBe(200);
      expect(res.body.data.code).toBe('NEWCODE');
      expect(res.body.data.discount).toBe(50);
    });

    it('should update store reference', async () => {
      const coupon = await createCoupon();
      const newStore = await createStore();

      const res = await request(app).put(`/coupon/${coupon._id}`).send({
        store: newStore._id
      });
      expect(res.status).toBe(200);
      expect(res.body.data.store.toString()).toBe(newStore._id.toString());
    });

    it('should fail with invalid coupon ID', async () => {
      const res = await request(app).put('/coupon/123').send({
        code: 'NEWCODE'
      });
      expect(res.status).toBe(400);
    });

    it('should fail with invalid store ID', async () => {
      const coupon = await createCoupon();
      const res = await request(app).put(`/coupon/${coupon._id}`).send({
        store: 'invalid-id'
      });
      expect(res.status).toBe(400);
    });

    it('should fail if store not found', async () => {
      const coupon = await createCoupon();
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).put(`/coupon/${coupon._id}`).send({
        store: fakeId
      });
      expect(res.status).toBe(404);
    });

    it('should return 404 for non-existing coupon', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).put(`/coupon/${fakeId}`).send({
        code: 'NEWCODE'
      });
      expect(res.status).toBe(404);
    });

    it('should update all fields', async () => {
      const coupon = await createCoupon();
      const newStore = await createStore();
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 60);

      const res = await request(app).put(`/coupon/${coupon._id}`).send({
        code: 'UPDATED',
        discount: 75,
        description: 'Updated description',
        expiryDate: expiryDate,
        active: false,
        store: newStore._id
      });
      expect(res.status).toBe(200);
      expect(res.body.data.code).toBe('UPDATED');
      expect(res.body.data.discount).toBe(75);
      expect(res.body.data.description).toBe('Updated description');
      expect(res.body.data.active).toBe(false);
    });
  });

  describe('Delete Coupon', () => {
    it('should delete a coupon', async () => {
      const coupon = await createCoupon();
      const res = await request(app).delete(`/coupon/${coupon._id}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const found = await Coupon.findById(coupon._id);
      expect(found).toBeNull();
    });

    it('should fail with invalid coupon ID', async () => {
      const res = await request(app).delete('/coupon/123');
      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existing coupon', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).delete(`/coupon/${fakeId}`);
      expect(res.status).toBe(404);
    });
  });

  describe('Coupon Validation', () => {
    // اختبارات الإنشاء
    it('should validate discount range on creation', async () => {
      const store = await createStore();
      const res = await request(app).post('/coupon').send({
        code: 'INVALID',
        discount: 150, // Invalid: > 100
        store: store._id
      });
      expect(res.status).toBe(400);
    });

    it('should handle negative discount on creation', async () => {
      const store = await createStore();
      const res = await request(app).post('/coupon').send({
        code: 'INVALID',
        discount: -10, // Invalid: < 0
        store: store._id
      });
      expect(res.status).toBe(400);
    });

    it('should trim code and description on creation', async () => {
      const store = await createStore();
      const res = await request(app).post('/coupon').send({
        code: '  SAVE20  ',
        discount: 20,
        description: '  Test description  ',
        store: store._id
      });
      expect(res.status).toBe(201);
      expect(res.body.data.code).toBe('SAVE20');
      expect(res.body.data.description).toBe('Test description');
    });

    // اختبارات التحديث
    it('should fail if discount is greater than 100 on update', async () => {
      const coupon = await createCoupon();
      const res = await request(app).put(`/coupon/${coupon._id}`).send({
        discount: 150
      });
      expect(res.status).toBe(400);
    });

    it('should fail if discount is less than 0 on update', async () => {
      const coupon = await createCoupon();
      const res = await request(app).put(`/coupon/${coupon._id}`).send({
        discount: -10
      });
      expect(res.status).toBe(400);
    });

    it('should allow discount within valid range on update', async () => {
      const coupon = await createCoupon();
      const res = await request(app).put(`/coupon/${coupon._id}`).send({
        discount: 50
      });
      expect(res.status).toBe(200);
      expect(res.body.data.discount).toBe(50);
    });
  });

});
