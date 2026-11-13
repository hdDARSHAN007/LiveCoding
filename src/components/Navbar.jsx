import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import api from "../api/api";
import ThemeToggle from "./ThemeToggle";

const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive ? "bg-surfaceRaised text-hi" : "text-lo hover:text-hi"
    }`;

function Navbar() {
    const [isAdmin, setIsAdmin] = useState(false);

    // Same profile call the dashboard already uses. Only used to decide whether to show the Admin link.
    useEffect(() => {
        api
            .get("/user/profile")
            .then((res) => setIsAdmin(res.data.role === "ADMIN"))
            .catch(() => {});
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/login";
    };

    return (
        <header className="bg-surface/80 backdrop-blur border-b border-line">
            <div className="max-w-7xl mx-auto px-6 min-h-[64px] flex items-center justify-between gap-4">
                <NavLink to="/dashboard" className="flex items-center gap-2.5">
                    <span className="logo">{"</>"}</span>
                    <span className="hidden sm:inline font-display font-bold text-lg text-hi">Placement Portal</span>
                </NavLink>
                <nav aria-label="Main" className="flex items-center gap-1">
                    <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
                    <NavLink to="/problems" className={linkClass}>Practice</NavLink>
                    <NavLink to="/prep" className={linkClass}>Prep</NavLink>
                    {isAdmin && <NavLink to="/admin" className={linkClass}>Admin</NavLink>}
                </nav>
                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <button onClick={handleLogout} className="btn">Log out</button>
                </div>
            </div>
        </header>
    );
}

export default Navbar;