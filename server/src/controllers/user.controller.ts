import Elysia from "elysia";
import { User } from "../entity/User";
import { plugins } from "../utils/plugins";
import { ErrorMessage } from "../utils/messages";
import { jwtVerify } from "../utils/jwtUtils";
import { constants } from "../utils/constants";

export const userController = new Elysia({ prefix: "/user" })
    .use(plugins)
    .get("/", ({ db }) => {
        const users = db.manager.getRepository(User).find();
        return users;
    })

    .get("/profile", async ({ headers, db }) => {
        // Check if header have bearer token
        // console.log(headers);
        const authHeader = headers["authorization"];
        if (!authHeader || authHeader.split(" ")[0] != "Bearer" || authHeader.split(" ")[1] === "") {
            return {
                success: false,
                error: ErrorMessage.noAuthProvided
            };
        }

        const token = authHeader.split(" ")[1];
        console.log(token);
        const info = jwtVerify<AccessToken>(token, constants.jwtSecret);
        if (!info) {
            return {
                success: false,
                error: "Falsy Token"
            };
        }

        const userProfile = await db.manager.getRepository(User).findOne({
            where: { id: info.userId }
        });

        return {
            success: true,
            data: userProfile?.profile
        };
    });
