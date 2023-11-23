import axios, { AxiosInstance } from "axios";
import React from "react";

interface IGlobalContext {
    socket: WebSocket | null;
    fetch: AxiosInstance;
}

const fetch = axios.create({
    baseURL: import.meta.env.VITE_APP_BE_URL
});

const GlobalContext = React.createContext<IGlobalContext>({
    socket: null,
    fetch
});

export { GlobalContext };
