import NGOSidebar from "../components/NGOSidebar";
import DashboardCard from "../components/DashboardCard";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { LABELS } from "../translations";
import "../styles/NGOReports.css";

function NGOReports() {

    const t = useTranslate();

    usePageTranslation(LABELS.NGO_REPORTS);

    return (

        <>

            <NGOSidebar />

            <div className="reports-page">

                <div className="reports-header">

<div>

<h2 className="reports-title">

📊 {t("NGO Reports")}

</h2>

<p className="reports-subtitle">

View monthly NGO performance and impact statistics.

</p>

</div>

<div className="reports-badge">

2026 Report

</div>

</div>

                <div className="row mb-4">

                    <div className="col-lg-3 col-md-6 mb-3">

                        <DashboardCard
                            title={t("Meals Distributed")}
                            value="12,450"
                            color="green"
                        />

                    </div>

                    <div className="col-lg-3 col-md-6 mb-3">

                        <DashboardCard
                            title={t("Food Collected")}
                            value="2,350 Kg"
                            color="orange"
                        />

                    </div>

                    <div className="col-lg-3 col-md-6 mb-3">

                        <DashboardCard
                            title={t("Completed Pickups")}
                            value="107"
                            color="blue"
                        />

                    </div>

                    <div className="col-lg-3 col-md-6 mb-3">

                        <DashboardCard
                            title={t("CO₂ Saved")}
                            value="580 Kg"
                            color="purple"
                        />

                    </div>

                </div>

                <div className="report-card">

                    <div className="card-header">

                        {t("Monthly Summary")}

                    </div>

                    <div className="card-body">

                        <table className="table report-table">

                            <thead>

                                <tr>

                                    <th>{t("Month")}</th>

                                    <th>{t("Donations")}</th>

                                    <th>{t("Meals Served")}</th>

                                </tr>

                            </thead>

                            <tbody>

                                <tr>

                                    {t("January")}

                                    <td>52</td>

                                    <td>

<span className="badge bg-success rounded-pill px-3 py-2">

1800

</span>

</td>

                                </tr>

                                <tr>

                                    {t("February")}

                                    <td>61</td>

                                    <td>

<span className="badge bg-success rounded-pill px-3 py-2">

2100

</span>

</td>

                                </tr>

                                <tr>

                                    {t("March")}

                                    <td>74</td>

                                    <td>

<span className="badge bg-success rounded-pill px-3 py-2">

2600

</span>

</td>

                                </tr>

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

        </>

    );

}

export default NGOReports;