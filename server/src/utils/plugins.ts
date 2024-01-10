import Elysia from "elysia";
import { AppDataSource } from "./data-source";
import { ErrorMessage } from "./messages";
import { jwtVerify } from "./jwtUtils";
import { constants } from "./constants";
import { User } from "../entity/User";

const db = await AppDataSource.initialize();

// add db to context
const decorations = new Elysia({
    name: "db"
}).decorate("db", db);

// add user to context
const privateRoute = new Elysia({
    name: "auth-checker"
})
    .use(decorations)
    .onError(({ error }) => {
        return {
            success: false,
            message: error.message
        };
    })
    .derive(async ({ headers, db }) => {
        const authHeader = headers["authorization"];
        if (!authHeader || authHeader.split(" ")[0] != "Bearer" || authHeader.split(" ")[1] === "") {
            throw new Error(ErrorMessage.noAuthProvided);
        }

        const token = authHeader.split(" ")[1];
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
        return { user };
    });

export { decorations, privateRoute };
