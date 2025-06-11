import { WebSocket, WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../utils/data-source";
import { User } from "../entity/User";

interface WebSocketMessage {
    type: string;
    data: any;
}

export const setupWebSocket = (wss: WebSocketServer) => {
    wss.on("connection", async (ws: WebSocket, request) => {
        try {
            // Extract token from URL query parameters
            const url = new URL(request.url || "", `http://${request.headers.host}`);
            const token = url.searchParams.get("access");

            if (!token) {
                ws.close(1008, "No authentication token provided");
                return;
            }

            // Verify token
            const decoded = jwt.verify(token, Bun.env.JWT_SECRET || "your-secret-key") as { userId: string };
            const user = await AppDataSource.getRepository(User).findOne({
                where: { id: decoded.userId },
                relations: ["profile", "settings"],
            });

            if (!user) {
                ws.close(1008, "User not found");
                return;
            }

            // Assign user data to WebSocket instance
            (ws as any).data = { user };

            // Send connection confirmation
            ws.send(
                JSON.stringify({
                    type: "open-id",
                    data: { msg: `Connected with ID: ${(ws as any).id || "unknown"}` },
                })
            );

            // Broadcast user update to all connected clients
            wss.clients.forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(
                        JSON.stringify({
                            type: "user_update",
                            data: { user },
                        })
                    );
                }
            });

            // Handle messages
            ws.on("message", (rawMessage: string) => {
                try {
                    const message: WebSocketMessage = JSON.parse(rawMessage.toString());

                    switch (message.type) {
                        case "bruh1":
                            ws.send(
                                JSON.stringify({
                                    type: "bruh1",
                                    data: {
                                        msg: "yes call me bruh",
                                    },
                                })
                            );
                            break;

                        case "bruh2":
                            ws.send(
                                JSON.stringify({
                                    type: "bruh2",
                                    data: {
                                        msg: "hello",
                                        data: (ws as any).data,
                                    },
                                })
                            );
                            break;

                        case "bruh3":
                            ws.send(
                                JSON.stringify({
                                    type: "bruh3",
                                    data: {
                                        msg: "Legendary Bruh 3",
                                    },
                                })
                            );
                            break;

                        default:
                            ws.send(
                                JSON.stringify({
                                    type: "error",
                                    data: { msg: "Unknown message type" },
                                })
                            );
                    }
                } catch (error) {
                    ws.send(
                        JSON.stringify({
                            type: "error",
                            data: { msg: "Invalid message format" },
                        })
                    );
                }
            });

            // Handle connection close
            ws.on("close", () => {
                console.log(`Client disconnected: ${(ws as any).id || "unknown"}`);
            });
        } catch (error) {
            ws.close(1008, "Authentication failed");
        }
    });

    return wss;
};
