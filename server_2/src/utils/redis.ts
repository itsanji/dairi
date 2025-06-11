import { createClient } from "redis";

const redisClient = createClient({});

// Initialize Redis connection
async function initRedis() {
    try {
        await redisClient.connect();
        console.log("Redis connected successfully");
        return redisClient;
    } catch (error) {
        console.error("Redis connection error:", error);
        throw error;
    }
}

// Initialize Redis and export the connected client
const connectedClient = await initRedis();
export { connectedClient as redisClient };
