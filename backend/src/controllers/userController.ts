import { Response, NextFunction } from 'express';
import User from '../models/User';
import { IAuthRequest } from '../middleware/authMiddleware';

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private/Admin
 */
export const getUsers = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  try {
    // Exclude passwords from the result
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user role
 * @route   PUT /api/users/:id/role
 * @access  Private/Admin
 */
export const updateUserRole = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  try {
    const { role } = req.body;

    if (role && (role !== 'admin' && role !== 'customer')) {
        return res.status(400).json({ message: 'Invalid role specified. Must be "admin" or "customer".' });
    }
    
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Safety check: Prevent an admin from demoting themselves if they are the last admin.
    if (req.user?._id.toString() === user._id.toString() && user.role === 'admin' && role === 'customer') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Action failed: Cannot remove the last admin account.' });
      }
    }

    user.role = role || user.role;
    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } catch (error) {
    next(error);
  }
};

