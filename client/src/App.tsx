import { useEffect } from "react";
import "./App.css";
import { toast } from "react-toastify";

const socket = new WebSocket("ws://localhost:3000/ws");

function App() {
    useEffect(() => {
        socket.addEventListener("open", () => {
            console.log("opened");
        });
        socket.addEventListener("message", (ev) => {
            console.log("message", { ev });
        });
        socket.addEventListener("error", (err) => {
            console.log({ err });
        });

        socket.addEventListener("close", () => {
            console.log("Closed");
        });
    }, []);

    const sendSocketMessage = () => {
        socket.send(
            JSON.stringify({
                type: "test",
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
        </>
    );
}

export default App;
