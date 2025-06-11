import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../utils/data-source";
import { User } from "../entity/User";

export interface AuthRequest extends Request {
    user?: User;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "No authentication token provided" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, Bun.env.JWT_SECRET || "your-secret-key") as { userId: number };

        const user = await AppDataSource.manager.getRepository(User).findOne({
            where: { id: decoded.userId },
        });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid token" });
    }
};
