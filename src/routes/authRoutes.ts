import { Router } from "express";
import { register, login, refresh, logout, getUserData, updateUserData } from "../controllers/authController";
import { authenticateToken } from "../middlewares/authMiddleware";
import cookieParser from "cookie-parser";

const authRouter = Router();
authRouter.use(cookieParser());

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/refresh", refresh);
authRouter.post("/logout", logout);
authRouter.get("/user/:userId", authenticateToken, getUserData);
authRouter.put("/user/update", authenticateToken, updateUserData);

// Protected route example
authRouter.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: "This is a protected route", user: (req as any).user });
});

export default authRouter;