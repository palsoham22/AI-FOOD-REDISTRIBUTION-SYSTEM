import {
    Link,
    useNavigate,
    useLocation
} from "react-router-dom";

import {
    useState,
    useEffect
} from "react";

import { useTranslate } from "../hooks/useTranslate";

import "../styles/NGOSidebar.css";

function NGOSidebar() {

    const navigate = useNavigate();
    const location = useLocation();
    const t = useTranslate();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    const logout = () => {
        localStorage.clear();
        navigate("/login");
    };

    useEffect(() => {

        const handleResize = () => {

            if (window.innerWidth > 992) {

                setSidebarOpen(false);

            }

        };

        window.addEventListener("resize", handleResize);

        return () =>
            window.removeEventListener("resize", handleResize);

    }, []);

    const menuItems = [

        {
            path: "/ngo-dashboard",
            icon: "🏠",
            label: t("Dashboard")
        },

        {
            path: "/available-donations",
            icon: "🎁",
            label: t("Available Donations")
        },

        {
            path: "/accepted-donations",
            icon: "✅",
            label: t("Accepted Donations")
        },

        {
            path: "/pickup-schedule",
            icon: "🚚",
            label: t("Pickup Schedule")
        },

        {
            path: "/ngo-history",
            icon: "📜",
            label: t("Donation History")
        },

        {
            path: "/beneficiaries",
            icon: "👨‍👩‍👧",
            label: t("Beneficiaries")
        },

        {
            path: "/ngo-reports",
            icon: "📊",
            label: t("Reports")
        },

        {
            path: "/ngo-profile",
            icon: "🏢",
            label: t("Profile")
        },

        {
            path: "/ngo-settings",
            icon: "⚙️",
            label: t("Settings")
        }

    ];

    return (

        <>

            {/* Toggle */}

            <button
                className="ngo-toggle"
                onClick={() => {

                    if (window.innerWidth <= 992) {

                        setSidebarOpen(!sidebarOpen);

                    } else {

                        setCollapsed(!collapsed);

                    }

                }}
            >
                ☰
            </button>

            {/* Overlay */}

            <div
                className={`ngo-overlay ${sidebarOpen ? "show" : ""}`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar */}

            <aside
                className={`ngo-sidebar
                ${sidebarOpen ? "open" : ""}
                ${collapsed ? "collapsed" : ""}
                `}
            >

                <div className="ngo-header">

                    <div className="ngo-logo">

                        <br/>
                        🤝

                        {

                            !collapsed &&

                            <span style={{ marginLeft: "8px" }}>
                                <br/>
                                FoodBridge NGO

                            </span>

                        }

                    </div>

                </div>

                <div className="ngo-links">

                    {

                        menuItems.map((item)=>(

                            <Link

                                key={item.path}

                                to={item.path}

                                className={`ngo-link ${
                                    location.pathname===item.path
                                    ? "active"
                                    : ""
                                }`}

                                onClick={() => setSidebarOpen(false)}

                            >

                                <span>

                                    {item.icon}

                                </span>

                                <span className="link-text">

                                    {item.label}

                                </span>

                            </Link>

                        ))

                    }

                </div>

                <div className="ngo-footer">

                    {

                        !collapsed &&

                        <div className="ngo-user">

                            <strong>

                                👤 {localStorage.getItem("owner_name")}

                            </strong>

                            <br/>

                            <small>

                                🏢 {localStorage.getItem("business_name")}

                            </small>

                        </div>

                    }

                    <button

                        className="logout-btn"

                        onClick={logout}

                    >

                        🚪

                        {

                            !collapsed &&

                            " " + t("Logout")

                        }

                    </button>

                </div>

            </aside>

        </>

    );

}

export default NGOSidebar;