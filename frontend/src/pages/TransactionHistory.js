import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
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

    const dynamicLabels = buildDynamicLabels(

    LABELS.TRANSACTIONS,

    products,

    [

        "product_name",

        "category",

        "unit",

        "status"

    ]

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

    setProducts(response.data);

    localStorage.setItem(
        "offline_transactions",
        JSON.stringify(response.data)
    );

})

        .catch((err)=>{

    console.log(err);

    const cached = localStorage.getItem("offline_transactions");

    if(cached){

        setProducts(JSON.parse(cached));

        alert(t("📶 Offline Mode: Showing last synced transaction history."));

    }

});

    }, []);

    return (

<>
    <Sidebar />

    <div className="transaction-page">

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

</>

);

}

export default TransactionHistory;