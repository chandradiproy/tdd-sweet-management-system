// File Path: backend/src/controllers/cartController.ts
import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Cart from '../models/Cart';
import Sweet from '../models/Sweet';
import { IAuthRequest } from '../middleware/authMiddleware';

// Utility function to get or create a cart
const getOrCreateCart = async (userId: string) => {
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }
  return cart;
};

/**
 * @desc    Get user's cart
 * @route   GET /api/cart
 * @access  Private
 */
export const getCart = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  try {
    const cart = await Cart.findOne({ userId: req.user!._id }).populate({
      path: 'items.sweetId',
      model: 'Sweet',
    });

    if (!cart) {
      return res.status(200).json({ items: [] });
    }

    res.status(200).json(cart);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add item to cart
 * @route   POST /api/cart/add
 * @access  Private
 */
export const addItemToCart = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  const { sweetId, quantity } = req.body;
  const userId = req.user!._id;

  try {
    const sweet = await Sweet.findById(sweetId);
    if (!sweet) {
      return res.status(404).json({ message: 'Sweet not found' });
    }
    if (sweet.quantity < quantity) {
        return res.status(400).json({ message: 'Sweet is out of stock.' });
    }
    
    const cart = await getOrCreateCart(userId.toString());
    
    const existingItem = cart.items.find(item => item.sweetId.toString() === sweetId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ sweetId, quantity });
    }

    await cart.save();
    const populatedCart = await cart.populate({ path: 'items.sweetId', model: 'Sweet' });
    res.status(200).json(populatedCart);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update item quantity in cart
 * @route   PUT /api/cart/item/:sweetId
 * @access  Private
 */
export const updateCartItem = async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { sweetId } = req.params;
    const { quantity } = req.body;
    const userId = req.user!._id;

    try {
        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const itemIndex = cart.items.findIndex(item => item.sweetId.toString() === sweetId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item not in cart' });
        }

        if (quantity > 0) {
            const sweet = await Sweet.findById(sweetId);
            if (!sweet || sweet.quantity < quantity) {
                return res.status(400).json({ message: 'Not enough stock available' });
            }
            cart.items[itemIndex].quantity = quantity;
        } else {
            cart.items.splice(itemIndex, 1);
        }

        await cart.save();
        const populatedCart = await cart.populate({ path: 'items.sweetId', model: 'Sweet' });
        res.status(200).json(populatedCart);

    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/item/:sweetId
 * @access  Private
 */
export const removeCartItem = async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { sweetId } = req.params;
    const userId = req.user!._id;

    try {
        const cart = await Cart.findOneAndUpdate(
            { userId },
            { $pull: { items: { sweetId } } },
            { new: true }
        ).populate({ path: 'items.sweetId', model: 'Sweet' });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        
        res.status(200).json(cart);

    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Checkout cart
 * @route   POST /api/cart/checkout
 * @access  Private
 */
export const checkout = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  const userId = req.user!._id;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const cart = await Cart.findOne({ userId }).session(session);
    if (!cart || cart.items.length === 0) {
      throw new Error('Your cart is empty.');
    }

    for (const item of cart.items) {
      const sweet = await Sweet.findById(item.sweetId).session(session);
      if (!sweet || sweet.quantity < item.quantity) {
        throw new Error(`Not enough stock for ${sweet ? sweet.name : 'an item'}.`);
      }
    }

    for (const item of cart.items) {
      await Sweet.updateOne(
        { _id: item.sweetId },
        { $inc: { quantity: -item.quantity } },
        { session }
      );
    }

    cart.items = [];
    await cart.save({ session });

    await session.commitTransaction();
    res.status(200).json({ message: 'Checkout successful!' });
  } catch (error: any) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
};