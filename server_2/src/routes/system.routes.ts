import { Router, Request, Response } from "express";
import { AppDataSource } from "../utils/data-source";
import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";
import os from "os";

const router = Router();

/**
 * @swagger
 * /system/status:
 *   get:
 *     tags: [System]
 *     summary: Get system status
 *     security:
 *       - bearerAuth: []
 */
router.get("/status", authMiddleware, async (_: AuthRequest, res: Response) => {
    try {
        // Check database connection
        const dbStatus = await AppDataSource.manager.query("SELECT 1");

        // Get system metrics
        const metrics = {
            memory: process.memoryUsage(),
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
        };

        res.json({
            success: true,
            status: {
                database: dbStatus ? "connected" : "disconnected",
                metrics,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error checking system status",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});

/**
 * @swagger
 * /system/health:
 *   get:
 *     tags: [System]
 *     summary: Get detailed health check
 *     security:
 *       - bearerAuth: []
 */
router.get("/health", authMiddleware, async (_: AuthRequest, res: Response) => {
    try {
        const checks = {
            database: false,
            api: true,
            timestamp: new Date().toISOString(),
        };

        try {
            await AppDataSource.manager.query("SELECT 1");
            checks.database = true;
        } catch (error) {
            console.error("Database health check failed:", error);
        }

        const allHealthy = Object.values(checks).every((status) => (typeof status === "boolean" ? status : true));

        res.status(allHealthy ? 200 : 503).json({
            success: allHealthy,
            checks,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error performing health check",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});

/**
 * @swagger
 * /system/metrics:
 *   get:
 *     tags: [System]
 *     summary: Get system metrics
 *     security:
 *       - bearerAuth: []
 */
router.get("/metrics", authMiddleware, async (_: AuthRequest, res: Response) => {
    try {
        const metrics = {
            memory: {
                heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
                heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
                external: Math.round(process.memoryUsage().external / 1024 / 1024),
            },
            uptime: Math.round(process.uptime()),
            timestamp: new Date().toISOString(),
            platform: process.platform,
            version: process.version,
        };

        res.json({
            success: true,
            metrics,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching system metrics",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});

/**
 * @swagger
 * /server/info:
 *   get:
 *     tags: [System]
 *     summary: Get system information
 *     security:
 *       - bearerAuth: []
 */
router.get("/info", authMiddleware, async (_: AuthRequest, res: Response) => {
    try {
        const cpus = os.cpus();
        const sysInfo = {
            os: {
                architechure: os.arch(),
                hostname: os.hostname(),
                platform: os.platform(),
            },
            cpuTemp: 0, // This would need a platform-specific implementation
            cpuUsage: cpus.map((cpu) => {
                const total = Object.values(cpu.times).reduce((acc, time) => acc + time, 0);
                const idle = cpu.times.idle;
                return `${((1 - idle / total) * 100).toFixed(1)}%`;
            }),
            memoryUsage: {
                total: Math.round(os.totalmem() / 1024 / 1024),
                used: Math.round((os.totalmem() - os.freemem()) / 1024 / 1024),
                free: Math.round(os.freemem() / 1024 / 1024),
            },
        };

        res.json({
            success: true,
            data: {
                sysInfo,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching system info",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});

export const systemRouter = router;
