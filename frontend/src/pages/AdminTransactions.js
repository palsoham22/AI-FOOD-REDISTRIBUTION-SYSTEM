import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import AdminSidebar from "../components/AdminSidebar";
import TopNavbar from "../components/TopNavbar";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { LABELS } from "../translations";
import { buildDynamicLabels } from "../utils/buildDynamicLabels";
import { formatLocalizedDate } from "../utils/formatDate";
import { formatLocalizedNumber } from "../utils/formatNumber";
import { useTranslationContext } from "../context/TranslationContext";
import "../styles/AdminTransactions.css";

const STATUS_CHOICES = [
    { value: "ALL", labelKey: "All Statuses" },
    { value: "Available", labelKey: "Available" },
    { value: "Donated", labelKey: "Donated" },
    { value: "Accepted", labelKey: "Accepted" },
    { value: "Scheduled", labelKey: "Scheduled" },
    { value: "Out For Pickup", labelKey: "Out For Pickup" },
    { value: "Delivered", labelKey: "Delivered" },
    { value: "Completed", labelKey: "Completed" },
    { value: "Expired", labelKey: "Expired" }
];

const CATEGORY_CHOICES = [
    { value: "ALL", labelKey: "All Categories" },
    { value: "Dairy", labelKey: "Dairy" },
    { value: "Fruits", labelKey: "Fruits" },
    { value: "Vegetables", labelKey: "Vegetables" },
    { value: "Bakery", labelKey: "Bakery" },
    { value: "Beverages", labelKey: "Beverages" },
    { value: "Others", labelKey: "Others" }
];

