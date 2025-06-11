import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { redisClient } from "../utils/redis";
import axios from "axios";

const router = Router();

/**
 * @swagger
 * /rocket/channels:
 *   get:
 *     tags: [Rocket]
 *     summary: Get available channels
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/channels", authMiddleware, async (_req, res) => {
    try {
        // Get token
        const response = await axios.post(`${process.env.ROCKET_CHAT_URL}/api/v1/login`, {
            user: process.env.ROCKET_CHAT_USER,
            password: process.env.ROCKET_CHAT_PASSWORD,
        });

        const { authToken, userId } = response.data.data;
        const headers = {
            "X-Auth-Token": authToken,
            "X-User-Id": userId,
        };

        // Get all types of channels in parallel
        const [publicChannels, privateGroups, teams] = await Promise.all([
            axios.get(`${process.env.ROCKET_CHAT_URL}/api/v1/channels.list`, { headers }),
            axios.get(`${process.env.ROCKET_CHAT_URL}/api/v1/groups.list`, { headers }),
            axios.get(`${process.env.ROCKET_CHAT_URL}/api/v1/teams.list`, { headers }),
        ]);

        // Combine and map all channels
        const allChannels = [...(publicChannels.data.channels || []), ...(privateGroups.data.groups || []), ...(teams.data.teams || [])].map(
            (channel) => ({
                id: channel._id,
                name: channel.fname || channel.name,
                type: channel.t, // 'c' for channel, 'p' for private, 't' for team
            })
        );

        console.log(`Found ${allChannels.length} total channels`);

        return res.json({
            success: true,
            data: allChannels,
        });
    } catch (error: any) {
        console.error("Error fetching channels:", error.response?.data || error.message);
        return res.status(500).json({
            success: false,
            error: "Failed to fetch channels",
            details: error.response?.data || error.message,
        });
    }
});

/**
 * @swagger
 * /rocket/schedules:
 *   get:
 *     tags: [Rocket]
 *     summary: Get all schedules
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/schedules", authMiddleware, async (_req, res) => {
    try {
        const schedulesData = await redisClient.get("rocket:schedules");
        const schedules = schedulesData ? JSON.parse(schedulesData) : [];

        return res.json({
            success: true,
            data: schedules,
        });
    } catch (error) {
        console.error("Error fetching schedules:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to fetch schedules",
        });
    }
});

/**
 * @swagger
 * /rocket/schedules:
 *   post:
 *     tags: [Rocket]
 *     summary: Create new schedule
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             channelId: "CHANNEL_ID"
 *             message: "Hello World"
 *             time: "09:00"
 *             repeat: true
 *             days: ["Mon", "Wed", "Fri"]
 */
router.post("/schedules", authMiddleware, async (req, res) => {
    try {
        const { channelId, message, time, repeat, days } = req.body;

        // Validate input
        if (!channelId || !message || !time) {
            return res.status(400).json({
                success: false,
                error: "Channel, message and time are required",
            });
        }

        // Get token
        const response = await axios.post(`${process.env.ROCKET_CHAT_URL}/api/v1/login`, {
            user: process.env.ROCKET_CHAT_USER,
            password: process.env.ROCKET_CHAT_PASSWORD,
        });

        const { authToken, userId } = response.data.data;
        const headers = {
            "X-Auth-Token": authToken,
            "X-User-Id": userId,
        };

        // Try to get room info from different endpoints
        let channelName;
        try {
            // Try channels first
            const channelRes = await axios.get(`${process.env.ROCKET_CHAT_URL}/api/v1/channels.info?roomId=${channelId}`, {
                headers,
            });
            channelName = channelRes.data.channel.name;
        } catch (error) {
            try {
                // Try groups (private channels)
                const groupRes = await axios.get(`${process.env.ROCKET_CHAT_URL}/api/v1/groups.info?roomId=${channelId}`, {
                    headers,
                });
                channelName = groupRes.data.group.name;
            } catch (error) {
                try {
                    // Try teams
                    const teamRes = await axios.get(`${process.env.ROCKET_CHAT_URL}/api/v1/teams.info?teamId=${channelId}`, {
                        headers,
                    });
                    channelName = teamRes.data.team.name;
                } catch (error) {
                    return res.status(404).json({
                        success: false,
                        error: "Channel not found. Please make sure the channel ID is correct.",
                    });
                }
            }
        }

        // Create new schedule
        const schedulesData = await redisClient.get("rocket:schedules");
        const schedules = schedulesData ? JSON.parse(schedulesData) : [];

        const newSchedule = {
            id: `schedule_${Date.now()}`,
            channelId,
            channelName,
            message,
            time,
            repeat: repeat || false,
            days: repeat ? days : [],
            createdAt: new Date().toISOString(),
        };

        schedules.push(newSchedule);
        await redisClient.set("rocket:schedules", JSON.stringify(schedules));

        return res.json({
            success: true,
            data: newSchedule,
        });
    } catch (error) {
        console.error("Error creating schedule:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to create schedule",
        });
    }
});

/**
 * @swagger
 * /rocket/schedules/{id}:
 *   delete:
 *     tags: [Rocket]
 *     summary: Delete schedule
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.delete("/schedules/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const schedulesData = await redisClient.get("rocket:schedules");
        if (!schedulesData) {
            return res.status(404).json({
                success: false,
                error: "Schedule not found",
            });
        }

        const schedules = JSON.parse(schedulesData);
        const filteredSchedules = schedules.filter((s: any) => s.id !== id);

        if (filteredSchedules.length === schedules.length) {
            return res.status(404).json({
                success: false,
                error: "Schedule not found",
            });
        }

        await redisClient.set("rocket:schedules", JSON.stringify(filteredSchedules));

        return res.json({
            success: true,
            message: "Schedule deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting schedule:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to delete schedule",
        });
    }
});

export default router;
