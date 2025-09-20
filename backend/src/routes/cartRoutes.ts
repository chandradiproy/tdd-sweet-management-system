// File Path: backend/src/routes/cartRoutes.ts
import express from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  checkout,
} from '../controllers/cartController';

const router = express.Router();

// All cart routes are protected
router.use(protect);

router.route('/')
  .get(getCart);

router.route('/add')
  .post(addItemToCart);

router.route('/checkout')
  .post(checkout);
  
router.route('/item/:sweetId')
  .put(updateCartItem)
  .delete(removeCartItem);

export default router;