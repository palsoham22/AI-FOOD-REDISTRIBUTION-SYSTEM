import { Link, useLocation } from "react-router-dom";
import { useTranslate } from "../hooks/useTranslate";
import { useState } from "react";

function IndividualSidebar() {

    const t = useTranslate();
    const location = useLocation();

    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);


    const isActive = (path) => {
        return location.pathname === path;
    };


    const closeMobileSidebar = () => {
        setMobileOpen(false);
    };


    return (
        <>

            <style>
                {`

                /* ==========================================
                   INDIVIDUAL SIDEBAR
                ========================================== */

                .individual-sidebar {
                    position: fixed;
                    top: 0;
                    left: 0;

                    width: 250px;
                    height: 100vh;

                    padding: 18px 12px;

                    background:
                        linear-gradient(
                            180deg,
                            #123B34 0%,
                            #17483F 100%
                        );

                    color: #F2FAF7;

                    border-right: 1px solid rgba(255,255,255,0.08);

                    box-shadow:
                        4px 0 18px rgba(10,45,37,0.14);

                    z-index: 1000;

                    transition:
                        width 0.25s ease,
                        transform 0.25s ease;

                    overflow: hidden;
                }


                /* ==========================================
                   COLLAPSED DESKTOP SIDEBAR
                ========================================== */

                .individual-sidebar.collapsed {
                    width: 82px;
                }


                /* ==========================================
                   SIDEBAR TOP
                ========================================== */

                .sidebar-top {
                    display: flex;

                    align-items: center;

                    justify-content: space-between;

                    margin-bottom: 28px;

                    padding: 0 6px;

                    min-height: 48px;
                }


                /* ==========================================
                   HAMBURGER BUTTON
                ========================================== */

                .sidebar-toggle {
                    width: 48px;
                    height: 48px;

                    border: none;

                    border-radius: 13px;

                    background: rgba(255,255,255,0.10);

                    color: #ffffff;

                    font-size: 25px;

                    cursor: pointer;

                    display: flex;

                    align-items: center;
                    justify-content: center;

                    transition:
                        background 0.2s ease,
                        transform 0.2s ease;

                    flex-shrink: 0;
                }


                .sidebar-toggle:hover {
                    background: rgba(255,255,255,0.17);

                    transform: translateY(-1px);
                }


                /* ==========================================
                   SIDEBAR TITLE
                ========================================== */

                .sidebar-title {
                    margin: 0;

                    font-size: 1.45rem;

                    font-weight: 700;

                    white-space: nowrap;

                    color: #ffffff;

                    letter-spacing: -0.02em;
                }


                /* ==========================================
                   MENU
                ========================================== */

                .sidebar-menu {
                    display: flex;

                    flex-direction: column;

                    gap: 9px;

                    padding: 0;
                    margin: 0;

                    list-style: none;
                }


                /* ==========================================
                   MENU LINKS
                ========================================== */

                .sidebar-link {
                    display: flex;

                    align-items: center;

                    gap: 11px;

                    min-height: 47px;

                    padding: 10px 13px;

                    border-radius: 13px;

                    color: #EAF5F1 !important;

                    text-decoration: none;

                    font-size: 0.97rem;

                    font-weight: 600;

                    white-space: nowrap;

                    transition:
                        background 0.2s ease,
                        color 0.2s ease,
                        transform 0.2s ease,
                        box-shadow 0.2s ease;
                }


                .sidebar-link:hover {
                    background: rgba(255,255,255,0.08);

                    color: #ffffff !important;

                    transform: translateX(2px);
                }


                /* ==========================================
                   ACTIVE LINK
                ========================================== */

                .sidebar-link.active {
                    background:
                        linear-gradient(
                            135deg,
                            #2B806A,
                            #287761
                        );

                    color: #ffffff !important;

                    box-shadow:
                        0 6px 16px rgba(0,0,0,0.12);
                }


                .sidebar-link.active:hover {
                    background:
                        linear-gradient(
                            135deg,
                            #328C74,
                            #2B806A
                        );

                    transform: translateX(2px);
                }


                /* ==========================================
                   ICON
                ========================================== */

                .sidebar-icon {
                    width: 25px;

                    min-width: 25px;

                    text-align: center;

                    font-size: 1.05rem;
                }


                /* ==========================================
                   COLLAPSED DESKTOP STATE
                ========================================== */

                .individual-sidebar.collapsed .sidebar-title {
                    display: none;
                }


                .individual-sidebar.collapsed .sidebar-top {
                    justify-content: center;
                }


                .individual-sidebar.collapsed .sidebar-link {
                    justify-content: center;

                    padding: 10px;
                }


                .individual-sidebar.collapsed .sidebar-link span:last-child {
                    display: none;
                }


                /* ==========================================
                   MOBILE HAMBURGER
                ========================================== */

                .sidebar-mobile-button {
                    display: none;

                    position: fixed;

                    top: 16px;
                    left: 16px;

                    width: 46px;
                    height: 46px;

                    border: none;

                    border-radius: 13px;

                    background: #123B34;

                    color: #ffffff;

                    font-size: 24px;

                    align-items: center;
                    justify-content: center;

                    z-index: 1100;

                    box-shadow:
                        0 6px 16px rgba(0,0,0,0.16);

                    cursor: pointer;

                    transition:
                        background 0.2s ease,
                        transform 0.2s ease;
                }


                .sidebar-mobile-button:hover {
                    background: #1A5145;

                    transform: translateY(-1px);
                }


                /* ==========================================
                   MOBILE OVERLAY
                ========================================== */

                .sidebar-overlay {
                    display: none;
                }


                /* ==========================================
                   MOBILE
                ========================================== */

                @media (max-width: 768px) {

                    .individual-sidebar {
                        width: 250px;

                        transform: translateX(-100%);

                        transition:
                            transform 0.25s ease;
                    }


                    .individual-sidebar.mobile-open {
                        transform: translateX(0);
                    }


                    .individual-sidebar.collapsed {
                        width: 250px;

                        transform: translateX(-100%);
                    }


                    .individual-sidebar.collapsed.mobile-open {
                        transform: translateX(0);
                    }


                    .sidebar-mobile-button {
                        display: flex !important;
                    }


                    .sidebar-desktop-toggle {
                        display: none;
                    }


                    .sidebar-overlay.active {
                        display: block;

                        position: fixed;

                        inset: 0;

                        background: rgba(10,35,30,0.40);

                        backdrop-filter: blur(2px);

                        z-index: 999;
                    }
                }


                /* ==========================================
                   SMALL MOBILE
                ========================================== */

                @media (max-width: 480px) {

                    .individual-sidebar {
                        width: 235px;
                    }

                    .sidebar-link {
                        min-height: 45px;

                        font-size: 0.94rem;
                    }

                    .sidebar-title {
                        font-size: 1.35rem;
                    }
                }

                `}
            </style>


            {/* ==========================================
                MOBILE HAMBURGER
            ========================================== */}

            <button
                className="sidebar-mobile-button"
                onClick={() => setMobileOpen(true)}
                aria-label={t("Open sidebar")}
            >
                ☰
            </button>


            {/* ==========================================
                MOBILE OVERLAY
            ========================================== */}

            <div
                className={`sidebar-overlay ${
                    mobileOpen ? "active" : ""
                }`}
                onClick={closeMobileSidebar}
            >
            </div>


            {/* ==========================================
                SIDEBAR
            ========================================== */}

            <aside
                className={`
                    individual-sidebar
                    ${collapsed ? "collapsed" : ""}
                    ${mobileOpen ? "mobile-open" : ""}
                `}
            >


                {/* ==========================================
                    TOP
                ========================================== */}

                <div className="sidebar-top">

                    {!collapsed && (

                        <h3 className="sidebar-title">
                            <br />
                            <br />
                            👤 {t("Individual")}
                        </h3>

                    )}


                    <button
                        className="sidebar-toggle sidebar-desktop-toggle"
                        onClick={() => setCollapsed(!collapsed)}
                        aria-label={t("Toggle sidebar")}
                    >
                        ☰
                    </button>

                </div>


                {/* ==========================================
                    MENU
                ========================================== */}

                <ul className="sidebar-menu">


                    {/* Dashboard */}

                    <li>

                        <Link
                            to="/individual"
                            className={`sidebar-link ${
                                isActive("/individual")
                                    ? "active"
                                    : ""
                            }`}
                            onClick={closeMobileSidebar}
                        >

                            <span className="sidebar-icon">
                                🏠
                            </span>

                            <span>
                                {t("Dashboard")}
                            </span>

                        </Link>

                    </li>


                    {/* Donate Food */}

                    <li>

                        <Link
                            to="/donate-food"
                            className={`sidebar-link ${
                                isActive("/donate-food")
                                    ? "active"
                                    : ""
                            }`}
                            onClick={closeMobileSidebar}
                        >

                            <span className="sidebar-icon">
                                🍱
                            </span>

                            <span>
                                {t("Donate Food")}
                            </span>

                        </Link>

                    </li>


                    {/* My Donations */}

                    <li>

                        <Link
                            to="/my-donations"
                            className={`sidebar-link ${
                                isActive("/my-donations")
                                    ? "active"
                                    : ""
                            }`}
                            onClick={closeMobileSidebar}
                        >

                            <span className="sidebar-icon">
                                📦
                            </span>

                            <span>
                                {t("My Donations")}
                            </span>

                        </Link>

                    </li>


                    {/* Settings */}

                    <li>

                        <Link
                            to="/individual-settings"
                            className={`sidebar-link ${
                                isActive("/individual-settings")
                                    ? "active"
                                    : ""
                            }`}
                            onClick={closeMobileSidebar}
                        >

                            <span className="sidebar-icon">
                                ⚙
                            </span>

                            <span>
                                {t("Settings")}
                            </span>

                        </Link>

                    </li>


                </ul>

            </aside>

        </>
    );
}

export default IndividualSidebar;