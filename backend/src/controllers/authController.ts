// File Path: server/src/controllers/authController.ts
import {Request, Response} from 'express';
import User from '../models/User';
import jwt  from 'jsonwebtoken';

const generateToken = (id:string) => {
    const jwtSecret = process.env.JWT_SECRET;
    if(!jwtSecret){
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    return jwt.sign({id}, jwtSecret, {
        expiresIn:'30d',
    });
};

export const register = async (req:Request, res:Response) => {
    const {name, email,password, role} = req.body;
    try{
        const userExists = await User.findOne({email});

        if(userExists){
            return res.status(400).json({
                messafe: 'User already exists',
            });
        }
        const user = await User.create({
            name,
            email,
            password,
            role,
        });

        if(user){
            return res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id.toString()),
            });
        }else{
            return res.status(400).json({message: 'Invalid user data'});
        }
    }catch(err:any){
        return res.status(500).json({message: err.message});
    }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Check for user by email, and select password to be able to use it
    const user = await User.findOne({ email }).select('+password');

    // Check if user exists and password matches
    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id.toString()),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
