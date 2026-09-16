import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import AdminSidebar from "../components/AdminSidebar";
import TopNavbar from "../components/TopNavbar";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { LABELS } from "../translations";
import { buildDynamicLabels } from "../utils/buildDynamicLabels";
import { formatLocalizedDate } from "../utils/formatDate";
import { formatLocalizedNumber } from "../utils/formatNumber";
import { useTranslationContext } from "../context/TranslationContext";

function AdminTransactions() {

    const [transactions, setTransactions] = useState([]);

    const dynamicLabels = useMemo(
    () =>
        buildDynamicLabels(
            LABELS.ADMIN_TRANSACTIONS,
            transactions,
            [
                "product_name",
                "category",
                "unit",
                "status"
            ]
        ),
    [transactions]
);



    const [search, setSearch] = useState("");
    const t = useTranslate();
    const { language } = useTranslationContext();

    usePageTranslation(dynamicLabels);

    useEffect(() => {

        const token = localStorage.getItem("access");

        axios.get(
            "http://127.0.0.1:8000/api/inventory/admin/transactions/",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )
        .then((response) => {

            setTransactions(response.data);

        })
        .catch((error) => {

            console.log(error);

        });

    }, []);

    const filteredTransactions = transactions.filter((item) =>
    t(item.product_name)
        ?.toLowerCase()
        .includes(search.toLowerCase())
);

    return (

        <>

            <AdminSidebar />

            <div
                className="container-fluid"
                style={{
                    marginLeft: "260px",
                    width: "calc(100% - 260px)",
                    padding: "30px"
                }}
            >

                <TopNavbar />

                <div className="mt-4">

                    <h2 className="fw-bold">
                        📦 {t("Transactions")}
                    </h2>

                    <p className="text-muted">
                        {t("Complete history of all food donation transactions.")}
                    </p>

                    {/* Cards */}

                    <div className="row mt-4">

                        <div className="col-lg-3 col-md-6 mb-4">

                            <div className="card shadow border-0">

                                <div className="card-body text-center">

                                    <h6>{t("Total Transactions")}</h6>

                                    <h2 className="text-dark">

                                        {formatLocalizedNumber(transactions.length, language)}

                                    </h2>

                                </div>

                            </div>

                        </div>

                        <div className="col-lg-3 col-md-6 mb-4">

                            <div className="card shadow border-0">

                                <div className="card-body text-center">

                                    <h6>{t("Accepted")}</h6>

                                    <h2 className="text-primary">

                                        {
                                            formatLocalizedNumber(
    transactions.filter(
        t => t.status === "Accepted"
    ).length,
    language
)
                                        }

                                    </h2>

                                </div>

                            </div>

                        </div>

                        <div className="col-lg-3 col-md-6 mb-4">

                            <div className="card shadow border-0">

                                <div className="card-body text-center">

                                    <h6>{t("Scheduled")}</h6>

                                    <h2 className="text-warning">

                                        {
                                            formatLocalizedNumber(
    transactions.filter(
        t => t.status === "Scheduled"
    ).length,
    language
)
                                        }

                                    </h2>

                                </div>

                            </div>

                        </div>

                        <div className="col-lg-3 col-md-6 mb-4">

                            <div className="card shadow border-0">

                                <div className="card-body text-center">

                                    <h6>{t("Delivered")}</h6>

                                    <h2 className="text-success">

                                        {
                                            formatLocalizedNumber(
    transactions.filter(
        t => t.status === "Delivered"
    ).length,
    language
)
                                        }

                                    </h2>

                                </div>

                            </div>

                        </div>

                    </div>

                    {/* Table */}

                    <div className="card shadow">

                        <div className="card-body">

                            <div className="row mb-3">

                                <div className="col-md-4">

                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder={`🔍 ${t("Search Product...")}`}
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                    />

                                </div>

                            </div>

                            <div className="table-responsive">

                                <table className="table table-hover table-bordered align-middle">

                                    <thead className="table-dark">

                                        <tr>

                                            <th>{t("ID")}</th>

                                            <th>{t("Product")}</th>

                                            <th>{t("Business")}</th>

                                            <th>{t("Category")}</th>

                                            <th>{t("Quantity")}</th>

                                            <th>{t("Status")}</th>

                                            <th>{t("Expiry Date")}</th>

                                        </tr>

                                    </thead>

                                    <tbody>


                                        {filteredTransactions.length > 0 ? (

    filteredTransactions.map((item) => (

        <tr key={item.id}>

            <td>{item.id}</td>

            <td>{t(item.product_name)}</td>

            <td>{item.business_name}</td>

            <td>{t(item.category)}</td>

            <td>
    {formatLocalizedNumber(item.quantity, language)} {t(item.unit)}
</td>

            <td>

                <span
                    className={
                        item.status === "Delivered"
                            ? "badge bg-success"
                            : item.status === "Scheduled"
                            ? "badge bg-warning text-dark"
                            : item.status === "Accepted"
                            ? "badge bg-primary"
                            : item.status === "Pending"
                            ? "badge bg-danger"
                            : "badge bg-secondary"
                    }
                >
                    {t(item.status)}
                </span>

            </td>

           <td>
    {formatLocalizedDate(item.expiry_date, language)}
</td>

        </tr>

    ))

) : (

    <tr>

        <td
            colSpan="7"
            className="text-center text-muted py-4"
        >
            {t("No transactions found.")}
        </td>

    </tr>

)}

                                    </tbody>

                                </table>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </>

    );

}

export default AdminTransactions;