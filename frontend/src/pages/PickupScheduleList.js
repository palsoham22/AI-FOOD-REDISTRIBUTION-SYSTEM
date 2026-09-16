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
import "../styles/PickupScheduleList.css";

function PickupScheduleList() {

    const [pickups, setPickups] = useState([]);

    const dynamicLabels = useMemo(
    () =>
        buildDynamicLabels(
            [
                ...LABELS.NGO_PICKUP_SCHEDULE,
                ...LABELS.NGO_SIDEBAR
            ],
            pickups,
            [
                "product_name",
                "volunteer_name",
                "vehicle_number",
                "unit",
                "status"
            ]
        ),
    [pickups]
);

    const t = useTranslate();

    const { language } = useTranslationContext();

    usePageTranslation(dynamicLabels);

    const loadPickups = () => {

        const token = localStorage.getItem("access");

        axios.get(

            "http://127.0.0.1:8000/api/inventory/scheduled/",

            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }

        )

        .then((response) => {

    setPickups(response.data);

    localStorage.setItem(
        "offline_pickups",
        JSON.stringify(response.data)
    );

})

        .catch((error) => {

    console.log(error);

    const cached = localStorage.getItem("offline_pickups");

    if (cached) {

        setPickups(JSON.parse(cached));

        alert("📶 Offline Mode: Showing last synced pickup schedule.");

    }

});

    };

    useEffect(() => {

        loadPickups();

    }, []);

    const confirmPickup = async (id) => {

    const token = localStorage.getItem("access");

    try {

        await axios.post(

            `http://127.0.0.1:8000/api/inventory/confirm/${id}/`,

            {},

            {

                headers: {

                    Authorization: `Bearer ${token}`

                }

            }

        );

        alert(t("Pickup Confirmed Successfully 🚚"));

        loadPickups();

    }

    catch(error){

        console.log(error);

    }

};

    return (

        <>

            <NGOSidebar />

            <div className="pickup-list-page">

                <div className="pickup-list-header">

<div>

<h2 className="pickup-list-title">

🚚 {t("Scheduled Pickups")}

</h2>

<p className="pickup-list-subtitle">

Track and confirm all scheduled pickups.

</p>

</div>

<div className="pickup-badge">

{pickups.length} {t("Scheduled")}

</div>

</div>

<div className="pickup-summary">

<div className="summary-card">

<h6>{t("Scheduled")}</h6>

<h2>{pickups.length}</h2>

</div>

<div className="summary-card">

<h6>{t("Pending")}</h6>

<h2>

{

pickups.filter(

p=>p.status==="Scheduled"

).length

}

</h2>

</div>

<div className="summary-card">

<h6>{t("Confirmed")}</h6>

<h2>

{

pickups.filter(

p=>p.status==="Confirmed"

).length

}

</h2>

</div>

</div>

                <div className="pickup-table-card">

<div className="table-responsive">

                    <table className="table pickup-table">

                        <thead>

                            <tr>

                                <th>{t("Product")}</th>
                                <th>{t("Quantity")}</th>
                                <th>{t("Pickup Date")}</th>
                                <th>{t("Pickup Time")}</th>
                                <th>{t("Volunteer")}</th>
                                <th>{t("Vehicle")}</th>
                                <th>{t("Status")}</th>
                                <th>{t("Action")}</th>

                            </tr>

                        </thead>

                        <tbody>

                        {

                            pickups.length === 0 ?

                            <tr>

                                <td
                                    colSpan="7"
                                    className="text-center"
                                >

                                    {t("No Scheduled Pickups")}

                                </td>

                            </tr>

                            :

                            pickups.map((item)=>(

                                <tr key={item.id}>

                                    <td>{t(item.product_name)}</td>

                                    <td>
    {formatLocalizedNumber(item.quantity, language)} {t(item.unit)}
</td>

                                    <td>{formatLocalizedDate(item.pickup_date, language)}</td>

                                    <td>{item.pickup_time}</td>

                                    <td>{item.volunteer_name}</td>

                                    <td>{item.vehicle_number}</td>

                                    <td>

                                        <span className="badge bg-success">

                                            {t(item.status)}

                                        </span>

                                    </td>

                                    <td>

                                        <button

                                            className="btn btn-primary confirm-btn"

                                            onClick={() => confirmPickup(item.id)}

                                        >

                                            ✅ {t("Confirm Pickup")}

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

export default PickupScheduleList;