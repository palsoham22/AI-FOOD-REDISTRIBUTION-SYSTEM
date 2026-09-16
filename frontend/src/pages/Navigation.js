import DeliverySidebar from "../components/DeliverySidebar";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { LABELS } from "../translations";
import { buildDynamicLabels } from "../utils/buildDynamicLabels";
import { formatLocalizedNumber } from "../utils/formatNumber";
import { useTranslationContext } from "../context/TranslationContext";
import "../styles/Navigation.css";

function Navigation() {

    const [deliveries, setDeliveries] = useState([]);

    const dynamicLabels = useMemo(
    () =>
        buildDynamicLabels(
            LABELS.DELIVERY_NAVIGATION,
            deliveries,
            [
                "product_name",
                "unit",
                "status"
            ]
        ),
    [deliveries]
);

    const t = useTranslate();

    const { language } = useTranslationContext();

    usePageTranslation(dynamicLabels);

    const loadDeliveries = () => {

        const token = localStorage.getItem("access");

        axios.get(

            "http://127.0.0.1:8000/api/inventory/out-for-pickup/",

            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }

        )

        .then((response)=>{

            setDeliveries(response.data);

        })

        .catch(console.log);

    };

    useEffect(()=>{

        loadDeliveries();

    },[]);

    const openMap = () => {

        window.open(

            "https://www.google.com/maps?q=22.5726,88.3639",

            "_blank"

        );

    };

    const markDelivered = async(id)=>{

        const token = localStorage.getItem("access");

        try{

            await axios.post(

                `http://127.0.0.1:8000/api/inventory/mark-delivered/${id}/`,

                {},

                {

                    headers:{

                        Authorization:`Bearer ${token}`

                    }

                }

            );

            alert(t("Delivery Completed Successfully 🎉"));

            loadDeliveries();

        }

        catch(error){

            console.log(error);

            alert(t("Failed"));

        }

    };

    return(

        <>

        <DeliverySidebar/>

        <div className="navigation-page">

            <div className="navigation-header">

<div>

<h2 className="navigation-title">

🗺 {t("Navigation")}

</h2>

<p className="navigation-subtitle">

Navigate active deliveries and complete them successfully.

</p>

</div>

<div className="navigation-badge">

{deliveries.length} {t("Active Delivery")}

</div>

</div>

<div className="navigation-summary">

<div className="summary-card">

<h6>{t("Active Deliveries")}</h6>

<h2>{deliveries.length}</h2>

</div>

<div className="summary-card">

<h6>{t("Out For Delivery")}</h6>

<h2>

{

deliveries.filter(

d=>d.status==="Out For Pickup"

).length

}

</h2>

</div>

<div className="summary-card">

<h6>{t("Completed")}</h6>

<h2>0</h2>

</div>

</div>

            <div className="navigation-table-card">

<div className="table-responsive">

            <table className="table navigation-table">

                <thead>

                    <tr>

                        <th>{t("Product")}</th>

                        <th>{t("Quantity")}</th>

                        <th>{t("Vehicle")}</th>

                        <th>{t("Status")}</th>

                        <th>{t("Action")}</th>

                    </tr>

                </thead>

                <tbody>

                {

                    deliveries.length===0 ?

                    <tr>

                        <td colSpan="5" className="text-center">

                            {t("No Active Deliveries")}

                        </td>

                    </tr>

                    :

                    deliveries.map((item)=>(

                        <tr key={item.id}>

                            <td>{t(item.product_name)}</td>

                            <td>
    {formatLocalizedNumber(item.quantity, language)} {t(item.unit)}
</td>

                            <td>{item.vehicle_number}</td>

                            <td>

                                <span className="badge bg-warning text-dark rounded-pill px-3 py-2">

                                    {t(item.status)}

                                </span>

                            </td>

                            <td>

                                <button

                                    className="btn btn-primary navigate-btn me-2"

                                    onClick={openMap}

                                >

                                    🗺 {t("Navigate")}

                                </button>

                                <button

                                    className="btn btn-success delivered-btn"

                                    onClick={()=>markDelivered(item.id)}

                                >

                                    ✅ {t("Delivered")}

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

export default Navigation;