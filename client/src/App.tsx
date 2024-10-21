import { useContext, useEffect, useState } from "react";
import "./App.css";
import { GlobalContext } from "./contexts/globalContext";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Layout from "./components/Layout";
import Apps from "./pages/Apps";
import Auth from "./pages/Auth";
import NoMatch from "./pages/NoMatch";
// import Test from "./pages/Test";
import { api, constants } from "./utils/constants";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { SocketInstance } from "./utils/SocketInstance";

function App() {
    const globalContext = useContext(GlobalContext);
    const [user, setUser] = useState<IUser | undefined>(undefined);
    const [theme, setTheme] = useState<SelectableThemes>("cupcake");
    const [isLogged, setIsLogged] = useState(false);
    const [socket, setSocket] = useState<SocketInstance<SocketData> | null>(null);

    // Open Socket when logged in
    useEffect(() => {
        if (isLogged) {
            const accessToken = window.localStorage.getItem(constants.accessTokenKey);
            const socket = new SocketInstance(new WebSocket(`ws://${import.meta.env.VITE_APP_BE_URL}/ws?access=${accessToken}`), {
                defaultEvents: {
                    open() {
                        toast("opened");
                    },
                    close() {
                        toast("closed");
                    }
                }
            });
            setSocket(socket);
        }
    }, [isLogged]);

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

    useEffect(() => {
        if (socket) {
            socket
                .on("bruh1", (data) => {
                    toast(data.msg);
                })
                .on("open-id", (data) => {
                    toast(data.msg);
                })
                .on<{ msg: string; data: IUser }>("bruh2", ({ msg, data }) => {
                    toast(msg + " " + data.username);
                })
                .on("bruh3", (data) => {
                    toast(data.msg);
                });
        }
    }, [socket]);

    return (
        <GlobalContext.Provider
            value={{ socket, fetch: globalContext.fetch, isLogged, updateAuthState: setIsLogged, theme, updateTheme: setTheme, user }}
        >
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/apps" element={<Apps />} />
                    {/*<Route path="/test" element={<Test />} /> */}
                    <Route path="/*" element={<NoMatch />} />
                </Route>
            </Routes>
        </GlobalContext.Provider>
    );
}

export default App;
