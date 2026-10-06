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
import "../styles/AdminDonations.css";

const STATUS_CHOICES = [
    { value: "ALL", labelKey: "All Statuses" },
    { value: "Donated", labelKey: "Donated" },
    { value: "Accepted", labelKey: "Accepted" },
    { value: "Scheduled", labelKey: "Scheduled" },
    { value: "Out For Pickup", labelKey: "Out For Pickup" },
    { value: "Delivered", labelKey: "Delivered" }
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

function AdminDonations() {
    const t = useTranslate();
    const { language } = useTranslationContext();

    const [donations, setDonations] = useState([]);
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
    const [selectedDonation, setSelectedDonation] = useState(null);

    const dynamicLabels = useMemo(
        () =>
            buildDynamicLabels(
                LABELS.ADMIN_DONATIONS,
                donations,
                ["product_name", "category", "unit", "status"]
            ),
        [donations]
    );

    usePageTranslation(dynamicLabels);

    const fetchDonations = useCallback(async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        setError(null);

        try {
            const token = localStorage.getItem("access");
            const response = await axios.get(
                process.env.REACT_APP_API_URL + "/api/inventory/admin/donations/",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (Array.isArray(response.data)) {
                setDonations(response.data);
            } else {
                setDonations([]);
            }
        } catch (err) {
            console.error("Failed to fetch admin donations:", err);
            setError(t("Unable to load donation records."));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [t]);

    useEffect(() => {
        fetchDonations(false);
    }, [fetchDonations]);

    // Handle Escape key to dismiss modal
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && selectedDonation) {
                setSelectedDonation(null);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedDonation]);

    // Reset pagination when search or filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, categoryFilter, pageSize]);

    /* ==========================================================
       SUMMARY METRICS CALCULATION:
       Calculated strictly from the COMPLETE dataset (donations),
       NEVER from the filtered donation list!
       ========================================================== */
    const summaryMetrics = useMemo(() => {
        const total = donations.length;
        let donatedCount = 0;
        let acceptedCount = 0;
        let scheduledCount = 0;
        let outForPickupCount = 0;
        let deliveredCount = 0;

        for (let i = 0; i < donations.length; i++) {
            const st = (donations[i].status || "").toLowerCase().trim();
            if (st === "donated" || st === "available") {
                donatedCount++;
            } else if (st === "accepted") {
                acceptedCount++;
            } else if (st === "scheduled") {
                scheduledCount++;
            } else if (st === "out for pickup" || st === "out for delivery") {
                outForPickupCount++;
            } else if (st === "delivered" || st === "completed") {
                deliveredCount++;
            }
        }

        return {
            total,
            donated: donatedCount,
            accepted: acceptedCount,
            scheduled: scheduledCount,
            outForPickup: outForPickupCount,
            delivered: deliveredCount
        };
    }, [donations]);

    // Filter and Sort displayed records ONLY
    const filteredAndSorted = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        const filtered = donations.filter((item) => {
            // Search query matching real fields
            const matchesQuery =
                !query ||
                (item.product_name && item.product_name.toLowerCase().includes(query)) ||
                (item.category && item.category.toLowerCase().includes(query)) ||
                (item.business_name && item.business_name.toLowerCase().includes(query)) ||
                (item.status && item.status.toLowerCase().includes(query)) ||
                (item.pickup_address && item.pickup_address.toLowerCase().includes(query)) ||
                (item.donor_type && item.donor_type.toLowerCase().includes(query)) ||
                String(item.id).includes(query);

            // Status filter
            const rawStatus = (item.status || "").toLowerCase().trim();
            const filterLower = statusFilter.toLowerCase().trim();
            let matchesStatus = statusFilter === "ALL";

            if (!matchesStatus) {
                if (filterLower === "delivered") {
                    matchesStatus = rawStatus === "delivered" || rawStatus === "completed";
                } else if (filterLower === "out for pickup") {
                    matchesStatus = rawStatus === "out for pickup" || rawStatus === "out for delivery";
                } else if (filterLower === "donated") {
                    matchesStatus = rawStatus === "donated" || rawStatus === "available";
                } else {
                    matchesStatus = rawStatus === filterLower;
                }
            }

            // Category filter
            const matchesCategory =
                categoryFilter === "ALL" ||
                (item.category && item.category.toLowerCase().trim() === categoryFilter.toLowerCase().trim());

            return matchesQuery && matchesStatus && matchesCategory;
        });

        // Sorting
        filtered.sort((a, b) => {
            let aVal = a[sortField];
            let bVal = b[sortField];

            if (sortField === "id" || sortField === "quantity") {
                aVal = Number(aVal) || 0;
                bVal = Number(bVal) || 0;
                return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
            }

            if (sortField === "expiry_date" || sortField === "created_at") {
                aVal = new Date(aVal || 0).getTime();
                bVal = new Date(bVal || 0).getTime();
                return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
            }

            aVal = (aVal || "").toString().toLowerCase();
            bVal = (bVal || "").toString().toLowerCase();
            if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
            if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [donations, searchQuery, statusFilter, categoryFilter, sortField, sortDirection]);

    // Pagination slice
    const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / pageSize));
    const paginatedDonations = useMemo(() => {
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

        if (raw === "donated" || raw === "available") {
            badgeClass = "badge-emerald";
            icon = "bi-check-circle-fill";
            label = "Donated";
        } else if (raw === "accepted") {
            badgeClass = "badge-purple";
            icon = "bi-hand-thumbs-up-fill";
            label = "Accepted";
        } else if (raw === "scheduled") {
            badgeClass = "badge-amber";
            icon = "bi-calendar-event-fill";
            label = "Scheduled";
        } else if (raw === "out for pickup" || raw === "out for delivery") {
            badgeClass = "badge-sky";
            icon = "bi-truck";
            label = "Out For Pickup";
        } else if (raw === "delivered" || raw === "completed") {
            badgeClass = "badge-teal";
            icon = "bi-check2-all";
            label = "Delivered";
        } else if (raw === "expired") {
            badgeClass = "badge-rose";
            icon = "bi-exclamation-octagon-fill";
            label = "Expired";
        }

        return (
            <span className={`admin-don-status-badge ${badgeClass}`}>
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

    const startIdx = filteredAndSorted.length > 0 ? (currentPage - 1) * pageSize + 1 : 0;
    const endIdx = Math.min(currentPage * pageSize, filteredAndSorted.length);

    return (
        <div className="admin-wrapper">
            <AdminSidebar />

            <div className="admin-donations-page">
                <TopNavbar />

                {/* Header Banner */}
                <header className="admin-don-hero-banner">
                    <div className="admin-don-hero-content">
                        <div className="admin-don-hero-badge">
                            <i className="bi bi-gift me-2"></i>
                            {t("Donations Management")}
                        </div>
                        <h1 className="admin-don-hero-title">
                            {t("Donations Management")}
                        </h1>
                        <p className="admin-don-hero-subtitle">
                            {t("Monitor all donated food across the platform.")}
                        </p>
                    </div>

                    <div className="admin-don-hero-actions">
                        <span className="admin-don-total-pill">
                            <i className="bi bi-box2-heart me-2"></i>
                            {formatLocalizedNumber(summaryMetrics.total, language)} {t("Total Donations")}
                        </span>
                        <button
                            type="button"
                            className="btn btn-admin-don-refresh"
                            onClick={() => fetchDonations(true)}
                            disabled={loading || refreshing}
                            title={t("Refresh")}
                            aria-label={t("Refresh")}
                        >
                            <i className={`bi bi-arrow-clockwise me-2 ${refreshing ? "spin-icon" : ""}`}></i>
                            {refreshing ? t("Refreshing...") : t("Refresh")}
                        </button>
                    </div>
                </header>

                {/* Error Banner */}
                {error && (
                    <div className="admin-alert-banner alert alert-danger d-flex align-items-center justify-content-between" role="alert">
                        <div className="d-flex align-items-center">
                            <i className="bi bi-exclamation-triangle-fill fs-4 me-3"></i>
                            <div>
                                <strong>{error}</strong>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => fetchDonations(false)}
                        >
                            <i className="bi bi-arrow-repeat me-1"></i>
                            {t("Retry")}
                        </button>
                    </div>
                )}

                {/* Summary Cards Grid (Calculated from COMPLETE dataset) */}
                <section className="admin-don-kpi-grid">
                    <div className="admin-don-kpi-card kpi-border-blue">
                        <div className="admin-don-kpi-top">
                            <span className="admin-don-kpi-label">{t("Total Donations")}</span>
                            <div className="admin-don-kpi-icon icon-blue">
                                <i className="bi bi-box2-heart"></i>
                            </div>
                        </div>
                        <div className="admin-don-kpi-val text-blue">
                            {loading ? <span className="skeleton-placeholder-num"></span> : formatLocalizedNumber(summaryMetrics.total, language)}
                        </div>
                        <div className="admin-don-kpi-sub">{t("Monitor all donated food across the platform.")}</div>
                    </div>

                    <div className="admin-don-kpi-card kpi-border-green">
                        <div className="admin-don-kpi-top">
                            <span className="admin-don-kpi-label">{t("Donated")}</span>
                            <div className="admin-don-kpi-icon icon-green">
                                <i className="bi bi-check-circle"></i>
                            </div>
                        </div>
                        <div className="admin-don-kpi-val text-green">
                            {loading ? <span className="skeleton-placeholder-num"></span> : formatLocalizedNumber(summaryMetrics.donated, language)}
                        </div>
                        <div className="admin-don-kpi-sub">{t("Food items listed and awaiting acceptance.")}</div>
                    </div>

                    <div className="admin-don-kpi-card kpi-border-purple">
                        <div className="admin-don-kpi-top">
                            <span className="admin-don-kpi-label">{t("Accepted")}</span>
                            <div className="admin-don-kpi-icon icon-purple">
                                <i className="bi bi-hand-thumbs-up"></i>
                            </div>
                        </div>
                        <div className="admin-don-kpi-val text-purple">
                            {loading ? <span className="skeleton-placeholder-num"></span> : formatLocalizedNumber(summaryMetrics.accepted, language)}
                        </div>
                        <div className="admin-don-kpi-sub">{t("Donations accepted by partner NGOs.")}</div>
                    </div>

                    <div className="admin-don-kpi-card kpi-border-amber">
                        <div className="admin-don-kpi-top">
                            <span className="admin-don-kpi-label">{t("Scheduled")}</span>
                            <div className="admin-don-kpi-icon icon-amber">
                                <i className="bi bi-calendar-event"></i>
                            </div>
                        </div>
                        <div className="admin-don-kpi-val text-amber">
                            {loading ? <span className="skeleton-placeholder-num"></span> : formatLocalizedNumber(summaryMetrics.scheduled, language)}
                        </div>
                        <div className="admin-don-kpi-sub">{t("Pickup schedules created and awaiting collection.")}</div>
                    </div>

                    <div className="admin-don-kpi-card kpi-border-sky">
                        <div className="admin-don-kpi-top">
                            <span className="admin-don-kpi-label">{t("Out For Pickup")}</span>
                            <div className="admin-don-kpi-icon icon-sky">
                                <i className="bi bi-truck"></i>
                            </div>
                        </div>
                        <div className="admin-don-kpi-val text-sky">
                            {loading ? <span className="skeleton-placeholder-num"></span> : formatLocalizedNumber(summaryMetrics.outForPickup, language)}
                        </div>
                        <div className="admin-don-kpi-sub">{t("Pickups currently in transit.")}</div>
                    </div>

                    <div className="admin-don-kpi-card kpi-border-teal">
                        <div className="admin-don-kpi-top">
                            <span className="admin-don-kpi-label">{t("Delivered")}</span>
                            <div className="admin-don-kpi-icon icon-teal">
                                <i className="bi bi-check2-all"></i>
                            </div>
                        </div>
                        <div className="admin-don-kpi-val text-teal">
                            {loading ? <span className="skeleton-placeholder-num"></span> : formatLocalizedNumber(summaryMetrics.delivered, language)}
                        </div>
                        <div className="admin-don-kpi-sub">{t("Successfully completed deliveries.")}</div>
                    </div>
                </section>

                {/* Filter and Search Card */}
                <div className="admin-don-filter-card">
                    <div className="row g-3 align-items-center">
                        <div className="col-lg-5 col-md-12">
                            <div className="admin-don-search-input-wrap">
                                <i className="bi bi-search admin-don-search-icon" aria-hidden="true"></i>
                                <input
                                    type="text"
                                    className="form-control admin-don-search-field"
                                    placeholder={t("Search donations, donors, categories...")}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    aria-label={t("Search donations, donors, categories...")}
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        className="btn-clear-search"
                                        onClick={() => setSearchQuery("")}
                                        aria-label={t("Clear All")}
                                    >
                                        <i className="bi bi-x-circle-fill"></i>
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="col-lg-3 col-md-6 col-sm-6">
                            <select
                                className="form-select admin-don-select"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                aria-label={t("Status")}
                            >
                                {STATUS_CHOICES.map((choice) => (
                                    <option key={choice.value} value={choice.value}>
                                        {t(choice.labelKey)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-lg-3 col-md-6 col-sm-6">
                            <select
                                className="form-select admin-don-select"
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                aria-label={t("Category")}
                            >
                                {CATEGORY_CHOICES.map((choice) => (
                                    <option key={choice.value} value={choice.value}>
                                        {t(choice.labelKey)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-lg-1 col-md-12 d-flex justify-content-lg-end">
                            {(searchQuery || statusFilter !== "ALL" || categoryFilter !== "ALL") && (
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary w-100 admin-don-reset-btn"
                                    onClick={handleClearFilters}
                                    title={t("Reset Filters")}
                                    aria-label={t("Reset Filters")}
                                >
                                    <i className="bi bi-arrow-counterclockwise"></i>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Donations Table Card */}
                <div className="admin-don-table-card">
                    <div className="admin-don-table-header d-flex flex-wrap justify-content-between align-items-center gap-3">
                        <div className="d-flex align-items-center gap-2">
                            <h2 className="admin-don-table-title mb-0">{t("Total Donations")}</h2>
                            <span className="badge bg-primary-subtle text-primary fw-bold rounded-pill px-3 py-1">
                                {formatLocalizedNumber(filteredAndSorted.length, language)}
                            </span>
                        </div>

                        <div className="d-flex align-items-center gap-2">
                            <label htmlFor="donPageSizeSelect" className="small text-muted mb-0">
                                {t("Items per page")}:
                            </label>
                            <select
                                id="donPageSizeSelect"
                                className="form-select form-select-sm admin-don-pagesize-select"
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
                        <table className="table admin-don-table align-middle mb-0">
                            <thead>
                                <tr>
                                    <th
                                        scope="col"
                                        className="sortable-th text-nowrap"
                                        onClick={() => handleSort("id")}
                                    >
                                        {t("ID")}{" "}
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
                                        {t("Status")}{" "}
                                        {sortField === "status" ? (
                                            <i className={`bi bi-arrow-${sortDirection === "asc" ? "up" : "down"}`}></i>
                                        ) : (
                                            <i className="bi bi-arrow-down-up text-muted opacity-50"></i>
                                        )}
                                    </th>
                                    <th
                                        scope="col"
                                        className="sortable-th"
                                        onClick={() => handleSort("expiry_date")}
                                    >
                                        {t("Expiry")}{" "}
                                        {sortField === "expiry_date" ? (
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
                                        <tr key={i} className="admin-don-skeleton-row">
                                            <td colSpan="9">
                                                <div className="skeleton-table-line"></div>
                                            </td>
                                        </tr>
                                    ))
                                ) : donations.length === 0 ? (
                                    /* CASE A: Zero donation records returned by API */
                                    <tr>
                                        <td colSpan="9" className="text-center py-5">
                                            <div className="admin-don-empty-state">
                                                <div className="empty-icon-wrap">
                                                    <i className="bi bi-inbox"></i>
                                                </div>
                                                <h3 className="empty-title">{t("No donation records available.")}</h3>
                                                <p className="empty-sub text-muted">
                                                    {t("Monitor all donated food across the platform.")}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredAndSorted.length === 0 ? (
                                    /* CASE B: Donations exist but search/filter produced 0 matches */
                                    <tr>
                                        <td colSpan="9" className="text-center py-5">
                                            <div className="admin-don-empty-state">
                                                <div className="empty-icon-wrap">
                                                    <i className="bi bi-funnel"></i>
                                                </div>
                                                <h3 className="empty-title">{t("No donation records match your filters.")}</h3>
                                                <p className="empty-sub text-muted">
                                                    {t("Try refining your search terms or reset applied filters.")}
                                                </p>
                                                <button
                                                    type="button"
                                                    className="btn btn-primary mt-2"
                                                    onClick={handleClearFilters}
                                                >
                                                    <i className="bi bi-x-circle me-2"></i>
                                                    {t("Clear Filters")}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedDonations.map((item) => (
                                        <tr key={item.id} className="admin-don-row">
                                            <td className="fw-semibold text-muted text-nowrap">#{item.id}</td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className="admin-don-item-icon me-2">
                                                        <i className="bi bi-box2-heart"></i>
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
                                                <span className={`badge ${item.donor_type === "INDIVIDUAL" ? "bg-info-subtle text-info border border-info-subtle" : "bg-primary-subtle text-primary border border-primary-subtle"}`}>
                                                    {item.donor_type === "INDIVIDUAL" ? t("Individual") : t("Business")}
                                                </span>
                                            </td>
                                            <td>{getStatusBadge(item.status)}</td>
                                            <td>
                                                <span className="text-nowrap small text-muted">
                                                    {formatLocalizedDate(item.expiry_date, language)}
                                                </span>
                                            </td>
                                            <td className="text-end">
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-primary admin-don-view-btn"
                                                    onClick={() => setSelectedDonation(item)}
                                                    title={t("View Details")}
                                                    aria-label={`${t("View Details")} ${item.product_name}`}
                                                >
                                                    <i className="bi bi-eye me-1"></i>
                                                    {t("View Details")}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Bar */}
                    {!loading && filteredAndSorted.length > 0 && (
                        <div className="admin-don-pagination-bar d-flex flex-wrap align-items-center justify-content-between p-3 border-top">
                            <div className="text-muted small">
                                {t("Showing")} {formatLocalizedNumber(startIdx, language)} {t("to")}{" "}
                                {formatLocalizedNumber(endIdx, language)} {t("of")}{" "}
                                {formatLocalizedNumber(filteredAndSorted.length, language)} {t("donations")}
                            </div>

                            <nav aria-label="Donations pagination">
                                <ul className="pagination pagination-sm mb-0">
                                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                        <button
                                            type="button"
                                            className="page-link"
                                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            aria-label={t("Previous")}
                                        >
                                            <i className="bi bi-chevron-left me-1"></i>
                                            {t("Previous")}
                                        </button>
                                    </li>

                                    <li className="page-item disabled">
                                        <span className="page-link">
                                            {t("Page")} {formatLocalizedNumber(currentPage, language)} / {formatLocalizedNumber(totalPages, language)}
                                        </span>
                                    </li>

                                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                        <button
                                            type="button"
                                            className="page-link"
                                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            aria-label={t("Next")}
                                        >
                                            {t("Next")}
                                            <i className="bi bi-chevron-right ms-1"></i>
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    )}
                </div>

                {/* View Details Modal */}
                {selectedDonation && (
                    <div
                        className="modal fade show admin-modal-backdrop"
                        style={{ display: "block" }}
                        tabIndex="-1"
                        role="dialog"
                        aria-modal="true"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) {
                                setSelectedDonation(null);
                            }
                        }}
                    >
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <div className="modal-content admin-modal-content">
                                <div className="modal-header border-bottom">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="admin-modal-header-icon bg-primary text-white">
                                            <i className="bi bi-gift"></i>
                                        </div>
                                        <div>
                                            <h4 className="modal-title fw-bold mb-0">
                                                {t(selectedDonation.product_name)}
                                            </h4>
                                            <span className="text-muted small">
                                                {t("ID")}: #{selectedDonation.id}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        aria-label={t("Close")}
                                        onClick={() => setSelectedDonation(null)}
                                    ></button>
                                </div>

                                <div className="modal-body py-4">
                                    <div className="row g-3">
                                        <div className="col-md-4 col-sm-6">
                                            <div className="detail-field-box">
                                                <span className="detail-field-label">{t("Status")}</span>
                                                <div className="mt-1">{getStatusBadge(selectedDonation.status)}</div>
                                            </div>
                                        </div>

                                        <div className="col-md-4 col-sm-6">
                                            <div className="detail-field-box">
                                                <span className="detail-field-label">{t("Category")}</span>
                                                <div className="detail-field-value">{t(selectedDonation.category)}</div>
                                            </div>
                                        </div>

                                        <div className="col-md-4 col-sm-6">
                                            <div className="detail-field-box">
                                                <span className="detail-field-label">{t("Quantity")}</span>
                                                <div className="detail-field-value">
                                                    {formatLocalizedNumber(selectedDonation.quantity, language)} {t(selectedDonation.unit)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-md-6 col-sm-6">
                                            <div className="detail-field-box">
                                                <span className="detail-field-label">{t("Donor / Business")}</span>
                                                <div className="detail-field-value">
                                                    {getDonorDisplayName(selectedDonation)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-md-6 col-sm-6">
                                            <div className="detail-field-box">
                                                <span className="detail-field-label">{t("Donor Type")}</span>
                                                <div className="detail-field-value">
                                                    {selectedDonation.donor_type === "INDIVIDUAL" ? t("Individual Donor") : t("Business")}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-md-6 col-sm-6">
                                            <div className="detail-field-box">
                                                <span className="detail-field-label">{t("Storage Type")}</span>
                                                <div className="detail-field-value">
                                                    {t(selectedDonation.storage_type || "Room Temperature")}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-md-6 col-sm-6">
                                            <div className="detail-field-box">
                                                <span className="detail-field-label">{t("Expiry Date")}</span>
                                                <div className="detail-field-value">
                                                    {formatLocalizedDate(selectedDonation.expiry_date, language)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-md-6 col-sm-6">
                                            <div className="detail-field-box">
                                                <span className="detail-field-label">{t("Created Date")}</span>
                                                <div className="detail-field-value">
                                                    {formatLocalizedDate(selectedDonation.created_at, language)}
                                                </div>
                                            </div>
                                        </div>

                                        {selectedDonation.pickup_address && (
                                            <div className="col-12">
                                                <div className="detail-field-box">
                                                    <span className="detail-field-label">{t("Pickup Address")}</span>
                                                    <div className="detail-field-value">
                                                        <i className="bi bi-geo-alt me-1 text-danger"></i>
                                                        {selectedDonation.pickup_address}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {selectedDonation.contact_number && (
                                            <div className="col-md-6">
                                                <div className="detail-field-box">
                                                    <span className="detail-field-label">{t("Contact Number")}</span>
                                                    <div className="detail-field-value">
                                                        <i className="bi bi-telephone me-1 text-primary"></i>
                                                        {selectedDonation.contact_number}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {selectedDonation.description && (
                                            <div className="col-12">
                                                <div className="detail-field-box">
                                                    <span className="detail-field-label">{t("Description")}</span>
                                                    <div className="detail-field-value">
                                                        {selectedDonation.description}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="modal-footer border-top">
                                    <button
                                        type="button"
                                        className="btn btn-secondary px-4"
                                        onClick={() => setSelectedDonation(null)}
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

export default AdminDonations;