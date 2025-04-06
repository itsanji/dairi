import axios, { AxiosInstance } from "axios";
import React from "react";
import { SocketInstance } from "../utils/SocketInstance";
import { base as baseUrl } from "../utils/constants";

interface IGlobalContext {
    socket: SocketInstance<SocketData> | null;
    fetch: AxiosInstance;
    isLogged: boolean;
    updateAuthState: (isLogged: boolean) => void;
    theme: SelectableThemes;
    updateTheme: (newTheme: SelectableThemes) => void;
    user: IUser | undefined;
}

const fetch = axios.create({
    baseURL: baseUrl
});

const GlobalContext = React.createContext<IGlobalContext>({
    socket: null,
    theme: "cupcake",
    updateTheme: () => { },
    fetch,
    isLogged: false,
    updateAuthState: () => { },
    user: undefined
});

export { GlobalContext, type IGlobalContext };
