import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DeliverySidebar from "../components/DeliverySidebar";
import TopNavbar from "../components/TopNavbar";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { LABELS } from "../translations";
import { buildDynamicLabels } from "../utils/buildDynamicLabels";
import { formatLocalizedNumber } from "../utils/formatNumber";
import { formatLocalizedDate } from "../utils/formatDate";
import { useTranslationContext } from "../context/TranslationContext";
import "../styles/CompletedDeliveries.css";

function CompletedDeliveries() {
    const navigate = useNavigate();
    const t = useTranslate();
    const { language } = useTranslationContext();

    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [feedback, setFeedback] = useState(null);
    const [selectedDelivery, setSelectedDelivery] = useState(null);

    const dynamicLabels = useMemo(
        () =>
            buildDynamicLabels(LABELS.COMPLETED_DELIVERIES, deliveries, [
                "product_name",
                "category",
                "unit",
                "status",
                "donor_name",
                "business_name",
                "volunteer_name",
            ]),
        [deliveries]
    );

    usePageTranslation(dynamicLabels);

    const showFeedback = useCallback((type, message) => {
        setFeedback({ type, message });
        setTimeout(() => {
            setFeedback(null);
        }, 5000);
    }, []);

    // 1. Fetch completed deliveries
    const loadDeliveries = useCallback(async (isManualRefresh = false) => {
        const token = localStorage.getItem("access");
        if (!token) {
            navigate("/login");
            return;
        }

        if (isManualRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            const response = await axios.get(
                process.env.REACT_APP_API_URL + "/api/inventory/history/",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = Array.isArray(response.data) ? response.data : [];
            setDeliveries(data);
            localStorage.setItem(
                "offline_completed_deliveries",
                JSON.stringify(data)
            );
        } catch (error) {
            console.error("Failed to load completed deliveries:", error);
            const cached = localStorage.getItem("offline_completed_deliveries");
            if (cached) {
                try {
                    setDeliveries(JSON.parse(cached));
                    showFeedback(
                        "info",
                        t("📶 Offline Mode: Showing last synced completed deliveries.")
                    );
                } catch (e) {
                    setDeliveries([]);
                }
            } else {
                showFeedback("danger", t("Failed to load completed deliveries."));
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [navigate, showFeedback, t]);

    useEffect(() => {
        loadDeliveries();
    }, [loadDeliveries]);

    // 2. Real Statistics computed from authentic records
    const stats = useMemo(() => {
        const total = deliveries.length;
        const totalQty = deliveries.reduce(
            (sum, item) => sum + (Number(item.quantity) || 0),
            0
        );
        const otpVerified = deliveries.filter(
            (item) => item.delivery_verified === true
        ).length;
        const uniqueCategories = new Set(
            deliveries.map((item) => item.category).filter(Boolean)
        ).size;

        return {
            total,
            totalQty,
            otpVerified,
            uniqueCategories,
        };
    }, [deliveries]);

    // 3. Filtered deliveries
    const filteredDeliveries = useMemo(() => {
        return deliveries.filter((item) => {
            const matchesCategory =
                categoryFilter === "All" || item.category === categoryFilter;

            const q = searchQuery.toLowerCase().trim();
            const matchesSearch =
                !q ||
                (item.product_name &&
                    item.product_name.toLowerCase().includes(q)) ||
                (item.donor_name &&
                    item.donor_name.toLowerCase().includes(q)) ||
                (item.business_name &&
                    item.business_name.toLowerCase().includes(q)) ||
                (item.volunteer_name &&
                    item.volunteer_name.toLowerCase().includes(q)) ||
                (item.vehicle_number &&
                    item.vehicle_number.toLowerCase().includes(q)) ||
                (item.pickup_address &&
                    item.pickup_address.toLowerCase().includes(q));

            return matchesCategory && matchesSearch;
        });
    }, [deliveries, categoryFilter, searchQuery]);

    const categories = [
        "All",
        "Dairy",
        "Fruits",
        "Vegetables",
        "Bakery",
        "Beverages",
        "Others",
    ];

    const resetFilters = () => {
        setSearchQuery("");
        setCategoryFilter("All");
    };

    return (
        <div className="completed-layout">
            <DeliverySidebar />

            <main className="completed-page">
                <TopNavbar />

                {/* Feedback Banner */}
                {feedback && (
                    <div
                        className={`completed-alert completed-alert-${feedback.type}`}
                        role="alert"
                    >
                        <span>{feedback.message}</span>
                        <button
                            type="button"
                            className="completed-alert-close"
                            onClick={() => setFeedback(null)}
                            aria-label="Close"
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* Header Card */}
                <header className="completed-header-card">
                    <div className="completed-header-left">
                        <div className="completed-header-icon-box">
                            <span className="completed-header-icon" role="img" aria-label="Completed">
                                ✅
                            </span>
                        </div>
                        <div className="completed-header-text">
                            <div className="completed-header-title-row">
                                <h1 className="completed-title">{t("Completed Deliveries")}</h1>
                                <span className="completed-badge-pill">
                                    <span className="completed-pulse-dot" aria-hidden="true"></span>
                                    {formatLocalizedNumber(deliveries.length, language)} {t("Completed")}
                                </span>
                            </div>
                            <p className="completed-subtitle">
                                {t("Review all successfully completed food deliveries.")}
                            </p>
                        </div>
                    </div>

                    <div className="completed-header-actions">
                        <button
                            type="button"
                            className="completed-btn-secondary"
                            onClick={() => loadDeliveries(true)}
                            disabled={refreshing || loading}
                        >
                            <span className={`completed-btn-icon ${refreshing ? "completed-spinning" : ""}`}>
                                🔄
                            </span>
                            <span>{t("Refresh")}</span>
                        </button>
                    </div>
                </header>

                {/* KPI Metrics Summary Grid */}
                <section className="completed-summary-grid" aria-label="Delivery Statistics">
                    <div className="completed-metric-card">
                        <div className="completed-metric-header">
                            <span className="completed-metric-label">{t("Total Completed")}</span>
                            <span className="completed-metric-icon" role="img" aria-label="Deliveries">
                                📦
                            </span>
                        </div>
                        <div className="completed-metric-val">
                            {formatLocalizedNumber(stats.total, language)}
                        </div>
                        <div className="completed-metric-subtext">
                            {t("Delivered")}
                        </div>
                    </div>

                    <div className="completed-metric-card">
                        <div className="completed-metric-header">
                            <span className="completed-metric-label">{t("Food Delivered")}</span>
                            <span className="completed-metric-icon" role="img" aria-label="Food">
                                🥗
                            </span>
                        </div>
                        <div className="completed-metric-val">
                            {formatLocalizedNumber(stats.totalQty, language)}
                        </div>
                        <div className="completed-metric-subtext">
                            {t("Units")}
                        </div>
                    </div>

                    <div className="completed-metric-card">
                        <div className="completed-metric-header">
                            <span className="completed-metric-label">{t("OTP Verified")}</span>
                            <span className="completed-metric-icon" role="img" aria-label="Security">
                                🛡️
                            </span>
                        </div>
                        <div className="completed-metric-val">
                            {formatLocalizedNumber(stats.otpVerified, language)}
                        </div>
                        <div className="completed-metric-subtext">
                            {stats.total > 0
                                ? `${Math.round((stats.otpVerified / stats.total) * 100)}% ${t("Verified")}`
                                : t("Verified")}
                        </div>
                    </div>

                    <div className="completed-metric-card">
                        <div className="completed-metric-header">
                            <span className="completed-metric-label">{t("Categories Served")}</span>
                            <span className="completed-metric-icon" role="img" aria-label="Categories">
                                🏷️
                            </span>
                        </div>
                        <div className="completed-metric-val">
                            {formatLocalizedNumber(stats.uniqueCategories, language)}
                        </div>
                        <div className="completed-metric-subtext">
                            {t("Unique Donors")}
                        </div>
                    </div>
                </section>

                {/* Filters & Search Toolbar */}
                <section className="completed-toolbar-card">
                    <div className="completed-search-box">
                        <span className="completed-search-icon" aria-hidden="true">
                            🔍
                        </span>
                        <input
                            type="text"
                            className="completed-search-input"
                            placeholder={t("Search deliveries...")}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                className="completed-search-clear"
                                onClick={() => setSearchQuery("")}
                                aria-label="Clear Search"
                            >
                                ×
                            </button>
                        )}
                    </div>

                    <div className="completed-filter-group">
                        <label htmlFor="category-filter-select" className="completed-filter-label">
                            {t("Filter by Category")}:
                        </label>
                        <select
                            id="category-filter-select"
                            className="completed-select"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat === "All" ? t("All Categories") : t(cat)}
                                </option>
                            ))}
                        </select>

                        {(searchQuery || categoryFilter !== "All") && (
                            <button
                                type="button"
                                className="completed-btn-reset"
                                onClick={resetFilters}
                            >
                                ✕ {t("Reset Filters")}
                            </button>
                        )}
                    </div>
                </section>

                {/* Deliveries Table Card / Empty States */}
                <section className="completed-table-card">
                    {loading ? (
                        <div className="completed-loading-box">
                            <div className="completed-spinner" aria-hidden="true"></div>
                            <p>{t("Review all successfully completed food deliveries.")}</p>
                        </div>
                    ) : deliveries.length === 0 ? (
                        <div className="completed-empty-box">
                            <div className="completed-empty-icon" role="img" aria-label="Empty">
                                🚚
                            </div>
                            <h3 className="completed-empty-title">
                                {t("No Completed Deliveries Yet")}
                            </h3>
                            <p className="completed-empty-desc">
                                {t("Deliveries will appear here once pickup and delivery OTPs are verified.")}
                            </p>
                        </div>
                    ) : filteredDeliveries.length === 0 ? (
                        <div className="completed-empty-box">
                            <div className="completed-empty-icon" role="img" aria-label="No results">
                                🔍
                            </div>
                            <h3 className="completed-empty-title">{t("No Deliveries Found")}</h3>
                            <p className="completed-empty-desc">
                                {t("Try adjusting your search or filters.")}
                            </p>
                            <button
                                type="button"
                                className="completed-btn-reset mt-2"
                                onClick={resetFilters}
                            >
                                {t("Clear Filters")}
                            </button>
                        </div>
                    ) : (
                        <div className="completed-table-responsive">
                            <table className="completed-table">
                                <thead>
                                    <tr>
                                        <th>{t("Product")}</th>
                                        <th>{t("Quantity")}</th>
                                        <th>{t("Donor")}</th>
                                        <th>{t("Volunteer")}</th>
                                        <th>{t("Vehicle")}</th>
                                        <th>{t("Date & Time")}</th>
                                        <th>{t("Status")}</th>
                                        <th className="text-end">{t("Delivery Details")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredDeliveries.map((item) => {
                                        const donorDisplay =
                                            item.donor_name ||
                                            item.business_name ||
                                            t("Donor");
                                        const dateDisplay = item.pickup_date
                                            ? `${formatLocalizedDate(item.pickup_date, language)} ${item.pickup_time ? item.pickup_time.substring(0, 5) : ""}`
                                            : item.created_at
                                            ? formatLocalizedDate(item.created_at, language)
                                            : "—";

                                        return (
                                            <tr key={item.id} className="completed-row">
                                                <td>
                                                    <div className="completed-product-cell">
                                                        <span className="completed-product-name">
                                                            {t(item.product_name)}
                                                        </span>
                                                        <span className="completed-category-tag">
                                                            {t(item.category || "Others")}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="completed-quantity-text">
                                                        {formatLocalizedNumber(item.quantity, language)}{' '}
                                                        <span className="completed-unit-text">
                                                            {t(item.unit || "Units")}
                                                        </span>
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="completed-donor-name">
                                                        {donorDisplay}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="completed-volunteer-name">
                                                        {item.volunteer_name || "—"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="completed-vehicle-badge">
                                                        🚗 {item.vehicle_number || "—"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="completed-date-text">
                                                        {dateDisplay}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="completed-status-wrap">
                                                        <span className="completed-status-pill completed-status-success">
                                                            ✓ {t(item.status || "Delivered")}
                                                        </span>
                                                        {item.delivery_verified && (
                                                            <span
                                                                className="completed-otp-badge"
                                                                title={t("OTP Verified")}
                                                            >
                                                                🛡️ {t("Verified")}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="text-end">
                                                    <button
                                                        type="button"
                                                        className="completed-btn-view"
                                                        onClick={() => setSelectedDelivery(item)}
                                                        aria-label={`${t("View Details")} - ${item.product_name}`}
                                                    >
                                                        {t("View Details")}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {/* Delivery Details Modal */}
                {selectedDelivery && (
                    <div
                        className="completed-modal-backdrop"
                        onClick={() => setSelectedDelivery(null)}
                        role="presentation"
                    >
                        <div
                            className="completed-modal-content"
                            onClick={(e) => e.stopPropagation()}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="completed-modal-title"
                        >
                            <div className="completed-modal-header">
                                <div className="d-flex align-items-center gap-2">
                                    <span className="completed-modal-icon">📋</span>
                                    <h3 id="completed-modal-title" className="completed-modal-title">
                                        {t("Delivery Details")}
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    className="completed-modal-close"
                                    onClick={() => setSelectedDelivery(null)}
                                    aria-label={t("Close")}
                                >
                                    ×
                                </button>
                            </div>

                            <div className="completed-modal-body">
                                <div className="completed-detail-grid">
                                    <div className="completed-detail-item">
                                        <span className="completed-detail-label">{t("Product")}:</span>
                                        <span className="completed-detail-val fw-bold">
                                            {t(selectedDelivery.product_name)}
                                        </span>
                                    </div>

                                    <div className="completed-detail-item">
                                        <span className="completed-detail-label">{t("Category")}:</span>
                                        <span className="completed-detail-val">
                                            {t(selectedDelivery.category || "Others")}
                                        </span>
                                    </div>

                                    <div className="completed-detail-item">
                                        <span className="completed-detail-label">{t("Quantity")}:</span>
                                        <span className="completed-detail-val fw-bold">
                                            {formatLocalizedNumber(selectedDelivery.quantity, language)}{' '}
                                            {t(selectedDelivery.unit || "Units")}
                                        </span>
                                    </div>

                                    <div className="completed-detail-item">
                                        <span className="completed-detail-label">{t("Donor")}:</span>
                                        <span className="completed-detail-val">
                                            {selectedDelivery.donor_name ||
                                                selectedDelivery.business_name ||
                                                t("Donor")}
                                        </span>
                                    </div>

                                    <div className="completed-detail-item">
                                        <span className="completed-detail-label">{t("Volunteer")}:</span>
                                        <span className="completed-detail-val">
                                            {selectedDelivery.volunteer_name || "—"}
                                        </span>
                                    </div>

                                    <div className="completed-detail-item">
                                        <span className="completed-detail-label">{t("Vehicle")}:</span>
                                        <span className="completed-detail-val">
                                            {selectedDelivery.vehicle_number || "—"}
                                            {selectedDelivery.recommended_vehicle
                                                ? ` (${selectedDelivery.recommended_vehicle})`
                                                : ""}
                                        </span>
                                    </div>

                                    <div className="completed-detail-item">
                                        <span className="completed-detail-label">{t("Date & Time")}:</span>
                                        <span className="completed-detail-val">
                                            {selectedDelivery.pickup_date
                                                ? `${formatLocalizedDate(selectedDelivery.pickup_date, language)} ${selectedDelivery.pickup_time || ""}`
                                                : formatLocalizedDate(selectedDelivery.created_at, language)}
                                        </span>
                                    </div>

                                    <div className="completed-detail-item">
                                        <span className="completed-detail-label">{t("Status")}:</span>
                                        <span className="completed-detail-val">
                                            <span className="completed-status-pill completed-status-success">
                                                ✓ {t(selectedDelivery.status || "Delivered")}
                                            </span>
                                        </span>
                                    </div>

                                    <div className="completed-detail-item">
                                        <span className="completed-detail-label">{t("OTP Verified")}:</span>
                                        <span className="completed-detail-val">
                                            {selectedDelivery.delivery_verified ? (
                                                <span className="text-success fw-bold">
                                                    ✓ {t("Verified")}
                                                </span>
                                            ) : (
                                                <span className="text-muted">—</span>
                                            )}
                                        </span>
                                    </div>

                                    {selectedDelivery.contact_number && (
                                        <div className="completed-detail-item">
                                            <span className="completed-detail-label">{t("Contact Number")}:</span>
                                            <span className="completed-detail-val">
                                                {selectedDelivery.contact_number}
                                            </span>
                                        </div>
                                    )}

                                    {selectedDelivery.pickup_address && (
                                        <div className="completed-detail-item full-width">
                                            <span className="completed-detail-label">{t("Pickup Address")}:</span>
                                            <span className="completed-detail-val">
                                                {selectedDelivery.pickup_address}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="completed-modal-footer">
                                <button
                                    type="button"
                                    className="completed-btn-secondary"
                                    onClick={() => setSelectedDelivery(null)}
                                >
                                    {t("Close")}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default CompletedDeliveries;