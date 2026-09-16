import NGOSidebar from "../components/NGOSidebar";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { LABELS } from "../translations";
import { buildDynamicLabels } from "../utils/buildDynamicLabels";
import { formatLocalizedDate } from "../utils/formatDate";
import { formatLocalizedNumber } from "../utils/formatNumber";
import { useTranslationContext } from "../context/TranslationContext";
import "../styles/AvailableDonations.css";

function AvailableDonations() {

    const [donations, setDonations] = useState([]);

    const dynamicLabels = useMemo(
    () =>
        buildDynamicLabels(
            [
                ...LABELS.NGO_AVAILABLE_DONATIONS,
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

    localStorage.setItem(
        "offline_available_donations",
        JSON.stringify(response.data)
    );

})

        .catch((error)=>{

    console.log(error);

    const cached = localStorage.getItem(
        "offline_available_donations"
    );

    if(cached){

        setDonations(JSON.parse(cached));

        alert("📶 Offline Mode: Showing last synced donations.");

    }

});

    };

    useEffect(() => {

        loadDonations();

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

        }

        catch (error) {

            console.log(error);

            alert(t("Acceptance Failed"));

        }

    };

    return (

<>

<NGOSidebar/>

<div className="available-page">

{/* Header */}

<div className="available-header">

<div>

<h2 className="available-title">

🎁 {t("Available Donations")}

</h2>

<p className="available-subtitle">

{t("View and accept food donations from businesses.")}

</p>

</div>

<div className="available-badge">

{donations.length} {t("Available")}

</div>

</div>

{/* Summary Cards */}

<div className="summary-grid">

<div className="summary-card">

<h6>{t("Available Donations")}</h6>

<h2>{donations.length}</h2>

</div>

<div className="summary-card">

<h6>{t("Fresh Donations")}</h6>

<h2>

{

donations.filter(

item=>item.status==="Donated"

).length

}

</h2>

</div>

<div className="summary-card">

<h6>{t("Ready For Pickup")}</h6>

<h2>

{

donations.filter(

item=>item.status==="Accepted"

).length

}

</h2>

</div>

</div>

{/* Donation Table */}

<div className="table-card">

<div className="table-responsive">

<table className="table available-table">

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

🎁 {t("No Donations Available")}

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

<span className="badge bg-success">

{t(item.status)}

</span>

}

</td>

<td>

<button

className="btn btn-primary accept-btn"

onClick={()=>acceptDonation(item.id)}

>

🤝 {t("Accept Donation")}

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