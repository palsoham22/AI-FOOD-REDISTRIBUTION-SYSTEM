import DeliverySidebar from "../components/DeliverySidebar";
import TopNavbar from "../components/TopNavbar";
import DashboardCard from "../components/DashboardCard";
import { useEffect, useState } from "react";
import axios from "axios";
import DriverMap from "../components/DriverMap";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { LABELS } from "../translations";
import { formatLocalizedNumber } from "../utils/formatNumber";
import { useTranslationContext } from "../context/TranslationContext";
import "../styles/DeliveryDashboard.css";

function DeliveryDashboard() {

    const [profile, setProfile] = useState({});

    const [stats, setStats] = useState({});

    const t = useTranslate();

    const { language } = useTranslationContext();

    usePageTranslation(LABELS.DELIVERY_DASHBOARD);

    const [notifications, setNotifications] = useState([]);

    const loadProfile = () => {

    const token = localStorage.getItem("access");

    axios.get(

            "http://127.0.0.1:8000/api/delivery/profile/",

        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }

    )

    .then((response) => {

        console.log(response.data);

        setProfile(response.data);

    })

    .catch((error) => {

        console.log(error);

    });

};

const loadStats = () => {

    const token = localStorage.getItem("access");

    axios.get(

        "http://127.0.0.1:8000/api/delivery/dashboard/",

        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }

    )

    .then((response) => {

        setStats(response.data);

    })

    .catch((error) => {

        console.log(error);

    });

};

const updateLocation = (latitude, longitude) => {

    console.log("Sending:", latitude, longitude);

    const token = localStorage.getItem("access");

    axios.post(
            "http://127.0.0.1:8000/api/delivery/update-location/",
        {
            latitude,
            longitude
        },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    )
    .then((response) => {

        console.log("SUCCESS");
        console.log(response.data);

    })
    .catch((error) => {

        console.log("FAILED");

        console.log(error);

        if(error.response){
            console.log(error.response.status);
            console.log(error.response.data);
        }

    });

};

const loadNotifications = () => {

    const list = [];

    if ((stats.assigned || 0) > 0) {
        list.push("assigned");
    }

    if ((stats.out_for_pickup || 0) > 0) {
        list.push("pickup");
    }

    if ((stats.completed || 0) > 0) {
        list.push("completed");
    }

    if (list.length === 0) {
        list.push("waiting");
    }

    setNotifications(list);

};

useEffect(() => {

    if (!navigator.geolocation) {
        alert(t("Geolocation is not supported."));
        return;
    }

    const watchId = navigator.geolocation.watchPosition(

        (position) => {

            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            console.log("Live:", latitude, longitude);

            updateLocation(latitude, longitude);

        },

        (error) => {
            console.log(error);
        },

        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000
        }

    );

    return () => {
        navigator.geolocation.clearWatch(watchId);
    };

}, []);

useEffect(() => {

    loadProfile();
    loadStats();

}, []);

useEffect(() => {

    loadNotifications();

}, [stats]);

    return (

<>

<DeliverySidebar/>

<div className="delivery-page">

<TopNavbar/>

<div className="delivery-header">

<div>

<h2 className="delivery-title">

🚚 {t("Delivery Partner Dashboard")}

</h2>

<p className="delivery-subtitle">

{t("Welcome Delivery Partner")} 👋

</p>

</div>

<div className="delivery-badge">

🚛 Active Driver

</div>

</div>

{/* Driver Profile */}

<div className="row">

<div className="col-lg-8 mb-4">

<div className="profile-card">

<div className="card-body">

<h3 className="profile-title">

🚚 {t("Delivery Partner")}

</h3>

<hr/>

<div className="row">

<div className="col-md-6">

<p>

<strong>

👤 {t("Name")}:

</strong>

{" "}

{profile.username}

</p>

<p>

<strong>

🚚 {t("Vehicle Number")}:

</strong>

{" "}

{profile.vehicle_number}

</p>

</div>

<div className="col-md-6">

<p>

<strong>

📞 {t("Phone")}:

</strong>

{" "}

{profile.phone}

</p>

<p>

<strong>

📍 {t("Status")}:

</strong>

<span

className={`badge ms-2 ${

profile.availability==="AVAILABLE"

?

"bg-success"

:

profile.availability==="BUSY"

?

"bg-warning text-dark"

:

"bg-secondary"

}`}

>

{t(profile.availability)}

</span>

</p>

</div>

</div>

</div>

</div>

</div>

</div>

                {/* Dashboard Cards */}

<div className="row mt-2 mb-4">

    <div className="col-lg-3 col-md-6 mb-3">

        <DashboardCard
            title={t("Assigned")}
            value={formatLocalizedNumber(stats.assigned || 0, language)}
            color="blue"
        />

    </div>

    <div className="col-lg-3 col-md-6 mb-3">

        <DashboardCard
            title={t("Out For Pickup")}
            value={formatLocalizedNumber(stats.out_for_pickup || 0, language)}
            color="blue"
        />

    </div>

    <div className="col-lg-3 col-md-6 mb-3">

        <DashboardCard
            title={t("Completed")}
            value={formatLocalizedNumber(stats.completed || 0, language)}
            color="green"
        />

    </div>

    <div className="col-lg-3 col-md-6 mb-3">

        <DashboardCard
            title={t("Distance Covered")}
            value={`${formatLocalizedNumber(42, language)} ${t("Km")}`}
            color="purple"
        />

    </div>

</div>

{/* Notifications */}

<div className="notification-card">

    <div className="card-header">

        🔔 {t("Notifications")}

    </div>

    <div className="card-body">

        <ul className="list-group">

            {

                notifications.map((note,index)=>(

                    <li
                        key={index}
                        className="list-group-item d-flex align-items-center"
                    >

                        {

                            note==="assigned" &&

                            <>📦 {t("You have new pickup assignments.")}</>

                        }

                        {

                            note==="pickup" &&

                            <>🚚 {t("You are currently delivering food.")}</>

                        }

                        {

                            note==="completed" &&

                            <>✅ {t("Great job! Deliveries completed successfully.")}</>

                        }

                        {

                            note==="waiting" &&

                            <>🎉 {t("No pending pickups. Waiting for next assignment.")}</>

                        }

                    </li>

                ))

            }

        </ul>

    </div>

</div>

                {/* Live Driver Location */}

<div className="map-card mt-4">

    <div className="card-header">

        📍 {t("Live Driver Location")}

    </div>

    <div className="card-body">

        <DriverMap />

    </div>

</div>

</div>

</>

);

}

export default DeliveryDashboard;