import { useEffect } from "react";
import "./App.css";
import { toast } from "react-toastify";

const socket = new WebSocket("ws://localhost:4000/ws");

function App() {
    useEffect(() => {
        socket.addEventListener("open", () => {
            console.log("openedddddddddddddddd");
        });
        socket.addEventListener("message", (ev) => {
            console.log("socket message: ", { data: JSON.parse(ev.data) });
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
                data: {
                    test: "ok",
                },
            })
        );
    };

    const testPost = () => {
        fetch("http://localhost:4000/users", {
            method: "POST",
            body: JSON.stringify({
                firstName: "test",
                lastName: "test",
                age: 10,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
            });
    };

    return (
        <>
            <button onClick={sendSocketMessage}>send message to backend</button>
            <button onClick={testPost}>Test Post</button>
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
