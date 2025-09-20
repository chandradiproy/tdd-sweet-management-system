import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cors, { CorsOptions } from "cors";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";
import sweetRoutes from "./routes/sweetRoutes";
import userRoutes from "./routes/userRoutes";
import cartRoutes from "./routes/cartRoutes"; // Import cart routes
import logger from "./middleware/logger";
import errorHandler from "./middleware/errorHandler";

dotenv.config();

connectDB();
const app: Application = express();

const whitelist = [
  "http://localhost:3000",
  "http://localhost:5173",
  process.env.FRONTEND_URL,
];

const corsOptions: CorsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) {
    if (!origin) {
      return callback(null, true);
    }

    if (whitelist.includes(origin)) {
      callback(null, true); // allow
    } else {
      callback(new Error("Not allowed by CORS")); // block
    }
  },
};

app.use(express.json()); //To enable JSON bodies
app.use(cors(corsOptions));
app.use(logger);

// Rate Limiter for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message:
      "Too many login attempts from this IP, please try again after 15 minutes",
  },
});

app.get("/api", (req: Request, res: Response) => {
  res.status(200).json({ message: "Sweet Shop API is running ..." });
});

// Apply the limiter only to the auth routes
app.use("/api/auth", authLimiter, authRoutes);

app.use("/api/sweets", sweetRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes); // Use cart routes

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.info(`Server is running on port ${PORT}`);
});

process.on("unhandledRejection", (err: any, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

export { server };
export default app;
