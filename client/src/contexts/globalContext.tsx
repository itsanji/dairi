import axios, { AxiosInstance } from "axios";
import React from "react";

interface IGlobalContext {
    socket: WebSocket | null;
    fetch: AxiosInstance;
    isLogged: boolean;
    updateAuthState: (isLogged: boolean) => void;
    theme: SelectableThemes;
    updateTheme: (newTheme: SelectableThemes) => void;
}

const fetch = axios.create({
    baseURL: import.meta.env.VITE_APP_BE_URL
});

const GlobalContext = React.createContext<IGlobalContext>({
    socket: null,
    theme: "cupcake",
    updateTheme: () => {},
    fetch,
    isLogged: false,
    updateAuthState: () => {}
});

export { GlobalContext, type IGlobalContext };
