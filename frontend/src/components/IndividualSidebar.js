import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTranslate } from "../hooks/useTranslate";
import "../styles/IndividualSidebar.css";

function IndividualSidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const t = useTranslate();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(() => {
        try {
            return localStorage.getItem("individual_sidebar_collapsed") === "true";
        } catch (e) {
            return false;
        }
    });

    useEffect(() => {
        document.body.classList.toggle("individual-sidebar-collapsed", collapsed);
        try {
            localStorage.setItem("individual_sidebar_collapsed", collapsed ? "true" : "false");
        } catch (e) {
            console.error("LocalStorage write error:", e);
        }
    }, [collapsed]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 992) {
                setSidebarOpen(false);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const ownerName =
        localStorage.getItem("owner_name") ||
        localStorage.getItem("username") ||
        "Individual Donor";
    const userInitial = (ownerName.trim().charAt(0) || "I").toUpperCase();

    const logout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const menuItems = [
        {
            path: "/individual",
            icon: "bi-speedometer2",
            label: t("Dashboard")
        },
        {
            path: "/donate-food",
            icon: "bi-box-seam",
            label: t("Donate Food")
        },
        {
            path: "/my-donations",
            icon: "bi-heart",
            label: t("My Donations")
        },
        {
            path: "/individual-settings",
            icon: "bi-gear",
            label: t("Settings")
        }
    ];

    const isItemActive = (item) => {
        const p = location.pathname;
        if (p === item.path) return true;
        if (item.subPaths && item.subPaths.some((sub) => p.startsWith(sub))) {
            return true;
        }
        return false;
    };

    return (
        <>
            {/* Mobile Floating Toggle Button */}
            <button
                type="button"
                className="individual-mobile-toggle d-lg-none"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle navigation menu"
                title="Menu"
            >
                <i className={`bi ${sidebarOpen ? "bi-x-lg" : "bi-list"}`}></i>
            </button>

            {/* Mobile Backdrop Overlay */}
            <div
                className={`individual-overlay ${sidebarOpen ? "show" : ""}`}
                onClick={() => setSidebarOpen(false)}
                aria-hidden="true"
            />

            {/* Sidebar Container */}
            <aside
                className={`individual-sidebar ${sidebarOpen ? "open" : ""} ${collapsed ? "collapsed" : ""}`}
                aria-label="Individual Donor navigation"
            >
                {/* Header with Brand & Collapse Button */}
                <div className="individual-sidebar-header">
                    <Link
                        to="/individual"
                        className="brand-logo"
                        onClick={() => setSidebarOpen(false)}
                        title="FoodBridge AI"
                    >
                        <span className="brand-icon">🤝</span>
                        <span className="brand-text">
                            FoodBridge <span className="brand-accent">Donor</span>
                        </span>
                    </Link>

                    {/* Desktop Collapse / Hamburger Button */}
                    <button
                        type="button"
                        className="sidebar-collapse-btn d-none d-lg-flex"
                        onClick={() => setCollapsed(!collapsed)}
                        title={collapsed ? t("Expand Sidebar") : t("Collapse Sidebar")}
                        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        <i className="bi bi-list"></i>
                    </button>

                    {/* Mobile Drawer Close Button */}
                    <button
                        type="button"
                        className="sidebar-close-btn d-lg-none"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Close menu"
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                {/* Sidebar Menu Items */}
                <div className="individual-sidebar-menu">
                    {menuItems.map((item) => {
                        const active = isItemActive(item);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`individual-sidebar-link ${active ? "active" : ""}`}
                                onClick={() => setSidebarOpen(false)}
                                title={item.label}
                            >
                                <span className="sidebar-icon">
                                    <i className={`bi ${item.icon}`}></i>
                                </span>
                                <span className="sidebar-link-text">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>

                {/* Sidebar Footer with Logout & User Info */}
                <div className="individual-sidebar-footer">
                    <button
                        type="button"
                        className="logout-btn"
                        onClick={logout}
                        title={t("Logout")}
                    >
                        <span className="sidebar-icon">
                            <i className="bi bi-box-arrow-right"></i>
                        </span>
                        <span className="sidebar-link-text">
                            {t("Logout")}
                        </span>
                    </button>

                    <div
                        className="user-box"
                        title={`${ownerName} • ${t("Individual Donor")}`}
                    >
                        <div className="user-avatar">
                            {userInitial}
                        </div>
                        <div className="user-details">
                            <span className="user-name">{ownerName}</span>
                            <span className="user-badge">{t("Individual Donor")}</span>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}

export default IndividualSidebar;
