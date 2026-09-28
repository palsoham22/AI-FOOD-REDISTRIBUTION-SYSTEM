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
import "../styles/AvailableDonations.css";

function AvailableDonations() {
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [acceptingId, setAcceptingId] = useState(null);

    const t = useTranslate();
    const { language } = useTranslationContext();

    const dynamicLabels = useMemo(
        () =>
            buildDynamicLabels(
                [
                    ...LABELS.NGO_AVAILABLE_DONATIONS,
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
            .get("http://127.0.0.1:8000/api/inventory/donations/", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then((response) => {
                const data = Array.isArray(response.data) ? response.data : [];
                setDonations(data);
                localStorage.setItem(
                    "offline_available_donations",
                    JSON.stringify(data)
                );
            })
            .catch((error) => {
                console.error("Error fetching available donations:", error);
                const cached = localStorage.getItem("offline_available_donations");
                if (cached) {
                    try {
                        setDonations(JSON.parse(cached));
                        alert(t("📶 Offline Mode: Showing last synced donations."));
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

    const acceptDonation = async (id) => {
        if (!window.confirm(t("Accept this donation?"))) {
            return;
        }

        setAcceptingId(id);
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
        } catch (error) {
            console.error("Donation acceptance failed:", error);
            alert(t("Acceptance Failed"));
        } finally {
            setAcceptingId(null);
        }
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

    // Counts for stats
    const freshCount = useMemo(() => donations.filter((item) => item.status === "Donated").length, [donations]);
    const readyCount = useMemo(() => donations.filter((item) => item.status === "Accepted").length, [donations]);

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

            <div className="available-page">
                <TopNavbar />

                {/* 1. Page Header */}
                <div className="available-header-card mb-4">
                    <div className="available-header-main">
                        <div className="available-avatar-box">
                            <span className="available-avatar-icon">🎁</span>
                        </div>
                        <div className="available-header-info">
                            <div className="d-flex align-items-center flex-wrap gap-2 mb-1">
                                <h1 className="available-title mb-0">{t("Available Donations")}</h1>
                                <span className="badge available-status-pill">
                                    <span className="available-pulse-dot" aria-hidden="true"></span>
                                    {formatLocalizedNumber(donations.length, language)} {t("Available")}
                                </span>
                            </div>
                            <p className="available-subtitle mb-0">
                                {t("View and accept food donations from businesses.")}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. Key Statistics Summary Cards */}
                <div className="row g-3 mb-4">
                    {/* Card 1: Available Donations */}
                    <div className="col-xl-4 col-md-6 col-12">
                        <div
                            className={`available-kpi-card available-kpi-blue ${statusFilter === "All" ? "kpi-active" : ""}`}
                            onClick={() => setStatusFilter("All")}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === "Enter" && setStatusFilter("All")}
                        >
                            <div className="available-kpi-top">
                                <span className="available-kpi-label">{t("Available Donations")}</span>
                                <span className="available-kpi-icon-wrap">
                                    <i className="bi bi-gift"></i>
                                </span>
                            </div>
                            <div className="available-kpi-value">
                                {formatLocalizedNumber(donations.length, language)}
                            </div>
                            <div className="available-kpi-bottom">
                                <span>{t("Active Donations")}</span>
                                <span className="available-kpi-link">
                                    {statusFilter === "All" ? `✓ ${t("All")}` : `${t("Filter")} →`}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Fresh Donations */}
                    <div className="col-xl-4 col-md-6 col-12">
                        <div
                            className={`available-kpi-card available-kpi-amber ${statusFilter === "Donated" ? "kpi-active" : ""}`}
                            onClick={() => setStatusFilter(statusFilter === "Donated" ? "All" : "Donated")}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === "Enter" && setStatusFilter(statusFilter === "Donated" ? "All" : "Donated")}
                        >
                            <div className="available-kpi-top">
                                <span className="available-kpi-label">{t("Fresh Donations")}</span>
                                <span className="available-kpi-icon-wrap">
                                    <i className="bi bi-box-seam"></i>
                                </span>
                            </div>
                            <div className="available-kpi-value">
                                {formatLocalizedNumber(freshCount, language)}
                            </div>
                            <div className="available-kpi-bottom">
                                <span>{t("Donated")}</span>
                                <span className="available-kpi-link">
                                    {statusFilter === "Donated" ? `✓ ${t("Donated")}` : `${t("Filter")} →`}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Ready For Pickup */}
                    <div className="col-xl-4 col-md-12 col-12">
                        <div
                            className={`available-kpi-card available-kpi-purple ${statusFilter === "Accepted" ? "kpi-active" : ""}`}
                            onClick={() => setStatusFilter(statusFilter === "Accepted" ? "All" : "Accepted")}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === "Enter" && setStatusFilter(statusFilter === "Accepted" ? "All" : "Accepted")}
                        >
                            <div className="available-kpi-top">
                                <span className="available-kpi-label">{t("Ready For Pickup")}</span>
                                <span className="available-kpi-icon-wrap">
                                    <i className="bi bi-truck"></i>
                                </span>
                            </div>
                            <div className="available-kpi-value">
                                {formatLocalizedNumber(readyCount, language)}
                            </div>
                            <div className="available-kpi-bottom">
                                <span>{t("Accepted")}</span>
                                <span className="available-kpi-link">
                                    {statusFilter === "Accepted" ? `✓ ${t("Accepted")}` : `${t("Filter")} →`}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Main Content Card (Search/Filter Toolbar + Table) */}
                <div className="available-content-card">
                    <div className="available-card-header">
                        <div className="d-flex align-items-center gap-2">
                            <h2 className="available-card-title mb-0">{t("Available Donations")}</h2>
                            <span className="badge available-count-badge">
                                {formatLocalizedNumber(filteredDonations.length, language)} {t("Available")}
                            </span>
                        </div>

                        {/* Search & Filter Toolbar */}
                        <div className="available-filter-toolbar">
                            <div className="available-search-wrap">
                                <i className="bi bi-search available-search-icon"></i>
                                <input
                                    type="text"
                                    className="form-control form-control-sm available-search-input"
                                    placeholder={t("Search Product...")}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    aria-label={t("Search Product...")}
                                />
                            </div>

                            <select
                                className="form-select form-select-sm available-filter-select"
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
                                className="form-select form-select-sm available-filter-select"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                aria-label={t("Status")}
                            >
                                <option value="All">{t("Status")}: {t("All")}</option>
                                <option value="Donated">{t("Donated")}</option>
                                <option value="Accepted">{t("Accepted")}</option>
                            </select>

                            {(searchQuery || categoryFilter !== "All" || statusFilter !== "All") && (
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-secondary available-reset-btn"
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
                        <table className="table available-table">
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
                                            <span className="text-muted fw-semibold">{t("Available Donations")}...</span>
                                        </td>
                                    </tr>
                                ) : filteredDonations.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-5">
                                            <div className="available-empty-state">
                                                <div className="available-empty-icon">
                                                    {donations.length === 0 ? "🎁" : "🔍"}
                                                </div>
                                                <h3 className="available-empty-title">
                                                    {donations.length === 0
                                                        ? t("No Donations Available")
                                                        : t("No Donations Available")}
                                                </h3>
                                                <p className="available-empty-sub mb-3">
                                                    {searchQuery || categoryFilter !== "All" || statusFilter !== "All"
                                                        ? t("Try adjusting your search or filters.")
                                                        : t("View and accept food donations from businesses.")}
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
                                        const isDonated = item.status === "Donated";
                                        const isAccepted = item.status === "Accepted";
                                        const isAccepting = acceptingId === item.id;

                                        return (
                                            <tr key={item.id}>
                                                <td>
                                                    <div className="fw-semibold text-primary available-product-title">
                                                        {t(item.product_name)}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span className="available-donor-icon">🏪</span>
                                                        <span className="fw-medium text-main">
                                                            {item.business_name || t("Business")}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="badge available-category-badge">
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
                                                        <span className="available-date-text">
                                                            {formatLocalizedDate(item.expiry_date, language)}
                                                        </span>
                                                        <span className={`badge ${risk.badgeClass}`}>
                                                            {t(risk.label)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`badge available-status-badge ${
                                                        isDonated
                                                            ? "status-donated"
                                                            : isAccepted
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
                                                    {isDonated ? (
                                                        <button
                                                            type="button"
                                                            className="btn btn-primary btn-sm accept-btn"
                                                            onClick={() => acceptDonation(item.id)}
                                                            disabled={isAccepting}
                                                        >
                                                            {isAccepting ? (
                                                                <>
                                                                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                                                    {t("Accept Donation")}
                                                                </>
                                                            ) : (
                                                                <>
                                                                    🤝 {t("Accept Donation")}
                                                                </>
                                                            )}
                                                        </button>
                                                    ) : isAccepted ? (
                                                        <span className="badge status-accepted py-2 px-3">
                                                            <i className="bi bi-check-circle me-1"></i> {t("Accepted")}
                                                        </span>
                                                    ) : (
                                                        <span className="badge status-other py-2 px-3">
                                                            {t(item.status)}
                                                        </span>
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

export default AvailableDonations;
