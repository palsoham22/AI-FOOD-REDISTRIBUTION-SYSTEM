import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslate } from "../hooks/useTranslate";
import { useState, useEffect } from "react";
import "../styles/Sidebar.css";

function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const t = useTranslate();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(() => {
        return localStorage.getItem("business_sidebar_collapsed") === "true";
    });

    useEffect(() => {
        document.body.classList.toggle("sidebar-collapsed", collapsed);
        try {
            localStorage.setItem("business_sidebar_collapsed", collapsed ? "true" : "false");
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

    const ownerName = localStorage.getItem("owner_name") || localStorage.getItem("username") || "Business User";
    const businessName = localStorage.getItem("business_name") || "FoodBridge Partner";
    const businessType = localStorage.getItem("business_type") || "Commercial";
    const userInitial = (ownerName.trim().charAt(0) || "B").toUpperCase();

    const logout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const menuItems = [
        {
            path: "/business-dashboard",
            alias: "/business/dashboard",
            icon: "bi-speedometer2",
            label: t("Dashboard")
        },
        {
            path: "/inventory",
            alias: "/business/inventory",
            icon: "bi-box-seam",
            label: t("Inventory"),
            subPaths: ["/add-product", "/edit-product", "/business/add-product", "/business/edit-product"]
        },
        {
            path: "/business-donations",
            alias: "/business/donations",
            icon: "bi-gift",
            label: t("Donations")
        },
        {
            path: "/transactions",
            alias: "/business/transactions",
            icon: "bi-receipt",
            label: t("Transactions")
        },
        {
            path: "/analytics",
            alias: "/business/analytics",
            icon: "bi-graph-up-arrow",
            label: t("Analytics")
        },
        {
            path: "/settings",
            alias: "/business/settings",
            icon: "bi-gear",
            label: t("Settings")
        }
    ];

    const isItemActive = (item) => {
        const p = location.pathname;
        if (p === item.path || (item.alias && p === item.alias)) return true;
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
                className="sidebar-mobile-toggle d-lg-none"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle navigation menu"
                title="Menu"
            >
                <i className={`bi ${sidebarOpen ? "bi-x-lg" : "bi-list"}`}></i>
            </button>

            {/* Mobile Backdrop Overlay */}
            <div
                className={`sidebar-overlay ${sidebarOpen ? "show" : ""}`}
                onClick={() => setSidebarOpen(false)}
                aria-hidden="true"
            />

            {/* Sidebar Container */}
            <aside
                className={`fb-sidebar ${sidebarOpen ? "open" : ""} ${collapsed ? "collapsed" : ""}`}
                aria-label="Business navigation"
            >
                {/* Header with Brand & Collapse Button */}
                <div className="sidebar-header">
                    <Link
                        to="/business-dashboard"
                        className="brand-logo"
                        onClick={() => setSidebarOpen(false)}
                        title="FoodBridge AI"
                    >
                        <span className="brand-icon">🍽</span>
                        <span className="brand-text">
                            FoodBridge <span className="brand-accent">AI</span>
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
                <div className="sidebar-menu">
                    {menuItems.map((item) => {
                        const active = isItemActive(item);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`sidebar-link ${active ? "active" : ""}`}
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
                <div className="sidebar-footer">
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
                        title={`${ownerName} • ${businessName} (${businessType})`}
                    >
                        <div className="user-avatar">
                            {userInitial}
                        </div>
                        <div className="user-details">
                            <span className="user-name">{ownerName}</span>
                            <span className="user-biz">{businessName}</span>
                            <span className="user-badge">{businessType}</span>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;
