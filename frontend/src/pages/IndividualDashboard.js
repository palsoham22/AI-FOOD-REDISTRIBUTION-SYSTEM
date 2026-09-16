import IndividualSidebar from "../components/IndividualSidebar";
import TopNavbar from "../components/TopNavbar";
import { useState, useEffect } from "react";
import axios from "axios";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { LABELS } from "../translations";
import "../styles/IndividualDashboard.css";

function IndividualDashboard() {

    const t = useTranslate();

    usePageTranslation(LABELS.INDIVIDUAL_DASHBOARD);

    const [dashboard, setDashboard] = useState({
        total_donations: 0,
        pending: 0,
        accepted: 0,
        scheduled: 0,
        delivered: 0,
    });

    const [selectedCard, setSelectedCard] = useState(null);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {

        try {

            const token = localStorage.getItem("access");

            const response = await axios.get(
                "http://127.0.0.1:8000/api/inventory/individual/dashboard/",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setDashboard(response.data);

        } catch (error) {

            console.log(error);

        }

    };


    const dashboardCards = [

        {
            title: "🎁 Total Donations",
            value: dashboard.total_donations,
            color: "#16834b",
            description: "Total food donations you have made."
        },

        {
            title: "⏳ Pending Donations",
            value: dashboard.pending,
            color: "#d49a18",
            description: "Donations waiting for approval."
        },

        {
            title: "🤝 Accepted Donations",
            value: dashboard.accepted,
            color: "#367fd1",
            description: "Donations accepted by NGOs."
        },

        {
            title: "✅ Delivered Donations",
            value: dashboard.delivered,
            color: "#16a36f",
            description: "Donations successfully delivered."
        },

        {
            title: "📅 Scheduled Pickups",
            value: dashboard.scheduled,
            color: "#159b87",
            description: "Pickups scheduled for your donations."
        }

    ];


    return (

        <>

            <IndividualSidebar />

            <div className="individual-page">

                <TopNavbar />


                {/* Dashboard Banner */}

                <div className="individual-banner">

                    <div>

                        <h1 className="individual-title">
                            💚 {t("Individual Donor Dashboard")}
                        </h1>

                        <p className="individual-subtitle">
                            {t(
                                "Support communities by donating food and tracking every contribution you make."
                            )}
                        </p>

                    </div>


                    <div className="individual-badge">
                        🤝 Kindness Matters
                    </div>

                </div>


                {/* Donation Overview */}

                <h3 className="individual-section">
                    📊 {t("Donation Overview")}
                </h3>


                <div className="row mt-4">

                    {dashboardCards.map((card, index) => (

                        <div
                            key={index}
                            className="col-xl col-lg-4 col-md-6 col-sm-6 mb-4"
                        >

                            <div
                                className="individual-card"
                                onClick={() => setSelectedCard(card)}
                            >

                                <h5>
                                    {card.title}
                                </h5>

                                <h2 style={{ color: card.color }}>
                                    {card.value}
                                </h2>

                                <small>
                                    Click to View →
                                </small>

                            </div>

                        </div>

                    ))}

                </div>


                {/* Modal */}

                {selectedCard && (

                    <div
                        className="modal fade show"
                        style={{
                            display: "block",
                            background: "rgba(0,0,0,.45)"
                        }}
                    >

                        <div className="modal-dialog modal-dialog-centered">

                            <div
                                className="modal-content"
                                style={{
                                    borderRadius: "20px"
                                }}
                            >

                                <div className="modal-header">

                                    <h4>
                                        {selectedCard.title}
                                    </h4>

                                    <button
                                        className="btn-close"
                                        onClick={() => setSelectedCard(null)}
                                    >
                                    </button>

                                </div>


                                <div className="modal-body text-center">

                                    <h1
                                        style={{
                                            color: selectedCard.color,
                                            fontSize: "60px",
                                            fontWeight: "700"
                                        }}
                                    >
                                        {selectedCard.value}
                                    </h1>

                                    <p className="text-muted mt-3">
                                        {selectedCard.description}
                                    </p>

                                </div>


                                <div className="modal-footer">

                                    <button
                                        className="btn btn-primary"
                                        onClick={() => setSelectedCard(null)}
                                    >
                                        Close
                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>

                )}

            </div>

        </>

    );

}

export default IndividualDashboard;