import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import axios from "axios";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { LABELS } from "../translations";
import "../styles/BusinessDonations.css";

function BusinessDonations() {

    const t = useTranslate();

    usePageTranslation(LABELS.DONATIONS);

    const [donations, setDonations] = useState([]);

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

        .then((response) => {

            const donatedProducts = response.data.filter(
                (item) => item.status !== "Available"
            );

            setDonations(donatedProducts);

        })

        .catch(console.log);

    }, []);

    return (

<>
    <Sidebar />

    <div className="donation-page">

        <div className="donation-header">

            <div>

                <h2 className="donation-title">
                    🎁 {t("My Donations")}
                </h2>

                <p className="donation-subtitle">
    {t("Track all donated products and their current status.")}
</p>

            </div>

        </div>

        {/* Summary Cards */}

        <div className="donation-summary">

            <div className="summary-card summary-green">

                <h6>{t("Total Donations")}</h6>

                <h2>{donations.length}</h2>

            </div>

            <div className="summary-card summary-blue">

                <h6>{t("Accepted")}</h6>

                <h2>

                    {

                        donations.filter(

                            item => item.status === "Accepted"

                        ).length

                    }

                </h2>

            </div>

            <div className="summary-card summary-warning">

                <h6>{t("Pending")}</h6>

                <h2>

                    {

                        donations.filter(

                            item => item.status === "Donated"

                        ).length

                    }

                </h2>

            </div>

            <div className="summary-card summary-purple">

                <h6>{t("Completed")}</h6>

                <h2>

                    {

                        donations.filter(

                            item => item.status === "Completed"

                        ).length

                    }

                </h2>

            </div>

        </div>

        {/* Table */}

        <div className="donation-card">

            <div className="table-responsive">

                <table className="table donation-table">

                    <thead>

                        <tr>

                            <th>{t("Product")}</th>

                            <th>{t("Category")}</th>

                            <th>{t("Quantity")}</th>

                            <th>{t("Expiry")}</th>

                            <th>{t("Status")}</th>

                        </tr>

                    </thead>

                    <tbody>

                    {

                        donations.length === 0 ?

                        <tr>

                            <td
                                colSpan="5"
                                className="text-center text-muted py-5"
                            >

                                🎁 {t("No Donations Yet")}

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

                                    {t(item.category)}

                                </td>

                                <td>

                                    {item.quantity} {t(item.unit)}

                                </td>

                                <td>

                                    {item.expiry_date}

                                </td>

                                <td>

                                    <span

                                        className={`status-badge

                                        ${

                                            item.status === "Accepted"

                                            ?

                                            "status-accepted"

                                            :

                                            item.status === "Completed"

                                            ?

                                            "status-donated"

                                            :

                                            "status-pending"

                                        }

                                        `}

                                    >

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

export default BusinessDonations;