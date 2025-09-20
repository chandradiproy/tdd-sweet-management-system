// File Path: server/src/routes/sweetRoutes.ts

import express from 'express';
import { body } from 'express-validator';
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

const sweetValidationRules = [
  body('name').trim().notEmpty().escape().withMessage('Name is required.'),
  body('category').trim().notEmpty().escape().withMessage('Category is required.'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number.'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer.')
];

// Publicly accessible route to view and search sweets
router.get('/', protect, getSweets);

// Admin-only routes for managing sweets
router.post('/', protect, admin, sweetValidationRules, addSweet);
router.put('/:id', protect, admin, sweetValidationRules, updateSweet);
router.delete('/:id', protect, admin, deleteSweet);

// User and Admin routes for inventory
router.post('/:id/purchase', protect, purchaseSweet);
router.post('/:id/restock', protect, admin, restockSweet);

export default router;