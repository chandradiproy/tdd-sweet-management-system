import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connectDB = async() =>{
    try{
        const mongoUri = process.env.MONGO_URI || '';
        if(!mongoUri){
            console.error('MONGO_URI is not defined in environment variables');
            process.exit(1);
        }
        const conn = await mongoose.connect(mongoUri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    }catch(err:any){
        console.error(`Error connecting to MongoDB: ${err.message}`);
        process.exit(1);
    }
};

export default connectDB;