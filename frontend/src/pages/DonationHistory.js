import NGOSidebar from "../components/NGOSidebar";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { LABELS } from "../translations";
import { buildDynamicLabels } from "../utils/buildDynamicLabels";
import { formatLocalizedNumber } from "../utils/formatNumber";
import { useTranslationContext } from "../context/TranslationContext";
import "../styles/DonationHistory.css";

function DonationHistory() {

    const [history, setHistory] = useState([]);

    const dynamicLabels = useMemo(
    () =>
        buildDynamicLabels(
            [
                ...LABELS.NGO_DONATION_HISTORY,
                ...LABELS.NGO_SIDEBAR
            ],
            history,
            [
                "product_name",
                "category",
                "unit",
                "status"
            ]
        ),
    [history]
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

        .then((response) => {

    setHistory(response.data);

    localStorage.setItem(
        "offline_donation_history",
        JSON.stringify(response.data)
    );

})

        .catch((error) => {

    console.log(error);

    const cached = localStorage.getItem(
        "offline_donation_history"
    );

    if (cached) {

        setHistory(JSON.parse(cached));

        alert(t("📶 Offline Mode: Showing last synced donation history."));

    }

});

    }, []);

    return (

        <>

            <NGOSidebar />

            <div className="history-page">

                <div className="history-header">

<div>

<h2 className="history-title">

📜 {t("Donation History")}

</h2>

<p className="history-subtitle">

View all completed donations handled by your NGO.

</p>

</div>

<div className="history-badge">

{history.length} {t("Completed")}

</div>

</div>

                <div className="history-table-card">

<div className="table-responsive">

                    <table className="table history-table">

                        <thead>

                            <tr>

                                <th>{t("Product")}</th>
                                <th>{t("Category")}</th>
                                <th>{t("Quantity")}</th>
                                <th>{t("Volunteer")}</th>
                                <th>{t("Vehicle")}</th>
                                <th>{t("Status")}</th>

                            </tr>

                        </thead>

                        <tbody>

                        {

                            history.length===0 ?

                            <tr>

                                <td
                                    colSpan="6"
                                    className="text-center"
                                >

                                    {t("No Completed Donations")}

                                </td>

                            </tr>

                            :

                            history.map((item)=>(

                                <tr key={item.id}>

                                    <td>{t(item.product_name)}</td>

                                    <td>{t(item.category)}</td>

                                    <td>
    {formatLocalizedNumber(item.quantity, language)} {t(item.unit)}
</td>

                                    <td>{item.volunteer_name}</td>

                                    <td>{item.vehicle_number}</td>

                                    <td>

                                        <span className="badge bg-success">
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

export default DonationHistory;