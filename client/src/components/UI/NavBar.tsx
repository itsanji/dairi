import { Link, useNavigate } from "react-router-dom";
import { constants } from "../../utils/constants";
import MinidenticonImg from "./Avatar";
import Btn from "./Btn";
import ThemeSelector from "./ThemeSelector";
import { useContext } from "react";
import { GlobalContext } from "../../contexts/globalContext";

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
        <div className="navbar bg-base-100">
            <div className="flex-1">
                <Link to={globalContext.isLogged ? "/" : "/auth"} className="btn btn-ghost text-xl">
                    Dairi
                </Link>
            </div>
            {globalContext.isLogged ? (
                <>
                    <div className="avatar w-12 mx-1">
                        <div className="rounded-xl hover:outline">
                            <MinidenticonImg username={"test"} />
                        </div>
                    </div>
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

export default NavBar;
