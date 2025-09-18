// File Path: server/tests/sweets.test.ts

import request from "supertest";
import mongoose from "mongoose";
import app, { server } from "../src/server"; // Correct import
import User, { IUser } from "../src/models/User";
import Sweet, { ISweet } from "../src/models/Sweet";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

describe("Sweets API Endpoints", () => {
  let adminToken: string;
  let userToken: string;
  let adminUser: IUser;
  let regularUser: IUser;
  let sweet1: ISweet;
  let sweet2: ISweet;

  const generateToken = (id: string): string => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET environment variable is not defined");
    }
    return jwt.sign({ id }, secret, { expiresIn: "1d" });
  };

  // No more manual mongoose.connect in beforeAll
  beforeEach(async () => {
    // Clear collections and wait for completion
    await Promise.all([User.deleteMany({}), Sweet.deleteMany({})]);

    // Create users and wait for them to be fully saved
    adminUser = await User.create({
      name: "Admin",
      email: "admin@test.com",
      password: "password123",
      role: "admin",
    });

    regularUser = await User.create({
      name: "User",
      email: "user@test.com",
      password: "password123",
      role: "customer",
    });

    // Ensure users are saved before generating tokens
    await adminUser.save();
    await regularUser.save();

    // Generate tokens only after users are confirmed saved
    adminToken = generateToken(adminUser._id.toString());
    userToken = generateToken(regularUser._id.toString());

    // Create sweets
    sweet1 = await Sweet.create({
      name: "Chocolate Bar",
      category: "Candy",
      price: 1.5,
      quantity: 10,
    });

    sweet2 = await Sweet.create({
      name: "Gummy Bears",
      category: "Gummy",
      price: 2.0,
      quantity: 0,
    });
  });

  afterAll((done) => {
    // Close the server and the database connection gracefully
    server.close(() => {
      mongoose.connection.close().then(() => done());
    });
  });

  // --- CRUD Operations ---

  describe("GET /api/sweets", () => {
    it("should get all sweets for an authenticated user", async () => {
      console.log("User ID:", regularUser._id);
      console.log("Token generated:", !!userToken);
      console.log("Token length:", userToken?.length);

      const res = await request(app)
        .get("/api/sweets")
        .set("Authorization", `Bearer ${userToken}`);

      if (res.statusCode !== 200) {
        console.log("Response body:", res.body);
        console.log("Response status:", res.statusCode);
      }

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2);
    });

    it("should fail if user is not authenticated", async () => {
      const res = await request(app).get("/api/sweets");
      expect(res.statusCode).toBe(401);
    });

    it("should filter sweets by name search", async () => {
      const res = await request(app)
        .get("/api/sweets?search=Chocolate")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe("Chocolate Bar");
    });
  });

  describe("POST /api/sweets", () => {
    it("should allow an admin to add a new sweet", async () => {
      const res = await request(app)
        .post("/api/sweets")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Lollipop",
          category: "Candy",
          price: 0.5,
          quantity: 100,
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.name).toBe("Lollipop");
    });

    it("should prevent a regular user from adding a sweet", async () => {
      const res = await request(app)
        .post("/api/sweets")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          name: "Lollipop",
          category: "Candy",
          price: 0.5,
          quantity: 100,
        });

      expect(res.statusCode).toBe(403);
    });
  });

  describe("DELETE /api/sweets/:id", () => {
    it("should allow an admin to delete a sweet", async () => {
      const res = await request(app)
        .delete(`/api/sweets/${sweet1._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Sweet removed");
    });

    it("should prevent a regular user from deleting a sweet", async () => {
      const res = await request(app)
        .delete(`/api/sweets/${sweet1._id}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
    });
  });

  // --- Inventory Management ---

  describe("POST /api/sweets/:id/purchase", () => {
    it("should allow an authenticated user to purchase an in-stock sweet", async () => {
      const res = await request(app)
        .post(`/api/sweets/${sweet1._id}/purchase`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.quantity).toBe(9);
    });

    it("should prevent purchase of an out-of-stock sweet", async () => {
      const res = await request(app)
        .post(`/api/sweets/${sweet2._id}/purchase`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Sweet is out of stock");
    });

    it("should fail if user is not authenticated", async () => {
      const res = await request(app).post(`/api/sweets/${sweet1._id}/purchase`);

      expect(res.statusCode).toBe(401);
    });
  });

  describe("POST /api/sweets/:id/restock", () => {
    it("should allow an admin to restock a sweet", async () => {
      const res = await request(app)
        .post(`/api/sweets/${sweet2._id}/restock`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ quantity: 50 });

      expect(res.statusCode).toBe(200);
      expect(res.body.quantity).toBe(50);
    });

    it("should prevent a regular user from restocking a sweet", async () => {
      const res = await request(app)
        .post(`/api/sweets/${sweet2._id}/restock`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ quantity: 50 });

      expect(res.statusCode).toBe(403);
    });
  });
});
