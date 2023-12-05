import { useContext, useEffect, useState } from "react";
import "./App.css";
import { GlobalContext } from "./contexts/globalContext";
import type { App } from "../../server/src/";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Layout from "./pages/Layout";
import Apps from "./pages/Apps";
import Auth from "./pages/Auth";
import NoMatch from "./pages/NoMatch";
import { api, constants } from "./utils/constants";
import { redirectOrigin, afterAuth } from "./utils/afterAuth";

function App() {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const globalContext = useContext(GlobalContext);
    const [checked, setChecked] = useState(false);
    const [isLogged, setIsLogged] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

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

    useEffect(() => {
        const currentURL = location.pathname + location.search;
        window.localStorage.setItem(constants.redirectOriginKey, currentURL);

        const verifing = async () => {
            // verifing token
            const accessToken = window.localStorage.getItem(constants.accessTokenKey);
            const refreshToken = window.localStorage.getItem(constants.refreshTokenKey);

            if (!accessToken || !refreshToken) {
                if (location.pathname === "/auth") {
                    navigate(currentURL);
                } else {
                    navigate("/auth?state=login");
                }
                return;
            }

            const { data } = await globalContext.fetch.get(api().auth.verify, {
                headers: {
                    Authorization: "Bearer " + accessToken
                }
            });

            // verify complete, check if redirect origin
            if (data.success) {
                afterAuth(data, globalContext);
                redirectOrigin(navigate);
                return;
            }

            // checking w refresh token
            const { data: checkRefresh } = await globalContext.fetch.get(api().auth.refresh, {
                headers: {
                    Authorization: "Bearer " + refreshToken
                }
            });

            if (checkRefresh.success) {
                afterAuth(checkRefresh, globalContext);
                redirectOrigin(navigate);
                return;
            }
            if (location.pathname === "/auth") {
                navigate(currentURL);
            } else {
                navigate("/auth?state=login");
            }
        };

        if (globalContext && !checked) {
            verifing();
            setChecked(true);
        }
    }, [globalContext]);

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

    return (
        <GlobalContext.Provider value={{ socket, fetch: globalContext.fetch, isLogged, updateLogState: setIsLogged }}>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/apps" element={<Apps />} />
                    <Route path="/*" element={<NoMatch />} />
                </Route>
            </Routes>
        </GlobalContext.Provider>
    );
}

export default App;
