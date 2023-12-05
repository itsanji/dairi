import axios, { AxiosInstance } from "axios";
import React from "react";

interface IGlobalContext {
    socket: WebSocket | null;
    fetch: AxiosInstance;
    isLogged: boolean;
    updateLogState: (isLogged: boolean) => void;
}

const fetch = axios.create({
    baseURL: import.meta.env.VITE_APP_BE_URL
});

const GlobalContext = React.createContext<IGlobalContext>({
    socket: null,
    fetch,
    isLogged: false,
    updateLogState: () => {}
});

export { GlobalContext, type IGlobalContext };
