import NGOSidebar from "../components/NGOSidebar";
import DashboardCard from "../components/DashboardCard";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { LABELS } from "../translations";
import "../styles/Beneficiaries.css";

function Beneficiaries() {

    const t = useTranslate();

    usePageTranslation(LABELS.NGO_BENEFICIARIES);

    return (

        <>

            <NGOSidebar />

            <div className="beneficiaries-page">

                <div className="beneficiaries-header">

<div>

<h2 className="beneficiaries-title">

👨‍👩‍👧 {t("Beneficiaries")}

</h2>

<p className="beneficiaries-subtitle">

{t("Organizations receiving food through the FoodBridge AI platform.")}

</p>

</div>

<div className="beneficiaries-badge">

18 {t("Organizations")}

</div>

</div>

                {/* Dashboard Cards */}

                <div className="row mb-4">

                    <div className="col-lg-3 col-md-6 mb-3">

                        <DashboardCard
                            title={t("Organizations")}
                            value="18"
                            color="green"
                        />

                    </div>

                    <div className="col-lg-3 col-md-6 mb-3">

                        <DashboardCard
                            title={t("Meals Served")}
                            value="12,450"
                            color="orange"
                        />

                    </div>

                    <div className="col-lg-3 col-md-6 mb-3">

                        <DashboardCard
                            title={t("Cities Covered")}
                            value="5"
                            color="blue"
                        />

                    </div>

                    <div className="col-lg-3 col-md-6 mb-3">

                        <DashboardCard
                            title={t("Active NGOs")}
                            value="18"
                            color="purple"
                        />

                    </div>

                </div>

                <div className="beneficiary-table-card">

                    <div className="card-header">

                        {t("Registered Beneficiaries")}

                    </div>

                    <div className="card-body">

                        <div className="table-responsive">

                            <table className="table beneficiary-table">

                                <thead>

                                    <tr>

                                        <th>{t("Organization")}</th>

                                        <th>{t("Category")}</th>

                                        <th>{t("Contact Person")}</th>

                                        <th>{t("Meals Served")}</th>

                                        <th>{t("Status")}</th>

                                    </tr>

                                </thead>

                                <tbody>

                                    <tr>

                                        <td>Helping Hands Foundation</td>

                                        {t("Orphanage")}

                                        <td>Rahul Kumar</td>

                                        <td>3,200</td>

                                        <td>

                                            <span className="badge bg-success px-3 py-2 rounded-pill">

                                                {t("Active")}

                                            </span>

                                        </td>

                                    </tr>

                                    <tr>

                                        <td>Care Home</td>

                                        {t("Old Age Home")}

                                        <td>Amit Roy</td>

                                        <td>2,800</td>

                                        <td>

                                            <span className="badge bg-success">

                                                {t("Active")}

                                            </span>

                                        </td>

                                    </tr>

                                    <tr>

                                        <td>Smile Shelter</td>

                                        {t("Homeless Shelter")}

                                        <td>Priya Das</td>

                                        <td>4,150</td>

                                        <td>

                                            <span className="badge bg-success">

                                                {t("Active")}

                                            </span>

                                        </td>

                                    </tr>

                                    <tr>

                                        <td>Hope NGO</td>

                                        {t("Community Kitchen")}

                                        <td>Rakesh Singh</td>

                                        <td>2,300</td>

                                        <td>

                                            <span className="badge bg-warning text-dark px-3 py-2 rounded-pill">

                                                {t("Pending")}

                                            </span>

                                        </td>

                                    </tr>

                                </tbody>

                            </table>

                        </div>

                    </div>

                </div>

            </div>

        </>

    );

}

export default Beneficiaries;