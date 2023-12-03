import { NavigateFunction } from "react-router-dom";
import { constants } from "./constants";
import { type IGlobalContext } from "../contexts/globalContext";

function redirectOrigin(navigate: NavigateFunction) {
    const redirectOrigin = window.localStorage.getItem(constants.redirectOriginKey);
    if (!redirectOrigin || redirectOrigin.includes("/auth")) {
        navigate("/");
        return;
    }

    if (redirectOrigin) {
        window.localStorage.removeItem(constants.redirectOriginKey);
        navigate(redirectOrigin);
        return;
    }
}

/**
 * - set new accessToken and refreshToken to localStorage
 * - set accessToken to all request header
 */
function afterAuth(reqData: any, globalContext: IGlobalContext) {
    const newAccessToken = reqData.data.accessToken;
    const newRefreshToken = reqData.data.refreshToken;
    window.localStorage.setItem(constants.accessTokenKey, newAccessToken);
    window.localStorage.setItem(constants.refreshTokenKey, newRefreshToken);

    // setting access token to header
    globalContext.fetch.interceptors.request.use(function (config) {
        config.headers.Authorization = "Bearer " + newAccessToken;
        return config;
    });
}

export { redirectOrigin, afterAuth };
