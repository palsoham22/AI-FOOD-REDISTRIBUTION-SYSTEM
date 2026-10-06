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
import "../styles/AdminInventory.css";

const STATUS_CHOICES = [
    { value: "ALL", labelKey: "All Statuses" },
    { value: "Available", labelKey: "Available" },
    { value: "Donated", labelKey: "Donated" },
    { value: "Accepted", labelKey: "Accepted" },
    { value: "Scheduled", labelKey: "Scheduled" },
    { value: "Out For Pickup", labelKey: "Out For Pickup" },
    { value: "Delivered", labelKey: "Delivered" },
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

function AdminInventory() {
    const t = useTranslate();
    const { language } = useTranslationContext();

    const [inventory, setInventory] = useState([]);
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
    const [selectedProduct, setSelectedProduct] = useState(null);

    const dynamicLabels = useMemo(
        () =>
            buildDynamicLabels(
                LABELS.ADMIN_INVENTORY,
                inventory,
                ["product_name", "category", "unit", "status"]
            ),
        [inventory]
    );

    usePageTranslation(dynamicLabels);

    const fetchInventory = useCallback(async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        setError(null);

        try {
            const token = localStorage.getItem("access");
            const response = await axios.get(
                process.env.REACT_APP_API_URL + "/api/inventory/admin/inventory/",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (Array.isArray(response.data)) {
                setInventory(response.data);
            } else {
                setInventory([]);
            }
        } catch (err) {
            console.error("Failed to fetch admin inventory:", err);
            setError(t("Unable to load inventory data."));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [t]);

    useEffect(() => {
        fetchInventory(false);
    }, [fetchInventory]);

    // Handle Escape key to dismiss modal
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && selectedProduct) {
                setSelectedProduct(null);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedProduct]);

    // Reset pagination when search or filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, categoryFilter, pageSize]);

    /* ==========================================================
       IMPORTANT KPI CALCULATION FIX:
       KPI metrics are calculated from the COMPLETE dataset (inventory),
       NEVER from the filtered product list!
       ========================================================== */
    const kpiMetrics = useMemo(() => {
        const total = inventory.length;
        let availableCount = 0;
        let acceptedCount = 0;
        let scheduledCount = 0;
        let inTransitCount = 0;
        let deliveredCount = 0;
        let expiredCount = 0;

        for (let i = 0; i < inventory.length; i++) {
            const st = (inventory[i].status || "").toLowerCase().trim();
            if (st === "available" || st === "donated") {
                availableCount++;
            } else if (st === "accepted") {
                acceptedCount++;
            } else if (st === "scheduled") {
                scheduledCount++;
            } else if (st === "out for pickup" || st === "out for delivery") {
                inTransitCount++;
            } else if (st === "delivered" || st === "completed") {
                deliveredCount++;
            } else if (st === "expired") {
                expiredCount++;
            }
        }

        return {
            total,
            available: availableCount,
            accepted: acceptedCount,
            scheduled: scheduledCount,
            inTransit: inTransitCount,
            delivered: deliveredCount,
            expired: expiredCount
        };
    }, [inventory]);

    // Filter and Sort displayed records ONLY
    const filteredAndSorted = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        const filtered = inventory.filter((item) => {
            // Search query matching real fields
            const matchesQuery =
                !query ||
                (item.product_name && item.product_name.toLowerCase().includes(query)) ||
                (item.category && item.category.toLowerCase().includes(query)) ||
                (item.business_name && item.business_name.toLowerCase().includes(query)) ||
                (item.status && item.status.toLowerCase().includes(query)) ||
                (item.pickup_address && item.pickup_address.toLowerCase().includes(query)) ||
                (item.storage_type && item.storage_type.toLowerCase().includes(query)) ||
                String(item.id).includes(query);

            // Status filter
            const matchesStatus =
                statusFilter === "ALL" ||
                (item.status && item.status.toLowerCase().trim() === statusFilter.toLowerCase().trim());

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
    }, [inventory, searchQuery, statusFilter, categoryFilter, sortField, sortDirection]);

    // Pagination slice
    const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / pageSize));
    const paginatedProducts = useMemo(() => {
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

        if (raw === "available" || raw === "donated") {
            badgeClass = "badge-emerald";
            icon = "bi-check-circle-fill";
        } else if (raw === "accepted") {
            badgeClass = "badge-purple";
            icon = "bi-hand-thumbs-up-fill";
        } else if (raw === "scheduled") {
            badgeClass = "badge-amber";
            icon = "bi-calendar-event-fill";
        } else if (raw === "out for pickup" || raw === "out for delivery") {
            badgeClass = "badge-sky";
            icon = "bi-truck";
        } else if (raw === "delivered" || raw === "completed") {
            badgeClass = "badge-teal";
            icon = "bi-check2-all";
        } else if (raw === "expired") {
            badgeClass = "badge-rose";
            icon = "bi-exclamation-octagon-fill";
        }

        return (
            <span className={`admin-status-badge ${badgeClass}`}>
                <i className={`bi ${icon} me-1`}></i>
                {t(status || "Available")}
            </span>
        );
    };

    const getOwnerDisplayName = (item) => {
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

            <div className="admin-inventory-page">
                <TopNavbar />

                {/* Header Banner */}
                <header className="admin-inv-hero-banner">
                    <div className="admin-inv-hero-content">
                        <div className="admin-inv-hero-badge">
                            <i className="bi bi-boxes me-2"></i>
                            {t("Inventory Management")}
                        </div>
                        <h1 className="admin-inv-hero-title">
                            {t("Inventory Management")}
                        </h1>
                        <p className="admin-inv-hero-subtitle">
                            {t("Monitor and manage all inventory items across the FoodBridge AI platform.")}
                        </p>
                    </div>

                    <div className="admin-inv-hero-actions">
                        <span className="admin-inv-total-pill">
                            <i className="bi bi-box-seam me-2"></i>
                            {formatLocalizedNumber(kpiMetrics.total, language)} {t("Total Products")}
                        </span>
                        <button
                            type="button"
                            className="btn btn-admin-inv-refresh"
                            onClick={() => fetchInventory(true)}
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
                            onClick={() => fetchInventory(false)}
                        >
                            <i className="bi bi-arrow-repeat me-1"></i>
                            {t("Retry")}
                        </button>
                    </div>
                )}

                {/* KPI Cards Section (Fixed Architecture: Always shows complete dataset counts) */}
                <section className="admin-inv-kpi-grid">
                    <div className="admin-inv-kpi-card kpi-border-blue">
                        <div className="admin-inv-kpi-top">
                            <span className="admin-inv-kpi-label">{t("Total Products")}</span>
                            <div className="admin-inv-kpi-icon icon-blue">
                                <i className="bi bi-boxes"></i>
                            </div>
                        </div>
                        <div className="admin-inv-kpi-val text-blue">
                            {loading ? <span className="skeleton-placeholder-num"></span> : formatLocalizedNumber(kpiMetrics.total, language)}
                        </div>
                        <div className="admin-inv-kpi-sub">{t("Products currently managed in inventory.")}</div>
                    </div>

                    <div className="admin-inv-kpi-card kpi-border-green">
                        <div className="admin-inv-kpi-top">
                            <span className="admin-inv-kpi-label">{t("Available / Donated")}</span>
                            <div className="admin-inv-kpi-icon icon-green">
                                <i className="bi bi-check-circle"></i>
                            </div>
                        </div>
                        <div className="admin-inv-kpi-val text-green">
                            {loading ? <span className="skeleton-placeholder-num"></span> : formatLocalizedNumber(kpiMetrics.available, language)}
                        </div>
                        <div className="admin-inv-kpi-sub">{t("Food items listed and awaiting acceptance.")}</div>
                    </div>

                    <div className="admin-inv-kpi-card kpi-border-purple">
                        <div className="admin-inv-kpi-top">
                            <span className="admin-inv-kpi-label">{t("Accepted")}</span>
                            <div className="admin-inv-kpi-icon icon-purple">
                                <i className="bi bi-hand-thumbs-up"></i>
                            </div>
                        </div>
                        <div className="admin-inv-kpi-val text-purple">
                            {loading ? <span className="skeleton-placeholder-num"></span> : formatLocalizedNumber(kpiMetrics.accepted, language)}
                        </div>
                        <div className="admin-inv-kpi-sub">{t("Donations accepted by partner NGOs.")}</div>
                    </div>

                    <div className="admin-inv-kpi-card kpi-border-amber">
                        <div className="admin-inv-kpi-top">
                            <span className="admin-inv-kpi-label">{t("Scheduled")}</span>
                            <div className="admin-inv-kpi-icon icon-amber">
                                <i className="bi bi-calendar-event"></i>
                            </div>
                        </div>
                        <div className="admin-inv-kpi-val text-amber">
                            {loading ? <span className="skeleton-placeholder-num"></span> : formatLocalizedNumber(kpiMetrics.scheduled, language)}
                        </div>
                        <div className="admin-inv-kpi-sub">{t("Pickup schedules created and awaiting collection.")}</div>
                    </div>

                    <div className="admin-inv-kpi-card kpi-border-teal">
                        <div className="admin-inv-kpi-top">
                            <span className="admin-inv-kpi-label">{t("Delivered")}</span>
                            <div className="admin-inv-kpi-icon icon-teal">
                                <i className="bi bi-check2-all"></i>
                            </div>
                        </div>
                        <div className="admin-inv-kpi-val text-teal">
                            {loading ? <span className="skeleton-placeholder-num"></span> : formatLocalizedNumber(kpiMetrics.delivered, language)}
                        </div>
                        <div className="admin-inv-kpi-sub">{t("Successfully completed deliveries.")}</div>
                    </div>

                    <div className="admin-inv-kpi-card kpi-border-rose">
                        <div className="admin-inv-kpi-top">
                            <span className="admin-inv-kpi-label">{t("Expired")}</span>
                            <div className="admin-inv-kpi-icon icon-rose">
                                <i className="bi bi-exclamation-octagon"></i>
                            </div>
                        </div>
                        <div className="admin-inv-kpi-val text-rose">
                            {loading ? <span className="skeleton-placeholder-num"></span> : formatLocalizedNumber(kpiMetrics.expired, language)}
                        </div>
                        <div className="admin-inv-kpi-sub">{t("Items past shelf-life threshold.")}</div>
                    </div>
                </section>

                {/* Filter and Search Bar */}
                <div className="admin-inv-filter-card">
                    <div className="row g-3 align-items-center">
                        <div className="col-lg-5 col-md-12">
                            <div className="admin-inv-search-input-wrap">
                                <i className="bi bi-search admin-inv-search-icon" aria-hidden="true"></i>
                                <input
                                    type="text"
                                    className="form-control admin-inv-search-field"
                                    placeholder={t("Search products, donors, categories...")}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    aria-label={t("Search products, donors, categories...")}
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
                                className="form-select admin-inv-select"
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
                                className="form-select admin-inv-select"
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
                                    className="btn btn-outline-secondary w-100 admin-inv-reset-btn"
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

                {/* Main Table Card */}
                <div className="admin-inv-table-card">
                    <div className="admin-inv-table-header d-flex flex-wrap justify-content-between align-items-center gap-3">
                        <div className="d-flex align-items-center gap-2">
                            <h2 className="admin-inv-table-title mb-0">{t("Total Products")}</h2>
                            <span className="badge bg-primary-subtle text-primary fw-bold rounded-pill px-3 py-1">
                                {formatLocalizedNumber(filteredAndSorted.length, language)}
                            </span>
                        </div>

                        <div className="d-flex align-items-center gap-2">
                            <label htmlFor="pageSizeSelect" className="small text-muted mb-0">
                                {t("Items per page")}:
                            </label>
                            <select
                                id="pageSizeSelect"
                                className="form-select form-select-sm admin-inv-pagesize-select"
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
                        <table className="table admin-inv-table align-middle mb-0">
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
                                    <th scope="col">{t("Donor / Business")}</th>
                                    <th scope="col">{t("Storage Type")}</th>
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
                                        <tr key={i} className="admin-inv-skeleton-row">
                                            <td colSpan="9">
                                                <div className="skeleton-table-line"></div>
                                            </td>
                                        </tr>
                                    ))
                                ) : inventory.length === 0 ? (
                                    /* CASE A: Database has no inventory records */
                                    <tr>
                                        <td colSpan="9" className="text-center py-5">
                                            <div className="admin-inv-empty-state">
                                                <div className="empty-icon-wrap">
                                                    <i className="bi bi-inbox"></i>
                                                </div>
                                                <h3 className="empty-title">{t("No inventory records available.")}</h3>
                                                <p className="empty-sub text-muted">
                                                    {t("Monitor and manage all inventory items across the FoodBridge AI platform.")}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredAndSorted.length === 0 ? (
                                    /* CASE B: Inventory exists but search/filters produce no matches */
                                    <tr>
                                        <td colSpan="9" className="text-center py-5">
                                            <div className="admin-inv-empty-state">
                                                <div className="empty-icon-wrap">
                                                    <i className="bi bi-funnel"></i>
                                                </div>
                                                <h3 className="empty-title">{t("No inventory records match your filters.")}</h3>
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
                                    paginatedProducts.map((item) => (
                                        <tr key={item.id} className="admin-inv-row">
                                            <td className="fw-semibold text-muted text-nowrap">#{item.id}</td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className="admin-inv-prod-icon me-2">
                                                        <i className="bi bi-box-seam"></i>
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
                                            <td>{getStatusBadge(item.status)}</td>
                                            <td>
                                                <span className="text-secondary fw-medium">
                                                    {getOwnerDisplayName(item)}
                                                </span>
                                            </td>
                                            <td>
                                                <small className="text-muted">
                                                    {t(item.storage_type || "Room Temperature")}
                                                </small>
                                            </td>
                                            <td>
                                                <span className="text-nowrap small text-muted">
                                                    {formatLocalizedDate(item.expiry_date, language)}
                                                </span>
                                            </td>
                                            <td className="text-end">
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-primary admin-inv-view-btn"
                                                    onClick={() => setSelectedProduct(item)}
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

                    {/* Pagination Controls */}
                    {!loading && filteredAndSorted.length > 0 && (
                        <div className="admin-inv-pagination-bar d-flex flex-wrap align-items-center justify-content-between p-3 border-top">
                            <div className="text-muted small">
                                {t("Showing")} {formatLocalizedNumber(startIdx, language)} {t("to")}{" "}
                                {formatLocalizedNumber(endIdx, language)} {t("of")}{" "}
                                {formatLocalizedNumber(filteredAndSorted.length, language)} {t("items")}
                            </div>

                            <nav aria-label="Inventory pagination">
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
                {selectedProduct && (
                    <div
                        className="modal fade show admin-modal-backdrop"
                        style={{ display: "block" }}
                        tabIndex="-1"
                        role="dialog"
                        aria-modal="true"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) {
                                setSelectedProduct(null);
                            }
                        }}
                    >
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <div className="modal-content admin-modal-content">
                                <div className="modal-header border-bottom">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="admin-modal-header-icon bg-primary text-white">
                                            <i className="bi bi-box-seam"></i>
                                        </div>
                                        <div>
                                            <h4 className="modal-title fw-bold mb-0">
                                                {t(selectedProduct.product_name)}
                                            </h4>
                                            <span className="text-muted small">
                                                {t("ID")}: #{selectedProduct.id}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        aria-label={t("Close")}
                                        onClick={() => setSelectedProduct(null)}
                                    ></button>
                                </div>

                                <div className="modal-body py-4">
                                    <div className="row g-3">
                                        <div className="col-md-4 col-sm-6">
                                            <div className="detail-field-box">
                                                <span className="detail-field-label">{t("Status")}</span>
                                                <div className="mt-1">{getStatusBadge(selectedProduct.status)}</div>
                                            </div>
                                        </div>

                                        <div className="col-md-4 col-sm-6">
                                            <div className="detail-field-box">
                                                <span className="detail-field-label">{t("Category")}</span>
                                                <div className="detail-field-value">{t(selectedProduct.category)}</div>
                                            </div>
                                        </div>

                                        <div className="col-md-4 col-sm-6">
                                            <div className="detail-field-box">
                                                <span className="detail-field-label">{t("Quantity")}</span>
                                                <div className="detail-field-value">
                                                    {formatLocalizedNumber(selectedProduct.quantity, language)} {t(selectedProduct.unit)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-md-6 col-sm-6">
                                            <div className="detail-field-box">
                                                <span className="detail-field-label">{t("Donor / Business")}</span>
                                                <div className="detail-field-value">
                                                    {getOwnerDisplayName(selectedProduct)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-md-6 col-sm-6">
                                            <div className="detail-field-box">
                                                <span className="detail-field-label">{t("Storage Type")}</span>
                                                <div className="detail-field-value">
                                                    {t(selectedProduct.storage_type || "Room Temperature")}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-md-6 col-sm-6">
                                            <div className="detail-field-box">
                                                <span className="detail-field-label">{t("Expiry Date")}</span>
                                                <div className="detail-field-value">
                                                    {formatLocalizedDate(selectedProduct.expiry_date, language)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-md-6 col-sm-6">
                                            <div className="detail-field-box">
                                                <span className="detail-field-label">{t("Created Date")}</span>
                                                <div className="detail-field-value">
                                                    {formatLocalizedDate(selectedProduct.created_at, language)}
                                                </div>
                                            </div>
                                        </div>

                                        {selectedProduct.pickup_address && (
                                            <div className="col-12">
                                                <div className="detail-field-box">
                                                    <span className="detail-field-label">{t("Pickup Address")}</span>
                                                    <div className="detail-field-value">
                                                        <i className="bi bi-geo-alt me-1 text-danger"></i>
                                                        {selectedProduct.pickup_address}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {selectedProduct.contact_number && (
                                            <div className="col-md-6">
                                                <div className="detail-field-box">
                                                    <span className="detail-field-label">{t("Contact Number")}</span>
                                                    <div className="detail-field-value">
                                                        <i className="bi bi-telephone me-1 text-primary"></i>
                                                        {selectedProduct.contact_number}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {selectedProduct.description && (
                                            <div className="col-12">
                                                <div className="detail-field-box">
                                                    <span className="detail-field-label">{t("Description")}</span>
                                                    <div className="detail-field-value">
                                                        {selectedProduct.description}
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
                                        onClick={() => setSelectedProduct(null)}
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

export default AdminInventory;