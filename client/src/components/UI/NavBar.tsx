import { Link, useNavigate } from "react-router-dom";
import { constants } from "../../utils/constants";
import MinidenticonImg from "./Avatar";
import Btn from "./Btn";
import ThemeSelector from "./ThemeSelector";
import { useContext, useMemo, useState } from "react";
import { GlobalContext } from "../../contexts/globalContext";

const NavBar: React.FC = () => {
    const globalContext = useContext(GlobalContext);
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false);

    const logout = () => {
        window.localStorage.removeItem(constants.accessTokenKey);
        window.localStorage.removeItem(constants.refreshTokenKey);
        navigate("/auth?state=login");
        globalContext.updateAuthState(false);
    };

    const username = useMemo(() => {
        if (globalContext.user?.profile?.firstname && globalContext.user?.profile?.lastname) {
            return `${globalContext.user.profile.firstname} ${globalContext.user.profile.lastname}`;
        }

        if (globalContext.user?.username) {
            return globalContext.user?.username;
        }
        return "error";
    }, [globalContext.user]);

    return (
        <div className="navbar bg-base-100">
            <div className="flex-1">
                <Link to={globalContext.isLogged ? "/" : "/auth"} className="btn btn-ghost text-xl">
                    Dairi
                </Link>
            </div>
            {globalContext.isLogged ? (
                <>
                    <div className="avatar w-12 mx-1 cursor-pointer">
                        <div className="rounded-xl hover:outline"></div>
                        {showMenu ? (
                            <div className="fixed top-0 left-0 w-screen h-screen" onClick={() => setShowMenu(false)}>
                                <ul
                                    className="absolute top-0 right-0 menu bg-base-200 w-56 rounded-box"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        console.log("ul clicked");
                                    }}
                                >
                                    <li className="menu-title">
                                        {username}
                                        <MinidenticonImg username={username} />
                                    </li>
                                    <li>
                                        <a>Profile</a>
                                    </li>
                                    <li>
                                        <a>Settings</a>
                                    </li>
                                    <li>
                                        <a>Logout</a>
                                    </li>
                                </ul>
                            </div>
                        ) : (
                            <MinidenticonImg
                                username={username}
                                onClick={() => {
                                    setShowMenu(true);
                                }}
                            />
                        )}
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
