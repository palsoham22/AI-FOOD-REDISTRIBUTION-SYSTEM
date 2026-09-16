import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import IndividualSidebar from "../components/IndividualSidebar";
import TopNavbar from "../components/TopNavbar";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { LABELS } from "../translations";
import { buildDynamicLabels } from "../utils/buildDynamicLabels";
import { formatLocalizedDate } from "../utils/formatDate";
import { formatLocalizedNumber } from "../utils/formatNumber";
import { useTranslationContext } from "../context/TranslationContext";

function MyDonations() {

    const [donations, setDonations] = useState([]);

    const dynamicLabels = useMemo(
        () =>
            buildDynamicLabels(
                LABELS.MY_DONATIONS,
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

    const t = useTranslate();

    const { language } = useTranslationContext();

    usePageTranslation(dynamicLabels);


    useEffect(() => {
        fetchDonations();
    }, []);


    const fetchDonations = async () => {

        try {

            const token = localStorage.getItem("access");

            const response = await axios.get(
                "http://127.0.0.1:8000/api/inventory/individual/my-donations/",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setDonations(response.data);

        }

        catch (error) {

            console.log(error);

        }

    };


    return (
        <>

            <IndividualSidebar />


            <style>
                {`

                /* =========================================
                   MY DONATIONS PAGE
                ========================================= */

                .my-donations-page {

                    min-height: 100vh;

                    margin-left: 250px;

                    width: calc(100% - 250px);

                    padding: 26px 30px 45px;

                    background:
                        linear-gradient(
                            135deg,
                            #f2faf7 0%,
                            #eef8f5 50%,
                            #f7fbfa 100%
                        );

                    color: #173c32;

                    transition:
                        margin-left 0.25s ease,
                        width 0.25s ease;
                }


                /* =========================================
                   PAGE HEADER
                ========================================= */

                .my-donations-header {

                    margin-top: 18px;

                    margin-bottom: 22px;

                    padding: 24px 28px;

                    border-radius: 20px;

                    background:
                        linear-gradient(
                            135deg,
                            #e2f5ed,
                            #d7efe5
                        );

                    border: 1px solid rgba(23,96,72,0.10);

                    box-shadow:
                        0 8px 25px rgba(22,84,63,0.06);
                }


                .my-donations-header-content {

                    display: flex;

                    align-items: center;

                    justify-content: space-between;

                    gap: 20px;
                }


                .my-donations-title-area {

                    display: flex;

                    align-items: center;

                    gap: 14px;
                }


                .my-donations-title-icon {

                    width: 52px;

                    height: 52px;

                    display: flex;

                    align-items: center;

                    justify-content: center;

                    border-radius: 15px;

                    background: rgba(255,255,255,0.75);

                    font-size: 1.5rem;

                    box-shadow:
                        0 5px 15px rgba(25,91,67,0.08);
                }


                .my-donations-title {

                    margin: 0;

                    color: #124d3c;

                    font-size: 1.85rem;

                    font-weight: 750;

                    letter-spacing: -0.03em;
                }


                .my-donations-subtitle {

                    margin: 5px 0 0;

                    color: #5c7b70;

                    font-size: 0.95rem;
                }


                .my-donations-badge {

                    padding: 9px 15px;

                    border-radius: 999px;

                    background: rgba(255,255,255,0.75);

                    color: #26765d;

                    font-size: 0.84rem;

                    font-weight: 700;

                    white-space: nowrap;
                }


                /* =========================================
                   DONATION TABLE CARD
                ========================================= */

                .donations-table-card {

                    background: #ffffff;

                    border: 1px solid rgba(22,84,63,0.10);

                    border-radius: 20px;

                    box-shadow:
                        0 10px 30px rgba(22,84,63,0.07);

                    overflow: hidden;
                }


                .donations-table-header {

                    display: flex;

                    align-items: center;

                    justify-content: space-between;

                    gap: 15px;

                    padding: 20px 26px;

                    border-bottom: 1px solid #e4efeb;

                    background: #fbfefd;
                }


                .donations-table-header h3 {

                    margin: 0;

                    color: #164c3d;

                    font-size: 1.15rem;

                    font-weight: 700;
                }


                .donations-table-header p {

                    margin: 4px 0 0;

                    color: #789087;

                    font-size: 0.86rem;
                }


                .donations-count {

                    min-width: 40px;

                    height: 40px;

                    display: flex;

                    align-items: center;

                    justify-content: center;

                    padding: 0 12px;

                    border-radius: 12px;

                    background: #e2f5ed;

                    color: #176d4e;

                    font-size: 0.9rem;

                    font-weight: 800;
                }


                /* =========================================
                   TABLE
                ========================================= */

                .donations-table-wrapper {

                    width: 100%;

                    overflow-x: auto;
                }


                .donations-table {

                    width: 100%;

                    min-width: 720px;

                    margin: 0;

                    border-collapse: separate;

                    border-spacing: 0;
                }


                .donations-table thead th {

                    padding: 15px 20px;

                    background: #e2f3eb;

                    color: #245c4b;

                    border-bottom: 1px solid #cfe3da;

                    font-size: 0.78rem;

                    font-weight: 800;

                    letter-spacing: 0.05em;

                    text-transform: uppercase;

                    white-space: nowrap;
                }


                .donations-table thead th:first-child {

                    padding-left: 26px;
                }


                .donations-table tbody td {

                    padding: 17px 20px;

                    color: #41675b;

                    background: #ffffff;

                    border-bottom: 1px solid #e8f0ed;

                    font-size: 0.92rem;

                    vertical-align: middle;
                }


                .donations-table tbody td:first-child {

                    padding-left: 26px;

                    color: #194c3d;

                    font-weight: 700;
                }


                .donations-table tbody tr:last-child td {

                    border-bottom: none;
                }


                .donations-table tbody tr {

                    transition:
                        background 0.18s ease;
                }


                .donations-table tbody tr:hover td {

                    background: #f4faf7;
                }


                /* =========================================
                   STATUS BADGES
                ========================================= */

                .donation-status {

                    display: inline-flex;

                    align-items: center;

                    justify-content: center;

                    min-width: 90px;

                    padding: 6px 12px;

                    border-radius: 999px;

                    font-size: 0.78rem;

                    font-weight: 750;

                    white-space: nowrap;
                }


                .donation-status.delivered {

                    color: #08744c;

                    background: #d9f4e7;
                }


                .donation-status.accepted {

                    color: #2468c7;

                    background: #e0ecff;
                }


                .donation-status.scheduled {

                    color: #936000;

                    background: #fff0c7;
                }


                .donation-status.pending {

                    color: #66756f;

                    background: #e9efed;
                }


                /* =========================================
                   EMPTY STATE
                ========================================= */

                .donations-empty {

                    padding: 55px 25px;

                    text-align: center;
                }


                .donations-empty-icon {

                    width: 60px;

                    height: 60px;

                    margin: 0 auto 15px;

                    display: flex;

                    align-items: center;

                    justify-content: center;

                    border-radius: 18px;

                    background: #e4f5ed;

                    font-size: 1.6rem;
                }


                .donations-empty h4 {

                    margin-bottom: 6px;

                    color: #245b4a;

                    font-size: 1.05rem;

                    font-weight: 700;
                }


                .donations-empty p {

                    margin: 0;

                    color: #7c928a;

                    font-size: 0.88rem;
                }


                /* =========================================
                   TABLET
                ========================================= */

                @media (max-width: 1000px) {

                    .my-donations-page {

                        padding: 24px 22px 40px;
                    }

                    .my-donations-header {

                        padding: 22px;
                    }

                }


                /* =========================================
                   MOBILE
                ========================================= */

                @media (max-width: 768px) {

                    .my-donations-page {

                        margin-left: 0;

                        width: 100%;

                        padding:
                            80px
                            16px
                            30px;
                    }


                    .my-donations-header {

                        margin-top: 0;

                        padding: 20px;

                        border-radius: 17px;
                    }


                    .my-donations-header-content {

                        align-items: flex-start;

                        flex-direction: column;
                    }


                    .my-donations-title {

                        font-size: 1.55rem;
                    }


                    .my-donations-title-icon {

                        width: 46px;

                        height: 46px;

                        font-size: 1.3rem;
                    }


                    .my-donations-badge {

                        align-self: flex-start;
                    }


                    .donations-table-card {

                        border-radius: 17px;
                    }


                    .donations-table-header {

                        padding: 18px 20px;
                    }

                }


                /* =========================================
                   SMALL MOBILE
                ========================================= */

                @media (max-width: 480px) {

                    .my-donations-page {

                        padding-left: 12px;

                        padding-right: 12px;
                    }


                    .my-donations-header {

                        padding: 18px;
                    }


                    .my-donations-title {

                        font-size: 1.4rem;
                    }


                    .my-donations-subtitle {

                        font-size: 0.88rem;
                    }

                }

                `}
            </style>


            <div className="my-donations-page">

                <TopNavbar />


                {/* =====================================
                    PAGE HEADER
                ===================================== */}

                <section className="my-donations-header">

                    <div className="my-donations-header-content">

                        <div className="my-donations-title-area">

                            <div className="my-donations-title-icon">
                                📦
                            </div>

                            <div>

                                <h1 className="my-donations-title">
                                    {t("My Donations")}
                                </h1>

                                <p className="my-donations-subtitle">
                                    Track your food donations and their current status.
                                </p>

                            </div>

                        </div>


                        <div className="my-donations-badge">
                            💚 Every Donation Matters
                        </div>

                    </div>

                </section>


                {/* =====================================
                    DONATIONS TABLE
                ===================================== */}

                <section className="donations-table-card">

                    <div className="donations-table-header">

                        <div>

                            <h3>
                                📋 Donation History
                            </h3>

                            <p>
                                View all your submitted food donations.
                            </p>

                        </div>


                        <div className="donations-count">
                            {donations.length}
                        </div>

                    </div>


                    {donations.length === 0 ? (

                        <div className="donations-empty">

                            <div className="donations-empty-icon">
                                📦
                            </div>

                            <h4>
                                No donations yet
                            </h4>

                            <p>
                                Your submitted food donations will appear here.
                            </p>

                        </div>

                    ) : (

                        <div className="donations-table-wrapper">

                            <table className="donations-table">

                                <thead>

                                    <tr>

                                        <th>
                                            {t("Food")}
                                        </th>

                                        <th>
                                            {t("Category")}
                                        </th>

                                        <th>
                                            {t("Quantity")}
                                        </th>

                                        <th>
                                            {t("Status")}
                                        </th>

                                        <th>
                                            {t("Expiry")}
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {donations.map((item) => {

                                        const statusClass =
                                            item.status === "Delivered"
                                                ? "delivered"
                                                : item.status === "Accepted"
                                                ? "accepted"
                                                : item.status === "Scheduled"
                                                ? "scheduled"
                                                : "pending";


                                        return (

                                            <tr key={item.id}>

                                                <td>
                                                    {t(item.product_name)}
                                                </td>


                                                <td>
                                                    {t(item.category)}
                                                </td>


                                                <td>
                                                    {formatLocalizedNumber(
                                                        item.quantity,
                                                        language
                                                    )}{" "}
                                                    {t(item.unit)}
                                                </td>


                                                <td>

                                                    <span
                                                        className={`donation-status ${statusClass}`}
                                                    >
                                                        {t(item.status)}
                                                    </span>

                                                </td>


                                                <td>
                                                    {formatLocalizedDate(
                                                        item.expiry_date,
                                                        language
                                                    )}
                                                </td>

                                            </tr>

                                        );

                                    })}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>

            </div>

        </>

    );
}

export default MyDonations;