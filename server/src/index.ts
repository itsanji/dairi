import { Elysia, t } from "elysia";
import cors from "@elysiajs/cors";
import { logger } from "@grotto/logysia";
import "reflect-metadata";
import swagger from "@elysiajs/swagger";
import { authController } from "./controllers/auth.controller";
import { userController } from "./controllers/user.controller";

const app = new Elysia()
    .use(logger())
    .use(swagger())
    .use(cors())
    .get("/health", () => ({ message: "application feeling good" }))
    .use(authController)
    .use(userController)
    .ws("/ws", {
        body: t.Object({
            type: t.String(),
            data: t.Any()
        }),
        message: (ws, message) => {
            console.log(message);
            ws.send({
                data: {
                    success: "test"
                }
            });
        }
    })
    .listen(Bun.env.PORT || 4000);
console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);

export type App = typeof app;
