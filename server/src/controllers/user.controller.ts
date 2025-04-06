import Elysia from "elysia";
import { User } from "../entity/User";
import { db, privateRoute } from "../utils/plugins";
import { Settings } from "../entity/Settings";
import { wrapResponse } from "../utils/responseWrapper";

export const userController = new Elysia({ prefix: "/user" })
    .use(privateRoute)
    .get("/", async ({ user }) => {
        return wrapResponse(async () => {
            const users = await db.manager.getRepository(User).find();
            return { users, user };
        });
    })

    .get("/profile", async ({ user }) => {
        return wrapResponse(async () => {
            const settings = await db.manager.getRepository(Settings).findOne({
                where: { user: { id: user.id } }
            });

            return { ...user, settings };
        });
    });
