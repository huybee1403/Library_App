import { createContext, useContext, useState } from "react";
import { loginAPI, refreshTokenAPI, logoutAPI, registerAPI, resetPasswordAPI, forgotPasswordAPI } from "../../services/api/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);

    const login = async (values) => {
        const res = await loginAPI(values);

        const { accessToken, user } = res;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("user", JSON.stringify(user));

        setUser(user);

        return res; // QUAN TRỌNG
    };

    const refreshAccessToken = async () => {
        try {
            const res = await refreshTokenAPI();

            const newToken = res.data.accessToken;

            localStorage.setItem("accessToken", newToken);

            return newToken;
        } catch (err) {
            logout();
        }
    };

    const logout = async () => {
        try {
            await logoutAPI();
        } catch {}

        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");

        setUser(null);
    };

    const register = async (values) => {
        const res = await registerAPI(values);
        return res.data;
    };

    const requestResetPassword = async (email) => {
        const res = await forgotPasswordAPI({ email });
        return res.data;
    };

    const resetPassword = async (data) => {
        const res = await resetPasswordAPI(data);
        return res.data;
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                register,
                requestResetPassword,
                resetPassword,
                refreshAccessToken,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
