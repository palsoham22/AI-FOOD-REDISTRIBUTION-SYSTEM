import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NGOSidebar from "../components/NGOSidebar";
import TopNavbar from "../components/TopNavbar";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { LABELS } from "../translations";
import { buildDynamicLabels } from "../utils/buildDynamicLabels";
import { formatLocalizedDate } from "../utils/formatDate";
import { formatLocalizedNumber } from "../utils/formatNumber";
import { useTranslationContext } from "../context/TranslationContext";
import "../styles/NGODashboard.css";

function NGODashboard() {
    const navigate = useNavigate();
    const t = useTranslate();
    const { language } = useTranslationContext();

    const [donations, setDonations] = useState([]);
    const [stats, setStats] = useState({
        available: 0,
        accepted: 0,
        scheduled: 0,
        delivered: 0,
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [loading, setLoading] = useState(true);

    const ngoName = localStorage.getItem("business_name") || "Helping Hands NGO";
    const contactPerson = localStorage.getItem("owner_name") || "NGO Partner";

    const dynamicLabels = useMemo(
        () =>
            buildDynamicLabels(
                [
                    ...LABELS.NGO_DASHBOARD,
                    ...LABELS.NGO_SIDEBAR
                ],
                donations,
                [
                    "business_name",
                    "product_name",
                    "category",
                    "unit",
                    "status"
                ]
            ),
        [donations]
    );

    usePageTranslation(dynamicLabels);

    const loadDonations = () => {
        const token = localStorage.getItem("access");
        axios.get("http://127.0.0.1:8000/api/inventory/donations/", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then((response) => {
            setDonations(Array.isArray(response.data) ? response.data : []);
        })
        .catch((error) => {
            console.error("Failed to load donations:", error);
        })
        .finally(() => {
            setLoading(false);
        });
    };

    const loadDashboard = () => {
        const token = localStorage.getItem("access");
        axios.get("http://127.0.0.1:8000/api/inventory/ngo/dashboard/", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then((response) => {
            if (response.data) {
                setStats({
                    available: Number(response.data.available) || 0,
                    accepted: Number(response.data.accepted) || 0,
                    scheduled: Number(response.data.scheduled) || 0,
                    delivered: Number(response.data.delivered) || 0,
                });
            }
        })
        .catch((error) => {
            console.error("Failed to load dashboard metrics:", error);
        });
    };

    useEffect(() => {
        loadDonations();
        loadDashboard();
    }, []);

    const acceptDonation = async (id) => {
        if (!window.confirm(t("Accept this donation?"))) {
            return;
        }

        const token = localStorage.getItem("access");
        try {
            await axios.post(
                `http://127.0.0.1:8000/api/inventory/accept/${id}/`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert(t("Donation Accepted Successfully 🎉"));
            loadDonations();
            loadDashboard();
        } catch (error) {
            console.error("Acceptance error:", error);
            alert(t("Acceptance Failed"));
        }
    };

    // Filtered donations based on search and category
    const filteredDonations = useMemo(() => {
        return donations.filter((item) => {
            const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
            const query = searchQuery.toLowerCase().trim();
            const matchesSearch = !query ||
                (item.product_name && item.product_name.toLowerCase().includes(query)) ||
                (item.business_name && item.business_name.toLowerCase().includes(query));
            return matchesCategory && matchesSearch;
        });
    }, [donations, categoryFilter, searchQuery]);

    // Categories list for filter dropdown
    const categories = ["All", "Dairy", "Bakery", "Fruits", "Vegetables", "Beverages", "Others"];

    // Expiry risk helper
    const getExpiryRisk = (expiryDate) => {
        if (!expiryDate) return { label: "Safe", badgeClass: "risk-safe" };
        const today = new Date();
        const exp = new Date(expiryDate);
        const daysLeft = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
        if (daysLeft < 0) return { label: "Expired", badgeClass: "risk-critical", daysLeft };
        if (daysLeft <= 2) return { label: "Urgent", badgeClass: "risk-critical", daysLeft };
        if (daysLeft <= 5) return { label: "Near Expiry", badgeClass: "risk-warning", daysLeft };
        return { label: "Safe", badgeClass: "risk-safe", daysLeft };
    };

    return (
        <>
            <NGOSidebar />

            <div className="ngo-dashboard">
                <TopNavbar />

                {/* 1. Welcome / NGO Overview Card */}
                <div className="ngo-welcome-card mb-4">
                    <div className="ngo-welcome-main">
                        <div className="ngo-avatar-box">
                            <span className="ngo-avatar-icon">🤝</span>
                        </div>
                        <div className="ngo-welcome-info">
                            <div className="d-flex align-items-center flex-wrap gap-2 mb-1">
                                <h1 className="ngo-welcome-title mb-0">{ngoName}</h1>
                                <span className="badge ngo-verified-badge">
                                    <i className="bi bi-shield-check me-1"></i> {t("Verified NGO")}
                                </span>
                            </div>
                            <p className="ngo-welcome-sub">
                                {t("Welcome")}, <strong>{contactPerson}</strong> • {t("NGO Distribution Dashboard")}
                            </p>
                            <div className="ngo-meta-row">
                                <span className="ngo-meta-item">
                                    <i className="bi bi-card-text me-1 text-primary"></i>
                                    <strong>{t("Registration No:")}</strong> NGO-2026-001
                                </span>
                                <span className="ngo-meta-item">
                                    <i className="bi bi-geo-alt me-1 text-primary"></i>
                                    <strong>{t("Service Area:")}</strong> Howrah, Kolkata
                                </span>
                                <span className="ngo-meta-item">
                                    <i className="bi bi-envelope me-1 text-primary"></i>
                                    <strong>{t("Email:")}</strong> ngo@foodbridge.ai
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="ngo-welcome-actions">
                        <span className="ngo-status-pill">
                            <span className="ngo-pulse-dot" aria-hidden="true"></span>
                            {t("Active Donations")}: {formatLocalizedNumber(donations.length, language)}
                        </span>
                    </div>
                </div>

                {/* 2. Key Statistics (KPI Cards Grid) */}
                <div className="row g-3 mb-4">
                    {/* Card 1: Available Donations */}
                    <div className="col-xl-3 col-md-6 col-12">
                        <div
                            className="ngo-kpi-card ngo-kpi-blue"
                            onClick={() => navigate("/available-donations")}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === "Enter" && navigate("/available-donations")}
                        >
                            <div className="ngo-kpi-top">
                                <span className="ngo-kpi-label">{t("Available Donations")}</span>
                                <span className="ngo-kpi-icon-wrap">
                                    <i className="bi bi-gift"></i>
                                </span>
                            </div>
                            <div className="ngo-kpi-value">
                                {formatLocalizedNumber(stats.available, language)}
                            </div>
                            <div className="ngo-kpi-bottom">
                                <span>{t("Active Donations")}</span>
                                <span className="ngo-kpi-link">
                                    {t("Click to View")} →
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Accepted Donations */}
                    <div className="col-xl-3 col-md-6 col-12">
                        <div
                            className="ngo-kpi-card ngo-kpi-green"
                            onClick={() => navigate("/accepted-donations")}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === "Enter" && navigate("/accepted-donations")}
                        >
                            <div className="ngo-kpi-top">
                                <span className="ngo-kpi-label">{t("Accepted Donations")}</span>
                                <span className="ngo-kpi-icon-wrap">
                                    <i className="bi bi-check2-circle"></i>
                                </span>
                            </div>
                            <div className="ngo-kpi-value">
                                {formatLocalizedNumber(stats.accepted, language)}
                            </div>
                            <div className="ngo-kpi-bottom">
                                <span>{t("Accepted")}</span>
                                <span className="ngo-kpi-link">
                                    {t("Click to View")} →
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Scheduled Pickups */}
                    <div className="col-xl-3 col-md-6 col-12">
                        <div
                            className="ngo-kpi-card ngo-kpi-amber"
                            onClick={() => navigate("/pickup-schedule")}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === "Enter" && navigate("/pickup-schedule")}
                        >
                            <div className="ngo-kpi-top">
                                <span className="ngo-kpi-label">{t("Scheduled Pickups")}</span>
                                <span className="ngo-kpi-icon-wrap">
                                    <i className="bi bi-truck"></i>
                                </span>
                            </div>
                            <div className="ngo-kpi-value">
                                {formatLocalizedNumber(stats.scheduled, language)}
                            </div>
                            <div className="ngo-kpi-bottom">
                                <span>{t("Scheduled")}</span>
                                <span className="ngo-kpi-link">
                                    {t("Click to View")} →
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Card 4: Delivered Donations */}
                    <div className="col-xl-3 col-md-6 col-12">
                        <div
                            className="ngo-kpi-card ngo-kpi-purple"
                            onClick={() => navigate("/ngo-history")}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === "Enter" && navigate("/ngo-history")}
                        >
                            <div className="ngo-kpi-top">
                                <span className="ngo-kpi-label">{t("Delivered Donations")}</span>
                                <span className="ngo-kpi-icon-wrap">
                                    <i className="bi bi-box2-heart"></i>
                                </span>
                            </div>
                            <div className="ngo-kpi-value">
                                {formatLocalizedNumber(stats.delivered, language)}
                            </div>
                            <div className="ngo-kpi-bottom">
                                <span>{t("Delivered")}</span>
                                <span className="ngo-kpi-link">
                                    {t("Click to View")} →
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Operational Notification / Status Banner */}
                {stats.available > 0 ? (
                    <div className="ngo-alert-banner ngo-alert-banner-info mb-4">
                        <div className="ngo-alert-left">
                            <div className="ngo-alert-icon-box">
                                <i className="bi bi-bell-fill"></i>
                            </div>
                            <div>
                                <h4 className="ngo-alert-title">{t("Notifications")}</h4>
                                <p className="ngo-alert-text mb-0">
                                    🎁 <strong>{stats.available}</strong> {t("new donation(s) available.")}
                                </p>
                            </div>
                        </div>
                        <a href="#available-donations-table" className="btn ngo-btn-alert">
                            <i className="bi bi-arrow-down-circle me-1"></i> {t("Available Donations")}
                        </a>
                    </div>
                ) : (
                    <div className="ngo-alert-banner ngo-alert-banner-neutral mb-4">
                        <div className="ngo-alert-left">
                            <div className="ngo-alert-icon-box">
                                <i className="bi bi-shield-check"></i>
                            </div>
                            <div>
                                <h4 className="ngo-alert-title">{t("No notifications available.")}</h4>
                                <p className="ngo-alert-text mb-0">
                                    {t("View all donations accepted by your NGO.")}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. Available Donations Section */}
                <div className="ngo-content-card mb-4" id="available-donations-table">
                    {/* Card Header with Title, Count, and Search / Filter Controls */}
                    <div className="ngo-card-header">
                        <div className="d-flex align-items-center gap-2">
                            <h2 className="ngo-card-title mb-0">
                                🎁 {t("Available Donations")}
                            </h2>
                            <span className="badge ngo-count-badge">
                                {formatLocalizedNumber(filteredDonations.length, language)} {t("Available")}
                            </span>
                        </div>

                        {/* Search & Filter Toolbar */}
                        <div className="ngo-filter-toolbar">
                            <div className="ngo-search-wrap">
                                <i className="bi bi-search ngo-search-icon"></i>
                                <input
                                    type="text"
                                    className="form-control form-control-sm ngo-search-input"
                                    placeholder={t("Search Product...")}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <select
                                className="form-select form-select-sm ngo-filter-select"
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                aria-label={t("Category")}
                            >
                                <option value="All">{t("All")}</option>
                                {categories.filter(c => c !== "All").map((cat) => (
                                    <option key={cat} value={cat}>
                                        {t(cat)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Table View */}
                    <div className="table-responsive">
                        <table className="table ngo-table align-middle mb-0">
                            <thead>
                                <tr>
                                    <th>{t("Business")}</th>
                                    <th>{t("Product")}</th>
                                    <th>{t("Category")}</th>
                                    <th>{t("Quantity")}</th>
                                    <th>{t("Expiry")}</th>
                                    <th>{t("Status")}</th>
                                    <th className="text-end">{t("Action")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-5">
                                            <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                                            <span className="text-muted">{t("Available Donations")}...</span>
                                        </td>
                                    </tr>
                                ) : filteredDonations.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-5">
                                            <div className="ngo-empty-state">
                                                <div className="ngo-empty-icon">🎁</div>
                                                <h3 className="ngo-empty-title">{t("No Donations Available")}</h3>
                                                <p className="ngo-empty-sub mb-0">
                                                    {searchQuery || categoryFilter !== "All"
                                                        ? t("Try adjusting your search or filters.")
                                                        : t("No notifications available.")}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredDonations.map((item) => {
                                        const risk = getExpiryRisk(item.expiry_date);
                                        return (
                                            <tr key={item.id}>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span className="ngo-donor-icon">🏪</span>
                                                        <span className="fw-semibold text-main">
                                                            {item.business_name || t("Business")}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="fw-semibold text-primary">
                                                        {item.product_name}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge ngo-category-badge">
                                                        {t(item.category)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="fw-bold">
                                                        {formatLocalizedNumber(item.quantity, language)}
                                                    </span>{" "}
                                                    <span className="text-muted">{t(item.unit)}</span>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span>{formatLocalizedDate(item.expiry_date, language)}</span>
                                                        <span className={`badge ${risk.badgeClass}`}>
                                                            {t(risk.label)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`badge ngo-status-badge ${
                                                        item.status === "Donated"
                                                            ? "status-donated"
                                                            : item.status === "Accepted"
                                                            ? "status-accepted"
                                                            : item.status === "Scheduled"
                                                            ? "status-scheduled"
                                                            : item.status === "Delivered"
                                                            ? "status-delivered"
                                                            : "status-other"
                                                    }`}>
                                                        {t(item.status)}
                                                    </span>
                                                </td>
                                                <td className="text-end">
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary btn-sm ngo-btn-accept"
                                                        onClick={() => acceptDonation(item.id)}
                                                    >
                                                        <i className="bi bi-hand-thumbs-up me-1"></i>
                                                        {t("Accept")}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 5. Quick Activity & Navigation Cards */}
                <div className="row g-3">
                    <div className="col-md-6 col-12">
                        <div className="ngo-summary-box">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div className="d-flex align-items-center gap-2">
                                    <span className="ngo-box-icon text-primary bg-primary-subtle">
                                        <i className="bi bi-truck"></i>
                                    </span>
                                    <div>
                                        <h3 className="ngo-box-title mb-0">{t("Pickup Schedule")}</h3>
                                        <small className="text-muted">{t("Scheduled Pickups")}: {stats.scheduled}</small>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={() => navigate("/pickup-schedule")}
                                >
                                    {t("Click to View")} →
                                </button>
                            </div>
                            <p className="ngo-box-text mb-0">
                                {stats.scheduled > 0
                                    ? `${stats.scheduled} ${t("pickup(s) scheduled.")}`
                                    : t("No Scheduled Pickups")}
                            </p>
                        </div>
                    </div>

                    <div className="col-md-6 col-12">
                        <div className="ngo-summary-box">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div className="d-flex align-items-center gap-2">
                                    <span className="ngo-box-icon text-success bg-success-subtle">
                                        <i className="bi bi-people"></i>
                                    </span>
                                    <div>
                                        <h3 className="ngo-box-title mb-0">{t("Beneficiaries")}</h3>
                                        <small className="text-muted">{t("Delivered Donations")}: {stats.delivered}</small>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={() => navigate("/beneficiaries")}
                                >
                                    {t("Click to View")} →
                                </button>
                            </div>
                            <p className="ngo-box-text mb-0">
                                {stats.delivered > 0
                                    ? `${stats.delivered} ${t("donation(s) delivered successfully.")}`
                                    : t("Track all donated products and their current status.")}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default NGODashboard;
