import { useContext, useState } from "react";
import { GlobalContext } from "../../contexts/globalContext";
import { api } from "../../utils/constants";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { afterAuth, redirectOrigin } from "../../utils/afterAuth";

interface ErrorResponse {
    success: boolean;
    message: string;
}

const Login: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const globalContext = useContext(GlobalContext);
    const navigate = useNavigate();

    const loginHandler = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        globalContext.fetch
            .post(api().auth.login, {
                username,
                password
            })
            .then(({ data }) => {
                if (data.success) {
                    toast("Logged in successfully");
                    afterAuth(data, globalContext);
                    redirectOrigin(navigate);
                } else {
                    toast.error(data.message || "Login failed");
                }
            })
            .catch((e: AxiosError<ErrorResponse>) => {
                if (e.response?.data) {
                    console.log(e.response.data);
                    toast.error(e.response.data.message || "Login failed. Please check your credentials.");
                } else {
                    toast.error("Login failed. Please try again.");
                }
            });
    };

    return (
        <>
            <h3 className="text-lg font-bold text-center mb-4">Login</h3>
            <form onSubmit={loginHandler} className="max-w-sm mx-auto p-4">
                <div className="mb-4">
                    <input
                        type="text"
                        value={username}
                        placeholder="Username or Email"
                        onChange={(e) => setUsername(e.currentTarget.value)}
                        className="input input-bordered input-primary w-full"
                    />
                </div>
                <div className="mb-4">
                    <input
                        type="password"
                        value={password}
                        placeholder="Password"
                        onChange={(e) => setPassword(e.currentTarget.value)}
                        className="input input-bordered input-primary w-full"
                    />
                </div>
                <button type="submit" className="w-full btn btn-outline">
                    Login
                </button>
            </form>
        </>
    );
};

export default Login;
