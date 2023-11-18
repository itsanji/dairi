import { useEffect, useState } from "react";
import "./App.css";
import { toast } from "react-toastify";
import TodoApp from "./components/TodoApp";
import { GlobalContext } from "./contexts/globalContext";
import { edenTreaty } from "@elysiajs/eden";
import type { App } from "../../server/src/";

const _socket = new WebSocket(`ws://${import.meta.env.VITE_APP_BE_URL}/ws`);

const client = edenTreaty<App>(`http://${import.meta.env.VITE_APP_BE_URL}`);

function App() {
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        console.log(import.meta.env);
        client.health.get().then((data) => {
            console.log(data.data);
        });
    }, []);

    useEffect(() => {
        _socket.addEventListener("error", (err) => {
            console.log({ err });
        });

        _socket.onopen = () => {
            console.log("socket opened");
            setSocket(_socket);
        };
        _socket.onmessage = (ev) => {
            console.log("socket message: ", { data: JSON.parse(ev.data) });
        };

        _socket.addEventListener("close", () => {
            console.log("Closed");
        });
    }, []);

    const sendSocketMessage = () => {
        _socket.send(
            JSON.stringify({
                type: "test",
                data: {
                    test: "ok"
                }
            })
        );
    };

    return (
        <GlobalContext.Provider value={{ socket }}>
            <button onClick={sendSocketMessage}>send message to backend</button>
            <button
                onClick={() => {
                    toast("TOAST");
                }}
            >
                Toast
            </button>
            <TodoApp />
        </GlobalContext.Provider>
    );
}

export default App;
