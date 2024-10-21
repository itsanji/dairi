import Elysia from "elysia";
import { AppDataSource } from "./data-source";
import { ErrorMessage } from "./messages";
import { jwtVerify } from "./jwtUtils";
import { constants } from "./constants";
import { User } from "../entity/User";

const db = await AppDataSource.initialize();

// add user to context
const privateRoute = new Elysia({
    name: "auth-checker"
})
    .onError(({ error }) => {
        return {
            success: false,
            message: error.message
        };
    })
    .resolve({as: "global"}, async ({ headers, request, query }) => {
        let token = "";
        const connectionType = request.headers.get("connection");
        if (connectionType === "Upgrade") {
            token = query[constants.accessTokenKey] || "";
        } else {
            const authHeader = headers["authorization"];
            if (!authHeader || authHeader.split(" ")[0] != "Bearer" || authHeader.split(" ")[1] === "") {
                throw new Error(ErrorMessage.noAuthProvided);
            }
            token = authHeader.split(" ")[1];
        }

        const info = jwtVerify<AccessToken>(token, constants.jwtSecret);
        if (!info) {
            throw new Error(ErrorMessage.tokenInvalid);
        }

        const user = await db.manager.getRepository(User).findOne({
            where: { id: info.userId }
        });

        if (!user) {
            throw new Error(ErrorMessage.userNotExisted);
        }
        return { 'user': user };
    });

export { db, privateRoute };
