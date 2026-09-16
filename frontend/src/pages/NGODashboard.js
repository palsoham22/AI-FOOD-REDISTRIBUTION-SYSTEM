import NGOSidebar from "../components/NGOSidebar";
import TopNavbar from "../components/TopNavbar";
import DashboardCard from "../components/DashboardCard";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { LABELS } from "../translations";
import { buildDynamicLabels } from "../utils/buildDynamicLabels";
import { formatLocalizedDate } from "../utils/formatDate";
import { formatLocalizedNumber } from "../utils/formatNumber";
import { useTranslationContext } from "../context/TranslationContext";
import "../styles/NGODashboard.css";

function NGODashboard() {

    const { language } = useTranslationContext();

    const [donations, setDonations] = useState([]);

    const dynamicLabels = useMemo(
    () =>
        buildDynamicLabels(
            [
                ...LABELS.NGO_DASHBOARD,
                ...LABELS.NGO_SIDEBAR
            ],
            donations,
            [
                "business_name",
                "product_name",
                "category",
                "unit",
                "status"
            ]
        ),
    [donations]
);

    const ngoName =
        localStorage.getItem("business_name") || "Helping Hands NGO";

    const contactPerson =
        localStorage.getItem("owner_name") || "NGO Partner";

    const loadDonations = () => {

        const token = localStorage.getItem("access");

        axios.get(

            "http://127.0.0.1:8000/api/inventory/donations/",

            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }

        )

        .then((response) => {

            setDonations(response.data);

        })

        .catch((error) => {

            console.log(error);

        });

    };

    const loadDashboard = () => {

    const token = localStorage.getItem("access");

    axios.get(
            "http://127.0.0.1:8000/api/inventory/ngo/dashboard/",
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    )

    .then((response)=>{

        console.log(response.data); 

        setStats(response.data);

    })

    .catch(console.log);

};

    useEffect(() => {

        loadDonations();
        loadDashboard();

    }, []);

    const acceptDonation = async (id) => {

        if (!window.confirm(t("Accept this donation?"))) {
            return;
        }

        const token = localStorage.getItem("access");

        try {

            await axios.post(

                `http://127.0.0.1:8000/api/inventory/accept/${id}/`,

                {},

                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }

            );

            alert(t("Donation Accepted Successfully 🎉"));

            loadDonations();
            loadDashboard();

        }

        catch (error) {

            console.log(error);

            alert(t("Acceptance Failed"));

        }

    };

    const [stats, setStats] = useState({
        available: 0,
        accepted: 0,
        scheduled: 0,
        delivered: 0,
    });

    const t = useTranslate();

    usePageTranslation(dynamicLabels);

    return (

<>

<NGOSidebar />

<div className="ngo-dashboard">

<TopNavbar/>

{/* Header */}

<div className="ngo-header">

<div>

<h2 className="ngo-title">

🏢 {t("NGO Distribution Dashboard")}

</h2>

<p className="ngo-subtitle">

{t("Welcome")}, <strong>{contactPerson}</strong> 👋

</p>

</div>

<div className="ngo-badge">

🎁 {donations.length} {t("Active Donations")}

</div>

</div>

{/* NGO PROFILE */}

<div className="ngo-profile">

<div className="row align-items-center">

<div className="col-lg-2 text-center">

<div className="ngo-avatar">

🤝

</div>

</div>

<div className="col-lg-10">

<h3 className="fw-bold text-primary">

{ngoName}

</h3>

<div className="row mt-3">

<div className="col-md-6">

<p>

<strong>

🆔 {t("Registration No")}:

</strong>

NGO-2026-001

</p>

<p>

<strong>

📍 {t("Service Area")}:

</strong>

Howrah, Kolkata

</p>

</div>

<div className="col-md-6">

<p>

<strong>

👤 {t("Contact Person")}:

</strong>

{contactPerson}

</p>

<p>

<strong>

📧 {t("Email")}:

</strong>

ngo@foodbridge.ai

</p>

</div>

</div>

</div>

</div>

</div>

{/* DASHBOARD CARDS */}

<div className="row mb-4">

<div className="col-lg-3 col-md-6 mb-3">

<div className="ngo-card">

<DashboardCard

title={t("Available Donations")}

value={stats.available}

color="green"

/>

</div>

</div>

<div className="col-lg-3 col-md-6 mb-3">

<div className="ngo-card">

<DashboardCard

title={t("Accepted Donations")}

value={stats.accepted}

color="orange"

/>

</div>

</div>

<div className="col-lg-3 col-md-6 mb-3">

<div className="ngo-card">

<DashboardCard

title={t("Scheduled Pickups")}

value={stats.scheduled}

color="blue"

/>

</div>

</div>

<div className="col-lg-3 col-md-6 mb-3">

<div className="ngo-card">

<DashboardCard

title={t("Delivered Donations")}

value={stats.delivered}

color="red"

/>

</div>

</div>

</div>
                {/* NOTIFICATIONS */}

<div className="notification-card mb-4">

    <div className="card-header">

        🔔 {t("Notifications")}

    </div>

    <div className="card-body">

        {

            stats.available > 0 &&

            <div className="alert alert-primary">

                🎁 <strong>{stats.available}</strong> {t("new donation(s) available.")}

            </div>

        }

        {

            stats.accepted > 0 &&

            <div className="alert alert-success">

                🤝 <strong>{stats.accepted}</strong> {t("donation(s) accepted.")}

            </div>

        }

        {

            stats.scheduled > 0 &&

            <div className="alert alert-info">

                🚚 <strong>{stats.scheduled}</strong> {t("pickup(s) scheduled.")}

            </div>

        }

        {

            stats.delivered > 0 &&

            <div className="alert alert-warning">

                ✅ <strong>{stats.delivered}</strong> {t("donation(s) delivered successfully.")}

            </div>

        }

        {

            stats.available===0 &&

            stats.accepted===0 &&

            stats.scheduled===0 &&

            stats.delivered===0 &&

            <div className="text-center text-muted py-4">

                🔕 {t("No notifications available.")}

            </div>

        }

    </div>

</div>

{/* DONATION HEADER */}

<div className="d-flex justify-content-between align-items-center mb-3">

<h4 className="fw-bold text-primary">

🎁 {t("Available Donations")}

</h4>

<span className="ngo-badge">

{donations.length} {t("Available")}

</span>

</div>

{/* DONATION TABLE */}

<div className="donation-card">

<div className="table-responsive">

<table className="table donation-table">

<thead>

<tr>

<th>{t("Business")}</th>

<th>{t("Product")}</th>

<th>{t("Category")}</th>

<th>{t("Quantity")}</th>

<th>{t("Expiry")}</th>

<th>{t("Status")}</th>

<th>{t("Action")}</th>

</tr>

</thead>

<tbody>

{

donations.length===0

?

<tr>

<td

colSpan="7"

className="text-center text-muted py-5"

>

🎁 {t("No Donations Available")}

</td>

</tr>

:

donations.map((item)=>(

<tr key={item.id}>

<td>

<strong>

🏪 {item.business_name}

</strong>

</td>

<td>

{item.product_name}

</td>

<td>

<span className="badge bg-light text-dark">

{item.category}

</span>

</td>

<td>

{formatLocalizedNumber(item.quantity, language)}

{" "}

{t(item.unit)}

</td>

<td>

{formatLocalizedDate(item.expiry_date, language)}

</td>

<td>

{

item.status==="Donated"

?

<span className="badge bg-warning text-dark">

🟡 {t(item.status)}

</span>

:

item.status==="Accepted"

?

<span className="badge bg-primary">

🔵 {t(item.status)}

</span>

:

item.status==="Scheduled"

?

<span className="badge bg-info text-dark">

🚚 {t(item.status)}

</span>

:

item.status==="Delivered"

?

<span className="badge bg-success">

✅ {t(item.status)}

</span>

:

<span className="badge bg-secondary">

{t(item.status)}

</span>

}

</td>

<td>

<button

className="btn btn-primary accept-btn"

onClick={()=>acceptDonation(item.id)}

>

🤝 {t("Accept")}

</button>

</td>

</tr>

))

}

</tbody>

</table>

</div>

</div>

</div>

</>

);

}

export default NGODashboard;