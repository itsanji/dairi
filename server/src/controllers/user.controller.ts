import Elysia, { t } from "elysia";
import { User } from "../entity/User";
import { dbClient } from "../utils/dbPlugin";

export const userController = new Elysia({ prefix: "/users" })
    .use(dbClient)
    .get("/", ({ db }) => {
        const users = db.manager.getRepository(User).find();
        return users;
    })
    .post(
        "/",
        (context) => {
            const user = new User();
            user.firstName = context.body.firstName;
            user.lastName = context.body.lastName;
            user.age = context.body.age;
            context.db.manager.save(user);
            return {
                data: {
                    success: "ok",
                    user,
                },
            };
        },
        {
            body: t.Object({
                firstName: t.String(),
                lastName: t.String(),
                age: t.Number(),
            }),
            response: t.Object({
                data: t.Object({
                    success: t.String(),
                }),
            }),
        }
    );
