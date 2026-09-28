import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTranslate } from "../hooks/useTranslate";
import "../styles/NGOSidebar.css";

function NGOSidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const t = useTranslate();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(() => {
        try {
            return localStorage.getItem("ngo_sidebar_collapsed") === "true";
        } catch (e) {
            return false;
        }
    });

    useEffect(() => {
        document.body.classList.toggle("ngo-sidebar-collapsed", collapsed);
        try {
            localStorage.setItem("ngo_sidebar_collapsed", collapsed ? "true" : "false");
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

    const ownerName = localStorage.getItem("owner_name") || localStorage.getItem("username") || "NGO Partner";
    const businessName = localStorage.getItem("business_name") || "Helping Hands NGO";
    const userInitial = (ownerName.trim().charAt(0) || "N").toUpperCase();

    const logout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const menuItems = [
        {
            path: "/ngo-dashboard",
            icon: "bi-speedometer2",
            label: t("Dashboard")
        },
        {
            path: "/available-donations",
            icon: "bi-gift",
            label: t("Available Donations")
        },
        {
            path: "/accepted-donations",
            icon: "bi-check2-circle",
            label: t("Accepted Donations")
        },
        {
            path: "/pickup-schedule",
            icon: "bi-truck",
            label: t("Pickup Schedule"),
            subPaths: ["/schedule-pickup"]
        },
        {
            path: "/ngo-history",
            icon: "bi-clock-history",
            label: t("Donation History")
        },
        {
            path: "/beneficiaries",
            icon: "bi-people",
            label: t("Beneficiaries")
        },
        {
            path: "/ngo-reports",
            icon: "bi-bar-chart-line",
            label: t("Reports")
        },
        {
            path: "/ngo-profile",
            icon: "bi-building",
            label: t("Profile")
        },
        {
            path: "/ngo-settings",
            icon: "bi-gear",
            label: t("Settings")
        }
    ];

    const isItemActive = (item) => {
        const p = location.pathname;
        if (p === item.path) return true;
        if (item.subPaths && item.subPaths.some(sub => p.startsWith(sub))) {
            return true;
        }
        return false;
    };

    return (
        <>
            {/* Mobile Floating Toggle Button */}
            <button
                type="button"
                className="ngo-mobile-toggle d-lg-none"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle navigation menu"
                title="Menu"
            >
                <i className={`bi ${sidebarOpen ? "bi-x-lg" : "bi-list"}`}></i>
            </button>

            {/* Mobile Backdrop Overlay */}
            <div
                className={`ngo-overlay ${sidebarOpen ? "show" : ""}`}
                onClick={() => setSidebarOpen(false)}
                aria-hidden="true"
            />

            {/* Sidebar Container */}
            <aside
                className={`ngo-sidebar ${sidebarOpen ? "open" : ""} ${collapsed ? "collapsed" : ""}`}
                aria-label="NGO navigation"
            >
                {/* Header with Brand & Collapse Button */}
                <div className="ngo-sidebar-header">
                    <Link
                        to="/ngo-dashboard"
                        className="brand-logo"
                        onClick={() => setSidebarOpen(false)}
                        title="FoodBridge AI"
                    >
                        <span className="brand-icon">🤝</span>
                        <span className="brand-text">
                            FoodBridge <span className="brand-accent">NGO</span>
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
                <div className="ngo-sidebar-menu">
                    {menuItems.map((item) => {
                        const active = isItemActive(item);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`ngo-sidebar-link ${active ? "active" : ""}`}
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
                <div className="ngo-sidebar-footer">
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
                        title={`${ownerName} • ${businessName}`}
                    >
                        <div className="user-avatar">
                            {userInitial}
                        </div>
                        <div className="user-details">
                            <span className="user-name">{ownerName}</span>
                            <span className="user-biz">{businessName}</span>
                            <span className="user-badge">{t("NGO Partner")}</span>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}

export default NGOSidebar;
