import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../utils/data-source";
import { User } from "../entity/User";
import { Profile } from "../entity/Profile";
import { Settings } from "../entity/Settings";

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - rePassword
 *               - firstname
 *               - lastname
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               rePassword:
 *                 type: string
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 */
router.post(
    "/register",
    [
        body("username").notEmpty(),
        body("email").isEmail(),
        body("password").isLength({ min: 6 }),
        body("rePassword").notEmpty(),
        body("firstname").notEmpty(),
        body("lastname").notEmpty(),
    ],
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, errors: errors.array() });
            }

            if (req.body.password !== req.body.rePassword) {
                return res.status(400).json({ success: false, message: "Passwords do not match" });
            }

            const userRepository = AppDataSource.getRepository(User);
            const existingUser = await userRepository.findOne({
                where: [{ email: req.body.email }, { username: req.body.username }],
            });

            if (existingUser) {
                return res.status(400).json({ success: false, message: "User already exists" });
            }

            // Create profile
            const userProfile = new Profile();
            userProfile.firstname = req.body.firstname;
            userProfile.lastname = req.body.lastname;
            await AppDataSource.getRepository(Profile).save(userProfile);

            // Create user
            const user = new User();
            user.username = req.body.username;
            user.email = req.body.email;
            user.password = req.body.password;
            user.name = `${req.body.firstname} ${req.body.lastname}`;
            user.profile = userProfile;

            await user.hashPassword();
            await userRepository.save(user);

            // Create default settings
            const userSettings = new Settings();
            userSettings.theme = "light";
            userSettings.apps = [];
            userSettings.user = user;
            await AppDataSource.getRepository(Settings).save(userSettings);

            const token = jwt.sign({ userId: user.id }, Bun.env.JWT_SECRET || "your-secret-key", {
                expiresIn: "24h",
            });

            res.json({
                success: true,
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    name: user.name,
                    profile: user.profile,
                    settings: userSettings,
                },
            });
        } catch (error) {
            console.error("Registration error:", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Can be either username or email
 *               password:
 *                 type: string
 */
router.post("/login", [body("username").notEmpty(), body("password").exists()], async (req: Request, res: Response) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({
            where: [{ username: req.body.username }, { email: req.body.username }],
            relations: ["profile", "settings"],
        });

        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const validPassword = await user.validatePassword(req.body.password);
        if (!validPassword) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const accessToken = jwt.sign({ userId: user.id }, Bun.env.JWT_SECRET || "your-secret-key", {
            expiresIn: "1h",
        });

        const refreshToken = jwt.sign({ id: user.id }, Bun.env.JWT_SECRET || "your-secret-key", {
            expiresIn: "7d",
        });

        res.json({
            success: true,
            data: {
                accessToken,
                refreshToken,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    name: user.name,
                    profile: user.profile,
                    settings: user.settings,
                },
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

/**
 * @swagger
 * /auth/verify:
 *   get:
 *     tags: [Auth]
 *     summary: Verify access token and get user data
 *     security:
 *       - bearerAuth: []
 */
router.get("/verify", async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "No authentication token provided" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, Bun.env.JWT_SECRET || "your-secret-key") as { userId: string };

        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({
            where: { id: decoded.userId },
            relations: ["profile", "settings"],
        });

        if (!user) {
            return res.status(401).json({ success: false, message: "User not found" });
        }

        const accessToken = jwt.sign({ userId: user.id }, Bun.env.JWT_SECRET || "your-secret-key", {
            expiresIn: "1h",
        });

        const refreshToken = jwt.sign({ id: user.id }, Bun.env.JWT_SECRET || "your-secret-key", {
            expiresIn: "7d",
        });

        res.json({
            success: true,
            data: {
                accessToken,
                refreshToken,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    name: user.name,
                    profile: user.profile,
                    settings: user.settings,
                },
            },
        });
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ success: false, message: "Invalid or expired token" });
        }
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token using refresh token
 *     security:
 *       - bearerAuth: []
 */
router.post("/refresh", async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "No refresh token provided" });
        }

        const refreshToken = authHeader.split(" ")[1];
        const decoded = jwt.verify(refreshToken, Bun.env.JWT_SECRET || "your-secret-key") as { id: string };

        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({
            where: { id: decoded.id },
        });

        if (!user) {
            return res.status(401).json({ success: false, message: "User not found" });
        }

        const newAccessToken = jwt.sign({ userId: user.id }, Bun.env.JWT_SECRET || "your-secret-key", { expiresIn: "1h" });

        const newRefreshToken = jwt.sign({ id: user.id }, Bun.env.JWT_SECRET || "your-secret-key", { expiresIn: "7d" });

        res.json({
            success: true,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ success: false, message: "Invalid refresh token" });
        }
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

export const authRouter = router;
