import { Routes, Route } from "react-router-dom";
import Login from "../pages/authentication/Login/Login";
import Register from "../pages/authentication/Register/Register";
import ForgotPass from "../pages/authentication/ForgotPass/ForgotPass";
import ResetPass from "../pages/authentication/ResetPass/ResetPass";
import HomePage from "../pages/home/HomePage";
import NotFound from "../components/global/404/NotFound";

import { ProtectedRoute, GuestRoute, RoleRoute, ResetPasswordGuard } from "../utils/RouteGuard";
export default function AppRoutes() {
    return (
        <Routes>
            {/* 🔥 Admin route */}
            <Route element={<RoleRoute allowedRoles={["admin"]} />}>
                <Route path="/admin/dashboard" element={<HomePage />} />
            </Route>

            {/* Guest */}
            <Route element={<GuestRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPass />} />
            </Route>

            {/* Reset password */}
            <Route
                path="/reset-password"
                element={
                    <ResetPasswordGuard>
                        <ResetPass />
                    </ResetPasswordGuard>
                }
            />

            {/* 404 */}
            <Route path="/404" element={<NotFound />} />
        </Routes>
    );
}
