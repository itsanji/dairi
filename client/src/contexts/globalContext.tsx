import React from "react";

interface IGlobalContext {
    socket: WebSocket | null;
}

const GlobalContext = React.createContext<IGlobalContext>({
    socket: null
});

export { GlobalContext };
