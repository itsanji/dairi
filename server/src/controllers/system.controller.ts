import Elysia from "elysia";
import { privateRoute } from "../utils/plugins";
import { getSystemDetails } from "../utils/system";
import { wrapResponse } from "../utils/responseWrapper";

export const serverController = new Elysia({ prefix: "server", name: "server-info" }).use(privateRoute).get("/info", async (_context) => {
    return wrapResponse(async () => {
        const sysInfo = await getSystemDetails();
        return { sysInfo };
    });
});
