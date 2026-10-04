import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { LABELS } from "../translations";
import "../styles/AdminSidebar.css";

function AdminSidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const t = useTranslate();
    usePageTranslation(LABELS.ADMIN_SIDEBAR);

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(() => {
        try {
            return localStorage.getItem("admin_sidebar_collapsed") === "true";
        } catch (e) {
            return false;
        }
    });

    useEffect(() => {
        document.body.classList.toggle("admin-sidebar-collapsed", collapsed);
        try {
            localStorage.setItem("admin_sidebar_collapsed", collapsed ? "true" : "false");
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
        "Admin";
    const displayName = ownerName.trim() || "Admin";
    const userInitial = (displayName.charAt(0) || "A").toUpperCase();

    const handleLogout = () => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("role");
        localStorage.removeItem("username");
        localStorage.removeItem("owner_name");
        localStorage.removeItem("business_name");
        localStorage.removeItem("business_type");
        navigate("/login");
    };

    const menuItems = [
        {
            path: "/admin-dashboard",
            subPaths: ["/admin-dashboard", "/admin/dashboard"],
            icon: "bi-speedometer2",
            label: t("Dashboard"),
        },
        {
            path: "/admin/inventory",
            icon: "bi-box-seam",
            label: t("Inventory"),
        },
        {
            path: "/admin/donations",
            icon: "bi-gift",
            label: t("Donations"),
        },
        {
            path: "/admin/transactions",
            icon: "bi-arrow-left-right",
            label: t("Transactions"),
        },
        {
            path: "/admin/analytics",
            icon: "bi-graph-up",
            label: t("Analytics"),
        },
        {
            path: "/admin/settings",
            icon: "bi-gear",
            label: t("Settings"),
        },
    ];

    const isItemActive = (item) => {
        const current = location.pathname;
        if (current === item.path) return true;
        if (item.subPaths && item.subPaths.includes(current)) return true;
        return false;
    };

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                type="button"
                className="admin-mobile-toggle d-lg-none"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label={sidebarOpen ? t("Close Menu") : t("Open Menu")}
                title="Menu"
            >
                <i className={`bi ${sidebarOpen ? "bi-x-lg" : "bi-list"}`}></i>
            </button>

            {/* Mobile Backdrop Overlay */}
            <div
                className={`admin-overlay ${sidebarOpen ? "show" : ""}`}
                onClick={() => setSidebarOpen(false)}
                aria-hidden="true"
            />

            {/* Sidebar Container */}
            <aside
                className={`admin-sidebar ${sidebarOpen ? "open" : ""} ${collapsed ? "collapsed" : ""}`}
                aria-label="Admin navigation"
            >
                {/* Header: Brand & Collapse Control */}
                <div className="admin-sidebar-header admin-header">
                    <Link
                        to="/admin-dashboard"
                        className="brand-logo"
                        onClick={() => setSidebarOpen(false)}
                        title="FoodBridge AI - Administrator"
                    >
                        <span className="brand-icon">
                            <i className="bi bi-shield-lock-fill text-primary"></i>
                        </span>
                        <span className="brand-text">
                            FoodBridge <span className="brand-accent">Admin</span>
                        </span>
                    </Link>

                    {/* Desktop Collapse Button */}
                    <button
                        type="button"
                        className="sidebar-collapse-btn d-none d-lg-flex"
                        onClick={() => setCollapsed(!collapsed)}
                        title={collapsed ? t("Expand Sidebar") : t("Collapse Sidebar")}
                        aria-label={collapsed ? t("Expand Sidebar") : t("Collapse Sidebar")}
                    >
                        <i className="bi bi-list"></i>
                    </button>

                    {/* Mobile Drawer Close Button */}
                    <button
                        type="button"
                        className="sidebar-close-btn d-lg-none"
                        onClick={() => setSidebarOpen(false)}
                        aria-label={t("Close Menu")}
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="admin-sidebar-menu admin-menu">
                    {menuItems.map((item) => {
                        const active = isItemActive(item);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`admin-sidebar-link admin-link ${active ? "active" : ""}`}
                                onClick={() => setSidebarOpen(false)}
                                title={item.label}
                            >
                                <span className="sidebar-icon">
                                    <i className={`bi ${item.icon}`}></i>
                                </span>
                                <span className="sidebar-link-text link-text">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer: User Profile & Targeted Logout */}
                <div className="admin-sidebar-footer admin-footer">
                    <button
                        type="button"
                        className="logout-btn"
                        onClick={handleLogout}
                        title={t("Logout")}
                        aria-label={t("Logout")}
                    >
                        <span className="sidebar-icon">
                            <i className="bi bi-box-arrow-right"></i>
                        </span>
                        <span className="sidebar-link-text link-text">
                            {t("Logout")}
                        </span>
                    </button>

                    <div className="user-box admin-user" title={displayName}>
                        <div className="user-avatar">
                            {userInitial}
                        </div>
                        <div className="user-details">
                            <span className="user-name">{displayName}</span>
                            <span className="user-badge">{t("Administrator")}</span>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}

export default AdminSidebar;
