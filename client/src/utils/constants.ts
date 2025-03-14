const base = `http://${import.meta.env.VITE_APP_BE_URL}`;

const api = () => {
    // Path Define
    const auth = base + "/auth";

    // User
    const user = base + "/user";

    const server = base + "/server";

    const serverGroup = {
        info: server + "/info"
    };

    const exchangeGroup = {
        exchangeRate: base + "/jobs/exchange-rate"
    };

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
        user: userGroup,
        server: serverGroup,
        exchangeGroup
    };
};

const selectableThemes: SelectableThemes[] = [
    "light",
    "dark",
    "cupcake",
    // "bumblebee",
    // "emerald",
    // "corporate",
    "synthwave",
    "retro",
    "cyberpunk",
    "valentine",
    // "halloween",
    "garden",
    // "forest",
    "aqua",
    // "lofi",
    // "pastel",
    // "fantasy",
    // "wireframe",
    // "black",
    // "luxury",
    "dracula",
    // "cmyk",
    // "autumn",
    // "business",
    "acid",
    "lemonade",
    "night",
    "coffee",
    "winter",
    // "dim",
    "nord"
    // "sunset"
] as const;

const constants = {
    accessTokenKey: "access",
    refreshTokenKey: "refresh",
    redirectOriginKey: "redirect-origin",
    selectableThemes
};

export { api, constants };