function AdminTransactions() {
    const t = useTranslate();
    const { language } = useTranslationContext();

    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    // Filters, Search & Sorting
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [categoryFilter, setCategoryFilter] = useState("ALL");
    const [sortField, setSortField] = useState("id");
    const [sortDirection, setSortDirection] = useState("desc");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Modal Details
    const [selectedRecord, setSelectedRecord] = useState(null);

    const dynamicLabels = useMemo(
        () =>
            buildDynamicLabels(
                LABELS.ADMIN_TRANSACTIONS,
                transactions,
                ["product_name", "category", "unit", "status"]
            ),
        [transactions]
    );

    usePageTranslation(dynamicLabels);

    const fetchTransactions = useCallback(async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        setError(null);

        try {
            const token = localStorage.getItem("access");
            const response = await axios.get(
                process.env.REACT_APP_API_URL + "/api/inventory/admin/transactions/",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (Array.isArray(response.data)) {
                setTransactions(response.data);
            } else {
                setTransactions([]);
            }
        } catch (err) {
            console.error("Failed to fetch admin transactions:", err);
            setError(t("Unable to load ledger records."));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [t]);

    useEffect(() => {
        fetchTransactions(false);
    }, [fetchTransactions]);

    // Handle Escape key to dismiss modal
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && selectedRecord) {
                setSelectedRecord(null);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedRecord]);

    // Reset to page 1 on filter or page size changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, categoryFilter, pageSize]);

    // Summary KPIs calculated strictly from the COMPLETE dataset
    const totalRecordsCount = transactions.length;
    const deliveredCount = transactions.filter(
        (t) => t.status === "Delivered" || t.status === "Completed"
    ).length;
    const inProgressCount = transactions.filter(
        (t) => t.status === "Accepted" || t.status === "Scheduled"
    ).length;
    const availableCount = transactions.filter(
        (t) => t.status === "Available" || t.status === "Donated"
    ).length;

    // Filter & Sort
    const filteredAndSorted = useMemo(() => {
        let list = [...transactions];

        if (searchQuery.trim()) {
            const query = searchQuery.trim().toLowerCase();
            list = list.filter((item) => {
                const idStr = String(item.id || "");
                const name = (item.product_name || "").toLowerCase();
                const brand = (item.brand || "").toLowerCase();
                const cat = (item.category || "").toLowerCase();
                const bName = (item.business_name || "").toLowerCase();
                const addr = (item.pickup_address || "").toLowerCase();
                const st = (item.status || "").toLowerCase();
                const donorType = (item.donor_type || "").toLowerCase();
                const transName = (t(item.product_name) || "").toLowerCase();
                const transCat = (t(item.category) || "").toLowerCase();
                const transSt = (t(item.status) || "").toLowerCase();

                return (
                    idStr.includes(query) ||
                    name.includes(query) ||
                    brand.includes(query) ||
                    cat.includes(query) ||
                    bName.includes(query) ||
                    addr.includes(query) ||
                    st.includes(query) ||
                    donorType.includes(query) ||
                    transName.includes(query) ||
                    transCat.includes(query) ||
                    transSt.includes(query)
                );
            });
        }

        if (statusFilter !== "ALL") {
            list = list.filter((item) => item.status === statusFilter);
        }

        if (categoryFilter !== "ALL") {
            list = list.filter((item) => item.category === categoryFilter);
        }

        list.sort((a, b) => {
            let aVal = a[sortField];
            let bVal = b[sortField];

            if (sortField === "quantity" || sortField === "id") {
                aVal = Number(aVal) || 0;
                bVal = Number(bVal) || 0;
            } else if (sortField === "created_at" || sortField === "expiry_date") {
                aVal = aVal ? new Date(aVal).getTime() : 0;
                bVal = bVal ? new Date(bVal).getTime() : 0;
            } else {
                aVal = (aVal || "").toString().toLowerCase();
                bVal = (bVal || "").toString().toLowerCase();
            }

            if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
            if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
            return 0;
        });

        return list;
    }, [transactions, searchQuery, statusFilter, categoryFilter, sortField, sortDirection, t]);

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / pageSize));
    const paginatedRecords = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredAndSorted.slice(start, start + pageSize);
    }, [filteredAndSorted, currentPage, pageSize]);

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const handleClearFilters = () => {
        setSearchQuery("");
        setStatusFilter("ALL");
        setCategoryFilter("ALL");
    };

    const getStatusBadge = (status) => {
        const raw = (status || "").toLowerCase().trim();
        let badgeClass = "badge-gray";
        let icon = "bi-circle-fill";
        let label = status || "Available";

        if (raw === "available" || raw === "donated") {
            badgeClass = "badge-emerald";
            icon = "bi-check-circle-fill";
            label = status === "Donated" ? "Donated" : "Available";
        } else if (raw === "accepted") {
            badgeClass = "badge-purple";
            icon = "bi-check-circle";
            label = "Accepted";
        } else if (raw === "scheduled") {
            badgeClass = "badge-amber";
            icon = "bi-clock-history";
            label = "Scheduled";
        } else if (raw === "out for pickup") {
            badgeClass = "badge-sky";
            icon = "bi-truck";
            label = "Out For Pickup";
        } else if (raw === "delivered" || raw === "completed") {
            badgeClass = "badge-teal";
            icon = "bi-check2-all";
            label = status === "Completed" ? "Completed" : "Delivered";
        } else if (raw === "expired") {
            badgeClass = "badge-rose";
            icon = "bi-exclamation-octagon-fill";
            label = "Expired";
        }

        return (
            <span className={`admin-tx-status-badge ${badgeClass}`}>
                <i className={`bi ${icon} me-1`}></i>
                {t(label)}
            </span>
        );
    };

    const getDonorDisplayName = (item) => {
        if (item.business_name && item.business_name.trim()) {
            return item.business_name;
        }
        if (item.donor_type === "INDIVIDUAL") {
            return t("Individual Donor");
        }
        return t("Business");
    };

    const isFilterActive = searchQuery.trim() !== "" || statusFilter !== "ALL" || categoryFilter !== "ALL";
    const startIdx = filteredAndSorted.length > 0 ? (currentPage - 1) * pageSize + 1 : 0;
    const endIdx = Math.min(currentPage * pageSize, filteredAndSorted.length);

    return (
        <div className="admin-wrapper">
            <AdminSidebar />

            <div className="admin-transactions-page">
                <TopNavbar />

                {/* Hero Banner */}
                <header className="admin-tx-hero-banner">
                    <div className="admin-tx-hero-content">
                        <div className="admin-tx-hero-badge">
                            <i className="bi bi-journal-check me-2"></i>
                            {t("Operational Ledger")}
                        </div>
                        <h1 className="admin-tx-hero-title">{t("Transactions")}</h1>
                        <p className="admin-tx-hero-subtitle">
                            {t("Complete operational ledger of all food redistribution and inventory lifecycle events.")}
                        </p>
                        <div className="admin-tx-hero-disclaimer">
                            <i className="bi bi-info-circle-fill"></i>
                            <span>{t("Operational Notice: FoodBridge tracks food redistribution lifecycle events. No financial payments or fees are processed on this platform.")}</span>
                        </div>
                    </div>

                    <div className="admin-tx-hero-actions">
                        <button
                            type="button"
                            className="admin-tx-refresh-btn"
                            onClick={() => fetchTransactions(true)}
                            disabled={loading || refreshing}
                            title={t("Refresh")}
                            aria-label={t("Refresh")}
                        >
                            <i className={`bi bi-arrow-clockwise ${refreshing ? "spin-icon" : ""}`}></i>
                            <span>{refreshing ? t("Refreshing...") : t("Refresh")}</span>
                        </button>
                    </div>
                </header>

                {/* Error Banner */}
                {error && (
                    <div className="admin-tx-error-card" role="alert">
                        <div className="d-flex align-items-center gap-2">
                            <i className="bi bi-exclamation-triangle-fill fs-5"></i>
                            <span>{error}</span>
                        </div>
                        <button
                            type="button"
                            className="admin-tx-retry-btn"
                            onClick={() => fetchTransactions(false)}
                        >
                            <i className="bi bi-arrow-repeat"></i>
                            {t("Retry")}
                        </button>
                    </div>
                )}

                {/* KPI Summary Cards */}
                <section className="admin-tx-kpi-grid" aria-label="Key Performance Indicators">
                    {loading ? (
                        [...Array(4)].map((_, i) => (
                            <div key={i} className="admin-tx-skeleton-card"></div>
                        ))
                    ) : (
                        <>
                            <div className="admin-tx-kpi-card">
                                <div className="admin-tx-kpi-icon blue">
                                    <i className="bi bi-journal-text"></i>
                                </div>
                                <div className="admin-tx-kpi-info">
                                    <div className="admin-tx-kpi-title">{t("Total Ledger Records")}</div>
                                    <div className="admin-tx-kpi-value">
                                        {formatLocalizedNumber(totalRecordsCount, language)}
                                    </div>
                                </div>
                            </div>

                            <div className="admin-tx-kpi-card">
                                <div className="admin-tx-kpi-icon teal">
                                    <i className="bi bi-check2-all"></i>
                                </div>
                                <div className="admin-tx-kpi-info">
                                    <div className="admin-tx-kpi-title">{t("Delivered & Completed")}</div>
                                    <div className="admin-tx-kpi-value">
                                        {formatLocalizedNumber(deliveredCount, language)}
                                    </div>
                                </div>
                            </div>

                            <div className="admin-tx-kpi-card">
                                <div className="admin-tx-kpi-icon purple">
                                    <i className="bi bi-arrow-repeat"></i>
                                </div>
                                <div className="admin-tx-kpi-info">
                                    <div className="admin-tx-kpi-title">{t("Accepted & Scheduled")}</div>
                                    <div className="admin-tx-kpi-value">
                                        {formatLocalizedNumber(inProgressCount, language)}
                                    </div>
                                </div>
                            </div>

                            <div className="admin-tx-kpi-card">
                                <div className="admin-tx-kpi-icon emerald">
                                    <i className="bi bi-box-seam"></i>
                                </div>
                                <div className="admin-tx-kpi-info">
                                    <div className="admin-tx-kpi-title">{t("Available / Listed")}</div>
                                    <div className="admin-tx-kpi-value">
                                        {formatLocalizedNumber(availableCount, language)}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </section>

                {/* Filters & Search Controls */}
                <section className="admin-tx-controls-card">
                    <div className="admin-tx-controls-row">
                        <div className="admin-tx-search-wrap">
                            <i className="bi bi-search admin-tx-search-icon"></i>
                            <input
                                type="text"
                                className="admin-tx-search-input"
                                placeholder={t("Search ledger by product, donor, address, ID...")}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                aria-label={t("Search ledger by product, donor, address, ID...")}
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    className="admin-tx-search-clear"
                                    onClick={() => setSearchQuery("")}
                                    aria-label={t("Clear Filters")}
                                >
                                    <i className="bi bi-x-circle-fill"></i>
                                </button>
                            )}
                        </div>

                        <div className="admin-tx-filter-group">
                            <select
                                className="admin-tx-select"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                aria-label={t("Status")}
                            >
                                {STATUS_CHOICES.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {t(opt.labelKey)}
                                    </option>
                                ))}
                            </select>

                            <select
                                className="admin-tx-select"
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                aria-label={t("Category")}
                            >
                                {CATEGORY_CHOICES.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {t(opt.labelKey)}
                                    </option>
                                ))}
                            </select>

                            {isFilterActive && (
                                <button
                                    type="button"
                                    className="admin-tx-reset-btn"
                                    onClick={handleClearFilters}
                                >
                                    <i className="bi bi-arrow-counterclockwise"></i>
                                    {t("Reset Filters")}
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                {/* Ledger Table Card */}
                <section className="admin-tx-table-card">
                    <div className="admin-tx-table-header">
                        <div className="admin-tx-table-title">
                            <span>{t("Transactions")}</span>
                            <span className="admin-tx-table-badge">
                                {formatLocalizedNumber(filteredAndSorted.length, language)}
                            </span>
                        </div>

                        <div className="d-flex align-items-center gap-2">
                            <label htmlFor="txPageSizeSelect" className="small text-muted mb-0">
                                {t("Items per page")}:
                            </label>
                            <select
                                id="txPageSizeSelect"
                                className="admin-tx-pagesize-select"
                                value={pageSize}
                                onChange={(e) => setPageSize(Number(e.target.value))}
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                            </select>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table admin-tx-table align-middle mb-0">
                            <thead>
                                <tr>
                                    <th
                                        scope="col"
                                        className="sortable-th text-nowrap"
                                        onClick={() => handleSort("id")}
                                    >
                                        {t("Record ID")}{" "}
                                        {sortField === "id" ? (
                                            <i className={`bi bi-arrow-${sortDirection === "asc" ? "up" : "down"}`}></i>
                                        ) : (
                                            <i className="bi bi-arrow-down-up text-muted opacity-50"></i>
                                        )}
                                    </th>
                                    <th
                                        scope="col"
                                        className="sortable-th"
                                        onClick={() => handleSort("product_name")}
                                    >
                                        {t("Product")}{" "}
                                        {sortField === "product_name" ? (
                                            <i className={`bi bi-arrow-${sortDirection === "asc" ? "up" : "down"}`}></i>
                                        ) : (
                                            <i className="bi bi-arrow-down-up text-muted opacity-50"></i>
                                        )}
                                    </th>
                                    <th scope="col">{t("Category")}</th>
                                    <th
                                        scope="col"
                                        className="sortable-th"
                                        onClick={() => handleSort("quantity")}
                                    >
                                        {t("Quantity")}{" "}
                                        {sortField === "quantity" ? (
                                            <i className={`bi bi-arrow-${sortDirection === "asc" ? "up" : "down"}`}></i>
                                        ) : (
                                            <i className="bi bi-arrow-down-up text-muted opacity-50"></i>
                                        )}
                                    </th>
                                    <th scope="col">{t("Donor / Business")}</th>
                                    <th scope="col">{t("Donor Type")}</th>
                                    <th
                                        scope="col"
                                        className="sortable-th"
                                        onClick={() => handleSort("status")}
                                    >
                                        {t("Lifecycle Status")}{" "}
                                        {sortField === "status" ? (
                                            <i className={`bi bi-arrow-${sortDirection === "asc" ? "up" : "down"}`}></i>
                                        ) : (
                                            <i className="bi bi-arrow-down-up text-muted opacity-50"></i>
                                        )}
                                    </th>
                                    <th
                                        scope="col"
                                        className="sortable-th text-nowrap"
                                        onClick={() => handleSort("created_at")}
                                    >
                                        {t("Created Date")}{" "}
                                        {sortField === "created_at" ? (
                                            <i className={`bi bi-arrow-${sortDirection === "asc" ? "up" : "down"}`}></i>
                                        ) : (
                                            <i className="bi bi-arrow-down-up text-muted opacity-50"></i>
                                        )}
                                    </th>
                                    <th scope="col" className="text-end">{t("Actions")}</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    [...Array(6)].map((_, i) => (
                                        <tr key={i} className="admin-tx-skeleton-row">
                                            <td colSpan="9">
                                                <div className="admin-tx-skeleton-line"></div>
                                            </td>
                                        </tr>
                                    ))
                                ) : transactions.length === 0 ? (
                                    /* CASE A: No records exist in database */
                                    <tr>
                                        <td colSpan="9">
                                            <div className="admin-tx-empty-state">
                                                <div className="admin-tx-empty-icon">
                                                    <i className="bi bi-journal-x"></i>
                                                </div>
                                                <h3 className="admin-tx-empty-title">{t("No ledger records available.")}</h3>
                                                <p className="admin-tx-empty-sub">
                                                    {t("Operational records will appear here as food is listed, accepted, and redistributed.")}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredAndSorted.length === 0 ? (
                                    /* CASE B: Filter/search produced zero matches */
                                    <tr>
                                        <td colSpan="9">
                                            <div className="admin-tx-empty-state">
                                                <div className="admin-tx-empty-icon">
                                                    <i className="bi bi-funnel"></i>
                                                </div>
                                                <h3 className="admin-tx-empty-title">{t("No ledger records match your filters.")}</h3>
                                                <p className="admin-tx-empty-sub">
                                                    {t("Try adjusting your search terms or reset applied filters.")}
                                                </p>
                                                <button
                                                    type="button"
                                                    className="btn btn-primary"
                                                    onClick={handleClearFilters}
                                                >
                                                    <i className="bi bi-arrow-counterclockwise me-2"></i>
                                                    {t("Clear Filters")}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedRecords.map((item) => (
                                        <tr key={item.id} className="admin-tx-row">
                                            <td className="fw-semibold text-muted text-nowrap">#{item.id}</td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className="admin-tx-item-icon me-2">
                                                        <i className="bi bi-box2"></i>
                                                    </div>
                                                    <div>
                                                        <span className="fw-semibold text-main">{t(item.product_name)}</span>
                                                        {item.brand && (
                                                            <small className="d-block text-muted">{item.brand}</small>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge bg-light text-dark border">
                                                    {t(item.category)}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="fw-bold">
                                                    {formatLocalizedNumber(item.quantity, language)} {t(item.unit)}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="text-secondary fw-medium">
                                                    {getDonorDisplayName(item)}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`admin-tx-donor-badge ${item.donor_type === "INDIVIDUAL" ? "individual" : "business"}`}>
                                                    {item.donor_type === "INDIVIDUAL" ? t("Individual") : t("Business")}
                                                </span>
                                            </td>
                                            <td>{getStatusBadge(item.status)}</td>
                                            <td>
                                                <span className="text-nowrap small text-muted">
                                                    {formatLocalizedDate(item.created_at, language)}
                                                </span>
                                            </td>
                                            <td className="text-end">
                                                <button
                                                    type="button"
                                                    className="admin-tx-view-btn"
                                                    onClick={() => setSelectedRecord(item)}
                                                    title={t("View Details")}
                                                    aria-label={`${t("View Details")} ${item.product_name}`}
                                                >
                                                    <i className="bi bi-eye"></i>
                                                    {t("View Details")}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {!loading && filteredAndSorted.length > 0 && (
                        <div className="admin-tx-pagination-bar">
                            <div className="admin-tx-pagination-info">
                                {t("Showing")} {formatLocalizedNumber(startIdx, language)} {t("to")}{" "}
                                {formatLocalizedNumber(endIdx, language)} {t("of")}{" "}
                                {formatLocalizedNumber(filteredAndSorted.length, language)} {t("records")}
                            </div>

                            <div className="admin-tx-pagination-controls">
                                <button
                                    type="button"
                                    className="admin-tx-page-btn"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                    aria-label={t("Previous")}
                                >
                                    <i className="bi bi-chevron-left"></i>
                                    <span>{t("Previous")}</span>
                                </button>

                                <span className="admin-tx-page-indicator">
                                    {t("Page")} {formatLocalizedNumber(currentPage, language)} /{" "}
                                    {formatLocalizedNumber(totalPages, language)}
                                </span>

                                <button
                                    type="button"
                                    className="admin-tx-page-btn"
                                    disabled={currentPage >= totalPages}
                                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                    aria-label={t("Next")}
                                >
                                    <span>{t("Next")}</span>
                                    <i className="bi bi-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                    )}
                </section>
            </div>

            {/* View Details Modal */}
            {selectedRecord && (
                <div
                    className="admin-tx-modal-backdrop"
                    onClick={() => setSelectedRecord(null)}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="txModalTitle"
                >
                    <div
                        className="admin-tx-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="admin-tx-modal-header">
                            <div className="admin-tx-modal-title" id="txModalTitle">
                                <i className="bi bi-journal-text text-primary"></i>
                                <span>{t("Ledger Record Details")}</span>
                                <span className="badge bg-secondary-subtle text-secondary small">
                                    #{selectedRecord.id}
                                </span>
                            </div>
                            <button
                                type="button"
                                className="admin-tx-modal-close"
                                onClick={() => setSelectedRecord(null)}
                                aria-label={t("Close")}
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>

                        <div className="admin-tx-modal-body">
                            {/* Section 1: Item Details */}
                            <div className="admin-tx-modal-section">
                                <div className="admin-tx-modal-section-title">
                                    <i className="bi bi-box-seam"></i>
                                    {t("Record Information")}
                                </div>
                                <div className="admin-tx-modal-grid">
                                    <div className="admin-tx-detail-item">
                                        <div className="admin-tx-detail-label">{t("Product")}</div>
                                        <div className="admin-tx-detail-value">{t(selectedRecord.product_name)}</div>
                                    </div>

                                    <div className="admin-tx-detail-item">
                                        <div className="admin-tx-detail-label">{t("Brand")}</div>
                                        <div className="admin-tx-detail-value">
                                            {selectedRecord.brand || t("Not Specified")}
                                        </div>
                                    </div>

                                    <div className="admin-tx-detail-item">
                                        <div className="admin-tx-detail-label">{t("Category")}</div>
                                        <div className="admin-tx-detail-value">{t(selectedRecord.category)}</div>
                                    </div>

                                    <div className="admin-tx-detail-item">
                                        <div className="admin-tx-detail-label">{t("Quantity")}</div>
                                        <div className="admin-tx-detail-value">
                                            {formatLocalizedNumber(selectedRecord.quantity, language)} {t(selectedRecord.unit)}
                                        </div>
                                    </div>

                                    <div className="admin-tx-detail-item">
                                        <div className="admin-tx-detail-label">{t("Lifecycle Status")}</div>
                                        <div className="admin-tx-detail-value">
                                            {getStatusBadge(selectedRecord.status)}
                                        </div>
                                    </div>

                                    <div className="admin-tx-detail-item">
                                        <div className="admin-tx-detail-label">{t("Storage Type")}</div>
                                        <div className="admin-tx-detail-value">
                                            {t(selectedRecord.storage_type || "Room Temperature")}
                                        </div>
                                    </div>

                                    <div className="admin-tx-detail-item">
                                        <div className="admin-tx-detail-label">{t("Expiry Date")}</div>
                                        <div className="admin-tx-detail-value">
                                            {formatLocalizedDate(selectedRecord.expiry_date, language)}
                                        </div>
                                    </div>

                                    <div className="admin-tx-detail-item">
                                        <div className="admin-tx-detail-label">{t("Created Date")}</div>
                                        <div className="admin-tx-detail-value">
                                            {formatLocalizedDate(selectedRecord.created_at, language)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Donor Information */}
                            <div className="admin-tx-modal-section">
                                <div className="admin-tx-modal-section-title">
                                    <i className="bi bi-person-badge"></i>
                                    {t("Donor / Business")}
                                </div>
                                <div className="admin-tx-modal-grid">
                                    <div className="admin-tx-detail-item">
                                        <div className="admin-tx-detail-label">{t("Donor / Business")}</div>
                                        <div className="admin-tx-detail-value">
                                            {getDonorDisplayName(selectedRecord)}
                                        </div>
                                    </div>

                                    <div className="admin-tx-detail-item">
                                        <div className="admin-tx-detail-label">{t("Donor Type")}</div>
                                        <div className="admin-tx-detail-value">
                                            {selectedRecord.donor_type === "INDIVIDUAL" ? t("Individual Donor") : t("Business")}
                                        </div>
                                    </div>

                                    <div className="admin-tx-detail-item">
                                        <div className="admin-tx-detail-label">{t("Contact Number")}</div>
                                        <div className="admin-tx-detail-value">
                                            {selectedRecord.contact_number || t("Not Specified")}
                                        </div>
                                    </div>

                                    <div className="admin-tx-detail-item">
                                        <div className="admin-tx-detail-label">{t("Pickup Address")}</div>
                                        <div className="admin-tx-detail-value">
                                            {selectedRecord.pickup_address || t("Not Specified")}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Logistics & Lifecycle */}
                            {(selectedRecord.pickup_date || selectedRecord.vehicle_number || selectedRecord.pickup_verified || selectedRecord.delivery_verified) && (
                                <div className="admin-tx-modal-section">
                                    <div className="admin-tx-modal-section-title">
                                        <i className="bi bi-truck"></i>
                                        {t("Logistics & Lifecycle")}
                                    </div>
                                    <div className="admin-tx-modal-grid">
                                        {selectedRecord.pickup_date && (
                                            <div className="admin-tx-detail-item">
                                                <div className="admin-tx-detail-label">{t("Pickup Schedule")}</div>
                                                <div className="admin-tx-detail-value">
                                                    {formatLocalizedDate(selectedRecord.pickup_date, language)} {selectedRecord.pickup_time || ""}
                                                </div>
                                            </div>
                                        )}

                                        {selectedRecord.vehicle_number && (
                                            <div className="admin-tx-detail-item">
                                                <div className="admin-tx-detail-label">{t("Vehicle Number")}</div>
                                                <div className="admin-tx-detail-value">
                                                    {selectedRecord.vehicle_number}
                                                </div>
                                            </div>
                                        )}

                                        <div className="admin-tx-detail-item">
                                            <div className="admin-tx-detail-label">{t("Verification Status")}</div>
                                            <div className="admin-tx-detail-value d-flex gap-2 align-items-center">
                                                {selectedRecord.pickup_verified && (
                                                    <span className="badge bg-success-subtle text-success">
                                                        <i className="bi bi-check-circle me-1"></i>
                                                        {t("Pickup Verified")}
                                                    </span>
                                                )}
                                                {selectedRecord.delivery_verified && (
                                                    <span className="badge bg-teal-subtle text-teal">
                                                        <i className="bi bi-check2-all me-1"></i>
                                                        {t("Delivery Verified")}
                                                    </span>
                                                )}
                                                {!selectedRecord.pickup_verified && !selectedRecord.delivery_verified && (
                                                    <span className="badge bg-warning-subtle text-warning">
                                                        <i className="bi bi-hourglass-split me-1"></i>
                                                        {t("Pending Verification")}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Honest Operational Notice */}
                            <div className="admin-tx-modal-notice">
                                <i className="bi bi-info-circle-fill text-primary mt-1"></i>
                                <span>{t("Operational Note: This record represents a physical food redistribution lifecycle event on FoodBridge.")}</span>
                            </div>
                        </div>

                        <div className="admin-tx-modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary admin-tx-modal-btn"
                                onClick={() => setSelectedRecord(null)}
                            >
                                {t("Close")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminTransactions;