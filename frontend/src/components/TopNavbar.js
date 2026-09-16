import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTranslationContext } from "../context/TranslationContext";
import { useTranslate } from "../hooks/useTranslate";
import "../styles/TopNavbar.css";


function TopNavbar() {

    const {
    language,
    setLanguage
} = useTranslationContext();

const t = useTranslate();

    const role = localStorage.getItem("role");

const ownerName =
    localStorage.getItem("owner_name") ||
    localStorage.getItem("username") ||
    "User";

let businessName = localStorage.getItem("business_name");

// If Delivery Partner
if (role === "DELIVERY") {
    businessName = t("Delivery Partner");
}

// If NGO
else if (role === "NGO") {
    businessName = t("NGO");
}

// If Business
else {
    businessName = t("FoodBridge");
}

    const [count, setCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    const logout = () => {
        localStorage.clear();
        window.location.href = "/login";
    };

    const loadNotifications = async () => {

    const token = localStorage.getItem("access");

    try {

        const response = await axios.get(
                "http://127.0.0.1:8000/api/inventory/notifications/",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        setNotifications(response.data);

const unread = response.data.filter(
    notification => notification.is_read === false
);

setCount(unread.length);

    } catch (error) {

        console.log(error);

    }

};

const markAsRead = async (id) => {

    const token = localStorage.getItem("access");

    try {

        await axios.post(
            `http://127.0.0.1:8000/api/inventory/notifications/${id}/read/`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        // Reload notifications
        loadNotifications();
        setShowDropdown(false);

    } catch (error) {

        console.log(error);

    }

};

useEffect(() => {

    loadNotifications();

    const interval = setInterval(() => {
        loadNotifications();
    }, 10000);   // Every 10 seconds

    return () => clearInterval(interval);

}, []);

    return (

<nav className="fb-top-navbar">

<div className="fb-top-left">

</div>

<div className="fb-top-right">

{/* Notification */}

<div className="fb-notification">

<button

className="fb-icon-btn"

onClick={() => setShowDropdown(!showDropdown)}

>

<i className="bi bi-bell-fill"></i>

<span className="fb-badge">
    {count}
</span>

</button>

{

showDropdown && (

<div className="fb-dropdown card shadow">

<div className="card-header fw-bold">

{t("Notifications")}

</div>

<div className="fb-dropdown-body">

{

notifications.length===0

?

<p className="text-center mt-3">

🎉 You're all caught up!

</p>

:

notifications

.sort(

(a,b)=>

new Date(b.created_at)-new Date(a.created_at)

)

.slice(0,10)

.map((item)=>(

<div

key={item.id}

className="border-bottom p-3"

style={{

cursor:"pointer",

background:item.is_read?"#f8f9fa":"white"

}}

onClick={()=>markAsRead(item.id)}

>

<strong

className={

item.notification_type==="SUCCESS"

?

"text-success"

:

item.notification_type==="WARNING"

?

"text-warning"

:

item.notification_type==="ERROR"

?

"text-danger"

:

"text-primary"

}

>

{item.title}

</strong>

<br/>

<small>

{item.message}

</small>

<br/>

<small className="text-muted">

{new Date(item.created_at).toLocaleString()}

</small>

</div>

))

}

</div>

</div>

)

}

</div>

{/* Language */}

<div className="fb-language">

<select
    className="form-select"
    value={language}
    onChange={(e) => setLanguage(e.target.value)}
>
    <option value="en-IN">🌐 English</option>
    <option value="hi-IN">🇮🇳 हिन्दी</option>
    <option value="ta-IN">🇮🇳 தமிழ்</option>
    <option value="te-IN">🇮🇳 తెలుగు</option>
    <option value="ml-IN">🇮🇳 മലയാളം</option>
    <option value="bn-IN">🇮🇳 বাংলা</option>
</select>

</div>

{/* User */}

<div className="fb-user">

<div>

<div className="fw-bold">

👤 {ownerName}

</div>

<small>

🏪 {businessName}

</small>

</div>

</div>

{/* Logout */}

<button

className="btn btn-outline-danger"

onClick={logout}

>

<i className="bi bi-box-arrow-right"></i>

{" "}

{t("Logout")}

</button>

</div>

</nav>

);

}

export default TopNavbar;