import Elysia, { t } from "elysia";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";

export const userController = new Elysia({ prefix: "/users" })
    .get("/", () => {
        const users = AppDataSource.manager.getRepository(User).find();
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
            AppDataSource.manager.save(user);
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
