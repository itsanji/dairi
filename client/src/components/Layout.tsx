import React, { useContext } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { GlobalContext } from "../contexts/globalContext";
import { constants } from "../utils/constants";
import Btn from "./UI/Btn";
import ThemeSelector from "./UI/ThemeSelector";

const Layout: React.FC = () => {
    const globalContext = useContext(GlobalContext);

    return (
        <div
            data-theme={globalContext.theme}
            style={{
                minHeight: "100vh"
            }}
        >
            <NavBar />
            <div style={{ padding: "10px" }}>
                <Outlet />
            </div>
        </div>
    );
};

const NavBar: React.FC = () => {
    const globalContext = useContext(GlobalContext);
    const navigate = useNavigate();

    const logout = () => {
        window.localStorage.removeItem(constants.accessTokenKey);
        window.localStorage.removeItem(constants.refreshTokenKey);
        navigate("/auth?state=login");
        globalContext.updateAuthState(false);
    };

    return (
        <div className="flex justify-end p-10 h-50">
            {globalContext.isLogged ? (
                <>
                    <p>user logged in</p>
                    <Btn onClick={logout}>Logout</Btn>
                </>
            ) : (
                <>
                    <ThemeSelector />
                    <Btn
                        onClick={() => {
                            navigate("/auth?state=login");
                        }}
                    >
                        Please login
                    </Btn>
                </>
            )}
        </div>
    );
};

export default Layout;
