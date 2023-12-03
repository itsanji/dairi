const base = `http://${import.meta.env.VITE_APP_BE_URL}`;

const api = () => {
    // Path Define
    const auth = base + "/auth";

    // User
    const user = base + "/user";

    // Endpoit Define
    const authGroup = {
        register: auth + "/register",
        login: auth + "/login",
        verify: auth + "/verify",
        refresh: auth + "/refresh"
    };

    const userGroup = {
        profile: user + "/profile"
    };

    return {
        auth: authGroup,
        user: userGroup
    };
};

const constants = {
    accessTokenKey: "access",
    refreshTokenKey: "refresh",
    redirectOriginKey: "redirect-origin"
};

export { api, constants };
