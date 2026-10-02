import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTranslate } from "../hooks/useTranslate";
import "../styles/DeliverySidebar.css";

function DeliverySidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const t = useTranslate();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(() => {
        try {
            return localStorage.getItem("delivery_sidebar_collapsed") === "true";
        } catch (e) {
            return false;
        }
    });

    useEffect(() => {
        document.body.classList.toggle("delivery-sidebar-collapsed", collapsed);
        try {
            localStorage.setItem("delivery_sidebar_collapsed", collapsed ? "true" : "false");
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

    const username = localStorage.getItem("username") || "Delivery Partner";
    let vehicleNumber = localStorage.getItem("vehicle_number") || "";
    if (!vehicleNumber) {
        try {
            const cached = localStorage.getItem("offline_delivery_profile");
            if (cached) {
                const parsed = JSON.parse(cached);
                vehicleNumber = parsed.vehicle_number || parsed.vehicle_type || "";
            }
        } catch (e) {
            // ignore JSON parse error
        }
    }
    const userInitial = (username.trim().charAt(0) || "D").toUpperCase();

    const logout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const menuItems = [
        {
            path: "/delivery-dashboard",
            icon: "bi-speedometer2",
            label: t("Dashboard")
        },
        {
            path: "/assigned-pickups",
            icon: "bi-box-seam",
            label: t("Assigned Pickups")
        },
        {
            path: "/delivery-map",
            icon: "bi-geo-alt",
            label: t("Navigation")
        },
        {
            path: "/completed-deliveries",
            icon: "bi-check2-circle",
            label: t("Completed Deliveries")
        },
        {
            path: "/delivery-profile",
            icon: "bi-person-badge",
            label: t("Profile")
        },
        {
            path: "/delivery-settings",
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
                className="delivery-mobile-toggle d-lg-none"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle navigation menu"
                title="Menu"
            >
                <i className={`bi ${sidebarOpen ? "bi-x-lg" : "bi-list"}`}></i>
            </button>

            {/* Mobile Backdrop Overlay */}
            <div
                className={`delivery-overlay ${sidebarOpen ? "show" : ""}`}
                onClick={() => setSidebarOpen(false)}
                aria-hidden="true"
            />

            {/* Sidebar Container */}
            <aside
                className={`delivery-sidebar ${sidebarOpen ? "open" : ""} ${collapsed ? "collapsed" : ""}`}
                aria-label="Delivery navigation"
            >
                {/* Header with Brand & Collapse Button */}
                <div className="delivery-sidebar-header delivery-header">
                    <Link
                        to="/delivery-dashboard"
                        className="brand-logo"
                        onClick={() => setSidebarOpen(false)}
                        title="FoodBridge AI"
                    >
                        <span className="brand-icon">🚚</span>
                        <span className="brand-text">
                            FoodBridge <span className="brand-accent">Delivery</span>
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
                <div className="delivery-sidebar-menu delivery-links">
                    {menuItems.map((item) => {
                        const active = isItemActive(item);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`delivery-sidebar-link delivery-link ${active ? "active" : ""}`}
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
                </div>

                {/* Sidebar Footer with Logout & User Info */}
                <div className="delivery-sidebar-footer delivery-footer">
                    <button
                        type="button"
                        className="logout-btn"
                        onClick={logout}
                        title={t("Logout")}
                    >
                        <span className="sidebar-icon">
                            <i className="bi bi-box-arrow-right"></i>
                        </span>
                        <span className="sidebar-link-text link-text">
                            {t("Logout")}
                        </span>
                    </button>

                    <div
                        className="user-box delivery-user"
                        title={`${username}${vehicleNumber ? ` • ${vehicleNumber}` : ""}`}
                    >
                        <div className="user-avatar">
                            {userInitial}
                        </div>
                        <div className="user-details">
                            <span className="user-name">{username}</span>
                            <span className="user-biz">{vehicleNumber || t("Vehicle")}</span>
                            <span className="user-badge">{t("Delivery Partner")}</span>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}

export default DeliverySidebar;