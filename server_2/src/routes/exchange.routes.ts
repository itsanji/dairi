import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { redisClient } from "../utils/redis";

const router = Router();

// Get current exchange rate
router.get("/exchange-rate", authMiddleware, async (_req, res) => {
    try {
        const rateData = await redisClient.get("exchange:rate");
        if (!rateData) {
            return res.status(404).json({
                success: false,
                error: "Exchange rate data not available yet",
            });
        }

        const data = JSON.parse(rateData);
        console.log("Retrieved exchange rate data:", data);

        return res.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error("Error in exchange rate endpoint:", error);
        return res.status(500).json({
            success: false,
            error: `Failed to retrieve exchange rate data: ${error}`,
        });
    }
});

// Update exchange rate settings
router.put("/exchange-rate/settings", authMiddleware, async (req, res) => {
    try {
        const { base, target } = req.body;

        // Validate input
        if (!base || !target) {
            return res.status(400).json({
                success: false,
                error: "Both base and target currencies are required",
            });
        }

        // Validate currency codes (should be 3 letters)
        if (!/^[A-Z]{3}$/.test(base) || !/^[A-Z]{3}$/.test(target)) {
            return res.status(400).json({
                success: false,
                error: "Currency codes must be 3 uppercase letters (e.g., USD, EUR, THB)",
            });
        }

        // Save new settings to Redis
        await redisClient.set(
            "exchange:settings",
            JSON.stringify({
                base,
                target,
            })
        );

        return res.json({
            success: true,
            data: {
                base,
                target,
                message: "Exchange rate settings updated successfully",
            },
        });
    } catch (error) {
        console.error("Error updating exchange rate settings:", error);
        return res.status(500).json({
            success: false,
            error: `Failed to update exchange rate settings: ${error}`,
        });
    }
});

export default router;
