import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entity/User";
import { Profile } from "../entity/Profile";

export const AppDataSource = new DataSource({
    type: "mysql",
    host: Bun.env.APP_DB_HOST,
    port: Number(Bun.env.APP_DB_PORT) || undefined,
    username: Bun.env.APP_DB_USERNAME,
    password: Bun.env.APP_DB_PWD,
    database: Bun.env.APP_DB,
    synchronize: true,
    logging: false,
    entities: [User, Profile],
    migrations: [],
    subscribers: []
});
