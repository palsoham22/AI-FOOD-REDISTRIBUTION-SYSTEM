import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AdminSidebar from "../components/AdminSidebar";
import TopNavbar from "../components/TopNavbar";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { LABELS } from "../translations";
import { formatLocalizedNumber } from "../utils/formatNumber";
import { formatLocalizedDate } from "../utils/formatDate";
import { useTranslationContext } from "../context/TranslationContext";
import "../styles/AdminDashboard.css";

function AdminDashboard() {
    const navigate = useNavigate();
    const t = useTranslate();
    const { language } = useTranslationContext();

    usePageTranslation(LABELS.ADMIN_DASHBOARD);

    const [stats, setStats] = useState({
        total_users: 0,
        businesses: 0,
        ngos: 0,
        delivery_partners: 0,
        individual_donors: 0,
        products: 0,
        donated: 0,
        accepted: 0,
        scheduled: 0,
        delivered: 0
    });

    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchDashboardData = useCallback(async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        setError(false);

        const token = localStorage.getItem("access");
        const headers = { Authorization: `Bearer ${token}` };

        try {
            const [dashResponse, donationsResponse] = await Promise.all([
                axios.get(process.env.REACT_APP_API_URL + "/api/inventory/admin-dashboard/", { headers }),
                axios.get(process.env.REACT_APP_API_URL + "/api/inventory/admin/donations/", { headers })
            ]);

            if (dashResponse.data) {
                setStats({
                    total_users: Number(dashResponse.data.total_users) || 0,
                    businesses: Number(dashResponse.data.businesses) || 0,
                    ngos: Number(dashResponse.data.ngos) || 0,
                    delivery_partners: Number(dashResponse.data.delivery_partners) || 0,
                    individual_donors: Number(dashResponse.data.individual_donors) || 0,
                    products: Number(dashResponse.data.products) || 0,
                    donated: Number(dashResponse.data.donated) || 0,
                    accepted: Number(dashResponse.data.accepted) || 0,
                    scheduled: Number(dashResponse.data.scheduled) || 0,
                    delivered: Number(dashResponse.data.delivered) || 0
                });
            }

            if (Array.isArray(donationsResponse.data)) {
                setRecentActivity(donationsResponse.data.slice(0, 6));
            }

            setLastUpdated(new Date());
        } catch (err) {
            console.error("Admin dashboard fetch error:", err);
            setError(true);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData(false);
    }, [fetchDashboardData]);

    const stakeholderCards = [
        {
            key: "total_users",
            title: t("Total Users"),
            value: stats.total_users,
            desc: t("Total platform users registered across all roles."),
            icon: "bi-people-fill",
            color: "#2563EB",
            accentClass: "admin-kpi-blue",
            link: null
        },
        {
            key: "businesses",
            title: t("Businesses"),
            value: stats.businesses,
            desc: t("Total businesses registered on the platform."),
            icon: "bi-building",
            color: "#059669",
            accentClass: "admin-kpi-green",
            link: null
        },
        {
            key: "ngos",
            title: t("NGOs"),
            value: stats.ngos,
            desc: t("Total NGOs connected with FoodBridge AI."),
            icon: "bi-heart-fill",
            color: "#7C3AED",
            accentClass: "admin-kpi-purple",
            link: null
        },
        {
            key: "delivery_partners",
            title: t("Delivery Partners"),
            value: stats.delivery_partners,
            desc: t("Active delivery partners available on the platform."),
            icon: "bi-truck",
            color: "#0891B2",
            accentClass: "admin-kpi-cyan",
            link: null
        },
        {
            key: "individual_donors",
            title: t("Individual Donors"),
            value: stats.individual_donors,
            desc: t("Registered individual donors contributing food."),
            icon: "bi-person-heart",
            color: "#EA580C",
            accentClass: "admin-kpi-orange",
            link: null
        }
    ];

    const operationCards = [
        {
            key: "products",
            title: t("Total Products"),
            value: stats.products,
            desc: t("Products currently managed in inventory."),
            icon: "bi-box-seam",
            color: "#2563EB",
            accentClass: "admin-kpi-blue",
            link: "/admin/inventory"
        },
        {
            key: "donated",
            title: t("Available / Donated"),
            value: stats.donated,
            desc: t("Food items listed and awaiting acceptance."),
            icon: "bi-hand-thumbs-up",
            color: "#059669",
            accentClass: "admin-kpi-green",
            link: "/admin/inventory"
        },
        {
            key: "accepted",
            title: t("Accepted Donations"),
            value: stats.accepted,
            desc: t("Donations accepted by partner NGOs."),
            icon: "bi-check2-circle",
            color: "#7C3AED",
            accentClass: "admin-kpi-purple",
            link: "/admin/donations"
        },
        {
            key: "scheduled",
            title: t("Scheduled Pickups"),
            value: stats.scheduled,
            desc: t("Pickup schedules created and awaiting collection."),
            icon: "bi-calendar-check",
            color: "#D97706",
            accentClass: "admin-kpi-amber",
            link: "/admin/donations"
        },
        {
            key: "delivered",
            title: t("Completed Deliveries"),
            value: stats.delivered,
            desc: t("Successfully completed deliveries."),
            icon: "bi-check-all",
            color: "#0D9488",
            accentClass: "admin-kpi-teal",
            link: "/admin/donations"
        }
    ];

    const quickActions = [
        {
            title: t("Manage Inventory"),
            desc: t("Review and manage all products."),
            icon: "bi-boxes",
            path: "/admin/inventory",
            color: "#2563EB"
        },
        {
            title: t("View Donations"),
            desc: t("Inspect real-time donation pipelines."),
            icon: "bi-gift",
            path: "/admin/donations",
            color: "#7C3AED"
        },
        {
            title: t("Audit Transactions"),
            desc: t("Review platform transaction logs."),
            icon: "bi-receipt",
            path: "/admin/transactions",
            color: "#059669"
        },
        {
            title: t("Platform Analytics"),
            desc: t("Gain insights into recovery trends."),
            icon: "bi-graph-up",
            path: "/admin/analytics",
            color: "#0891B2"
        },
        {
            title: t("System Settings"),
            desc: t("Configure platform preferences."),
            icon: "bi-gear",
            path: "/admin/settings",
            color: "#4B5563"
        }
    ];

    const getStatusBadge = (status) => {
        const s = (status || "").toLowerCase();
        if (s === "delivered" || s === "completed") {
            return <span className="admin-status-badge badge-green">{t(status)}</span>;
        }
        if (s === "out for delivery" || s === "out for pickup") {
            return <span className="admin-status-badge badge-blue">{t(status)}</span>;
        }
        if (s === "scheduled") {
            return <span className="admin-status-badge badge-amber">{t(status)}</span>;
        }
        if (s === "accepted") {
            return <span className="admin-status-badge badge-purple">{t(status)}</span>;
        }
        if (s === "donated" || s === "available") {
            return <span className="admin-status-badge badge-teal">{t(status)}</span>;
        }
        return <span className="admin-status-badge badge-gray">{t(status || "Unknown")}</span>;
    };

    return (
        <div className="admin-wrapper">
            <AdminSidebar />

            <div className="admin-page">
                <TopNavbar />

                {/* Hero Banner */}
                <div className="admin-hero-banner">
                    <div className="admin-hero-content">
                        <div className="admin-hero-badge">
                            <span className="admin-status-dot"></span>
                            {t("System Online")}
                        </div>
                        <h1 className="admin-hero-title">
                            {t("Administrator Control Center")}
                        </h1>
                        <p className="admin-hero-subtitle">
                            {t("Monitor platform users, businesses, NGOs, inventory, donations and deliveries from one place.")}
                        </p>
                        {lastUpdated && (
                            <div className="admin-hero-meta">
                                <i className="bi bi-clock-history me-1"></i>
                                {t("Last updated")}: {lastUpdated.toLocaleTimeString()}
                            </div>
                        )}
                    </div>
                    <div className="admin-hero-actions">
                        <button
                            type="button"
                            className="btn btn-admin-refresh"
                            onClick={() => fetchDashboardData(true)}
                            disabled={loading || refreshing}
                            title={t("Refresh")}
                        >
                            <i className={`bi bi-arrow-clockwise me-2 ${refreshing ? "spin-icon" : ""}`}></i>
                            {refreshing ? t("Refreshing...") : t("Refresh")}
                        </button>
                    </div>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="admin-alert-banner alert alert-danger d-flex align-items-center justify-content-between" role="alert">
                        <div className="d-flex align-items-center">
                            <i className="bi bi-exclamation-triangle-fill fs-4 me-3"></i>
                            <div>
                                <strong>{t("Failed to load dashboard data.")}</strong>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => fetchDashboardData(false)}
                        >
                            <i className="bi bi-arrow-repeat me-1"></i>
                            {t("Retry")}
                        </button>
                    </div>
                )}

                {/* Section 1: Stakeholder Ecosystem */}
                <div className="admin-section">
                    <div className="admin-section-header">
                        <div>
                            <h2 className="admin-section-heading">
                                <i className="bi bi-people me-2"></i>
                                {t("Stakeholder Distribution")}
                            </h2>
                            <p className="admin-section-sub">
                                {t("Total platform users registered across all roles.")}
                            </p>
                        </div>
                    </div>

                    <div className="row g-3">
                        {stakeholderCards.map((card) => (
                            <div key={card.key} className="col-xl col-lg-4 col-md-6 col-12">
                                <div
                                    className={`admin-kpi-card ${card.accentClass}`}
                                    onClick={() => setSelectedCard(card)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            setSelectedCard(card);
                                        }
                                    }}
                                >
                                    {loading ? (
                                        <div className="admin-kpi-skeleton">
                                            <div className="skeleton-icon"></div>
                                            <div className="skeleton-title"></div>
                                            <div className="skeleton-value"></div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="admin-kpi-top">
                                                <div className="admin-kpi-icon" style={{ backgroundColor: `${card.color}15`, color: card.color }}>
                                                    <i className={`bi ${card.icon}`}></i>
                                                </div>
                                                <span className="admin-kpi-hint">
                                                    {t("Click to View")} <i className="bi bi-chevron-right ms-1"></i>
                                                </span>
                                            </div>
                                            <div className="admin-kpi-content">
                                                <span className="admin-kpi-title">{card.title}</span>
                                                <div className="admin-kpi-value" style={{ color: card.color }}>
                                                    {formatLocalizedNumber(card.value, language)}
                                                </div>
                                                <p className="admin-kpi-desc">{card.desc}</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section 2: Operations Overview */}
                <div className="admin-section">
                    <div className="admin-section-header">
                        <div>
                            <h2 className="admin-section-heading">
                                <i className="bi bi-boxes me-2"></i>
                                {t("Operations Overview")}
                            </h2>
                            <p className="admin-section-sub">
                                {t("Monitor platform users, businesses, NGOs, inventory, donations and deliveries from one place.")}
                            </p>
                        </div>
                    </div>

                    <div className="row g-3">
                        {operationCards.map((card) => (
                            <div key={card.key} className="col-xl col-lg-4 col-md-6 col-12">
                                <div
                                    className={`admin-kpi-card ${card.accentClass}`}
                                    onClick={() => setSelectedCard(card)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            setSelectedCard(card);
                                        }
                                    }}
                                >
                                    {loading ? (
                                        <div className="admin-kpi-skeleton">
                                            <div className="skeleton-icon"></div>
                                            <div className="skeleton-title"></div>
                                            <div className="skeleton-value"></div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="admin-kpi-top">
                                                <div className="admin-kpi-icon" style={{ backgroundColor: `${card.color}15`, color: card.color }}>
                                                    <i className={`bi ${card.icon}`}></i>
                                                </div>
                                                <span className="admin-kpi-hint">
                                                    {t("Click to View")} <i className="bi bi-chevron-right ms-1"></i>
                                                </span>
                                            </div>
                                            <div className="admin-kpi-content">
                                                <span className="admin-kpi-title">{card.title}</span>
                                                <div className="admin-kpi-value" style={{ color: card.color }}>
                                                    {formatLocalizedNumber(card.value, language)}
                                                </div>
                                                <p className="admin-kpi-desc">{card.desc}</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section 3: Quick Actions */}
                <div className="admin-section">
                    <div className="admin-section-header">
                        <div>
                            <h2 className="admin-section-heading">
                                <i className="bi bi-lightning-charge me-2"></i>
                                {t("Quick Actions")}
                            </h2>
                        </div>
                    </div>

                    <div className="row g-3">
                        {quickActions.map((action, idx) => (
                            <div key={idx} className="col-xl col-lg-4 col-md-6 col-12">
                                <Link to={action.path} className="admin-action-card text-decoration-none">
                                    <div className="admin-action-icon" style={{ color: action.color, backgroundColor: `${action.color}15` }}>
                                        <i className={`bi ${action.icon}`}></i>
                                    </div>
                                    <div className="admin-action-body">
                                        <h3 className="admin-action-title">{action.title}</h3>
                                        <p className="admin-action-desc">{action.desc}</p>
                                    </div>
                                    <div className="admin-action-arrow">
                                        <i className="bi bi-arrow-right"></i>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section 4: Recent Activity */}
                <div className="admin-section">
                    <div className="admin-card-container">
                        <div className="admin-card-header d-flex flex-wrap align-items-center justify-content-between gap-2">
                            <div>
                                <h2 className="admin-card-title mb-1">
                                    <i className="bi bi-clock-history me-2"></i>
                                    {t("Recent Platform Activity")}
                                </h2>
                                <p className="admin-card-subtitle mb-0">
                                    {t("Live activity across food donations and fulfillment.")}
                                </p>
                            </div>
                            <Link to="/admin/donations" className="btn btn-sm btn-outline-primary d-inline-flex align-items-center">
                                {t("View All Donations")}
                                <i className="bi bi-arrow-right ms-2"></i>
                            </Link>
                        </div>

                        <div className="admin-card-body p-0">
                            {loading ? (
                                <div className="p-4">
                                    <div className="placeholder-glow mb-3"><span className="placeholder col-12 py-3 rounded"></span></div>
                                    <div className="placeholder-glow mb-3"><span className="placeholder col-12 py-3 rounded"></span></div>
                                    <div className="placeholder-glow"><span className="placeholder col-12 py-3 rounded"></span></div>
                                </div>
                            ) : recentActivity.length === 0 ? (
                                <div className="admin-empty-state">
                                    <div className="admin-empty-icon">
                                        <i className="bi bi-inbox"></i>
                                    </div>
                                    <h4 className="admin-empty-title">{t("No recent activity recorded yet.")}</h4>
                                    <p className="admin-empty-sub">{t("Live activity across food donations and fulfillment.")}</p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table admin-activity-table align-middle mb-0">
                                        <thead>
                                            <tr>
                                                <th>{t("Item")}</th>
                                                <th>{t("Donor / Business")}</th>
                                                <th>{t("Category")}</th>
                                                <th>{t("Quantity")}</th>
                                                <th>{t("Status")}</th>
                                                <th>{t("Date")}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentActivity.map((item) => (
                                                <tr key={item.id}>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <div className="admin-item-avatar me-2">
                                                                <i className="bi bi-box-seam"></i>
                                                            </div>
                                                            <div>
                                                                <span className="fw-semibold text-dark-primary">{item.product_name}</span>
                                                                <small className="d-block text-muted">ID: #{item.id}</small>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="text-secondary-sub">
                                                            {item.business_name || t("Individual Donor")}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-light text-dark border">
                                                            {t(item.category || "General")}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="fw-medium">
                                                            {formatLocalizedNumber(item.quantity || 0, language)} {t(item.unit || "")}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {getStatusBadge(item.status)}
                                                    </td>
                                                    <td>
                                                        <small className="text-muted">
                                                            {formatLocalizedDate(item.created_at || item.expiry_date, language)}
                                                        </small>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Drilldown Modal */}
                {selectedCard && (
                    <div
                        className="modal fade show admin-modal-backdrop"
                        style={{ display: "block" }}
                        tabIndex="-1"
                        role="dialog"
                        aria-modal="true"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) {
                                setSelectedCard(null);
                            }
                        }}
                    >
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content admin-modal-content">
                                <div className="modal-header border-0 pb-0">
                                    <div className="d-flex align-items-center gap-2">
                                        <div
                                            className="admin-modal-header-icon"
                                            style={{ backgroundColor: `${selectedCard.color}15`, color: selectedCard.color }}
                                        >
                                            <i className={`bi ${selectedCard.icon}`}></i>
                                        </div>
                                        <div>
                                            <span className="text-muted small text-uppercase fw-semibold">{t("Metric Details")}</span>
                                            <h4 className="modal-title mb-0 fw-bold">{selectedCard.title}</h4>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        aria-label={t("Close")}
                                        onClick={() => setSelectedCard(null)}
                                    ></button>
                                </div>

                                <div className="modal-body text-center py-4">
                                    <div
                                        className="admin-modal-number"
                                        style={{ color: selectedCard.color }}
                                    >
                                        {formatLocalizedNumber(selectedCard.value || 0, language)}
                                    </div>
                                    <p className="admin-modal-desc">
                                        {selectedCard.desc}
                                    </p>
                                </div>

                                <div className="modal-footer border-0 pt-0">
                                    {selectedCard.link && (
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={() => {
                                                const target = selectedCard.link;
                                                setSelectedCard(null);
                                                navigate(target);
                                            }}
                                        >
                                            <i className="bi bi-box-arrow-up-right me-2"></i>
                                            {t("View Related Records")}
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => setSelectedCard(null)}
                                    >
                                        {t("Close")}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;