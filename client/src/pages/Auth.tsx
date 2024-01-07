import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Login from "../components/Auth/Login";
import Register from "../components/Auth/Register";
import Btn from "../components/UI/Btn";

const Auth: React.FC = () => {
    const [searchParam, setSearchParam] = useSearchParams();
    const [pageState, setPageState] = useState<"login" | "register">("login");

    useEffect(() => {
        const stateUrlParam = searchParam.get("state");
        setPageState(stateUrlParam === "register" ? "register" : "login");
    }, [searchParam.get("state")]);

    return (
        <div>
            <Btn
                onClick={() => {
                    setSearchParam((prev) => {
                        prev.set("state", "login");
                        return prev;
                    });
                }}
            >
                Login
            </Btn>
            <Btn
                onClick={() => {
                    setSearchParam((prev) => {
                        prev.set("state", "register");
                        return prev;
                    });
                }}
            >
                Register
            </Btn>
            <div>{pageState === "register" ? <Register /> : <Login />}</div>
        </div>
    );
};

export default Auth;
