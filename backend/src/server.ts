import express, {Application, Request, Response} from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import sweetRoutes from './routes/sweetRoutes';

import logger from './middleware/logger';
import errorHandler from './middleware/errorHandler';

dotenv.config()

connectDB();
const app:Application = express();

app.use(express.json()); //To enable JSON bodies
app.use(cors());
app.use(logger);
app.use(errorHandler);

app.get('/api', (req: Request, res: Response) => {
    res.status(200).json({"message  ":"Sweet Shop API is running ..."});
});
app.use('/api/auth', authRoutes);
app.use('/api/sweets', sweetRoutes);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, ()=>{
    console.info(`Server is running on port ${PORT}`);
})

process.on('unhandledRejection', (err: any, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

export { server };
export default app;
