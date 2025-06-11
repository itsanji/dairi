import { Cron } from "croner";
import axios from "axios";
import { redisClient } from "../utils/redis";

interface RocketSchedule {
    id: string;
    channelId: string;
    channelName: string;
    message: string;
    time: string;
    repeat: boolean;
    days: string[];
    createdAt: string;
}

interface RocketChatToken {
    userId: string;
    authToken: string;
    expiry: number;
}

const dayMap = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
    Sun: 0,
};

// Cache token for 1 hour
let rocketChatToken: RocketChatToken | null = null;
let tokenExpiry = 0;

async function getRocketChatToken(): Promise<RocketChatToken> {
    const now = Date.now();
    if (rocketChatToken && tokenExpiry > now) {
        return rocketChatToken;
    }

    const response = await axios.post(`${process.env.ROCKET_CHAT_URL}/api/v1/login`, {
        user: process.env.ROCKET_CHAT_USER,
        password: process.env.ROCKET_CHAT_PASSWORD,
    });

    rocketChatToken = {
        userId: response.data.data.userId,
        authToken: response.data.data.authToken,
        expiry: now + 3600000, // 1 hour
    };
    tokenExpiry = now + 3600000;

    return rocketChatToken;
}

async function sendMessage(channelId: string, message: string) {
    try {
        const token = await getRocketChatToken();

        // First verify the channel exists and we have access
        let channelEndpoint;
        let channelResponse;

        try {
            // Try public channel
            channelResponse = await axios.get(`${process.env.ROCKET_CHAT_URL}/api/v1/channels.info?roomId=${channelId}`, {
                headers: {
                    "X-Auth-Token": token.authToken,
                    "X-User-Id": token.userId,
                },
            });
        } catch (error) {
            try {
                // Try private group
                channelResponse = await axios.get(`${process.env.ROCKET_CHAT_URL}/api/v1/groups.info?roomId=${channelId}`, {
                    headers: {
                        "X-Auth-Token": token.authToken,
                        "X-User-Id": token.userId,
                    },
                });
            } catch (error) {
                try {
                    // Try team
                    channelResponse = await axios.get(`${process.env.ROCKET_CHAT_URL}/api/v1/teams.info?teamId=${channelId}`, {
                        headers: {
                            "X-Auth-Token": token.authToken,
                            "X-User-Id": token.userId,
                        },
                    });
                } catch (error) {
                    throw new Error(`Channel ${channelId} not found or no access`);
                }
            }
        }

        // Send the message
        const response = await axios.post(
            `${process.env.ROCKET_CHAT_URL}/api/v1/chat.postMessage`,
            {
                roomId: channelId, // Using roomId instead of channel
                text: message,
            },
            {
                headers: {
                    "X-Auth-Token": token.authToken,
                    "X-User-Id": token.userId,
                },
            }
        );

        if (response.data.success) {
            console.log(`Message successfully sent to channel ${channelId}`);
            return true;
        } else {
            throw new Error(`Failed to send message: ${response.data.error}`);
        }
    } catch (error: any) {
        console.error("Error sending message to Rocket Chat:", error.response?.data || error.message);
        throw error;
    }
}

// Check every minute for messages to send
export const rocketChatJob = new Cron("* * * * *", async () => {
    try {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
        const currentDay = now.getDay();

        const schedulesData = await redisClient.get("rocket:schedules");
        if (!schedulesData) {
            return;
        }

        const schedules: RocketSchedule[] = JSON.parse(schedulesData);
        console.log(`Checking schedules at ${currentTime} on day ${currentDay}`);

        for (const schedule of schedules) {
            console.log(`Checking schedule: ${JSON.stringify(schedule)}`);
            if (schedule.time === currentTime) {
                if (!schedule.repeat || schedule.days.some((day) => dayMap[day as keyof typeof dayMap] === currentDay)) {
                    try {
                        await sendMessage(schedule.channelId, schedule.message);
                        console.log(`Successfully processed schedule: ${schedule.id}`);
                    } catch (error) {
                        console.error(`Failed to process schedule ${schedule.id}:`, error);
                    }
                }
            }
        }
    } catch (error) {
        console.error("Error in Rocket Chat job:", error);
    }
});
