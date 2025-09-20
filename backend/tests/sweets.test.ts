// File Path: server/tests/sweets.test.ts

import request from "supertest";
import mongoose from "mongoose";
import app, { server } from "../src/server";
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

  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined in the .env file for testing");
    }
    await mongoose.connect(mongoUri);
  });
  
  beforeEach(async () => {
    await Promise.all([User.deleteMany({}), Sweet.deleteMany({})]);

    [adminUser, regularUser] = await Promise.all([
        User.create({ name: "Admin", email: "admin@test.com", password: "password123", role: "admin" }),
        User.create({ name: "User", email: "user@test.com", password: "password123", role: "customer" })
    ]);

    adminToken = generateToken(adminUser._id.toString());
    userToken = generateToken(regularUser._id.toString());

    [sweet1, sweet2] = await Promise.all([
        Sweet.create({ name: "Chocolate Bar", category: "Candy", price: 1.5, quantity: 10 }),
        Sweet.create({ name: "Gummy Bears", category: "Gummy", price: 2.0, quantity: 0 })
    ]);
  });

  afterAll((done) => {
    server.close(() => {
      mongoose.connection.close().then(() => done());
    });
  });

  // --- CRUD Operations ---

  describe("GET /api/sweets", () => {
    it("should get the first page of sweets with default limit", async () => {
      const res = await request(app)
        .get("/api/sweets")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('sweets');
      expect(res.body).toHaveProperty('page', 1);
      expect(res.body).toHaveProperty('pages', 1);
      expect(res.body).toHaveProperty('total', 2);
      expect(res.body.sweets.length).toBe(2);
    });
    
    it("should handle pagination correctly", async () => {
      // Create more sweets to test pagination
      const sweetsToAdd = Array.from({ length: 15 }, (_, i) => ({
        name: `Sweet ${i + 3}`,
        category: "Test",
        price: 1,
        quantity: 5,
      }));
      await Sweet.insertMany(sweetsToAdd);

      const res = await request(app)
        .get("/api/sweets?page=2&limit=5")
        .set("Authorization", `Bearer ${userToken}`);
        
      expect(res.statusCode).toBe(200);
      expect(res.body.page).toBe(2);
      expect(res.body.sweets.length).toBe(5);
      expect(res.body.total).toBe(17); // 2 initial + 15 new
      expect(res.body.pages).toBe(4); // 17 items, 5 per page
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
      expect(res.body.sweets.length).toBe(1);
      expect(res.body.sweets[0].name).toBe("Chocolate Bar");
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
    
    // --- New Validation and Sanitization Tests ---
    describe("Validation and Sanitization", () => {
        it("should fail if required fields are missing", async () => {
            const res = await request(app)
              .post("/api/sweets")
              .set("Authorization", `Bearer ${adminToken}`)
              .send({ name: "Incomplete Sweet" });
      
            expect(res.statusCode).toBe(400);
            expect(res.body.errors).toBeInstanceOf(Array);
            expect(res.body.errors.length).toBeGreaterThan(0);
        });

        it("should fail if price is not a positive number", async () => {
            const res = await request(app)
              .post("/api/sweets")
              .set("Authorization", `Bearer ${adminToken}`)
              .send({ name: "Bad Price", category: "Test", price: -10, quantity: 5 });
      
            expect(res.statusCode).toBe(400);
            expect(res.body.errors[0].msg).toBe("Price must be a positive number.");
        });

        it("should fail if quantity is not an integer", async () => {
            const res = await request(app)
              .post("/api/sweets")
              .set("Authorization", `Bearer ${adminToken}`)
              .send({ name: "Float Quantity", category: "Test", price: 1, quantity: 5.5 });
      
            expect(res.statusCode).toBe(400);
            expect(res.body.errors[0].msg).toBe("Quantity must be a non-negative integer.");
        });

        it("should trim and escape input fields", async () => {
            const maliciousName = ' <script>alert("XSS")</script> ';
            const expectedName = '&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;';

            const res = await request(app)
                .post("/api/sweets")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ name: maliciousName, category: "  XSS  ", price: 1, quantity: 1 });

            expect(res.statusCode).toBe(201);
            expect(res.body.name).toBe(expectedName);
            expect(res.body.category).toBe("XSS");
        });
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