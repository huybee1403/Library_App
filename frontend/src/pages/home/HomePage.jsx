import { useState } from "react";
import Header from "../../components/global/header/Header";
import Sidebar from "../../components/global/sidebar/Sidebar";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/authentication/AuthContext";
import "./HomePage.css";

const HomePage = () => {
    const { user } = useAuth();

    // Sidebar state
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const activeSidebar = () => {
        setIsSidebarOpen(true);
    };
    const removeActiveSidebar = () => {
        setIsSidebarOpen(false);
    };

    // 👉 chưa login thì không render layout
    if (!user) return null;

    return (
        <div className="layout">
            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} onClose={removeActiveSidebar} />

            {/* Content */}
            <div className="layout_content">
                <Header activeSidebar={activeSidebar} closeSidebar={removeActiveSidebar} />

                <div className="layout_main">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default HomePage;
