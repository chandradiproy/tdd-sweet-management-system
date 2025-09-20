// File Path: backend/tests/cart.test.ts
import request from 'supertest';
import mongoose from 'mongoose';
import app, { server } from '../src/server';
import User, { IUser } from '../src/models/User';
import Sweet, { ISweet } from '../src/models/Sweet';
import Cart from '../src/models/Cart';
import jwt from 'jsonwebtoken';

describe('Cart API Endpoints', () => {
  let userToken: string;
  let regularUser: IUser;
  let sweet1: ISweet, sweet2: ISweet, outOfStockSweet: ISweet;

  const generateToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET!, { expiresIn: '1d' });
  };

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI!);
  });

  beforeEach(async () => {
    await Promise.all([
      User.deleteMany({}),
      Sweet.deleteMany({}),
      Cart.deleteMany({}),
    ]);

    regularUser = await User.create({
      name: 'Test User',
      email: 'cartuser@test.com',
      password: 'password123',
    });
    userToken = generateToken(regularUser._id.toString());

    [sweet1, sweet2, outOfStockSweet] = await Promise.all([
      Sweet.create({ name: 'Caramel Chew', category: 'Candy', price: 2.5, quantity: 20 }),
      Sweet.create({ name: 'Fudge Brownie', category: 'Pastry', price: 4.0, quantity: 15 }),
      Sweet.create({ name: 'Sold Out Taffy', category: 'Candy', price: 1.0, quantity: 0 }),
    ]);
  });

  afterAll((done) => {
    server.close(() => {
      mongoose.connection.close().then(() => done());
    });
  });

  describe('GET /api/cart', () => {
    it("should return the user's cart with populated sweet details", async () => {
      await Cart.create({
        userId: regularUser._id,
        items: [{ sweetId: sweet1._id, quantity: 2 }],
      });

      const res = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].quantity).toBe(2);
      expect(res.body.items[0].sweetId.name).toBe('Caramel Chew');
    });
  });

  describe('POST /api/cart/add', () => {
    it('should add a new item to the cart', async () => {
      const res = await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ sweetId: sweet1._id.toString(), quantity: 1 });

      expect(res.statusCode).toBe(200);
      expect(res.body.items[0].sweetId._id.toString()).toBe(sweet1._id.toString());
      expect(res.body.items[0].quantity).toBe(1);
    });

    it('should increment the quantity if the item is already in the cart', async () => {
        await request(app)
          .post('/api/cart/add')
          .set('Authorization', `Bearer ${userToken}`)
          .send({ sweetId: sweet1._id.toString(), quantity: 1 });
  
        const res = await request(app)
          .post('/api/cart/add')
          .set('Authorization', `Bearer ${userToken}`)
          .send({ sweetId: sweet1._id.toString(), quantity: 2 });
  
        expect(res.statusCode).toBe(200);
        expect(res.body.items).toHaveLength(1);
        expect(res.body.items[0].quantity).toBe(3);
    });

    it('should fail to add an out-of-stock item', async () => {
        const res = await request(app)
          .post('/api/cart/add')
          .set('Authorization', `Bearer ${userToken}`)
          .send({ sweetId: outOfStockSweet._id.toString(), quantity: 1 });
  
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Sweet is out of stock.');
    });
  });
  
  describe('PUT /api/cart/item/:sweetId', () => {
    it("should update an item's quantity in the cart", async () => {
      await Cart.create({
        userId: regularUser._id,
        items: [{ sweetId: sweet1._id, quantity: 2 }],
      });
      
      const res = await request(app)
        .put(`/api/cart/item/${sweet1._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 5 });

      expect(res.statusCode).toBe(200);
      expect(res.body.items[0].quantity).toBe(5);
    });
  });

  describe('DELETE /api/cart/item/:sweetId', () => {
    it("should remove an item from the cart", async () => {
        await Cart.create({
            userId: regularUser._id,
            items: [{ sweetId: sweet1._id, quantity: 2 }, { sweetId: sweet2._id, quantity: 1 }],
        });

        const res = await request(app)
            .delete(`/api/cart/item/${sweet1._id}`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.items).toHaveLength(1);
        expect(res.body.items[0].sweetId._id.toString()).toBe(sweet2._id.toString());
    });
  });

  describe('POST /api/cart/checkout', () => {
    it('should process checkout, decrement stock, and clear the cart', async () => {
      await Cart.create({
        userId: regularUser._id,
        items: [
          { sweetId: sweet1._id, quantity: 2 },
          { sweetId: sweet2._id, quantity: 3 }
        ],
      });

      const res = await request(app)
        .post('/api/cart/checkout')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Checkout successful!');

      // Verify stock has been decremented
      const updatedSweet1 = await Sweet.findById(sweet1._id);
      const updatedSweet2 = await Sweet.findById(sweet2._id);
      expect(updatedSweet1!.quantity).toBe(18); // 20 - 2
      expect(updatedSweet2!.quantity).toBe(12); // 15 - 3

      // Verify cart is empty
      const userCart = await Cart.findOne({ userId: regularUser._id });
      expect(userCart!.items).toHaveLength(0);
    });

    it('should fail checkout if an item exceeds available stock', async () => {
        await Cart.create({
          userId: regularUser._id,
          items: [
            { sweetId: sweet1._id, quantity: 25 }, // Requesting 25, only 20 in stock
            { sweetId: sweet2._id, quantity: 1 }
          ],
        });
  
        const res = await request(app)
          .post('/api/cart/checkout')
          .set('Authorization', `Bearer ${userToken}`);
  
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain('Not enough stock for Caramel Chew');
  
        // Verify stock has NOT changed due to transaction rollback
        const updatedSweet1 = await Sweet.findById(sweet1._id);
        const updatedSweet2 = await Sweet.findById(sweet2._id);
        expect(updatedSweet1!.quantity).toBe(20);
        expect(updatedSweet2!.quantity).toBe(15);
      });
  });
});