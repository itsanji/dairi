import { useContext, useEffect, useState } from "react";
import "./App.css";
import { GlobalContext } from "./contexts/globalContext";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Layout from "./components/Layout";
import Apps from "./pages/Apps";
import Auth from "./pages/Auth";
import NoMatch from "./pages/NoMatch";
import Test from "./pages/Test";
import { api } from "./utils/constants";
import { toast } from "react-toastify";
import { AxiosError } from "axios";

function App() {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const globalContext = useContext(GlobalContext);
    const [user, setUser] = useState<IUser | undefined>(undefined);
    const [theme, setTheme] = useState<SelectableThemes>("cupcake");
    const [isLogged, setIsLogged] = useState(false);

    // Open Socket when logged in
    useEffect(() => {
        if (isLogged) {
            let socket = new WebSocket(`ws://${import.meta.env.VITE_APP_BE_URL}/ws`);

            socket.addEventListener("error", (err) => {
                console.log({ err });
            });
            socket.onopen = () => {
                console.log("socket opened");
                setSocket(socket);
            };
            socket.onmessage = (ev) => {
                console.log("socket message: ", { data: JSON.parse(ev.data as string) });
            };

            socket.addEventListener("close", () => {
                console.log("Closed");
            });
        }
    }, [isLogged]);

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

    useEffect(() => {
        // fetch user info after logged in
        const getUser = async () => {
            globalContext.fetch
                .get(api().user.profile)
                .then(({ data }) => {
                    if (!data.success) {
                        toast.error(data.error);
                        return;
                    }
                    setUser(data.data);
                })
                .catch((error: AxiosError) => {
                    if (error.response) console.log(error.response.data);
                    toast.error("System error");
                });
        };
        if (isLogged && !user) {
            getUser();
        }
    }, [isLogged, user]);

    return (
        <GlobalContext.Provider
            value={{ socket, fetch: globalContext.fetch, isLogged, updateAuthState: setIsLogged, theme, updateTheme: setTheme, user }}
        >
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/apps" element={<Apps />} />
                    <Route path="/test" element={<Test />} />
                    <Route path="/*" element={<NoMatch />} />
                </Route>
            </Routes>
        </GlobalContext.Provider>
    );
}

export default App;
