import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../src/server.js';
import { Store } from '../src/models/Store.model.js';
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

// Helper لإنشاء stores بسرعة
const createStore = async (overrides = {}) => {
    const category = await createCategory();
    const data = {
        name: `Store-${Math.random()}`,
        active: true,
        order: 1,
        category: category._id,
        ...overrides,
    };
    return Store.create(data);
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
    await Store.deleteMany({});
    await Category.deleteMany({});
});

describe('Store API', () => {
    describe('Get Stores', () => {
        it('should return all stores', async () => {
            await createStore({ name: 'Store1' });
            await createStore({ name: 'Store2' });
            const res = await request(app).get('/store');
            expect(res.status).toBe(200);
            expect(res.body.count).toBe(2);
        });

        it('should filter by active status', async () => {
            await createStore({ name: 'Active Store', active: true });
            await createStore({ name: 'Inactive Store', active: false });
            const res = await request(app).get('/store?active=true');
            expect(res.status).toBe(200);
            expect(res.body.count).toBe(1);
            expect(res.body.data[0].name).toBe('Active Store');
        });

        it('should filter by category', async () => {
            const category1 = await createCategory({ name: 'Category1' });
            const category2 = await createCategory({ name: 'Category2' });
            await createStore({ name: 'Store1', category: category1._id });
            await createStore({ name: 'Store2', category: category2._id });
            const res = await request(app).get(`/store?category=${category1._id}`);
            expect(res.status).toBe(200);
            expect(res.body.count).toBe(1);
            expect(res.body.data[0].name).toBe('Store1');
        });

        it('should return empty array for invalid category filter', async () => {
            const res = await request(app).get('/store?category=invalid-id');
            expect(res.status).toBe(400);
        });

        it('should sort by order and createdAt', async () => {
            const category = await createCategory();
            const store1 = await Store.create({
                name: 'Store1',
                category: category._id,
                order: 2,
                createdAt: new Date('2023-01-01')
            });
            const store2 = await Store.create({
                name: 'Store2',
                category: category._id,
                order: 1,
                createdAt: new Date('2023-01-02')
            });
            const res = await request(app).get('/store');
            expect(res.status).toBe(200);
            expect(res.body.data[0].name).toBe('Store2');
            expect(res.body.data[1].name).toBe('Store1');
        });
    });

    describe('Get Store By ID', () => {
        it('should return store by ID', async () => {
            const store = await createStore({ name: 'Test Store' });
            const res = await request(app).get(`/store/${store._id}`);
            expect(res.status).toBe(200);
            expect(res.body.data.name).toBe('Test Store');
        });

        it('should return 404 for non-existing store', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app).get(`/store/${fakeId}`);
            expect(res.status).toBe(404);
        });

        it('should return 400 for invalid store ID', async () => {
            const res = await request(app).get('/store/invalid-id');
            expect(res.status).toBe(400);
        });
    });

    describe('Create Store', () => {
        it('should create a new store', async () => {
            const category = await createCategory();
            const res = await request(app).post('/store').send({
                name: 'New Store',
                category: category._id
            });
            expect(res.status).toBe(201);
            expect(res.body.data.name).toBe('New Store');
        });

        it('should fail if required fields missing', async () => {
            const res = await request(app).post('/store').send({
                name: 'New Store'
                // Missing category
            });
            expect(res.status).toBe(400);
        });

        it('should fail if category ID invalid', async () => {
            const res = await request(app).post('/store').send({
                name: 'New Store',
                category: 'invalid-id'
            });
            expect(res.status).toBe(400);
        });

        it('should fail if category not found', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app).post('/store').send({
                name: 'New Store',
                category: fakeId
            });
            expect(res.status).toBe(404);
        });

        it('should fail if store name already exists in same category', async () => {
            const category = await createCategory();
            await createStore({ name: 'Duplicate Store', category: category._id });
            const res = await request(app).post('/store').send({
                name: 'Duplicate Store',
                category: category._id
            });
            expect(res.status).toBe(409);
        });

        it('should create store with optional fields', async () => {
            const category = await createCategory();
            const res = await request(app).post('/store').send({
                name: 'Full Store',
                icon: 'icon.png',
                banner: 'banner.png',
                description: 'Test description',
                link: 'https://example.com',
                active: false,
                order: 5,
                category: category._id
            });
            expect(res.status).toBe(201);
            expect(res.body.data.active).toBe(false);
            expect(res.body.data.order).toBe(5);
        });

        it('should trim name and description', async () => {
            const category = await createCategory();
            const res = await request(app).post('/store').send({
                name: '  Trimmed Store  ',
                description: '  Trimmed description  ',
                category: category._id
            });
            expect(res.status).toBe(201);
            expect(res.body.data.name).toBe('Trimmed Store');
            expect(res.body.data.description).toBe('Trimmed description');
        });
    });

    describe('Update Store', () => {
        it('should update a store', async () => {
            const store = await createStore({ name: 'Old Name' });
            const res = await request(app).put(`/store/${store._id}`).send({
                name: 'New Name',
                active: false
            });
            expect(res.status).toBe(200);
            expect(res.body.data.name).toBe('New Name');
            expect(res.body.data.active).toBe(false);
        });

        it('should update category reference', async () => {
            const store = await createStore();
            const newCategory = await createCategory({ name: 'New Category' });
            const res = await request(app).put(`/store/${store._id}`).send({
                category: newCategory._id
            });
            expect(res.status).toBe(200);
            expect(res.body.data.category._id.toString()).toBe(newCategory._id.toString());
        });

        it('should fail with invalid store ID', async () => {
            const res = await request(app).put('/store/123').send({
                name: 'New Name'
            });
            expect([400, 404]).toContain(res.status);
        });

        it('should fail with invalid category ID', async () => {
            const store = await createStore();
            const res = await request(app).put(`/store/${store._id}`).send({
                category: 'invalid-id'
            });
            expect(res.status).toBe(400);
        });

        it('should fail if category not found', async () => {
            const store = await createStore();
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app).put(`/store/${store._id}`).send({
                category: fakeId
            });
            expect(res.status).toBe(404);
        });

        it('should return 404 for non-existing store', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app).put(`/store/${fakeId}`).send({
                name: 'New Name'
            });
            expect(res.status).toBe(404);
        });

        it('should fail if store name already exists in same category', async () => {
            const category = await createCategory();
            const store1 = await createStore({ name: 'Store1', category: category._id });
            const store2 = await createStore({ name: 'Store2', category: category._id });
            const res = await request(app).put(`/store/${store1._id}`).send({
                name: 'Store2',
                category: category._id
            });
            expect(res.status).toBe(409);
        });

        it('should update all fields', async () => {
            const store = await createStore();
            const newCategory = await createCategory({ name: 'New Category' });
            const res = await request(app).put(`/store/${store._id}`).send({
                name: 'Updated Store',
                icon: 'new-icon.png',
                banner: 'new-banner.png',
                description: 'Updated description',
                link: 'https://new-example.com',
                active: false,
                order: 10,
                category: newCategory._id
            });
            expect(res.status).toBe(200);
            expect(res.body.data.name).toBe('Updated Store');
            expect(res.body.data.active).toBe(false);
            expect(res.body.data.order).toBe(10);
        });
    });

    describe('Delete Store', () => {
        it('should delete a store', async () => {
            const store = await createStore({ name: 'To Delete' });
            const res = await request(app).delete(`/store/${store._id}`).send({
                name: 'To Delete'
            });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            const found = await Store.findById(store._id);
            expect(found).toBeNull();
        });

        it('should fail with invalid store ID', async () => {
            const res = await request(app).delete('/store/123').send({
                name: 'Test'
            });
            expect([400, 404]).toContain(res.status);
        });

        it('should return 404 for non-existing store', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app).delete(`/store/${fakeId}`).send({
                name: 'Test'
            });
            expect(res.status).toBe(404);
        });

        it('should fail if name does not match', async () => {
            const store = await createStore({ name: 'Correct Name' });
            const res = await request(app).delete(`/store/${store._id}`).send({
                name: 'Wrong Name'
            });
            expect(res.status).toBe(400);
        });

        it('should fail if name is not provided', async () => {
            const store = await createStore({ name: 'Test Store' });
            const res = await request(app).delete(`/store/${store._id}`);
            expect(res.status).toBe(400);
        });
    });

    describe('Deactivate Store', () => {
        it('should deactivate a store', async () => {
            const store = await createStore({ active: true });
            const res = await request(app).put(`/store/${store._id}/deactivate`);
            expect(res.status).toBe(200);
            expect(res.body.data.active).toBe(false);
        });

        it('should fail with invalid store ID', async () => {
            const res = await request(app).put('/store/123/deactivate');
            expect(res.status).toBe(400);
        });

        it('should return 404 for non-existing store', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app).put(`/store/${fakeId}/deactivate`);
            expect(res.status).toBe(404);
        });
    });

    describe('Activate Store', () => {
        it('should activate a store', async () => {
            const store = await createStore({ active: false });
            const res = await request(app).put(`/store/${store._id}/activate`);
            expect(res.status).toBe(200);
            expect(res.body.data.active).toBe(true);
        });

        it('should fail with invalid store ID', async () => {
            const res = await request(app).put('/store/123/activate');
            expect(res.status).toBe(400);
        });

        it('should return 404 for non-existing store', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app).put(`/store/${fakeId}/activate`);
            expect(res.status).toBe(404);
        });
    });
});