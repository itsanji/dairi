import { useContext, useEffect, useRef, useState } from "react";
import "./App.css";
import { toast } from "react-toastify";
import TodoApp from "./components/TodoApp";
import { GlobalContext } from "./contexts/globalContext";
import type { App } from "../../server/src/";
import { api } from "./utils/api";

const _socket = new WebSocket(`ws://${import.meta.env.VITE_APP_BE_URL}/ws`);

function App() {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const globalContext = useContext(GlobalContext);
    // const usernameRef = useRef<HTMLInputElement>(null);
    // const emailRef = useRef<HTMLInputElement>(null);
    // const passwordRef = useRef<HTMLInputElement>(null);
    // const rePwdRef = useRef<HTMLInputElement>(null);
    const numRef = useRef<HTMLInputElement>(null);
    const num2Ref = useRef<HTMLInputElement>(null);

    useEffect(() => {
        _socket.addEventListener("error", (err) => {
            console.log({ err });
        });

        _socket.onopen = () => {
            console.log("socket opened");
            setSocket(_socket);
        };
        _socket.onmessage = (ev) => {
            console.log("socket message: ", { data: JSON.parse(ev.data as string) });
        };

        _socket.addEventListener("close", () => {
            console.log("Closed");
        });
    }, []);

    // const sendSocketMessage = () => {
    //     _socket.send(
    //         JSON.stringify({
    //             type: "test",
    //             data: {
    //                 test: "ok"
    //             }
    //         })
    //     );
    // };

    const registerHandle = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const input = numRef.current;
        if (!input) {
            return console.log("no ref");
        }

        const id = numRef.current.value || 1;

        const data = await globalContext.fetch.post(api().auth.register, {
            username: `usernam${id}`,
            email: `email${id}`,
            password: `password${id}`,
            rePassword: `password${id}`,
            firstname: `Test${id}`,
            lastname: `Last${id}`
        });

        console.log(data.data);
    };

    const loginHandler = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const input = num2Ref.current;
        if (!input) {
            return console.log("no ref");
        }

        const id = num2Ref.current.value || 1;

        const data = await globalContext.fetch.post(api().auth.login, {
            username: `usernam${id}`,
            password: `password${id}`
        });

        console.log(data);

        // setting accessToken to localStorage
        if (data.data.data.accessToken) {
            window.localStorage.setItem("accessToken", data.data.data.accessToken);
        }
    };

    const getProfile = () => {
        // accessToken
        const accessToken = window.localStorage.getItem("accessToken");
        if (!accessToken) {
            return console.log("No accessToken, should login again");
        }

        globalContext.fetch.get(api().user.profile, {
            headers: {
                Authorization: "Bearer " + accessToken
            }
        });
    };

    return (
        <GlobalContext.Provider value={{ socket, fetch: globalContext.fetch }}>
            {/* <TodoApp /> */}
            <form onSubmit={registerHandle}>
                <h4>register</h4>
                {/* <div>
                    <input ref={usernameRef} type="text" placeholder="username" />
                </div>
                <div>
                    <input ref={emailRef} type="text" placeholder="email" />
                </div>
                <div>
                    <input ref={passwordRef} type="text" placeholder="password" />
                </div>
                <div>
                    <input ref={rePwdRef} type="text" placeholder="re-password" />
                </div> */}
                <div>
                    <input type="text" ref={numRef} />
                </div>
                <button type="submit">Submit</button>
            </form>
            <form onSubmit={loginHandler}>
                <h4>Login</h4>
                <div>
                    <input type="text" ref={num2Ref} />
                </div>
                <button type="submit">Submit</button>
            </form>
            <div>
                <button onClick={getProfile}>Get Profile</button>
            </div>
        </GlobalContext.Provider>
    );
}

export default App;
