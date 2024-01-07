import { useContext, useState } from "react";
import { GlobalContext } from "../../contexts/globalContext";
import { api } from "../../utils/constants";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Register: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [repassword, setRePassword] = useState("");
    const [email, setEmail] = useState("");
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const globalContext = useContext(GlobalContext);
    const navigate = useNavigate();

    const registerHandler = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        globalContext.fetch
            .post(api().auth.register, {
                username,
                email,
                password,
                rePassword: repassword,
                firstname,
                lastname
            })
            .then(({ data }) => {
                console.log(data);
                if (data.success) {
                    toast("Register susscess");
                    navigate("/auth?state=login");
                }

                if (!data.success) {
                    toast(data.error, { type: "error" });
                }
            })
            .catch((e: AxiosError) => {
                if (e.response) {
                    console.log(e.response.data);
                    toast.error("register failed. server problem ig");
                }
            });
    };

    return (
        <>
            <h3 className="text-lg font-bold text-center mb-4">Register</h3>
            <form onSubmit={registerHandler} className="max-w-sm mx-auto p-4">
                <div className="mb-4">
                    <input
                        type="text"
                        value={username}
                        placeholder="username"
                        onChange={(e) => setUsername(e.currentTarget.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
                    />
                </div>
                <div className="mb-4">
                    <input
                        type="text"
                        value={email}
                        placeholder="email"
                        onChange={(e) => setEmail(e.currentTarget.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
                    />
                </div>
                <div className="mb-4">
                    <input
                        type="text"
                        value={firstname}
                        placeholder="firstname"
                        onChange={(e) => setFirstname(e.currentTarget.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
                    />
                </div>
                <div className="mb-4">
                    <input
                        type="text"
                        value={lastname}
                        placeholder="lastname"
                        onChange={(e) => setLastname(e.currentTarget.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
                    />
                </div>
                <div className="mb-4">
                    <input
                        type="password"
                        value={password}
                        placeholder="password"
                        onChange={(e) => setPassword(e.currentTarget.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
                    />
                </div>
                <div className="mb-4">
                    <input
                        type="password"
                        value={repassword}
                        placeholder="re-password"
                        onChange={(e) => setRePassword(e.currentTarget.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
                    />
                </div>
                <button type="submit" className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                    Submit
                </button>
            </form>
        </>
    );
};

export default Register;
