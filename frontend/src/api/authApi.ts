import { privateApi } from "./privateApi";

export const login = async (pseudonyme: string, password: string) => {
    const data = await privateApi("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ pseudonyme, password }),
    });
    return data.message;
};

export const logout = async () => {
    const data = await privateApi("/api/auth/logout", {
        method: "POST",
    });
    return data.message;
};
