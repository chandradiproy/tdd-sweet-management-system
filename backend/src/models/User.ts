// File Path: server/src/models/User.ts
import mongoose, {Document, Schema} from "mongoose";
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: Schema.Types.ObjectId;
  name: string;
  email: string;
  password?: string; // Password is optional as it won't be sent back to the client
  role: 'customer' | 'admin';
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema: Schema<IUser> = new Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false, // Do not return password by default on queries
  },
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer',
  },
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps
});

UserSchema.pre<IUser>('save', async function (next){
    if(!this.isModified('password') || !this.password) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

UserSchema.methods.comparePassword = async function (enteredPassword:string): Promise<Boolean>{
    if(!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
}

export default mongoose.model<IUser>('User',UserSchema);