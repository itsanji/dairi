declare module "bun" {
    interface Env {
        PORT: string;
        APP_DB: string;
        APP_DB_HOST: string;
        APP_DB_PORT: string;
        APP_DB_USERNAME: string;
        APP_DB_PWD: string;
    }
}
