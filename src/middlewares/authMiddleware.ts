import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { IAuthRequest, AuthResponseMsgEnum } from "../models/authModel";

export const authenticateToken = (req: IAuthRequest, res: Response, next: NextFunction) => {
    // Middleware to authenticate JWT tokens
    const autheHeader = req.headers["authorization"];
    const token = autheHeader && autheHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: AuthResponseMsgEnum.MISSING_ACCESS_TOKEN });
    }

    jwt.verify(token, process.env.ACCESS_SECRET_TOKEN as string, (err, user) => {
        if (err) {
            return res.status(403).json({ message: AuthResponseMsgEnum.INVALID_ACCESS_TOKEN });
        }
        req.user = user as { user_id: string; email: string };
        next();
    });
}