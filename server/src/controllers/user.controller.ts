import Elysia from "elysia";
import { User } from "../entity/User";
import { decorations, privateRoute } from "../utils/plugins";
import { Settings } from "../entity/Settings";

export const userController = new Elysia({ prefix: "/user" })
    .use(decorations)
    .use(privateRoute)
    .get("/", async ({ db, user }) => {
        const users = await db.manager.getRepository(User).find();
        return { users, user };
    })

    .get("/profile", async ({ db, user }) => {
        const settings = await db.manager.getRepository(Settings).findOne({
            where: { user: { id: user.id } }
        });

        return {
            success: true,
            data: { ...user, settings }
        };
    });
