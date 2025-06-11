import { DataSource } from "typeorm";
import { User } from "../entity/User";
import { Profile } from "../entity/Profile";
import { Settings } from "../entity/Settings";

export const AppDataSource = new DataSource({
    type: "mysql",
    host: Bun.env.APP_DB_HOST || "localhost",
    port: parseInt(Bun.env.APP_DB_PORT || "3306"),
    username: Bun.env.APP_DB_USERNAME || "root",
    password: Bun.env.APP_DB_PWD || "",
    database: Bun.env.APP_DB || "dairi",
    synchronize: true,
    logging: false,
    entities: [User, Profile, Settings],
    migrations: [],
    subscribers: [],
});
