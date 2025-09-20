// File Path: server/tests/auth.test.ts

import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/server'; // Import the configured express app
import {server} from '../src/server';
import User from '../src/models/User';
import dotenv from 'dotenv';

// Load environment variables for test
dotenv.config();

/*
================================================================================================
TEST SUITE FOR AUTHENTICATION ENDPOINTS
================================================================================================
*/
describe('Auth Endpoints', () => {
  // Connect to the database before running any tests
  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in the .env file for testing');
    }
    await mongoose.connect(mongoUri);
  });

  // Clear the users collection before each test to ensure a clean slate
  beforeEach(async () => {
    await User.deleteMany({});
  });

  // Disconnect from the database after all tests are done
  afterAll((done) => {
    server.close(() => {
      mongoose.connection.close().then(() => done());
    });
  });


  /*
  ----------------------------------------------------------------------------------------------
  REGISTRATION TESTS (/api/auth/register)
  ----------------------------------------------------------------------------------------------
  */
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        });
      
      // Assertions
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.name).toBe('Test User');

      // Verify user was actually created in the database
      const user = await User.findOne({ email: 'test@example.com' });
      expect(user).not.toBeNull();
    });

    it('should fail to register a user with an existing email', async () => {
      // First, create a user to ensure the email exists
      await User.create({
        name: 'Existing User',
        email: 'exists@example.com',
        password: 'password123',
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'New User',
          email: 'exists@example.com',
          password: 'newpassword',
        });

      // Assertions
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toBe('User already exists');
    });
  });


  /*
  ----------------------------------------------------------------------------------------------
  LOGIN TESTS (/api/auth/login)
  ----------------------------------------------------------------------------------------------
  */
  describe('POST /api/auth/login', () => {
    // Before each login test, we need a user to exist in the database
    beforeEach(async () => {
      await User.create({
        name: 'Login User',
        email: 'login@example.com',
        password: 'password123',
      });
    });

    it('should log in an existing user with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123',
        });
      
      // Assertions
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.name).toBe('Login User');
    });

    it('should fail to log in with an incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword',
        });

      // Assertions
      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toBe('Invalid email or password');
    });

    it('should fail to log in with a non-existent email', async () => {
        const res = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'nonexistent@example.com',
            password: 'password123',
          });
  
        // Assertions
        expect(res.statusCode).toEqual(401);
        expect(res.body.message).toBe('Invalid email or password');
    });

    it('should block login attempts after too many failures', async () => {
        const agent = request.agent(app);
        const loginPromises = [];
    
        // Make 15 failed attempts
        for (let i = 0; i < 15; i++) {
            loginPromises.push(
                agent.post('/api/auth/login').send({
                    email: 'login@example.com',
                    password: 'wrongpassword'
                })
            );
        }
    
        await Promise.all(loginPromises);
    
        // The next attempt should be blocked
        const finalRes = await agent.post('/api/auth/login').send({
            email: 'login@example.com',
            password: 'wrongpassword'
        });
    
        expect(finalRes.statusCode).toBe(429);
        expect(finalRes.body.message).toContain('Too many login attempts');
    });
  });
});