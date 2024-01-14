import { Elysia } from "elysia";
import cors from "@elysiajs/cors";
// import { logger } from "@grotto/logysia";
import "reflect-metadata";
import swagger from "@elysiajs/swagger";
import { authController } from "./controllers/auth.controller";
import { userController } from "./controllers/user.controller";
import { wsController } from "./controllers/ws.controller";

const app = new Elysia()
    // .use(logger())
    .use(swagger())
    .use(cors())
    .get("/health", () => ({ message: "application feeling good" }))
    .use(authController)
    // all routes above is private
    .use(userController)
    .use(wsController)
    .listen(Bun.env.PORT || 4000);
console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);

export type App = typeof app;
