import Elysia from "elysia";
import { AppDataSource } from "./data-source";

const db = await AppDataSource.initialize();

const decorations = new Elysia({
    name: "db"
}).decorate("db", db);

export { decorations };
