import express, { Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import "reflect-metadata";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { WebSocketServer } from "ws";
import { createServer } from "http";

import { AppDataSource } from "./utils/data-source";
import { authRouter } from "./routes/auth.routes.js";
import { userRouter } from "./routes/user.routes.js";
import { systemRouter } from "./routes/system.routes.js";
import exchangeRoutes from "./routes/exchange.routes";
import { setupWebSocket } from "./websocket/ws.handler.js";
import { startJobs } from "./jobs/index.job";

const app = express();
const port = Bun.env.PORT || 4000;

// Create HTTP server (needed for WebSocket)
const server = createServer(app);

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Daily Task Management API",
            version: "1.0.0",
            description: "API documentation for Daily Task Management",
        },
        servers: [
            {
                url: `http://localhost:${port}`,
            },
        ],
    },
    apis: ["./src/routes/*.ts"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check endpoint
app.get("/health", (_: Request, res: Response) => {
    res.json({ message: "application feeling good" });
});

// Routes
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/server", systemRouter);
app.use("/jobs", exchangeRoutes);

// Initialize WebSocket
const wss = new WebSocketServer({ server });
setupWebSocket(wss);

// Initialize database and start server
AppDataSource.initialize()
    .then(() => {
        // Start cron jobs
        startJobs();

        // Start server
        server.listen(port, () => {
            console.log(`🚀 Server is running at http://localhost:${port}`);
            console.log(`📚 Swagger documentation available at http://localhost:${port}/api-docs`);
        });
    })
    .catch((error: Error) => {
        console.error("Error during Data Source initialization:", error);
    });
