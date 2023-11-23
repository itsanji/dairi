import Elysia from "elysia";
import { AppDataSource } from "./data-source";
import jwt from "@elysiajs/jwt";

const db = await AppDataSource.initialize();
const plugins = new Elysia({
    name: "db"
})
    .decorate("db", db)
    .use(
        jwt({
            name: "jwt",
            secret: "some super secret"
        })
    );
export { plugins };
