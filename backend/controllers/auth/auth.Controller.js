const authService = require("../../services/auth.Service.js");

exports.register = async (req, res) => {
    try {
        const user = await authService.register(req.body);

        res.status(200).json({
            message: "Register success",
            user,
        });
    } catch (err) {
        res.status(err.status || 500).json({
            message: err.message || "Server error",
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { accessToken, refreshToken, user } = await authService.login(req.body);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            accessToken,
            user,
            message: "Login success",
        });
    } catch (err) {
        res.status(err.status || 401).json({
            message: err.message || "Login failed",
        });
    }
};

exports.logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        console.log(refreshToken);

        if (refreshToken) {
            await authService.logout(refreshToken);
        }

        res.clearCookie("refreshToken");

        res.status(200).json({
            message: "Logged out",
        });
    } catch (err) {
        res.status(err.status || 500).json({
            message: err.message,
        });
    }
};

exports.refreshToken = async (req, res) => {
    try {
        const token = await authService.refreshToken(req.cookies.refreshToken);

        res.status(200).json(token);
    } catch (err) {
        res.status(err.status || 401).json({
            message: err.message || "Invalid refresh token",
        });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        await authService.forgotPassword(req.body.email);

        res.status(200).json({
            message: "Reset mail sent",
        });
    } catch (err) {
        res.status(err.status || 400).json({
            message: err.message,
        });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        await authService.resetPassword(req.body.token, req.body.password);

        res.status(200).json({
            message: "Password reset success",
        });
    } catch (err) {
        res.status(err.status || 400).json({
            message: err.message,
        });
    }
};
