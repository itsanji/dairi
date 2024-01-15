export const constants = {
    jwtSecret: Bun.env.JWT_SECRET || "super secret",
    jwtAccessExpire: Bun.env.JWT_ACCS_EXPIRE || "1d",
    jwtRefreshExpire: Bun.env.JWT_REFR_EXPIRE || "30d",
    accessTokenKey: "access"
};
