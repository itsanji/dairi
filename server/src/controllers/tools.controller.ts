import Elysia from "elysia";
import { privateRoute } from "../utils/plugins";
import { runScript } from "../utils/tools";

export const toolsController = new Elysia({ prefix: "tools", name: "tools-controller" })
    .use(privateRoute)
    .get("/script", async (_context) => {
        const scriptPath = "/home/anji/data/scripts_and_jobs/test-script/test-script.sh"; // Update this path as needed
        const scriptResult = await runScript(scriptPath);
        return {
            success: true,
            scriptResult
        };
    })

    .get("/hello", async () => {
        return {
            success: true
        };
    });
