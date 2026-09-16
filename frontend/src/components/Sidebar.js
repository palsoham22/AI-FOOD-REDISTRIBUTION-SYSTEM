import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslate } from "../hooks/useTranslate";
import { useState, useEffect } from "react";
import "../styles/Sidebar.css";

function Sidebar() {

    const navigate = useNavigate();
    const location = useLocation();
    const t = useTranslate();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {

    document.body.classList.toggle("sidebar-collapsed", collapsed);

}, [collapsed]);

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

        return () => window.removeEventListener("resize", handleResize);

    }, []);

    const menuItems = [

        {
            path: "/business-dashboard",
            icon: "🏠",
            label: t("Dashboard")
        },

        {
            path: "/inventory",
            icon: "📦",
            label: t("Inventory")
        },

        {
            path: "/business-donations",
            icon: "🎁",
            label: t("Donations")
        },

        {
            path: "/transactions",
            icon: "📜",
            label: t("Transactions")
        },

        {
            path: "/analytics",
            icon: "📈",
            label: t("Analytics")
        },

        {
            path: "/barcode-scanner",
            icon: "📷",
            label: t("Barcode Scanner")
        },

        {
            path: "/settings",
            icon: "⚙️",
            label: t("Settings")
        }

    ];

    return (

        <>

            {/* Mobile Toggle */}

            <button
    className="sidebar-toggle"
    onClick={() => {

        if(window.innerWidth <= 992){

    setSidebarOpen(!sidebarOpen);

}else{

    setCollapsed(!collapsed);

}

    }}
>
    ☰
</button>

            {/* Overlay */}

            <div

                className={`sidebar-overlay ${sidebarOpen ? "show" : ""}`}

                onClick={() => setSidebarOpen(false)}

            />

            {/* Sidebar */}

            <aside
className={`fb-sidebar

${sidebarOpen ? "open" : ""}

${collapsed ? "collapsed" : ""}

`}
>

                <div className="sidebar-header">

                    <h3>
                        <br />
                        <br />
                        🍽 FoodBridge AI

                    </h3>

                </div>

                <div className="sidebar-menu">

                    {

                        menuItems.map((item) => (

                            <Link

                                key={item.path}

                                to={item.path}

                                className={`sidebar-link ${
                                    location.pathname === item.path
                                        ? "active"
                                        : ""
                                }`}

                                onClick={() => setSidebarOpen(false)}

                            >

                                <span className="sidebar-icon">

                                    {item.icon}

                                </span>

                                <span>

                                    {item.label}

                                </span>

                            </Link>

                        ))

                    }

                </div>

                <div className="sidebar-footer">

                    <button

                        className="logout-btn"

                        onClick={logout}

                    >

                        🚪 {t("Logout")}

                    </button>

                    <div className="user-box">

                        <strong>

                            👤 {localStorage.getItem("owner_name")}

                        </strong>

                        <small>

                            🏪 {localStorage.getItem("business_name")}

                        </small>

                        <small>

                            {localStorage.getItem("business_type")}

                        </small>

                    </div>

                </div>

            </aside>

        </>

    );

}

export default Sidebar;