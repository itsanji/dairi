import Elysia from "elysia";
import { privateRoute } from "../utils/plugins";
import { getSystemDetails } from "../utils/system";

export const serverController = new Elysia({ prefix: "server", name: "server-info" }).use(privateRoute).get("/info", async (_context) => {
    const sysInfo = await getSystemDetails();
    return {
        success: true,
        sysInfo
    };
});
