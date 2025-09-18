// File Path: server/src/routes/sweetRoutes.ts

import express from 'express';
import {
  getSweets,
  addSweet,
  updateSweet,
  deleteSweet,
  purchaseSweet,
  restockSweet
} from '../controllers/sweetController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// Publicly accessible route to view and search sweets
router.get('/', protect, getSweets);

// Admin-only routes for managing sweets
router.post('/', protect, admin, addSweet);
router.put('/:id', protect, admin, updateSweet);
router.delete('/:id', protect, admin, deleteSweet);

// User and Admin routes for inventory
router.post('/:id/purchase', protect, purchaseSweet);
router.post('/:id/restock', protect, admin, restockSweet);

export default router;
