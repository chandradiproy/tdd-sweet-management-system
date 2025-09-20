// File Path: server/src/middleware/authMiddleware.ts

import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/User';

// Extend the Express Request interface to include a user property
export interface IAuthRequest extends Request {
  params: any;
  user?: IUser; 
}

interface JwtPayload {
  id: string;
}

export const protect = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
      
      // Get user from the token (excluding the password)
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        // If user not found, send 401 response directly
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }
      
      req.user = user;
      next();
    } catch (error) {
      // If token is invalid or expired, send 401 response directly
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    // If no token is present, send 401 response directly
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Middleware to check for admin role
export const admin = (req: IAuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    // If user is not an admin, send 403 response directly
    return res.status(403).json({ message: 'Not authorized as an admin' });
  }
};
