import { Elysia } from "elysia";
import cors from "@elysiajs/cors";
import "reflect-metadata";
import swagger from "@elysiajs/swagger";
import { authController } from "./controllers/auth.controller";
import { userController } from "./controllers/user.controller";
import { wsController } from "./controllers/ws.controller";
import { logger } from "./utils/log";
import { jobEntry } from "./jobs/index.job";

const app = new Elysia()
    .use(logger())
    .use(swagger())
    .use(cors())
    .use(jobEntry)
    .get("/health", () => ({ message: "application feeling good" }))
    // below is private routes
    .use(authController)
    .use(userController)
    .use(wsController)
    .listen(Bun.env.PORT || 4000);
console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
