import request from 'supertest';
import mongoose from 'mongoose';
import app, { server } from '../src/server';
import User, { IUser } from '../src/models/User';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

describe('User Management API Endpoints', () => {
  let adminToken: string;
  let userToken: string;
  let adminUser: IUser;
  let regularUser: IUser;

  const generateToken = (id: string): string => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not defined');
    }
    return jwt.sign({ id }, secret, { expiresIn: '1d' });
  };

  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        throw new Error('MONGO_URI is not defined');
    }
    await mongoose.connect(mongoUri);
  });

  beforeEach(async () => {
    await User.deleteMany({});

    [adminUser, regularUser] = await Promise.all([
        User.create({
            name: 'Admin User',
            email: 'admin.user@test.com',
            password: 'password123',
            role: 'admin',
        }),
        User.create({
            name: 'Regular User',
            email: 'regular.user@test.com',
            password: 'password123',
            role: 'customer',
        })
    ]);

    adminToken = generateToken(adminUser._id.toString());
    userToken = generateToken(regularUser._id.toString());
  });

  afterAll((done) => {
    server.close(() => {
      mongoose.connection.close().then(() => done());
    });
  });

  // --- Get Users ---
  describe('GET /api/users', () => {
    it('should allow an admin to get all users', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBe(2);
      expect(res.body[0]).not.toHaveProperty('password');
    });

    it('should prevent a regular user from getting all users', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
    });

    it('should prevent an unauthenticated request from getting users', async () => {
        const res = await request(app).get('/api/users');
        expect(res.statusCode).toBe(401);
    });
  });

  // --- Update User Role ---
  describe('PUT /api/users/:id/role', () => {
    it('should allow an admin to update a user\'s role to admin', async () => {
      const res = await request(app)
        .put(`/api/users/${regularUser._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'admin' });

      expect(res.statusCode).toBe(200);
      expect(res.body.role).toBe('admin');
    });
    
    it('should allow an admin to update a user\'s role to customer', async () => {
        const anotherAdmin = await User.create({ name: 'Another Admin', email: 'another@admin.com', password: 'password123', role: 'admin' });
        
        const res = await request(app)
          .put(`/api/users/${anotherAdmin._id}/role`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ role: 'customer' });
  
        expect(res.statusCode).toBe(200);
        expect(res.body.role).toBe('customer');
      });

    it('should prevent a regular user from updating a role', async () => {
      const res = await request(app)
        .put(`/api/users/${regularUser._id}/role`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ role: 'admin' });

      expect(res.statusCode).toBe(403);
    });

    it('should fail if the role is invalid', async () => {
        const res = await request(app)
          .put(`/api/users/${regularUser._id}/role`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ role: 'super-admin' }); // Invalid role
  
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain('Invalid role specified');
    });

    it('should prevent an admin from demoting themselves if they are the last admin', async () => {
        await User.deleteOne({_id: regularUser._id}); // Ensure only one admin exists
        
        const res = await request(app)
          .put(`/api/users/${adminUser._id}/role`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ role: 'customer' });
  
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Action failed: Cannot remove the last admin account.');
      });
  });
});

