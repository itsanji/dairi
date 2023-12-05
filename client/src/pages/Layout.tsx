import React, { useContext } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { GlobalContext } from "../contexts/globalContext";
import { constants } from "../utils/constants";
import "./pages.css";

const Layout: React.FC = () => {
    return (
        <>
            <NavBar />
            <div style={{ padding: "10px" }}>
                <Outlet />
            </div>
        </>
    );
};

const NavBar: React.FC = () => {
    const globalContext = useContext(GlobalContext);
    const navigate = useNavigate();

    const logout = () => {
        window.localStorage.removeItem(constants.accessTokenKey);
        window.localStorage.removeItem(constants.refreshTokenKey);
        navigate("/auth?state=login");
        globalContext.updateLogState(false);
    };

    return (
        <div className="navbar-container">
            {globalContext.isLogged ? (
                <>
                    <p>user logged in</p>
                    <button onClick={logout}>Logout</button>
                </>
            ) : (
                <>
                    <button
                        onClick={() => {
                            navigate("/auth?state=login");
                        }}
                    >
                        Please login
                    </button>
                </>
            )}
        </div>
    );
};

export default Layout;
