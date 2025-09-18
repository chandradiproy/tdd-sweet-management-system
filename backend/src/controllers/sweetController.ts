import { Request, Response, NextFunction } from 'express';
import Sweet from '../models/Sweet';
import { IAuthRequest } from '../middleware/authMiddleware';

/**
 * @desc Get all sweets (with search)
 * @route GET /api/sweets
 * @access Private
 */
export const getSweets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, category, minPrice, maxPrice } = req.query;
    let query: any = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (category) {
      query.category = category;
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    const sweets = await Sweet.find(query);
    res.json(sweets);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Add a new sweet
 * @route POST /api/sweets
 * @access Private/Admin
 */
export const addSweet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, category, price, quantity } = req.body;
    if (!name || !category || price === undefined || quantity === undefined) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    const sweet = await Sweet.create({ name, category, price, quantity });
    res.status(201).json(sweet);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update a sweet's details
 * @route PUT /api/sweets/:id
 * @access Private/Admin
 */
export const updateSweet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sweet = await Sweet.findById(req.params.id);
    if (!sweet) {
      return res.status(404).json({ message: 'Sweet not found' });
    }
    const updatedSweet = await Sweet.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // return the modified document
      runValidators: true,
    });
    res.json(updatedSweet);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete a sweet
 * @route DELETE /api/sweets/:id
 * @access Private/Admin
 */
export const deleteSweet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sweet = await Sweet.findById(req.params.id);
    if (!sweet) {
      return res.status(404).json({ message: 'Sweet not found' });
    }
    await sweet.deleteOne();
    res.json({ message: 'Sweet removed' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Purchase a sweet
 * @route POST /api/sweets/:id/purchase
 * @access Private
 */
export const purchaseSweet = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  try {
    const sweet = await Sweet.findById(req.params.id);
    if (!sweet) {
      return res.status(404).json({ message: 'Sweet not found' });
    }
    if (sweet.quantity <= 0) {
      return res.status(400).json({ message: 'Sweet is out of stock' });
    }
    sweet.quantity -= 1;
    await sweet.save();
    res.json(sweet);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Restock a sweet
 * @route POST /api/sweets/:id/restock
 * @access Private/Admin
 */
export const restockSweet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { quantity } = req.body;
    if (quantity === undefined || Number(quantity) <= 0) {
      return res.status(400).json({ message: 'Please provide a valid quantity to add' });
    }
    const sweet = await Sweet.findById(req.params.id);
    if (!sweet) {
      return res.status(404).json({ message: 'Sweet not found' });
    }
    sweet.quantity += Number(quantity);
    await sweet.save();
    res.json(sweet);
  } catch (error) {
    next(error);
  }
};
