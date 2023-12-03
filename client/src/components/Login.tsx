import { useContext, useState } from "react";
import { GlobalContext } from "../contexts/globalContext";
import { api } from "../utils/constants";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { afterAuth, redirectOrigin } from "../utils/afterAuth";

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
                console.log(data);
                if (data.success) {
                    afterAuth(data, globalContext);
                    redirectOrigin(navigate);
                }
            })
            .catch((e: AxiosError) => {
                if (e.response) {
                    console.log(e.response.data);
                    toast.error("loggin failed. check credentials");
                }
            });
    };

    return (
        <>
            <h3>Login</h3>
            <form onSubmit={loginHandler}>
                <div>
                    <input type="text" value={username} placeholder="email" onChange={(e) => setUsername(e.currentTarget.value)} />
                </div>
                <div>
                    <input type="password" value={password} placeholder="password" onChange={(e) => setPassword(e.currentTarget.value)} />
                </div>
                <button type="submit">Submit</button>
            </form>
        </>
    );
};

export default Login;
