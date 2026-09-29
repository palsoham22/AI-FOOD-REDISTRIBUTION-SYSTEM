import React, { useEffect, useState, useMemo } from "react";
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
import "../styles/DonationHistory.css";

function DonationHistory() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");

    const t = useTranslate();
    const { language } = useTranslationContext();

    const dynamicLabels = useMemo(
        () =>
            buildDynamicLabels(
                [
                    ...LABELS.NGO_DONATION_HISTORY,
                    ...LABELS.NGO_DASHBOARD,
                    ...LABELS.NGO_SIDEBAR
                ],
                history,
                [
                    "business_name",
                    "product_name",
                    "category",
                    "unit",
                    "status"
                ]
            ),
        [history]
    );

    usePageTranslation(dynamicLabels);

    const loadHistory = () => {
        setLoading(true);
        const token = localStorage.getItem("access");

        axios
            .get("http://127.0.0.1:8000/api/inventory/history/", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then((response) => {
                const data = Array.isArray(response.data) ? response.data : [];
                setHistory(data);
                localStorage.setItem(
                    "offline_donation_history",
                    JSON.stringify(data)
                );
            })
            .catch((error) => {
                console.error("Failed to load donation history:", error);
                const cached = localStorage.getItem("offline_donation_history");
                if (cached) {
                    try {
                        setHistory(JSON.parse(cached));
                        alert(t("📶 Offline Mode: Showing last synced donation history."));
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
        loadHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Filtered history based on search and category
    const filteredHistory = useMemo(() => {
        return history.filter((item) => {
            const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
            const query = searchQuery.toLowerCase().trim();
            const matchesSearch = !query ||
                (item.product_name && item.product_name.toLowerCase().includes(query)) ||
                (item.business_name && item.business_name.toLowerCase().includes(query)) ||
                (item.volunteer_name && item.volunteer_name.toLowerCase().includes(query));
            return matchesCategory && matchesSearch;
        });
    }, [history, categoryFilter, searchQuery]);

    // Categories list for filter dropdown
    const categories = ["All", "Dairy", "Bakery", "Fruits", "Vegetables", "Beverages", "Others"];

    // Total quantity calculation
    const totalQuantity = useMemo(() => {
        return history.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    }, [history]);

    const resetFilters = () => {
        setSearchQuery("");
        setCategoryFilter("All");
    };

    return (
        <>
            <NGOSidebar />

            <div className="history-page">
                <TopNavbar />

                {/* 1. Page Header Card */}
                <div className="history-header-card mb-4">
                    <div className="history-header-main">
                        <div className="history-avatar-box">
                            <span className="history-avatar-icon">📜</span>
                        </div>
                        <div className="history-header-info">
                            <div className="d-flex align-items-center flex-wrap gap-2 mb-1">
                                <h1 className="history-title mb-0">{t("Donation History")}</h1>
                                <span className="badge history-status-pill">
                                    <span className="history-pulse-dot" aria-hidden="true"></span>
                                    {formatLocalizedNumber(history.length, language)} {t("Completed")}
                                </span>
                            </div>
                            <p className="history-subtitle mb-0">
                                {t("Track all donated products and their current status.")}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. Key Statistics Summary Cards */}
                <div className="row g-3 mb-4">
                    {/* Card 1: Completed Donations */}
                    <div className="col-xl-4 col-md-6 col-12">
                        <div
                            className={`history-kpi-card history-kpi-green ${categoryFilter === "All" ? "kpi-active" : ""}`}
                            onClick={() => setCategoryFilter("All")}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === "Enter" && setCategoryFilter("All")}
                        >
                            <div className="history-kpi-top">
                                <span className="history-kpi-label">{t("Completed")}</span>
                                <span className="history-kpi-icon-wrap">
                                    <i className="bi bi-check2-all"></i>
                                </span>
                            </div>
                            <div className="history-kpi-value">
                                {formatLocalizedNumber(history.length, language)}
                            </div>
                            <div className="history-kpi-bottom">
                                <span>{t("Donation History")}</span>
                                <span className="history-kpi-link">
                                    {categoryFilter === "All" ? `✓ ${t("All")}` : `${t("All")} →`}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Total Items Distributed */}
                    <div className="col-xl-4 col-md-6 col-12">
                        <div className="history-kpi-card history-kpi-blue">
                            <div className="history-kpi-top">
                                <span className="history-kpi-label">{t("Quantity")}</span>
                                <span className="history-kpi-icon-wrap">
                                    <i className="bi bi-box-seam"></i>
                                </span>
                            </div>
                            <div className="history-kpi-value">
                                {formatLocalizedNumber(totalQuantity, language)}
                            </div>
                            <div className="history-kpi-bottom">
                                <span>{t("Completed")}</span>
                                <span className="history-kpi-link">
                                    {t("Quantity")}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Categories Handled */}
                    <div className="col-xl-4 col-md-12 col-12">
                        <div className="history-kpi-card history-kpi-purple">
                            <div className="history-kpi-top">
                                <span className="history-kpi-label">{t("Category")}</span>
                                <span className="history-kpi-icon-wrap">
                                    <i className="bi bi-tags"></i>
                                </span>
                            </div>
                            <div className="history-kpi-value">
                                {new Set(history.map((item) => item.category).filter(Boolean)).size}
                            </div>
                            <div className="history-kpi-bottom">
                                <span>{t("Category")}</span>
                                <span className="history-kpi-link">
                                    {t("Category")}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Main Content Card (Table & Search/Filter Toolbar) */}
                <div className="history-table-card">
                    <div className="history-card-header">
                        <div className="d-flex align-items-center gap-2">
                            <h2 className="history-card-title mb-0">{t("Donation History")}</h2>
                            <span className="badge history-count-badge">
                                {formatLocalizedNumber(filteredHistory.length, language)} {t("Completed")}
                            </span>
                        </div>

                        {/* Search & Filter Toolbar */}
                        <div className="history-filter-toolbar">
                            <div className="history-search-wrap">
                                <i className="bi bi-search history-search-icon"></i>
                                <input
                                    type="text"
                                    className="form-control form-control-sm history-search-input"
                                    placeholder={t("Search Product...")}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    aria-label={t("Search Product...")}
                                />
                            </div>

                            <select
                                className="form-select form-select-sm history-filter-select"
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

                            {(searchQuery || categoryFilter !== "All") && (
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-secondary history-reset-btn"
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
                        <table className="table history-table">
                            <thead>
                                <tr>
                                    <th scope="col">{t("Product")}</th>
                                    <th scope="col">{t("Business")}</th>
                                    <th scope="col">{t("Category")}</th>
                                    <th scope="col">{t("Quantity")}</th>
                                    <th scope="col">{t("Expiry")}</th>
                                    <th scope="col">{t("Volunteer")}</th>
                                    <th scope="col">{t("Vehicle")}</th>
                                    <th scope="col" className="text-end">{t("Status")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-5">
                                            <div className="spinner-border text-primary spinner-border-sm me-2" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                            <span className="text-muted fw-semibold">{t("Donation History")}...</span>
                                        </td>
                                    </tr>
                                ) : filteredHistory.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-5">
                                            <div className="history-empty-state">
                                                <div className="history-empty-icon">
                                                    {history.length === 0 ? "📜" : "🔍"}
                                                </div>
                                                <h3 className="history-empty-title">
                                                    {history.length === 0
                                                        ? t("No Completed Donations")
                                                        : t("No Completed Donations")}
                                                </h3>
                                                <p className="history-empty-sub mb-3">
                                                    {searchQuery || categoryFilter !== "All"
                                                        ? t("Try adjusting your search or filters.")
                                                        : t("Track all donated products and their current status.")}
                                                </p>
                                                {(searchQuery || categoryFilter !== "All") && (
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
                                    filteredHistory.map((item) => (
                                        <tr key={item.id}>
                                            <td>
                                                <div className="fw-semibold text-primary history-product-title">
                                                    {t(item.product_name)}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    <span className="history-donor-icon">🏪</span>
                                                    <span className="fw-medium text-main">
                                                        {item.business_name || t("Business")}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge history-category-badge">
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
                                                <span className="history-date-text">
                                                    {formatLocalizedDate(item.expiry_date, language)}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    <span className="history-volunteer-icon">👤</span>
                                                    <span className="fw-medium text-main">
                                                        {item.volunteer_name || "—"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge history-vehicle-badge">
                                                    {item.vehicle_number || "—"}
                                                </span>
                                            </td>
                                            <td className="text-end">
                                                <span className="badge history-status-badge status-delivered py-2 px-3">
                                                    <i className="bi bi-check-circle me-1"></i>
                                                    {t(item.status)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

export default DonationHistory;
