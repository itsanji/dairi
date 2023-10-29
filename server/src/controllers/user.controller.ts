import Elysia, { t } from "elysia";
import { User } from "../entity/User";
import { DataSource } from "typeorm";

export const userController = (db: DataSource) =>
    new Elysia({ prefix: "/users" })
        .decorate("db", db)
        .get("/", ({ db }) => {
            const users = db.manager.getRepository(User).find();
            return users;
        })
        // .guard({
        //     body: t.Object({
        //         firstName: t.String(),
        //         lastName: t.String(),
        //         age: t.Number(),
        //     }),
        //     response: t.Object({
        //         data: t.Object({
        //             success: t.String(),
        //         }),
        //     }),
        // })
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
