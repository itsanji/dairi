import { createClient  } from "redis";
const redisClient = createClient({
});
await redisClient.connect();

export { redisClient }
