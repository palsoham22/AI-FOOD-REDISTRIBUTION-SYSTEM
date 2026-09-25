import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import BusinessLayout from "../components/BusinessLayout";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { LABELS } from "../translations";
import { buildDynamicLabels } from "../utils/buildDynamicLabels";
import { formatLocalizedDate } from "../utils/formatDate";
import { useTranslationContext } from "../context/TranslationContext";
import "../styles/TransactionHistory.css";


function TransactionHistory() {

    const t = useTranslate();

    const [products, setProducts] = useState([]);

    const { language } = useTranslationContext();

    const dynamicLabels = useMemo(
        () =>
            buildDynamicLabels(
                LABELS.TRANSACTIONS,
                products,
                ["product_name", "category", "unit", "status"]
            ),
        [products]
    );

    usePageTranslation(dynamicLabels);

    useEffect(() => {

        const token = localStorage.getItem("access");

        axios.get(

            "http://127.0.0.1:8000/api/inventory/list/",

            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }

        )

        .then((response)=>{

    const items = Array.isArray(response.data) ? response.data : [];
    setProducts(items);

    localStorage.setItem(
        "offline_transactions",
        JSON.stringify(items)
    );

})

        .catch((err)=>{

    console.warn("Transaction fetch error:", err.message);

    try {
        const cached = localStorage.getItem("offline_transactions");
        if(cached){
            const parsed = JSON.parse(cached);
            setProducts(Array.isArray(parsed) ? parsed : []);
        }
    } catch(e) {
        console.error("Cache read error:", e);
    }

});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <BusinessLayout>
            <div className="transaction-page-content">

        <div className="transaction-header">

            <div>

                <h2 className="transaction-title">

                    📜 {t("Transaction History")}

                </h2>

                <p className="transaction-subtitle">
    {t("View all inventory activities and donation transactions.")}
</p>

            </div>

        </div>

        {/* Summary Cards */}

        <div className="transaction-summary">

            <div className="summary-card summary-green">

                <h6>{t("Total Transactions")}</h6>

                <h2>{products.length}</h2>

            </div>

            <div className="summary-card summary-blue">

                <h6>{t("Added")}</h6>

                <h2>

                    {

                        products.filter(

                            p => p.status === "Available"

                        ).length

                    }

                </h2>

            </div>

            <div className="summary-card summary-yellow">

                <h6>{t("Donated")}</h6>

                <h2>

                    {

                        products.filter(

                            p => p.status === "Donated"

                        ).length

                    }

                </h2>

            </div>

            <div className="summary-card summary-red">

                <h6>{t("Accepted")}</h6>

                <h2>

                    {

                        products.filter(

                            p => p.status === "Accepted"

                        ).length

                    }

                </h2>

            </div>

        </div>

        {/* Table */}

        <div className="transaction-card">

            <div className="table-responsive">

                <table className="table transaction-table">

                    <thead>

                        <tr>

                            <th>{t("Date")}</th>

                            <th>{t("Product")}</th>

                            <th>{t("Action")}</th>

                            <th>{t("Status")}</th>

                        </tr>

                    </thead>

                    <tbody>

                    {

                        products.length === 0 ?

                        <tr>

                            <td
                                colSpan="4"
                                className="text-center text-muted py-5"
                            >

                                📜 {t("No Transactions Found")}

                            </td>

                        </tr>

                        :

                        products.map((product)=>(

                            <tr key={product.id}>

                                <td>

                                    {formatLocalizedDate(product.created_at, language)}

                                </td>

                                <td>

                                    <strong>

                                        {t(product.product_name)}

                                    </strong>

                                </td>

                                <td>

                                    {

                                        product.status === "Available"

                                        ?

                                        <span className="transaction-status status-added">

                                            {t("Added")}

                                        </span>

                                        :

                                        product.status === "Donated"

                                        ?

                                        <span className="transaction-status status-donated">

                                            {t("Donated")}

                                        </span>

                                        :

                                        <span className="transaction-status status-other">

                                            {t(product.status)}

                                        </span>

                                    }

                                </td>

                                <td>

                                    <span className="badge bg-success">

                                        {t(product.status)}

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
        </BusinessLayout>
    );
}

export default TransactionHistory;