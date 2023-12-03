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

const _socket = new WebSocket(`ws://${import.meta.env.VITE_APP_BE_URL}/ws`);

function App() {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const globalContext = useContext(GlobalContext);
    const [checked, setChecked] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

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

    useEffect(() => {
        window.localStorage.setItem(constants.redirectOriginKey, location.pathname + location.search);

        const verifing = async () => {
            console.log("1");
            // verifing token
            const accessToken = window.localStorage.getItem(constants.accessTokenKey);
            // if (!accessToken) {
            //     navigate("/auth?state=login");
            //     return;
            // }

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
            const refreshToken = window.localStorage.getItem(constants.refreshTokenKey);
            if (!refreshToken) {
                navigate("/auth?state=login");
            }

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

            navigate("/auth?state=login");
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

    const getProfile = () => {
        globalContext.fetch.get(api().user.profile, {});
    };

    return (
        <GlobalContext.Provider value={{ socket, fetch: globalContext.fetch }}>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/apps" element={<Apps />} />
                    <Route path="/*" element={<NoMatch />} />
                </Route>
            </Routes>
            <button onClick={getProfile}>Get Profile</button>
        </GlobalContext.Provider>
    );
}

export default App;
