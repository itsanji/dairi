import Elysia, { t } from "elysia";
import { dbClient } from "../utils/dbPlugin";
import jwt from "@elysiajs/jwt";
import cookie from "@elysiajs/cookie";
import * as bcrypt from "bcryptjs";
import { User } from "../entity/User";
import { ErrorMessage, MessageList } from "../utils/messages";
import { Profile } from "../entity/Profile";

export const authController = new Elysia({
    name: "auth",
    prefix: "auth"
})
    .use(dbClient)
    .use(cookie())
    .use(
        jwt({
            name: "jwt",
            secret: "some super secret"
        })
    )
    .post(
        "register",
        async ({ body, db }) => {
            if (body.password !== body.rePassword) {
                return {
                    success: false,
                    error: ErrorMessage.retypePwd
                };
            }
            // check if user existed
            const isExisted = await db.manager.getRepository(User).findOne({
                where: { username: body.username }
            });

            if (isExisted) {
                return {
                    success: false,
                    error: ErrorMessage.userExisted
                };
            }

            try {
                // create new user
                const userProfile = new Profile();
                userProfile.firstname = body.firstname;
                userProfile.lastname = body.lastname;
                await db.manager.getRepository(Profile).save(userProfile);

                const newUser = new User();
                newUser.username = body.username;

                // Encrypting password
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(body.password, salt);
                newUser.password = hashedPassword;
                newUser.profile = userProfile;
                await db.manager.getRepository(User).save(newUser);

                return {
                    success: true,
                    data: {
                        message: MessageList.userCreated
                    }
                };
            } catch (e) {
                // log to file later
                console.log(e);
                // return sys error
                return {
                    success: false,
                    error: ErrorMessage.systemError
                };
            }
        },
        {
            body: t.Object({
                username: t.String(),
                password: t.String(),
                rePassword: t.String(),
                firstname: t.String(),
                lastname: t.String()
            })
        }
    )
    .post(
        "login",
        async ({ body, db, setCookie, jwt }) => {
            const { username, password } = body;

            // If User exist
            const user = await db.manager.getRepository(User).findOne({
                where: [{ username: username }, { email: username }]
            });
            if (!user) {
                return {
                    success: false,
                    error: ErrorMessage.userNotExisted
                };
            }

            // Comparing password
            const isSamePwd = bcrypt.compare(password, user.password);

            if (!isSamePwd) {
                return {
                    success: false,
                    error: ErrorMessage.wrongPassword
                };
            }

            // Setting cookie
            setCookie(
                "auth",
                await jwt.sign({
                    userId: user.id
                }),
                {
                    httpOnly: true,
                    maxAge: 7 * 86400
                }
            );
        },
        {
            body: t.Object({
                username: t.String(),
                password: t.String()
            })
        }
    )
    .post("verify", async () => {})
    .post("refresh", async () => {});
