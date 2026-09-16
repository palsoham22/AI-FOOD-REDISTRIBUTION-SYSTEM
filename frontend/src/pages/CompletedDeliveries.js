import DeliverySidebar from "../components/DeliverySidebar";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { LABELS } from "../translations";
import { buildDynamicLabels } from "../utils/buildDynamicLabels";
import { formatLocalizedNumber } from "../utils/formatNumber";
import { useTranslationContext } from "../context/TranslationContext";
import "../styles/CompletedDeliveries.css";

function CompletedDeliveries() {

    const [deliveries, setDeliveries] = useState([]);

    const dynamicLabels = useMemo(
    () =>
        buildDynamicLabels(
            LABELS.COMPLETED_DELIVERIES,
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

    useEffect(() => {

        const token = localStorage.getItem("access");

        axios.get(

            "http://127.0.0.1:8000/api/inventory/history/",

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

    },[]);

    return(

        <>

        <DeliverySidebar/>

        <div className="completed-page">

       <div className="completed-header">

<div>

<h2 className="completed-title">

✅ {t("Completed Deliveries")}

</h2>

<p className="completed-subtitle">

Review all successfully completed food deliveries.

</p>

</div>

<div className="completed-badge">

{deliveries.length} {t("Completed")}

</div>

</div>

<div className="completed-summary">

<div className="completed-card">

<h6>{t("Completed Deliveries")}</h6>

<h2>{deliveries.length}</h2>

</div>

<div className="completed-card">

<h6>{t("Food Delivered")}</h6>

<h2>

{

deliveries.reduce(

(sum,item)=>sum+Number(item.quantity),

0

)

}

</h2>

</div>

<div className="completed-card">

<h6>{t("Success Rate")}</h6>

<h2>100%</h2>

</div>

</div>

        <div className="completed-table-card">

<div className="table-responsive">

        <table className="table completed-table">
            <thead>

                <tr>

                    <th>{t("Product")}</th>

                    <th>{t("Quantity")}</th>

                    <th>{t("Vehicle")}</th>

                    <th>{t("Status")}</th>

                </tr>

            </thead>

            <tbody>

            {

                deliveries.length===0 ?

                <tr>

                    <td colSpan="4" className="text-center">

                        {t("No Completed Deliveries")}

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

                            <span className="badge bg-success rounded-pill px-3 py-2">
    {t(item.status)}
</span>

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

export default CompletedDeliveries;