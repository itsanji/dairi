import Elysia from "elysia";
import { User } from "../entity/User";
import { dbClient } from "../utils/dbPlugin";

export const userController = new Elysia({ prefix: "/users" }).use(dbClient).get("/", ({ db }) => {
    const users = db.manager.getRepository(User).find();
    return users;
});
