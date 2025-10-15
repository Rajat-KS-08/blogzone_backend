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
const allowedOrigins = [
  "http://localhost:5173", // local dev
  "https://blogzone-frontend-2sac.onrender.com", // deployed frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from the specified Origin.`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use("/api/blogs", blogRouter);
app.use("/api/auth", authRouter);

//Server configuration
const PORT = process.env.PORT || 5000;

//Running the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
