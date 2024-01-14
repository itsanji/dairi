type Themes = "dark" | "light" | "cupcake" | "cyberpunk";

interface SocketMessage<T = SocketData> {
    type: string;
    data: T;
}

interface SocketData {
    msg?: string;
    [any: string]: any;
}

interface ITodo {
    id: number;
    name: string;
    isDone: boolean;
    addedAt: string;
}

interface IUser {
    id: string;
    username: string;
    email: string;
    password: string;
    createdAt: string;
    updatedAt: string;
    profile: IProfile;
    settings: Settings;
}

interface IProfile {
    id: number;
    firstname: string;
    lastname: string;
    createdAt: string;
    updatedAt: string;
}

interface ISettings {
    id: string;
    createdAt: string;
    updatedAt: string;
    theme: string;
    apps: any[];
}

type SelectableThemes = (readonly [
    "light",
    "dark",
    "cupcake",
    "bumblebee",
    "emerald",
    "corporate",
    "synthwave",
    "retro",
    "cyberpunk",
    "valentine",
    "halloween",
    "garden",
    "forest",
    "aqua",
    "lofi",
    "pastel",
    "fantasy",
    "wireframe",
    "black",
    "luxury",
    "dracula",
    "cmyk",
    "autumn",
    "business",
    "acid",
    "lemonade",
    "night",
    "coffee",
    "winter",
    "dim",
    "nord",
    "sunset"
])[number];
