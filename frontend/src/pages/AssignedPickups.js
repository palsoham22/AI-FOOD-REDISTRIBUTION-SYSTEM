import DeliverySidebar from "../components/DeliverySidebar";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { LABELS } from "../translations";
import { buildDynamicLabels } from "../utils/buildDynamicLabels";
import { formatLocalizedDate } from "../utils/formatDate";
import { formatLocalizedNumber } from "../utils/formatNumber";
import { useTranslationContext } from "../context/TranslationContext";
import "../styles/AssignedPickups.css";

function AssignedPickups() {

    const [pickups, setPickups] = useState([]);

    const dynamicLabels = useMemo(
    () =>
        buildDynamicLabels(
            LABELS.ASSIGNED_PICKUPS,
            pickups,
            [
                "product_name",
                "unit",
                "status"
            ]
        ),
    [pickups]
);


    const [pickupOtp, setPickupOtp] = useState({});
    const [deliveryOtp, setDeliveryOtp] = useState({});

    const t = useTranslate();

    const { language } = useTranslationContext();

    usePageTranslation(dynamicLabels);

    const loadPickups = () => {

        const token = localStorage.getItem("access");

        axios.get(

            "http://127.0.0.1:8000/api/inventory/delivery/my-pickups/",

            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }

        )

        .then((response) => {

    console.log(response.data);

    setPickups(response.data);

    localStorage.setItem(
        "offline_assigned_pickups",
        JSON.stringify(response.data)
    );

})

.catch((error) => {

    console.log(error);

    const cached = localStorage.getItem("offline_assigned_pickups");

    if (cached) {

        setPickups(JSON.parse(cached));

        alert("📶 Offline Mode: Showing last synced assigned pickups.");

    }

});

    };

    useEffect(() => {

        loadPickups();

    }, []);

    const startPickup = async (id) => {

    const token = localStorage.getItem("access");

    try {

        await axios.post(

            `http://127.0.0.1:8000/api/inventory/start-pickup/${id}/`,

            {},

            {

                headers: {

                    Authorization: `Bearer ${token}`

                }

            }

        );

        alert(t("Pickup Started Successfully 🚚"));

        loadPickups();

    }

    catch (error) {

        console.log(error);

        alert(t("Failed to Start Pickup"));

    }

};

const verifyPickupOtp = async (id) => {

    const token = localStorage.getItem("access");

    try {

        await axios.post(

            `http://127.0.0.1:8000/api/inventory/verify-pickup-otp/${id}/`,

            {
                pickup_otp: pickupOtp[id]
            },

            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }

        );

        alert("✅ " + t("Pickup OTP Verified"));

        loadPickups();

    }

    catch (error) {

        console.log(error);

        alert(error.response?.data?.error || t("Verification Failed"));

    }

};

const verifyDeliveryOtp = async (id) => {

    const token = localStorage.getItem("access");

    try {

        await axios.post(

            `http://127.0.0.1:8000/api/inventory/verify-delivery-otp/${id}/`,

            {
                delivery_otp: deliveryOtp[id]
            },

            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }

        );

        alert("✅ " + t("Delivery Completed Successfully"));

        loadPickups();

    }

    catch (error) {

        console.log(error);

        alert(error.response?.data?.error || t("Verification Failed"));

    }

};

    return (

        <>

            <DeliverySidebar />

            <div className="assigned-page">

                <div className="assigned-header">

<div>

<h2 className="assigned-title">

📦 {t("Assigned Pickups")}

</h2>

<p className="assigned-subtitle">

Manage all assigned pickups and complete OTP verification.

</p>

</div>

<div className="assigned-badge">

{pickups.length} {t("Assigned")}

</div>

</div>

<div className="assigned-summary">

<div className="summary-card">

<h6>{t("Assigned")}</h6>

<h2>{pickups.length}</h2>

</div>

<div className="summary-card">

<h6>{t("Out For Pickup")}</h6>

<h2>

{

pickups.filter(

p=>p.status==="Out For Pickup"

).length

}

</h2>

</div>

<div className="summary-card">

<h6>{t("Delivered")}</h6>

<h2>

{

pickups.filter(

p=>p.delivery_verified

).length

}

</h2>

</div>

</div>

                <div className="assigned-table-card">

<div className="table-responsive">

                    <table className="table assigned-table">

                        <thead>

                            <tr>

                                <th>{t("Product")}</th>

                                <th>{t("Quantity")}</th>

                                <th>{t("Pickup Date")}</th>

                                <th>{t("Pickup Time")}</th>

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
                                    colSpan="8"
                                    className="text-center"
                                >

                                    {t("No Assigned Pickups")}

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

                                    <td>{item.vehicle_number}</td>

                                    <td>

                                        <span className="badge bg-primary">

                                            {t(item.status)}

                                        </span>

                                    </td>

                                    <td>

                                         {item.status === "Scheduled" && (
        <button
            className="btn btn-warning rounded-pill"
            onClick={() => startPickup(item.id)}
        >
            🚚 {t("Start Pickup")}
        </button>
    )}

    {item.status === "Out For Pickup" && !item.pickup_verified && (
        <>
            <input
                type="text"
                className="form-control form-control-sm mb-2"
                placeholder={t("Enter Pickup OTP")}
                value={pickupOtp[item.id] || ""}
                onChange={(e) =>
                    setPickupOtp({
                        ...pickupOtp,
                        [item.id]: e.target.value,
                    })
                }
            />

            <button
                className="btn btn-success rounded-pill"
                onClick={() => verifyPickupOtp(item.id)}
            >
                🔐 {t("Verify Pickup OTP")}
            </button>
        </>
    )}

    {item.pickup_verified && !item.delivery_verified && (
    <>
        <input
            type="text"
            className="form-control form-control-sm mb-2"
            placeholder={t("Enter Delivery OTP")}
            value={deliveryOtp[item.id] || ""}
            onChange={(e) =>
                setDeliveryOtp({
                    ...deliveryOtp,
                    [item.id]: e.target.value,
                })
            }
        />

        <button
            className="btn btn-primary rounded-pill"
            onClick={() => verifyDeliveryOtp(item.id)}
        >
            🚚 {t("Verify Delivery OTP")}
        </button>
    </>
)}

    {item.delivery_verified && (
        <span className="badge bg-success">
            ✅ {t("Delivered")}
        </span>
    )}

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

export default AssignedPickups;