import jwt from "jsonwebtoken";

export function jwtDecode<T>(refreshToken: string): null | T {
    try {
        const result = jwt.decode(refreshToken) as T;
        if (result && typeof result !== "string") {
            return result;
        } else return null;
    } catch (error) {
        return null;
    }
}

export function jwtVerify<T>(refreshToken: string, refreshTokenSecret: string): null | T {
    try {
        const result = jwt.verify(refreshToken, refreshTokenSecret) as T;
        if (result && typeof result !== "string") {
            return result;
        } else return null;
    } catch (error) {
        return null;
    }
}
