import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { AppDataSource } from "../utils/data-source";
import { User } from "../entity/User";
import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * /users/profile:
 *   get:
 *     tags: [Users]
 *     summary: Get user profile
 *     security:
 *       - bearerAuth: []
 */
router.get("/profile", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({
            where: { id: req.user?.id },
            relations: ["profile", "settings"],
        });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({
            success: true,
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                name: user.name,
                profile: user.profile,
                settings: user.settings,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

/**
 * @swagger
 * /users/profile:
 *   put:
 *     tags: [Users]
 *     summary: Update user profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 */
router.put("/profile", [authMiddleware, body("name").optional().isString()], async (req: AuthRequest, res: Response) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const user = req.user;
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const userRepository = AppDataSource.getRepository(User);
        user.name = req.body.name || user.name;
        await userRepository.save(user);

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

/**
 * @swagger
 * /users/change-password:
 *   post:
 *     tags: [Users]
 *     summary: Change user password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 */
router.post(
    "/change-password",
    [authMiddleware, body("currentPassword").notEmpty(), body("newPassword").isLength({ min: 6 })],
    async (req: AuthRequest, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, errors: errors.array() });
            }

            const user = req.user;
            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }

            const validPassword = await user.validatePassword(req.body.currentPassword);
            if (!validPassword) {
                return res.status(401).json({ success: false, message: "Current password is incorrect" });
            }

            user.password = req.body.newPassword;
            await user.hashPassword();
            await AppDataSource.getRepository(User).save(user);

            res.json({ success: true, message: "Password updated successfully" });
        } catch (error) {
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }
);

export const userRouter = router;
