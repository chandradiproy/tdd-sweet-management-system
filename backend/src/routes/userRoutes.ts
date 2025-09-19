import express from 'express';
import { getUsers, updateUserRole } from '../controllers/userController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// Route to get all users, accessible only by admins.
router.route('/')
  .get(protect, admin, getUsers);

// Route to update a specific user's role, accessible only by admins.
router.route('/:id/role')
  .put(protect, admin, updateUserRole);

export default router;

