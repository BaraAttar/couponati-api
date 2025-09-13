// tests/banner.integration.test.ts
import request from "supertest";
import app, { closeServer } from "../src/server.js";
import { describe, beforeAll, afterAll, beforeEach, it, expect } from '@jest/globals';
import { clearDB, connectDB, disconnectDB } from "../src/database/connection.js";

describe("Banner API Integration Tests", () => {
  let bannerId: string;

  beforeAll(async () => {
    console.log = () => { };
    process.env.DOTENV_CONFIG_DEBUG = 'false';
    await connectDB();
  });

  afterAll(async () => {
    await clearDB();
    await disconnectDB();
    await closeServer();
  });

  it("should create a new banner", async () => {
    const createRes = await request(app)
      .post("/banners")
      .send({ name: "Test Banner", image: "https://example.com/banner.jpg" });

    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    expect(createRes.body.data.name).toBe("Test Banner");
    bannerId = createRes.body.data._id;
  });

  it("should fetch all banners", async () => {
    const res = await request(app).get("/banners");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("should update a banner", async () => {
    const res = await request(app)
      .put(`/banners/${bannerId}`)
      .send({ name: "Updated Banner" });
    console.debug(res.error);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("Updated Banner");
  });

  it("should delete a banner", async () => {
    const res = await request(app).delete(`/banners/${bannerId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("should return 404 for deleted banner", async () => {
    const res = await request(app).get(`/banners/${bannerId}`);
    expect(res.status).toBe(404);
  });

  it("should handle invalid ID format", async () => {
    const res = await request(app).delete("/banners/invalid-id");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Invalid ID format");
  });
});
