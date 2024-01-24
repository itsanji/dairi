import Elysia, { t } from "elysia";
import { decorations, privateRoute } from "../utils/plugins";

export const wsController = new Elysia({
    prefix: "/ws"
})
    .use(decorations)
    .use(privateRoute)
    .ws("/", {
        body: t.Object({
            type: t.String(),
            data: t.Any()
        }),
        open: (ws) => {
            ws.send({
                type: "open-id",
                data: { msg: `Connected with ID: ${ws.id}` }
            });
        },
        message: (ws, message: any) => {
            console.log(message.type);
            switch (message.type) {
                case "bruh1":
                    ws.send({
                        type: "bruh1",
                        data: {
                            msg: "yes call me bruh"
                        }
                    });
                    break;
                case "bruh2":
                    ws.send({
                        type: "bruh2",
                        data: {
                            msg: "hello",
                            data: ws.data.user
                        }
                    });
                    break;
                case "bruh3":
                    ws.send({
                        type: "bruh3",
                        data: {
                            msg: "Legendary Bruh 3"
                        }
                    });
                    break;
            }
        }
    });
