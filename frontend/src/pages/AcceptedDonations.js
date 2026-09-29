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
import "../styles/AcceptedDonations.css";

function AcceptedDonations() {
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");

    const t = useTranslate();
    const navigate = useNavigate();
    const { language } = useTranslationContext();

    const dynamicLabels = useMemo(
        () =>
            buildDynamicLabels(
                [
                    ...LABELS.NGO_ACCEPTED_DONATIONS,
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
        setLoading(true);
        const token = localStorage.getItem("access");

        axios
            .get("http://127.0.0.1:8000/api/inventory/accepted/", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then((response) => {
                const data = Array.isArray(response.data) ? response.data : [];
                setDonations(data);
                localStorage.setItem(
                    "offline_accepted_donations",
                    JSON.stringify(data)
                );
            })
            .catch((error) => {
                console.error("Failed to load accepted donations:", error);
                const cached = localStorage.getItem("offline_accepted_donations");
                if (cached) {
                    try {
                        setDonations(JSON.parse(cached));
                        alert(t("📶 Offline Mode: Showing last synced accepted donations."));
                    } catch (e) {
                        console.error("Cache parse error:", e);
                    }
                }
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        loadDonations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const schedulePickup = (id) => {
        navigate(`/schedule-pickup/${id}`);
    };

    // Filtered donations based on search, category, and status
    const filteredDonations = useMemo(() => {
        return donations.filter((item) => {
            const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
            const matchesStatus = statusFilter === "All" || item.status === statusFilter;
            const query = searchQuery.toLowerCase().trim();
            const matchesSearch = !query ||
                (item.product_name && item.product_name.toLowerCase().includes(query)) ||
                (item.business_name && item.business_name.toLowerCase().includes(query));
            return matchesCategory && matchesStatus && matchesSearch;
        });
    }, [donations, categoryFilter, statusFilter, searchQuery]);

    // Categories list for filter dropdown
    const categories = ["All", "Dairy", "Bakery", "Fruits", "Vegetables", "Beverages", "Others"];

    // Counts for KPI stats
    const readyPickupCount = useMemo(
        () => donations.filter((item) => item.status === "Accepted").length,
        [donations]
    );
    const scheduledCount = useMemo(
        () => donations.filter((item) => item.status === "Scheduled").length,
        [donations]
    );

    // Expiry risk helper
    const getExpiryRisk = (expiryDate) => {
        if (!expiryDate) return { label: "Safe", badgeClass: "risk-safe" };
        const today = new Date();
        const exp = new Date(expiryDate);
        const daysLeft = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
        if (daysLeft < 0) return { label: "Expired", badgeClass: "risk-critical", daysLeft };
        if (daysLeft <= 2) return { label: "Near Expiry", badgeClass: "risk-critical", daysLeft };
        if (daysLeft <= 5) return { label: "Near Expiry", badgeClass: "risk-warning", daysLeft };
        return { label: "Safe", badgeClass: "risk-safe", daysLeft };
    };

    const resetFilters = () => {
        setSearchQuery("");
        setCategoryFilter("All");
        setStatusFilter("All");
    };

    return (
        <>
            <NGOSidebar />

            <div className="accepted-page">
                <TopNavbar />

                {/* 1. Page Header Card */}
                <div className="accepted-header-card mb-4">
                    <div className="accepted-header-main">
                        <div className="accepted-avatar-box">
                            <span className="accepted-avatar-icon">✅</span>
                        </div>
                        <div className="accepted-header-info">
                            <div className="d-flex align-items-center flex-wrap gap-2 mb-1">
                                <h1 className="accepted-title mb-0">{t("Accepted Donations")}</h1>
                                <span className="badge accepted-status-pill">
                                    <span className="accepted-pulse-dot" aria-hidden="true"></span>
                                    {formatLocalizedNumber(donations.length, language)} {t("Accepted")}
                                </span>
                            </div>
                            <p className="accepted-subtitle mb-0">
                                {t("View all donations accepted by your NGO.")}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. Key Statistics Summary Cards */}
                <div className="row g-3 mb-4">
                    {/* Card 1: Accepted Donations */}
                    <div className="col-xl-4 col-md-6 col-12">
                        <div
                            className={`accepted-kpi-card accepted-kpi-green ${statusFilter === "All" ? "kpi-active" : ""}`}
                            onClick={() => setStatusFilter("All")}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === "Enter" && setStatusFilter("All")}
                        >
                            <div className="accepted-kpi-top">
                                <span className="accepted-kpi-label">{t("Accepted Donations")}</span>
                                <span className="accepted-kpi-icon-wrap">
                                    <i className="bi bi-check-circle-fill"></i>
                                </span>
                            </div>
                            <div className="accepted-kpi-value">
                                {formatLocalizedNumber(donations.length, language)}
                            </div>
                            <div className="accepted-kpi-bottom">
                                <span>{t("Accepted")}</span>
                                <span className="accepted-kpi-link">
                                    {statusFilter === "All" ? `✓ ${t("All")}` : `${t("All")} →`}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Ready For Pickup */}
                    <div className="col-xl-4 col-md-6 col-12">
                        <div
                            className={`accepted-kpi-card accepted-kpi-purple ${statusFilter === "Accepted" ? "kpi-active" : ""}`}
                            onClick={() => setStatusFilter(statusFilter === "Accepted" ? "All" : "Accepted")}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === "Enter" && setStatusFilter(statusFilter === "Accepted" ? "All" : "Accepted")}
                        >
                            <div className="accepted-kpi-top">
                                <span className="accepted-kpi-label">{t("Ready For Pickup")}</span>
                                <span className="accepted-kpi-icon-wrap">
                                    <i className="bi bi-truck"></i>
                                </span>
                            </div>
                            <div className="accepted-kpi-value">
                                {formatLocalizedNumber(readyPickupCount, language)}
                            </div>
                            <div className="accepted-kpi-bottom">
                                <span>{t("Ready For Pickup")}</span>
                                <span className="accepted-kpi-link">
                                    {statusFilter === "Accepted" ? `✓ ${t("Accepted")}` : `${t("Accepted")} →`}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Scheduled Pickups */}
                    <div className="col-xl-4 col-md-12 col-12">
                        <div
                            className={`accepted-kpi-card accepted-kpi-teal ${statusFilter === "Scheduled" ? "kpi-active" : ""}`}
                            onClick={() => setStatusFilter(statusFilter === "Scheduled" ? "All" : "Scheduled")}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === "Enter" && setStatusFilter(statusFilter === "Scheduled" ? "All" : "Scheduled")}
                        >
                            <div className="accepted-kpi-top">
                                <span className="accepted-kpi-label">{t("Scheduled Today")}</span>
                                <span className="accepted-kpi-icon-wrap">
                                    <i className="bi bi-calendar-check"></i>
                                </span>
                            </div>
                            <div className="accepted-kpi-value">
                                {formatLocalizedNumber(scheduledCount, language)}
                            </div>
                            <div className="accepted-kpi-bottom">
                                <span>{t("Scheduled")}</span>
                                <span className="accepted-kpi-link">
                                    {statusFilter === "Scheduled" ? `✓ ${t("Scheduled")}` : `${t("Scheduled")} →`}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Main Content Card (Table & Search/Filter Toolbar) */}
                <div className="accepted-content-card">
                    <div className="accepted-card-header">
                        <div className="d-flex align-items-center gap-2">
                            <h2 className="accepted-card-title mb-0">{t("Accepted Donations")}</h2>
                            <span className="badge accepted-count-badge">
                                {formatLocalizedNumber(filteredDonations.length, language)} {t("Accepted")}
                            </span>
                        </div>

                        {/* Search & Filter Toolbar */}
                        <div className="accepted-filter-toolbar">
                            <div className="accepted-search-wrap">
                                <i className="bi bi-search accepted-search-icon"></i>
                                <input
                                    type="text"
                                    className="form-control form-control-sm accepted-search-input"
                                    placeholder={t("Search Product...")}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    aria-label={t("Search Product...")}
                                />
                            </div>

                            <select
                                className="form-select form-select-sm accepted-filter-select"
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                aria-label={t("Category")}
                            >
                                <option value="All">{t("Category")}: {t("All")}</option>
                                {categories.filter((c) => c !== "All").map((cat) => (
                                    <option key={cat} value={cat}>
                                        {t(cat)}
                                    </option>
                                ))}
                            </select>

                            <select
                                className="form-select form-select-sm accepted-filter-select"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                aria-label={t("Status")}
                            >
                                <option value="All">{t("Status")}: {t("All")}</option>
                                <option value="Accepted">{t("Accepted")}</option>
                                <option value="Scheduled">{t("Scheduled")}</option>
                            </select>

                            {(searchQuery || categoryFilter !== "All" || statusFilter !== "All") && (
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-secondary accepted-reset-btn"
                                    onClick={resetFilters}
                                    title={t("All")}
                                >
                                    <i className="bi bi-x-circle me-1"></i>
                                    {t("All")}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Table View */}
                    <div className="table-responsive">
                        <table className="table accepted-table">
                            <thead>
                                <tr>
                                    <th scope="col">{t("Product")}</th>
                                    <th scope="col">{t("Business")}</th>
                                    <th scope="col">{t("Category")}</th>
                                    <th scope="col">{t("Quantity")}</th>
                                    <th scope="col">{t("Expiry")}</th>
                                    <th scope="col">{t("Status")}</th>
                                    <th scope="col" className="text-end">{t("Action")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-5">
                                            <div className="spinner-border text-primary spinner-border-sm me-2" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                            <span className="text-muted fw-semibold">{t("Accepted Donations")}...</span>
                                        </td>
                                    </tr>
                                ) : filteredDonations.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-5">
                                            <div className="accepted-empty-state">
                                                <div className="accepted-empty-icon">
                                                    {donations.length === 0 ? "✅" : "🔍"}
                                                </div>
                                                <h3 className="accepted-empty-title">
                                                    {donations.length === 0
                                                        ? t("No Donations Available")
                                                        : t("No Donations Available")}
                                                </h3>
                                                <p className="accepted-empty-sub mb-3">
                                                    {searchQuery || categoryFilter !== "All" || statusFilter !== "All"
                                                        ? t("Try adjusting your search or filters.")
                                                        : t("View all donations accepted by your NGO.")}
                                                </p>
                                                {(searchQuery || categoryFilter !== "All" || statusFilter !== "All") && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={resetFilters}
                                                    >
                                                        {t("All")}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredDonations.map((item) => {
                                        const risk = getExpiryRisk(item.expiry_date);
                                        const isScheduled = item.status === "Scheduled";

                                        return (
                                            <tr key={item.id}>
                                                <td>
                                                    <div className="fw-semibold text-primary accepted-product-title">
                                                        {t(item.product_name)}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span className="accepted-donor-icon">🏪</span>
                                                        <span className="fw-medium text-main">
                                                            {item.business_name || t("Business")}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="badge accepted-category-badge">
                                                        {t(item.category)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="fw-bold text-main">
                                                        {formatLocalizedNumber(item.quantity, language)}
                                                    </span>{" "}
                                                    <span className="text-muted small">{t(item.unit)}</span>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span className="accepted-date-text">
                                                            {formatLocalizedDate(item.expiry_date, language)}
                                                        </span>
                                                        <span className={`badge ${risk.badgeClass}`}>
                                                            {t(risk.label)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`badge accepted-status-badge ${
                                                        isScheduled
                                                            ? "status-scheduled"
                                                            : item.status === "Delivered"
                                                            ? "status-delivered"
                                                            : "status-accepted"
                                                    }`}>
                                                        {t(item.status)}
                                                    </span>
                                                </td>
                                                <td className="text-end">
                                                    {isScheduled ? (
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-primary btn-sm scheduled-view-btn"
                                                            onClick={() => navigate("/pickup-schedule")}
                                                        >
                                                            <i className="bi bi-calendar-check me-1"></i>
                                                            {t("Scheduled")}
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            className="btn btn-primary btn-sm pickup-btn"
                                                            onClick={() => schedulePickup(item.id)}
                                                        >
                                                            🚚 {t("Schedule Pickup")}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

export default AcceptedDonations;
