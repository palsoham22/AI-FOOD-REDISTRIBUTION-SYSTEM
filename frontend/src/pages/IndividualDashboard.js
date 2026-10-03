import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import IndividualSidebar from "../components/IndividualSidebar";
import TopNavbar from "../components/TopNavbar";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { useTranslationContext } from "../context/TranslationContext";
import { LABELS } from "../translations";
import { formatLocalizedNumber } from "../utils/formatNumber";
import { formatLocalizedDate } from "../utils/formatDate";
import "../styles/IndividualDashboard.css";

function IndividualDashboard() {
    const navigate = useNavigate();
    const t = useTranslate();
    const { language } = useTranslationContext();

    usePageTranslation(LABELS.INDIVIDUAL_DASHBOARD);

    const [dashboard, setDashboard] = useState({
        total_donations: 0,
        pending: 0,
        accepted: 0,
        scheduled: 0,
        delivered: 0,
    });
    const [recentDonations, setRecentDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const donorName =
        localStorage.getItem("owner_name") ||
        localStorage.getItem("username") ||
        "Donor";

    const fetchDashboard = useCallback(async () => {
        setLoading(true);
        setError(false);

        const token = localStorage.getItem("access");
        const headers = { Authorization: `Bearer ${token}` };

        try {
            // 1. Fetch real KPI metrics from existing backend endpoint
            const dashResponse = await axios.get(
                "http://127.0.0.1:8000/api/inventory/individual/dashboard/",
                { headers }
            );

            if (dashResponse.data) {
                setDashboard({
                    total_donations: Number(dashResponse.data.total_donations) || 0,
                    pending: Number(dashResponse.data.pending) || 0,
                    accepted: Number(dashResponse.data.accepted) || 0,
                    scheduled: Number(dashResponse.data.scheduled) || 0,
                    delivered: Number(dashResponse.data.delivered) || 0,
                });
            }

            // 2. Safely fetch recent donation records if available
            try {
                const donResponse = await axios.get(
                    "http://127.0.0.1:8000/api/inventory/individual/my-donations/",
                    { headers }
                );
                if (Array.isArray(donResponse.data)) {
                    setRecentDonations(donResponse.data.slice(0, 5));
                }
            } catch (donErr) {
                // Non-fatal: dashboard KPIs still display cleanly
                console.warn("Recent donations check:", donErr);
            }
        } catch (err) {
            console.error("Dashboard fetch error:", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    const kpiCards = [
        {
            key: "total_donations",
            title: t("Total Donations"),
            value: dashboard.total_donations,
            desc: t("All food contributions you have made"),
            icon: "bi-box-seam",
            accentClass: "kpi-accent-blue",
        },
        {
            key: "pending",
            title: t("Pending"),
            value: dashboard.pending,
            desc: t("Awaiting NGO acceptance"),
            icon: "bi-hourglass-split",
            accentClass: "kpi-accent-amber",
        },
        {
            key: "accepted",
            title: t("Accepted"),
            value: dashboard.accepted,
            desc: t("Accepted by partner NGOs"),
            icon: "bi-check-circle",
            accentClass: "kpi-accent-teal",
        },
        {
            key: "scheduled",
            title: t("Scheduled"),
            value: dashboard.scheduled,
            desc: t("Pickups scheduled for delivery"),
            icon: "bi-calendar-check",
            accentClass: "kpi-accent-indigo",
        },
        {
            key: "delivered",
            title: t("Delivered"),
            value: dashboard.delivered,
            desc: t("Successfully delivered to recipients"),
            icon: "bi-truck",
            accentClass: "kpi-accent-emerald",
        },
    ];

    const getStatusBadge = (status) => {
        const s = (status || "").toLowerCase();
        if (s === "delivered" || s === "completed") {
            return (
                <span className="donor-badge badge-delivered">
                    <span className="donor-badge-dot"></span>
                    {t("Delivered")}
                </span>
            );
        }
        if (s === "accepted") {
            return (
                <span className="donor-badge badge-accepted">
                    <span className="donor-badge-dot"></span>
                    {t("Accepted")}
                </span>
            );
        }
        if (s === "scheduled") {
            return (
                <span className="donor-badge badge-scheduled">
                    <span className="donor-badge-dot"></span>
                    {t("Scheduled")}
                </span>
            );
        }
        if (s === "pending") {
            return (
                <span className="donor-badge badge-pending">
                    <span className="donor-badge-dot"></span>
                    {t("Pending")}
                </span>
            );
        }
        return (
            <span className="donor-badge badge-available">
                <span className="donor-badge-dot"></span>
                {t(status || "Available")}
            </span>
        );
    };

    return (
        <>
            <IndividualSidebar />

            <main className="individual-page">
                <TopNavbar />

                {/* Welcome Header */}
                <header className="donor-banner">
                    <div className="donor-banner-text">
                        <h1 className="donor-banner-title">
                            {t("Welcome back")}, {donorName}
                        </h1>
                        <p className="donor-banner-subtitle">
                            {t(
                                "Support communities by donating food and tracking your contributions."
                            )}
                        </p>
                    </div>

                    <div className="donor-banner-actions">
                        <span className="donor-role-badge">
                            🤝 {t("Individual Donor")}
                        </span>
                        <button
                            type="button"
                            className="btn-donor-primary"
                            onClick={() => navigate("/donate-food")}
                            aria-label={t("Donate Food")}
                        >
                            <i className="bi bi-box-seam"></i>
                            {t("Donate Food")}
                        </button>
                    </div>
                </header>

                {/* Error Banner */}
                {error && (
                    <div className="donor-error-banner" role="alert">
                        <div className="donor-error-left">
                            <i className="bi bi-exclamation-triangle-fill"></i>
                            <span>{t("Unable to load dashboard data.")}</span>
                        </div>
                        <button
                            type="button"
                            className="btn-donor-retry"
                            onClick={fetchDashboard}
                        >
                            <i className="bi bi-arrow-clockwise"></i>
                            {t("Retry")}
                        </button>
                    </div>
                )}

                {/* Section Header: Metrics */}
                <div className="donor-section-header">
                    <h2 className="donor-section-title">
                        <i className="bi bi-graph-up-arrow"></i>
                        {t("Donation Overview")}
                    </h2>
                </div>

                {/* Loading State for KPIs */}
                {loading ? (
                    <div
                        className="donor-skeleton-grid"
                        aria-busy="true"
                        aria-label={t("Loading dashboard...")}
                    >
                        {[1, 2, 3, 4, 5].map((idx) => (
                            <div key={idx} className="donor-skeleton-card">
                                <div
                                    className="skeleton-box"
                                    style={{
                                        width: "44px",
                                        height: "44px",
                                        marginBottom: "16px",
                                    }}
                                />
                                <div
                                    className="skeleton-box"
                                    style={{
                                        width: "50%",
                                        height: "36px",
                                        marginBottom: "8px",
                                    }}
                                />
                                <div
                                    className="skeleton-box"
                                    style={{ width: "70%", height: "16px" }}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Real KPI Metrics Cards Grid */
                    <section
                        className="donor-kpi-grid"
                        aria-label={t("Donation Overview")}
                    >
                        {kpiCards.map((card) => (
                            <div
                                key={card.key}
                                className={`donor-kpi-card ${card.accentClass}`}
                            >
                                <div className="donor-kpi-top">
                                    <div
                                        className="donor-kpi-icon"
                                        aria-hidden="true"
                                    >
                                        <i className={`bi ${card.icon}`}></i>
                                    </div>
                                </div>
                                <div>
                                    <div className="donor-kpi-value">
                                        {formatLocalizedNumber(
                                            card.value,
                                            language
                                        )}
                                    </div>
                                    <h3 className="donor-kpi-label">
                                        {card.title}
                                    </h3>
                                    <div className="donor-kpi-desc">
                                        {card.desc}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </section>
                )}

                {/* Quick Actions */}
                <div className="donor-section-header">
                    <h2 className="donor-section-title">
                        <i className="bi bi-lightning-charge"></i>
                        {t("Quick Actions")}
                    </h2>
                </div>

                <nav
                    className="donor-quick-grid"
                    aria-label={t("Quick Actions")}
                >
                    <Link to="/donate-food" className="donor-action-card">
                        <div className="donor-action-left">
                            <div className="donor-action-icon">
                                <i className="bi bi-box-seam"></i>
                            </div>
                            <div>
                                <h3 className="donor-action-title">
                                    {t("Donate Food")}
                                </h3>
                                <p className="donor-action-desc">
                                    {t("Submit a new surplus food donation")}
                                </p>
                            </div>
                        </div>
                        <i
                            className="bi bi-chevron-right donor-action-arrow"
                            aria-hidden="true"
                        ></i>
                    </Link>

                    <Link to="/my-donations" className="donor-action-card">
                        <div className="donor-action-left">
                            <div className="donor-action-icon">
                                <i className="bi bi-heart"></i>
                            </div>
                            <div>
                                <h3 className="donor-action-title">
                                    {t("My Donations")}
                                </h3>
                                <p className="donor-action-desc">
                                    {t("Track all your submitted donations")}
                                </p>
                            </div>
                        </div>
                        <i
                            className="bi bi-chevron-right donor-action-arrow"
                            aria-hidden="true"
                        ></i>
                    </Link>

                    <Link
                        to="/individual-settings"
                        className="donor-action-card"
                    >
                        <div className="donor-action-left">
                            <div className="donor-action-icon">
                                <i className="bi bi-gear"></i>
                            </div>
                            <div>
                                <h3 className="donor-action-title">
                                    {t("Settings")}
                                </h3>
                                <p className="donor-action-desc">
                                    {t(
                                        "Manage your account profile and password"
                                    )}
                                </p>
                            </div>
                        </div>
                        <i
                            className="bi bi-chevron-right donor-action-arrow"
                            aria-hidden="true"
                        ></i>
                    </Link>
                </nav>

                {/* Recent Donations Section */}
                <div className="donor-section-header">
                    <h2 className="donor-section-title">
                        <i className="bi bi-clock-history"></i>
                        {t("Recent Donations")}
                    </h2>
                    {recentDonations.length > 0 && (
                        <Link to="/my-donations" className="donor-section-link">
                            {t("View All")}{" "}
                            <i className="bi bi-arrow-right"></i>
                        </Link>
                    )}
                </div>

                {loading ? (
                    <div
                        className="donor-table-card"
                        style={{ padding: "32px", textAlign: "center" }}
                    >
                        <div
                            className="spinner-border text-primary"
                            role="status"
                        >
                            <span className="visually-hidden">
                                {t("Loading dashboard...")}
                            </span>
                        </div>
                    </div>
                ) : recentDonations.length > 0 ? (
                    <div className="donor-table-card">
                        <div className="donor-table-responsive">
                            <table
                                className="donor-table"
                                aria-label={t("Recent Donations")}
                            >
                                <thead>
                                    <tr>
                                        <th>{t("Product")}</th>
                                        <th>{t("Category")}</th>
                                        <th>{t("Quantity")}</th>
                                        <th>{t("Status")}</th>
                                        <th>{t("Date")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentDonations.map((item) => (
                                        <tr key={item.id}>
                                            <td className="donor-product-name">
                                                {item.product_name || "—"}
                                            </td>
                                            <td>{t(item.category || "—")}</td>
                                            <td>
                                                {formatLocalizedNumber(
                                                    item.quantity,
                                                    language
                                                )}{" "}
                                                {item.unit || "Kg"}
                                            </td>
                                            <td>
                                                {getStatusBadge(item.status)}
                                            </td>
                                            <td>
                                                {formatLocalizedDate(
                                                    item.created_at,
                                                    language
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    /* Honest Empty / Zero State */
                    <div className="donor-empty-state">
                        <div className="donor-empty-icon" aria-hidden="true">
                            <i className="bi bi-box2-heart"></i>
                        </div>
                        <h3 className="donor-empty-title">
                            {t("No Donations Yet")}
                        </h3>
                        <p className="donor-empty-text">
                            {t(
                                "Start by donating surplus food to support communities."
                            )}
                        </p>
                        <Link to="/donate-food" className="btn-donor-primary">
                            <i className="bi bi-box-seam"></i>
                            {t("Donate Food")}
                        </Link>
                    </div>
                )}
            </main>
        </>
    );
}

export default IndividualDashboard;
