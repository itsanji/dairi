import Elysia, { t } from "elysia";
import * as bcrypt from "bcryptjs";
import { User } from "../entity/User";
import { ErrorMessage, MessageList } from "../utils/messages";
import { Profile } from "../entity/Profile";
import jwt from "jsonwebtoken";
import { constants } from "../utils/constants";
import { jwtVerify } from "../utils/jwtUtils";
import { Settings } from "../entity/Settings";
import { db } from "../utils/plugins";

export const authController = new Elysia({
    name: "auth",
    prefix: "auth"
})
    .post(
        "register",
        async ({ body }) => {
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
                newUser.email = body.email;
                newUser.profile = userProfile;

                await db.manager.getRepository(User).save(newUser);

                // create default setting
                const userSetting = new Settings();
                userSetting.apps = [];
                userSetting.user = newUser;
                await db.manager.getRepository(Settings).save(userSetting);

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
                email: t.String(),
                password: t.String(),
                rePassword: t.String(),
                firstname: t.String(),
                lastname: t.String()
            })
        }
    )
    .post(
        "login",
        async ({ body  }) => {
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
            const accessToken = jwt.sign({ userId: user.id } as AccessToken, constants.jwtSecret, {
                expiresIn: constants.jwtAccessExpire
            });

            const refreshToken = jwt.sign({ id: user.id } as RefreshToken, constants.jwtSecret, {
                expiresIn: constants.jwtRefreshExpire
            });

            return {
                success: true,
                data: {
                    accessToken,
                    refreshToken
                }
            };
        },
        {
            body: t.Object({
                username: t.String(),
                password: t.String()
            })
        }
    )
    .get("verify", async ({ headers  }) => {
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
        const info = jwtVerify<AccessToken>(token, constants.jwtSecret);
        if (!info) {
            return {
                success: false,
                error: ErrorMessage.tokenInvalid
            };
        }

        // Check if user really existed
        const userProfile = await db.manager.getRepository(User).findOne({
            where: { id: info.userId }
        });

        if (!userProfile) {
            return {
                success: false,
                error: ErrorMessage.tokenInvalid
            };
        }

        const newAccessToken = jwt.sign({ userId: userProfile.id }, constants.jwtSecret, {
            expiresIn: constants.jwtAccessExpire
        });

        const newRefreshToken = jwt.sign({ id: userProfile.id }, constants.jwtSecret, {
            expiresIn: constants.jwtRefreshExpire
        });

        return {
            success: true,
            data: { accessToken: newAccessToken, refreshToken: newRefreshToken }
        };
    })
    .get("refresh", async ({ headers }) => {
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
        const info = jwtVerify<RefreshToken>(token, constants.jwtSecret);
        if (!info) {
            return {
                success: false,
                error: ErrorMessage.tokenInvalid
            };
        }

        // Check if user really existed
        const userProfile = await db.manager.getRepository(User).findOne({
            where: { id: info.id }
        });

        if (!userProfile) {
            return {
                success: false,
                error: ErrorMessage.tokenInvalid
            };
        }

        const newAccessToken = jwt.sign({ userId: userProfile.id }, constants.jwtSecret, {
            expiresIn: constants.jwtAccessExpire
        });

        const newRefreshToken = jwt.sign({ id: userProfile.id }, constants.jwtSecret, {
            expiresIn: constants.jwtRefreshExpire
        });

        return {
            success: true,
            data: { accessToken: newAccessToken, refreshToken: newRefreshToken }
        };
    });
