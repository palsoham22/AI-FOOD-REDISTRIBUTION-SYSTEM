import NGOSidebar from "../components/NGOSidebar";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { LABELS } from "../translations";
import { buildDynamicLabels } from "../utils/buildDynamicLabels";
import { formatLocalizedDate } from "../utils/formatDate";
import { formatLocalizedNumber } from "../utils/formatNumber";
import { useTranslationContext } from "../context/TranslationContext";
import "../styles/AcceptedDonations.css";

function AvailableDonations() {

    const [donations, setDonations] = useState([]);

    const dynamicLabels = useMemo(
    () =>
        buildDynamicLabels(
            [
                ...LABELS.NGO_ACCEPTED_DONATIONS,
                ...LABELS.NGO_SIDEBAR
            ],
            donations,
            [
                "product_name",
                "category",
                "unit",
                "status"
            ]
        ),
    [donations]
);

    const t = useTranslate();

    const { language } = useTranslationContext();

    usePageTranslation(dynamicLabels);

    const navigate = useNavigate();

    const loadDonations = () => {

        const token = localStorage.getItem("access");

        axios.get(

            "http://127.0.0.1:8000/api/inventory/accepted/",

            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }

        )

        .then((response) => {

    setDonations(response.data);

    localStorage.setItem(
        "offline_accepted_donations",
        JSON.stringify(response.data)
    );

})

        .catch((error) => {

    console.log(error);

    const cached = localStorage.getItem(
        "offline_accepted_donations"
    );

    if (cached) {

        setDonations(JSON.parse(cached));

        alert("📶 Offline Mode: Showing last synced accepted donations.");

    }

});

    };

    useEffect(() => {

        loadDonations();

    }, []);

    const schedulePickup = (id) => {

    navigate(`/schedule-pickup/${id}`);

};

    return (

<>

<NGOSidebar/>

<div className="accepted-page">

<div className="accepted-header">

<div>

<h2 className="accepted-title">

✅ {t("Accepted Donations")}

</h2>

<p className="accepted-subtitle">

{t("View all donations accepted by your NGO.")}

</p>

</div>

<div className="accepted-badge">

{donations.length} {t("Accepted")}

</div>

</div>

<div className="summary-grid">

<div className="summary-card">

<h6>{t("Accepted Donations")}</h6>

<h2>{donations.length}</h2>

</div>

<div className="summary-card">

<h6>{t("Ready For Pickup")}</h6>

<h2>{donations.length}</h2>

</div>

<div className="summary-card">

<h6>{t("Scheduled Today")}</h6>

<h2>

{

donations.filter(

item=>item.status==="Scheduled"

).length

}

</h2>

</div>

</div>

<div className="table-card">

<div className="table-responsive">

<table className="table accepted-table">

<thead>

<tr>

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

colSpan="6"

className="text-center py-5 text-muted"

>

✅ {t("No Donations Available")}

</td>

</tr>

:

donations.map((item)=>(

<tr key={item.id}>

<td>

<strong>

{t(item.product_name)}

</strong>

</td>

<td>

<span className="badge bg-light text-dark">

{t(item.category)}

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

<span className="badge bg-primary">

🚚 {t(item.status)}

</span>

</td>

<td>

<button

className="btn btn-primary pickup-btn"

onClick={()=>schedulePickup(item.id)}

>

🚚 {t("Schedule Pickup")}

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

export default AvailableDonations;