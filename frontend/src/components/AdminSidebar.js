import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslate } from "../hooks/useTranslate";
import { useState, useEffect } from "react";
import "../styles/AdminSidebar.css";

function AdminSidebar() {

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

    const menuItems=[

        {
            path:"/admin-dashboard",
            icon:"📊",
            label:t("Dashboard")
        },

        {
            path:"/admin/inventory",
            icon:"📦",
            label:t("Inventory")
        },

        {
            path:"/admin/donations",
            icon:"🎁",
            label:t("Donations")
        },

        {
            path:"/admin/transactions",
            icon:"📜",
            label:t("Transactions")
        },

        {
            path:"/admin/analytics",
            icon:"📈",
            label:t("Analytics")
        },

        {
            path:"/admin/settings",
            icon:"⚙️",
            label:t("Settings")
        }

    ];

    return(

<>

<button

className="admin-toggle"

onClick={()=>{

if(window.innerWidth<=992){

setSidebarOpen(!sidebarOpen);

}else{

setCollapsed(!collapsed);

}

}}

>

☰

</button>

<div

className={`admin-overlay ${sidebarOpen ? "show" : ""}`}

onClick={()=>setSidebarOpen(false)}

></div>

<aside

className={`admin-sidebar

${sidebarOpen ? "open" : ""}

${collapsed ? "collapsed" : ""}

`}

>

<div className="admin-header">

<div className="admin-logo">


{

!collapsed &&

<span style={{marginLeft:"8px"}}>

    <br/>
<br/>
FoodBridge Admin

</span>

}

</div>

</div>

<div className="admin-menu">

{

menuItems.map((item)=>(

<Link

key={item.path}

to={item.path}

className={`admin-link ${

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

<div className="admin-footer">

{

!collapsed &&

<div className="admin-user">

<strong>

👨‍💼 Admin

</strong>

<br/>

<small>

FoodBridge AI

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

" "+t("Logout")

}

</button>

</div>

</aside>

</>

);

}

export default AdminSidebar;