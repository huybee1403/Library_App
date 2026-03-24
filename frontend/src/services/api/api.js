import axios from "../../utils/axios.customize";

//Auth API
export const registerAPI = async (data) => {
    const response = await axios.post(`/auth/register`, data);
    return response.data;
};

export const loginAPI = async (data) => {
    const response = await axios.post(`/auth/login`, data);
    console.log("response Data: ", response.data);

    return response.data;
};

export const forgotPasswordAPI = async (data) => {
    const response = await axios.post(`/auth/forgot-password`, data);
    return response.data;
};

export const resetPasswordAPI = async (token, new_password) => {
    const response = await axios.post(`/auth/reset-password`, {
        token,
        new_password,
    });
    return response.data;
};

export const logoutAPI = async () => {
    const response = await axios.post(`/auth/logout`);
    return response.data;
};

export const refreshTokenAPI = async () => {
    const response = await axios.post("/auth/refresh-token");
    return response.data;
};
