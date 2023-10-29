import { Elysia, t } from "elysia";
import { AppDataSource } from "./data-source";
import { userController } from "./controllers/user.controller";
import cors from "@elysiajs/cors";
import { logger } from "@grotto/logysia";
import "reflect-metadata";
import swagger from "@elysiajs/swagger";

async function server() {
    const db = await AppDataSource.initialize();

    const app = new Elysia()
        .use(logger())
        .use(swagger())
        .use(cors())
        .use(userController(db))
        .ws("/ws", {
            body: t.Object({
                type: t.String(),
                data: t.Any(),
            }),
            message: (ws, message) => {
                console.log(message);
                ws.send({
                    data: {
                        success: "test",
                    },
                });
            },
        })
        .listen(Bun.env.PORT || 4000);
    console.log(
        `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
    );
}

try {
    server();
} catch (error) {
    console.log(error);
}
