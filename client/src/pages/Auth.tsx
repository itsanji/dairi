import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Login from "../components/Login";
import Register from "../components/Register";

const Auth: React.FC = () => {
    const [searchParam, setSearchParam] = useSearchParams();
    const [pageState, setPageState] = useState<"login" | "register">("login");

    useEffect(() => {
        const stateUrlParam = searchParam.get("state");
        setPageState(stateUrlParam === "register" ? "register" : "login");
    }, [searchParam.get("state")]);

    return (
        <div>
            <h1>Auth</h1>
            <button
                onClick={() => {
                    setSearchParam((prev) => {
                        prev.set("state", "login");
                        return prev;
                    });
                }}
            >
                Login
            </button>
            <button
                onClick={() => {
                    setSearchParam((prev) => {
                        prev.set("state", "register");
                        return prev;
                    });
                }}
            >
                Register
            </button>
            {pageState === "register" ? (
                <div>
                    <Register />
                </div>
            ) : (
                <div>
                    <Login />
                </div>
            )}
        </div>
    );
};

export default Auth;
