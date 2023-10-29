import { useEffect } from "react";
import "./App.css";
import { toast } from "react-toastify";
import TodoApp from "./components/TodoApp";

const socket = new WebSocket("ws://localhost:4000/ws");

function App() {
    useEffect(() => {
        socket.addEventListener("error", (err) => {
            console.log({ err });
        });

        socket.onopen = () => {
            console.log("socket opened");
        };
        socket.onmessage = (ev) => {
            console.log("socket message: ", { data: JSON.parse(ev.data) });
        };

        socket.addEventListener("close", () => {
            console.log("Closed");
        });
    }, []);

    const sendSocketMessage = () => {
        socket.send(
            JSON.stringify({
                type: "test",
                data: {
                    test: "ok",
                },
            })
        );
    };

    return (
        <>
            <button onClick={sendSocketMessage}>send message to backend</button>
            <button
                onClick={() => {
                    toast("TOAST");
                }}
            >
                Toast
            </button>
            <TodoApp />
        </>
    );
}

export default App;
