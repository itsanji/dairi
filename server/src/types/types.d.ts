declare module "bun" {
    interface Env {
        PORT: string;
        APP_DB: string;
        APP_DB_HOST: string;
        APP_DB_PORT: string;
        APP_DB_USERNAME: string;
        APP_DB_PWD: string;
        JWT_SECRET: string;
        JWT_ACCS_EXPIRE: string;
        JWT_REFR_EXPIRE: string;
    }
}

interface AccessToken {
    userId: string;
}

interface RefreshToken {
    id: string;
    iat: number;
    exp: number;
}
