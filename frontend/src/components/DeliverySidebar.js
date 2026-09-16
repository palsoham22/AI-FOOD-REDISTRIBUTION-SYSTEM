import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslate } from "../hooks/useTranslate";
import { useState, useEffect } from "react";
import "../styles/DeliverySidebar.css";

function DeliverySidebar() {

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

            if(window.innerWidth > 992){

                setSidebarOpen(false);

            }

        };

        window.addEventListener("resize", handleResize);

        return () =>
            window.removeEventListener("resize", handleResize);

    }, []);

    const menuItems = [

        {
            path:"/delivery-dashboard",
            icon:"🏠",
            label:t("Dashboard")
        },

        {
            path:"/assigned-pickups",
            icon:"📦",
            label:t("Assigned Pickups")
        },

        {
            path:"/delivery-map",
            icon:"🗺️",
            label:t("Navigation")
        },

        {
            path:"/completed-deliveries",
            icon:"✅",
            label:t("Completed Deliveries")
        },

        {
            path:"/delivery-profile",
            icon:"👤",
            label:t("Profile")
        },

        {
            path:"/delivery-settings",
            icon:"⚙️",
            label:t("Settings")
        }

    ];

    return (

<>

<button
className="delivery-toggle"
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

<div

className={`delivery-overlay ${sidebarOpen ? "show" : ""}`}

onClick={() => setSidebarOpen(false)}

></div>

<aside

className={`delivery-sidebar

${sidebarOpen ? "open" : ""}

${collapsed ? "collapsed" : ""}

`}

>

<div className="delivery-header">

<div className="delivery-logo">


{

!collapsed &&

<span style={{marginLeft:"8px"}}>
<br/>
<br/>
FoodBridge Delivery

</span>

}

</div>

</div>

<div className="delivery-links">

{

menuItems.map((item)=>(

<Link

key={item.path}

to={item.path}

className={`delivery-link ${

location.pathname===item.path

?

"active"

:

""

}`}

onClick={()=>setSidebarOpen(false)}

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

<div className="delivery-footer">

{

!collapsed &&

<div className="delivery-user">

<strong>

👤 {localStorage.getItem("username") || "Delivery Partner"}

</strong>

<br/>

<small>

🚚 {localStorage.getItem("vehicle_number") || "Vehicle"}

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

export default DeliverySidebar;