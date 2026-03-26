import { useRef, useState } from "react";
import "./Header.css";
import useClickOutside from "../../../hooks/useClickOutside";

const Header = ({ activeSidebar, closeSidebar }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const searchRef = useRef(null);
    const iconRef = useRef(null);

    useClickOutside([searchRef, iconRef], () => {
        setIsOpen(false);
    });

    return (
        <nav className="topnav-admin">
            <div className="topnav-left">
                <span className="logo">The Scholarly Curator</span>
                <div className="search-container">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search collection or members..." className="search-input" />
                </div>
            </div>

            <div className="topnav-right">
                <i className="fa-solid fa-bell"></i>

                <i className="fa-solid fa-gear"></i>

                <i ref={iconRef} className="fa-solid fa-magnifying-glass" onClick={() => setIsOpen((prev) => !prev)}></i>

                <i className={`fa-solid fa-bars`} onClick={activeSidebar}></i>

                <div className="avatar">
                    <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDaausEuF3STFMPMQKD7emIWErZJuoJ9sTyG92IKe_IsbQSmaG7_Hi7E-s8X92dUnj8gQrYLPUGAfTlViZqGphVwGioqdun02Fm4BVFLLSJU6JlJuDDryqKYFPL3E_P7BaF0MmXrrwrIsASMfULg8dpRRFOwPSFnUyv1VcwIt-m90lfgJ10wD9-B2zSYI-FcSGGyxiRY9_TUyFsYVwdci_QSQB4rO6AFFIHL97QCFbt1zy4BfJCozXlXUzy_Pko_GocE5IMmXFJb6B-"
                        alt="Avatar"
                    />
                </div>
            </div>
            <div className={`search-container_res ${isOpen ? "open" : ""}`} ref={searchRef}>
                <i className="fa-solid fa-magnifying-glass"></i>
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search collection or members..." className="search-input" />
            </div>
        </nav>
    );
};

export default Header;
