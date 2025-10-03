import dotenv from "dotenv";
dotenv.config();

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import blogRouter from "./routes/blogRoutes";
import authRouter from "./routes/authRoutes";


const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());

// Set up CORS to allow requests from the frontend
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}))
app.use('/api/blogs', blogRouter);
app.use("/api/auth", authRouter);

//Server configuration
const PORT = process.env.PORT || 3000;

//Running the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
