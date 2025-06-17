const base = import.meta.env.PROD ? `https://${import.meta.env.VITE_APP_PROD_BE_URL}` : `http://${import.meta.env.VITE_APP_BE_URL}`;

const api = () => ({
    auth: {
        register: "/auth/register",
        login: "/auth/login",
        verify: "/auth/verify",
        refresh: "/auth/refresh"
    },
    user: {
        profile: "/user/profile"
    },
    server: {
        info: "/server/info"
    },
    jobs: {
        exchangeRate: "/jobs/exchange-rate",
        exchangeRateSettings: "/jobs/exchange-rate/settings",
        exchangeRateUpdate: "/jobs/exchange-rate/update"
    },
    rocket: {
        schedules: "/rocket/schedules",
        channels: "/rocket/channels"
    }
});

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

export { api, base, constants };
