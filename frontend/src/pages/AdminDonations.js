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

function AdminDonations() {

    const [donations, setDonations] = useState([]);

    const dynamicLabels = useMemo(
    () =>
        buildDynamicLabels(
            LABELS.ADMIN_DONATIONS,
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


    const [search, setSearch] = useState("");
    const t = useTranslate();
    const { language } = useTranslationContext();

    usePageTranslation(dynamicLabels);

    useEffect(() => {

        const token = localStorage.getItem("access");

        axios.get(
            "http://127.0.0.1:8000/api/inventory/admin/donations/",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )
        .then((response) => {

            setDonations(response.data);

        })
        .catch((error) => {

            console.log(error);

        });

    }, []);

    const filteredDonations = donations.filter((item) =>
    t(item.product_name)
        .toLowerCase()
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
                    padding: "30px",
                    overflowX: "hidden"
                }}
            >

                <TopNavbar />

                <div className="mt-4">

                    <h1 className="fw-bold">
                        🎁 {t("Donations Management")}
                    </h1>

                    <p className="text-muted">
                        {t("Monitor all donated food across the platform.")}
                    </p>

                    {/* Dashboard Cards */}

                    <div className="row mb-4">

                        <div className="col-md-3">
                            <div className="card shadow-sm">
                                <div className="card-body text-center">
                                    <h6>{t("Total Donations")}</h6>
                                    <h2 className="text-primary">
                                        {formatLocalizedNumber(donations.length, language)}
                                    </h2>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="card shadow-sm">
                                <div className="card-body text-center">
                                    <h6>{t("Accepted")}</h6>
                                    <h2 className="text-success">
                                        {
    formatLocalizedNumber(
        donations.filter(
            d => d.status === "Accepted"
        ).length,
        language
    )
}
                                    </h2>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="card shadow-sm">
                                <div className="card-body text-center">
                                    <h6>{t("Scheduled")}</h6>
                                    <h2 className="text-warning">
                                        {
    formatLocalizedNumber(
        donations.filter(
            d => d.status === "Scheduled"
        ).length,
        language
    )
}
                                            
                                    </h2>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="card shadow-sm">
                                <div className="card-body text-center">
                                    <h6>{t("Delivered")}</h6>
                                    <h2 className="text-danger">
                                        {
    formatLocalizedNumber(
        donations.filter(
            d => d.status === "Delivered"
        ).length,
        language
    )
}
                                    </h2>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Search */}

                    <div className="row mb-3">

                        <div className="col-md-4">

                            <input
                                type="text"
                                className="form-control"
                                placeholder={`🔍 ${t("Search Product...")}`}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />

                        </div>

                    </div>

                    {/* Table */}

                    <div className="card shadow-sm">

                        <div className="card-body">

                            <table className="table table-hover">

                                <thead className="table-success">

                                    <tr>

                                        <th>{t("ID")}</th>
                                        <th>{t("Product")}</th>
                                        <th>{t("Business")}</th>
                                        <th>{t("Category")}</th>
                                        <th>{t("Quantity")}</th>
                                        <th>{t("Status")}</th>
                                        <th>{t("Expiry")}</th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {filteredDonations.map((item) => (

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

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    </div>

                </div>

            </div>

        </>

    );

}

export default AdminDonations;