# -*- coding: utf-8 -*-
import os

js_content = '''import React, { useState, useEffect, useCallback } from "react";
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
                axios.get("http://127.0.0.1:8000/api/inventory/admin-dashboard/", { headers }),
                axios.get("http://127.0.0.1:8000/api/inventory/admin/donations/", { headers })
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
'''

css_content = '''/* ==========================================================================
   FoodBridge AI - Admin Dashboard Styling
   Modern design system with light & dark theme, responsive sidebar offsets
   ========================================================================== */

:root {
    --admin-sidebar-w: 260px;
    --admin-sidebar-collapsed-w: 80px;
    --admin-primary: #2563EB;
    --admin-primary-dark: #1D4ED8;
    --admin-bg-light: #F8FAFC;
    --admin-card-bg-light: #FFFFFF;
    --admin-text-main-light: #0F172A;
    --admin-text-muted-light: #64748B;
    --admin-border-light: #E2E8F0;
    --admin-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
    --admin-shadow-hover: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04);
}

/* Page wrapper & sidebar offsets */
.admin-wrapper {
    position: relative;
    min-height: 100vh;
    background-color: var(--admin-bg-light);
}

.admin-page {
    margin-left: var(--admin-sidebar-w);
    padding: 24px 32px 48px;
    min-height: 100vh;
    background-color: var(--admin-bg-light);
    transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

body.admin-sidebar-collapsed .admin-page {
    margin-left: var(--admin-sidebar-collapsed-w);
}

@media (max-width: 992px) {
    .admin-page {
        margin-left: 0 !important;
        padding: 84px 16px 36px;
    }
}

/* Hero Banner */
.admin-hero-banner {
    background: linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #2563EB 100%);
    color: #FFFFFF;
    border-radius: 20px;
    padding: 32px 36px;
    margin: 20px 0 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 24px;
    box-shadow: 0 12px 30px -10px rgba(15, 23, 42, 0.3);
    position: relative;
    overflow: hidden;
}

.admin-hero-banner::after {
    content: "";
    position: absolute;
    right: -60px;
    top: -60px;
    width: 220px;
    height: 220px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.12) 0%, transparent 70%);
    pointer-events: none;
}

.admin-hero-content {
    max-width: 760px;
    position: relative;
    z-index: 1;
}

.admin-hero-badge {
    display: inline-flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    color: #38BDF8;
    padding: 6px 14px;
    border-radius: 9999px;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.02em;
    margin-bottom: 12px;
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.admin-status-dot {
    width: 8px;
    height: 8px;
    background-color: #10B981;
    border-radius: 50%;
    display: inline-block;
    margin-right: 8px;
    box-shadow: 0 0 8px #10B981;
    animation: pulse-dot 2s infinite ease-in-out;
}

@keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(1.15); }
}

.admin-hero-title {
    font-size: 32px;
    font-weight: 800;
    line-height: 1.25;
    color: #FFFFFF !important;
    margin-bottom: 8px;
}

.admin-hero-subtitle {
    color: rgba(248, 250, 252, 0.85);
    font-size: 15px;
    line-height: 1.5;
    margin-bottom: 8px;
}

.admin-hero-meta {
    font-size: 13px;
    color: rgba(248, 250, 252, 0.7);
    display: flex;
    align-items: center;
}

.admin-hero-actions {
    position: relative;
    z-index: 1;
}

.btn-admin-refresh {
    background: rgba(255, 255, 255, 0.15);
    color: #FFFFFF;
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: 12px;
    padding: 10px 20px;
    font-weight: 600;
    font-size: 14px;
    backdrop-filter: blur(8px);
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
}

.btn-admin-refresh:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.25);
    color: #FFFFFF;
    transform: translateY(-1px);
}

.spin-icon {
    display: inline-block;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

/* Alert banner */
.admin-alert-banner {
    border-radius: 14px;
    padding: 16px 20px;
    margin-bottom: 24px;
    border: 1px solid #FECACA;
}

/* Sections */
.admin-section {
    margin-bottom: 36px;
}

.admin-section-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 16px;
}

.admin-section-heading {
    font-size: 20px;
    font-weight: 700;
    color: var(--admin-text-main-light);
    margin-bottom: 4px;
    display: flex;
    align-items: center;
}

.admin-section-sub {
    font-size: 13.5px;
    color: var(--admin-text-muted-light);
    margin-bottom: 0;
}

/* KPI Cards */
.admin-kpi-card {
    background-color: var(--admin-card-bg-light);
    border-radius: 16px;
    padding: 20px;
    border: 1px solid var(--admin-border-light);
    box-shadow: var(--admin-shadow);
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    height: 100%;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.admin-kpi-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--admin-shadow-hover);
    border-color: #CBD5E1;
}

.admin-kpi-card:focus-visible {
    outline: 2px solid var(--admin-primary);
    outline-offset: 2px;
}

/* Colored accent bar */
.admin-kpi-card::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
}

.admin-kpi-blue::before { background: #2563EB; }
.admin-kpi-green::before { background: #059669; }
.admin-kpi-purple::before { background: #7C3AED; }
.admin-kpi-cyan::before { background: #0891B2; }
.admin-kpi-orange::before { background: #EA580C; }
.admin-kpi-amber::before { background: #D97706; }
.admin-kpi-teal::before { background: #0D9488; }

.admin-kpi-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;
}

.admin-kpi-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
}

.admin-kpi-hint {
    font-size: 12px;
    color: var(--admin-text-muted-light);
    font-weight: 600;
    opacity: 0.8;
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.admin-kpi-card:hover .admin-kpi-hint {
    opacity: 1;
    transform: translateX(2px);
    color: var(--admin-primary);
}

.admin-kpi-content {
    display: flex;
    flex-direction: column;
}

.admin-kpi-title {
    font-size: 13.5px;
    font-weight: 600;
    color: var(--admin-text-muted-light);
    margin-bottom: 6px;
}

.admin-kpi-value {
    font-size: 32px;
    font-weight: 800;
    line-height: 1.15;
    margin-bottom: 6px;
    letter-spacing: -0.02em;
}

.admin-kpi-desc {
    font-size: 12.5px;
    color: var(--admin-text-muted-light);
    line-height: 1.4;
    margin-bottom: 0;
}

/* Skeleton Loading State */
.admin-kpi-skeleton {
    padding: 10px 0;
}

.skeleton-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: #E2E8F0;
    margin-bottom: 16px;
    animation: shimmer 1.5s infinite ease-in-out;
}

.skeleton-title {
    width: 65%;
    height: 14px;
    border-radius: 4px;
    background: #E2E8F0;
    margin-bottom: 12px;
    animation: shimmer 1.5s infinite ease-in-out;
}

.skeleton-value {
    width: 40%;
    height: 28px;
    border-radius: 6px;
    background: #E2E8F0;
    animation: shimmer 1.5s infinite ease-in-out;
}

@keyframes shimmer {
    0% { opacity: 0.5; }
    50% { opacity: 1; }
    100% { opacity: 0.5; }
}

/* Quick Actions Cards */
.admin-action-card {
    background: var(--admin-card-bg-light);
    border: 1px solid var(--admin-border-light);
    border-radius: 16px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: var(--admin-shadow);
    transition: all 0.2s ease;
    height: 100%;
}

.admin-action-card:hover {
    transform: translateY(-3px);
    box-shadow: var(--admin-shadow-hover);
    border-color: #CBD5E1;
}

.admin-action-icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    flex-shrink: 0;
}

.admin-action-body {
    flex: 1;
    min-width: 0;
}

.admin-action-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--admin-text-main-light);
    margin-bottom: 3px;
}

.admin-action-desc {
    font-size: 12.5px;
    color: var(--admin-text-muted-light);
    margin-bottom: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.admin-action-arrow {
    color: var(--admin-text-muted-light);
    font-size: 16px;
    opacity: 0.6;
    transition: transform 0.2s ease, opacity 0.2s ease;
}

.admin-action-card:hover .admin-action-arrow {
    transform: translateX(4px);
    opacity: 1;
    color: var(--admin-primary);
}

/* Recent Activity Card & Table */
.admin-card-container {
    background: var(--admin-card-bg-light);
    border: 1px solid var(--admin-border-light);
    border-radius: 18px;
    box-shadow: var(--admin-shadow);
    overflow: hidden;
}

.admin-card-header {
    padding: 22px 26px;
    border-bottom: 1px solid var(--admin-border-light);
    background: #FAFAFA;
}

.admin-card-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--admin-text-main-light);
}

.admin-card-subtitle {
    font-size: 13.5px;
    color: var(--admin-text-muted-light);
}

.admin-activity-table {
    margin-bottom: 0;
}

.admin-activity-table thead th {
    font-size: 12.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--admin-text-muted-light);
    background: #F8FAFC;
    padding: 14px 24px;
    border-bottom: 1px solid var(--admin-border-light);
    white-space: nowrap;
}

.admin-activity-table tbody td {
    padding: 16px 24px;
    font-size: 14px;
    color: var(--admin-text-main-light);
    border-bottom: 1px solid var(--admin-border-light);
}

.admin-activity-table tbody tr:last-child td {
    border-bottom: none;
}

.admin-activity-table tbody tr:hover {
    background-color: #F8FAFC;
}

.admin-item-avatar {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    background-color: #EFF6FF;
    color: #2563EB;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
}

.text-dark-primary {
    color: var(--admin-text-main-light);
}

.text-secondary-sub {
    color: #475569;
    font-weight: 500;
}

/* Status Badges */
.admin-status-badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    border-radius: 9999px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.02em;
}

.badge-green { background: #DCFCE7; color: #15803D; }
.badge-blue { background: #DBEAFE; color: #1D4ED8; }
.badge-purple { background: #F3E8FF; color: #7E22CE; }
.badge-amber { background: #FEF3C7; color: #B45309; }
.badge-teal { background: #CCFBF1; color: #0F766E; }
.badge-gray { background: #F1F5F9; color: #475569; }

/* Empty State */
.admin-empty-state {
    padding: 60px 24px;
    text-align: center;
}

.admin-empty-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-color: #F1F5F9;
    color: #94A3B8;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    margin-bottom: 16px;
}

.admin-empty-title {
    font-size: 17px;
    font-weight: 700;
    color: var(--admin-text-main-light);
    margin-bottom: 6px;
}

.admin-empty-sub {
    font-size: 13.5px;
    color: var(--admin-text-muted-light);
    margin-bottom: 0;
}

/* Modal Styling */
.admin-modal-backdrop {
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
}

.admin-modal-content {
    border-radius: 20px;
    border: none;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    background-color: #FFFFFF;
    padding: 10px;
}

.admin-modal-header-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
}

.admin-modal-number {
    font-size: 54px;
    font-weight: 800;
    line-height: 1.1;
    margin-bottom: 12px;
    letter-spacing: -0.03em;
}

.admin-modal-desc {
    font-size: 15px;
    color: var(--admin-text-muted-light);
    max-width: 380px;
    margin: 0 auto;
    line-height: 1.5;
}

/* ==========================================================================
   DARK THEME STYLING
   ========================================================================== */

[data-theme="dark"] .admin-wrapper,
[data-theme="dark"] .admin-page {
    background-color: #0B1120;
}

[data-theme="dark"] .admin-section-heading {
    color: #F8FAFC;
}

[data-theme="dark"] .admin-section-sub {
    color: #94A3B8;
}

[data-theme="dark"] .admin-kpi-card {
    background-color: #1E293B;
    border-color: #334155;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .admin-kpi-card:hover {
    border-color: #475569;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4);
}

[data-theme="dark"] .admin-kpi-title {
    color: #94A3B8;
}

[data-theme="dark"] .admin-kpi-desc {
    color: #94A3B8;
}

[data-theme="dark"] .admin-kpi-hint {
    color: #64748B;
}

[data-theme="dark"] .admin-kpi-card:hover .admin-kpi-hint {
    color: #60A5FA;
}

[data-theme="dark"] .skeleton-icon,
[data-theme="dark"] .skeleton-title,
[data-theme="dark"] .skeleton-value {
    background: #334155;
}

[data-theme="dark"] .admin-action-card {
    background: #1E293B;
    border-color: #334155;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .admin-action-card:hover {
    border-color: #475569;
}

[data-theme="dark"] .admin-action-title {
    color: #F8FAFC;
}

[data-theme="dark"] .admin-action-desc {
    color: #94A3B8;
}

[data-theme="dark"] .admin-action-arrow {
    color: #64748B;
}

[data-theme="dark"] .admin-card-container {
    background: #1E293B;
    border-color: #334155;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .admin-card-header {
    background: #192233;
    border-color: #334155;
}

[data-theme="dark"] .admin-card-title {
    color: #F8FAFC;
}

[data-theme="dark"] .admin-card-subtitle {
    color: #94A3B8;
}

[data-theme="dark"] .admin-activity-table thead th {
    background: #141D2E;
    border-color: #334155;
    color: #94A3B8;
}

[data-theme="dark"] .admin-activity-table tbody td {
    border-color: #334155;
    color: #E2E8F0;
}

[data-theme="dark"] .admin-activity-table tbody tr:hover {
    background-color: #243248;
}

[data-theme="dark"] .admin-item-avatar {
    background-color: #1E3A8A;
    color: #93C5FD;
}

[data-theme="dark"] .text-dark-primary {
    color: #F8FAFC;
}

[data-theme="dark"] .text-secondary-sub {
    color: #CBD5E1;
}

[data-theme="dark"] .badge-green { background: #064E3B; color: #6EE7B7; }
[data-theme="dark"] .badge-blue { background: #1E3A8A; color: #93C5FD; }
[data-theme="dark"] .badge-purple { background: #581C87; color: #D8B4FE; }
[data-theme="dark"] .badge-amber { background: #78350F; color: #FCD34D; }
[data-theme="dark"] .badge-teal { background: #134E4A; color: #5EEAD4; }
[data-theme="dark"] .badge-gray { background: #334155; color: #CBD5E1; }

[data-theme="dark"] .admin-empty-icon {
    background-color: #334155;
    color: #64748B;
}

[data-theme="dark"] .admin-empty-title {
    color: #F8FAFC;
}

[data-theme="dark"] .admin-empty-sub {
    color: #94A3B8;
}

[data-theme="dark"] .admin-modal-content {
    background-color: #1E293B;
    color: #F8FAFC;
    border: 1px solid #334155;
}

[data-theme="dark"] .admin-modal-content .modal-title {
    color: #F8FAFC;
}

[data-theme="dark"] .admin-modal-desc {
    color: #94A3B8;
}

[data-theme="dark"] .admin-modal-content .btn-close {
    filter: invert(1) grayscale(100%) brightness(200%);
}
'''

with open('frontend/src/pages/AdminDashboard.js', 'w', encoding='utf-8') as f:
    f.write(js_content)
    f.flush()
    os.fsync(f.fileno())
print('Written frontend/src/pages/AdminDashboard.js successfully')

with open('frontend/src/styles/AdminDashboard.css', 'w', encoding='utf-8') as f:
    f.write(css_content)
    f.flush()
    os.fsync(f.fileno())
print('Written frontend/src/styles/AdminDashboard.css successfully')

