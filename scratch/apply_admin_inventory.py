import os

js_content = '''import React, { useState, useEffect, useMemo, useCallback } from "react";
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
                "http://127.0.0.1:8000/api/inventory/admin/inventory/",
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
'''

css_content = '''/* ==========================================================================
   FoodBridge AI - Admin Inventory Styling
   Design tokens, dark theme, responsive sidebar offsets, accessible contrast
   ========================================================================== */

:root {
    --admin-sidebar-w: 260px;
    --admin-sidebar-collapsed-w: 80px;
    --admin-primary: #2563EB;
    --admin-primary-dark: #1D4ED8;
    --admin-bg: #F8FAFC;
    --admin-card-bg: #FFFFFF;
    --admin-text-main: #0F172A;
    --admin-text-muted: #64748B;
    --admin-border: #E2E8F0;
    --admin-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
    --admin-shadow-hover: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04);
}

/* Page wrapper & responsive sidebar offsets */
.admin-inventory-page {
    margin-left: var(--admin-sidebar-w);
    padding: 24px 32px 48px;
    min-height: 100vh;
    background-color: var(--admin-bg);
    transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

body.admin-sidebar-collapsed .admin-inventory-page {
    margin-left: var(--admin-sidebar-collapsed-w);
}

@media (max-width: 992px) {
    .admin-inventory-page {
        margin-left: 0 !important;
        padding: 84px 16px 36px;
    }
}

/* Hero Banner */
.admin-inv-hero-banner {
    background: linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #2563EB 100%);
    color: #FFFFFF;
    border-radius: 20px;
    padding: 30px 36px;
    margin: 20px 0 28px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
    box-shadow: 0 12px 30px -10px rgba(15, 23, 42, 0.3);
    position: relative;
    overflow: hidden;
}

.admin-inv-hero-banner::after {
    content: "";
    position: absolute;
    right: -50px;
    top: -50px;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.12) 0%, transparent 70%);
    pointer-events: none;
}

.admin-inv-hero-content {
    max-width: 720px;
    position: relative;
    z-index: 1;
}

.admin-inv-hero-badge {
    display: inline-flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    color: #38BDF8;
    padding: 5px 14px;
    border-radius: 9999px;
    font-size: 13px;
    font-weight: 700;
    margin-bottom: 10px;
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.admin-inv-hero-title {
    font-size: 32px;
    font-weight: 800;
    color: #FFFFFF !important;
    margin-bottom: 6px;
    line-height: 1.25;
}

.admin-inv-hero-subtitle {
    color: rgba(248, 250, 252, 0.85);
    font-size: 15px;
    margin-bottom: 0;
    line-height: 1.5;
}

.admin-inv-hero-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    position: relative;
    z-index: 1;
}

.admin-inv-total-pill {
    background: rgba(255, 255, 255, 0.15);
    color: #FFFFFF;
    padding: 10px 18px;
    border-radius: 12px;
    font-weight: 700;
    font-size: 14px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    display: inline-flex;
    align-items: center;
}

.btn-admin-inv-refresh {
    background: rgba(255, 255, 255, 0.15);
    color: #FFFFFF;
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: 12px;
    padding: 10px 18px;
    font-weight: 600;
    font-size: 14px;
    backdrop-filter: blur(8px);
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
}

.btn-admin-inv-refresh:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.25);
    color: #FFFFFF;
    transform: translateY(-1px);
}

/* Spin animation */
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

/* KPI Cards Grid */
.admin-inv-kpi-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 16px;
    margin-bottom: 24px;
}

@media (max-width: 1400px) {
    .admin-inv-kpi-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

@media (max-width: 768px) {
    .admin-inv-kpi-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 480px) {
    .admin-inv-kpi-grid {
        grid-template-columns: 1fr;
    }
}

.admin-inv-kpi-card {
    background-color: var(--admin-card-bg);
    border-radius: 16px;
    padding: 18px 20px;
    border: 1px solid var(--admin-border);
    box-shadow: var(--admin-shadow);
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.admin-inv-kpi-card:hover {
    transform: translateY(-3px);
    box-shadow: var(--admin-shadow-hover);
    border-color: #CBD5E1;
}

/* Top accent bars */
.admin-inv-kpi-card::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
}

.kpi-border-blue::before { background: #2563EB; }
.kpi-border-green::before { background: #059669; }
.kpi-border-purple::before { background: #7C3AED; }
.kpi-border-amber::before { background: #D97706; }
.kpi-border-teal::before { background: #0D9488; }
.kpi-border-rose::before { background: #DC2626; }

.admin-inv-kpi-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.admin-inv-kpi-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--admin-text-muted);
}

.admin-inv-kpi-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
}

.icon-blue { background: rgba(37, 99, 235, 0.1); color: #2563EB; }
.icon-green { background: rgba(5, 150, 105, 0.1); color: #059669; }
.icon-purple { background: rgba(124, 58, 237, 0.1); color: #7C3AED; }
.icon-amber { background: rgba(217, 119, 6, 0.1); color: #D97706; }
.icon-teal { background: rgba(13, 148, 136, 0.1); color: #0D9488; }
.icon-rose { background: rgba(220, 38, 38, 0.1); color: #DC2626; }

.text-blue { color: #2563EB; }
.text-green { color: #059669; }
.text-purple { color: #7C3AED; }
.text-amber { color: #D97706; }
.text-teal { color: #0D9488; }
.text-rose { color: #DC2626; }

.admin-inv-kpi-val {
    font-size: 28px;
    font-weight: 800;
    line-height: 1.2;
    margin-bottom: 4px;
}

.admin-inv-kpi-sub {
    font-size: 12px;
    color: var(--admin-text-muted);
    line-height: 1.35;
}

.skeleton-placeholder-num {
    display: inline-block;
    width: 45px;
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

/* Filter Card */
.admin-inv-filter-card {
    background-color: var(--admin-card-bg);
    border: 1px solid var(--admin-border);
    border-radius: 16px;
    padding: 18px 22px;
    margin-bottom: 24px;
    box-shadow: var(--admin-shadow);
}

.admin-inv-search-input-wrap {
    position: relative;
    display: flex;
    align-items: center;
}

.admin-inv-search-icon {
    position: absolute;
    left: 14px;
    color: var(--admin-text-muted);
    pointer-events: none;
    font-size: 14px;
}

.admin-inv-search-field {
    padding-left: 40px;
    padding-right: 36px;
    border-radius: 10px;
    border: 1px solid var(--admin-border);
    background-color: var(--admin-bg);
    color: var(--admin-text-main);
    font-size: 14px;
    height: 42px;
}

.admin-inv-search-field:focus {
    border-color: var(--admin-primary);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.btn-clear-search {
    position: absolute;
    right: 12px;
    background: transparent;
    border: none;
    color: var(--admin-text-muted);
    cursor: pointer;
    font-size: 14px;
    padding: 0;
}

.admin-inv-select {
    border-radius: 10px;
    border: 1px solid var(--admin-border);
    background-color: var(--admin-bg);
    color: var(--admin-text-main);
    font-size: 14px;
    height: 42px;
}

.admin-inv-select:focus {
    border-color: var(--admin-primary);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.admin-inv-reset-btn {
    height: 42px;
    border-radius: 10px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

/* Table Card */
.admin-inv-table-card {
    background-color: var(--admin-card-bg);
    border: 1px solid var(--admin-border);
    border-radius: 18px;
    box-shadow: var(--admin-shadow);
    overflow: hidden;
}

.admin-inv-table-header {
    padding: 20px 24px;
    border-bottom: 1px solid var(--admin-border);
    background-color: #FAFAFA;
}

.admin-inv-table-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--admin-text-main);
}

.admin-inv-pagesize-select {
    width: 75px;
    border-radius: 8px;
}

.admin-inv-table {
    margin-bottom: 0;
}

.admin-inv-table thead th {
    font-size: 12.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--admin-text-muted);
    background: #F8FAFC;
    padding: 14px 20px;
    border-bottom: 1px solid var(--admin-border);
}

.sortable-th {
    cursor: pointer;
    user-select: none;
    transition: color 0.15s ease;
}

.sortable-th:hover {
    color: var(--admin-primary);
}

.admin-inv-table tbody td {
    padding: 16px 20px;
    font-size: 14px;
    color: var(--admin-text-main);
    border-bottom: 1px solid var(--admin-border);
}

.admin-inv-row:hover {
    background-color: #F8FAFC;
}

.admin-inv-prod-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: #EFF6FF;
    color: #2563EB;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    flex-shrink: 0;
}

.text-main {
    color: var(--admin-text-main);
}

.admin-inv-view-btn {
    border-radius: 8px;
    font-size: 12.5px;
    font-weight: 600;
    padding: 6px 12px;
    white-space: nowrap;
}

/* Skeleton Loading Table */
.admin-inv-skeleton-row td {
    padding: 18px 20px;
}

.skeleton-table-line {
    width: 100%;
    height: 18px;
    border-radius: 4px;
    background: #E2E8F0;
    animation: shimmer 1.5s infinite ease-in-out;
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
    white-space: nowrap;
}

.badge-emerald { background: #DCFCE7; color: #15803D; }
.badge-purple { background: #F3E8FF; color: #7E22CE; }
.badge-amber { background: #FEF3C7; color: #B45309; }
.badge-sky { background: #DBEAFE; color: #1D4ED8; }
.badge-teal { background: #CCFBF1; color: #0F766E; }
.badge-rose { background: #FEE2E2; color: #B91C1C; }
.badge-gray { background: #F1F5F9; color: #475569; }

/* Empty States */
.admin-inv-empty-state {
    padding: 48px 20px;
}

.empty-icon-wrap {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #F1F5F9;
    color: #94A3B8;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    margin-bottom: 14px;
}

.empty-title {
    font-size: 17px;
    font-weight: 700;
    color: var(--admin-text-main);
    margin-bottom: 6px;
}

.empty-sub {
    font-size: 13.5px;
    max-width: 420px;
    margin: 0 auto;
}

/* Pagination Bar */
.admin-inv-pagination-bar {
    background-color: #FAFAFA;
}

/* Modal Details */
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
    overflow: hidden;
}

.admin-modal-header-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
}

.detail-field-box {
    background-color: #F8FAFC;
    border: 1px solid var(--admin-border);
    border-radius: 12px;
    padding: 12px 16px;
    height: 100%;
}

.detail-field-label {
    font-size: 11.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--admin-text-muted);
    display: block;
    margin-bottom: 4px;
}

.detail-field-value {
    font-size: 14px;
    font-weight: 600;
    color: var(--admin-text-main);
}

/* ==========================================================================
   DARK THEME STYLING
   ========================================================================== */

[data-theme="dark"] .admin-inventory-page {
    background-color: #0B1120;
}

[data-theme="dark"] .admin-inv-kpi-card {
    background-color: #1E293B;
    border-color: #334155;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .admin-inv-kpi-card:hover {
    border-color: #475569;
}

[data-theme="dark"] .admin-inv-kpi-label {
    color: #94A3B8;
}

[data-theme="dark"] .admin-inv-kpi-sub {
    color: #94A3B8;
}

[data-theme="dark"] .skeleton-placeholder-num {
    background: #334155;
}

[data-theme="dark"] .admin-inv-filter-card {
    background-color: #1E293B;
    border-color: #334155;
}

[data-theme="dark"] .admin-inv-search-field,
[data-theme="dark"] .admin-inv-select {
    background-color: #141D2E;
    border-color: #334155;
    color: #F8FAFC;
}

[data-theme="dark"] .admin-inv-search-field:focus,
[data-theme="dark"] .admin-inv-select:focus {
    border-color: #60A5FA;
}

[data-theme="dark"] .admin-inv-search-icon,
[data-theme="dark"] .btn-clear-search {
    color: #94A3B8;
}

[data-theme="dark"] .admin-inv-table-card {
    background-color: #1E293B;
    border-color: #334155;
}

[data-theme="dark"] .admin-inv-table-header {
    background-color: #192233;
    border-color: #334155;
}

[data-theme="dark"] .admin-inv-table-title {
    color: #F8FAFC;
}

[data-theme="dark"] .admin-inv-pagesize-select {
    background-color: #141D2E;
    border-color: #334155;
    color: #F8FAFC;
}

[data-theme="dark"] .admin-inv-table thead th {
    background-color: #141D2E;
    border-color: #334155;
    color: #94A3B8;
}

[data-theme="dark"] .admin-inv-table tbody td {
    border-color: #334155;
    color: #E2E8F0;
}

[data-theme="dark"] .admin-inv-row:hover {
    background-color: #243248;
}

[data-theme="dark"] .admin-inv-prod-icon {
    background-color: #1E3A8A;
    color: #93C5FD;
}

[data-theme="dark"] .text-main {
    color: #F8FAFC;
}

[data-theme="dark"] .badge.bg-light.text-dark {
    background-color: #334155 !important;
    color: #E2E8F0 !important;
    border-color: #475569 !important;
}

[data-theme="dark"] .badge-emerald { background: #064E3B; color: #6EE7B7; }
[data-theme="dark"] .badge-purple { background: #581C87; color: #D8B4FE; }
[data-theme="dark"] .badge-amber { background: #78350F; color: #FCD34D; }
[data-theme="dark"] .badge-sky { background: #1E3A8A; color: #93C5FD; }
[data-theme="dark"] .badge-teal { background: #134E4A; color: #5EEAD4; }
[data-theme="dark"] .badge-rose { background: #7F1D1D; color: #FCA5A5; }
[data-theme="dark"] .badge-gray { background: #334155; color: #CBD5E1; }

[data-theme="dark"] .empty-icon-wrap {
    background-color: #334155;
    color: #64748B;
}

[data-theme="dark"] .empty-title {
    color: #F8FAFC;
}

[data-theme="dark"] .admin-inv-pagination-bar {
    background-color: #192233;
    border-color: #334155;
}

[data-theme="dark"] .page-link {
    background-color: #1E293B;
    border-color: #334155;
    color: #CBD5E1;
}

[data-theme="dark"] .page-item.disabled .page-link {
    background-color: #141D2E;
    border-color: #334155;
    color: #64748B;
}

[data-theme="dark"] .skeleton-table-line {
    background: #334155;
}

[data-theme="dark"] .admin-modal-content {
    background-color: #1E293B;
    color: #F8FAFC;
    border: 1px solid #334155;
}

[data-theme="dark"] .admin-modal-content .modal-title {
    color: #F8FAFC;
}

[data-theme="dark"] .detail-field-box {
    background-color: #141D2E;
    border-color: #334155;
}

[data-theme="dark"] .detail-field-label {
    color: #94A3B8;
}

[data-theme="dark"] .detail-field-value {
    color: #F8FAFC;
}

[data-theme="dark"] .admin-modal-content .btn-close {
    filter: invert(1) grayscale(100%) brightness(200%);
}
'''

with open('frontend/src/pages/AdminInventory.js', 'w', encoding='utf-8') as f:
    f.write(js_content)
    f.flush()
    os.fsync(f.fileno())
print('Written frontend/src/pages/AdminInventory.js successfully')

with open('frontend/src/styles/AdminInventory.css', 'w', encoding='utf-8') as f:
    f.write(css_content)
    f.flush()
    os.fsync(f.fileno())
print('Written frontend/src/styles/AdminInventory.css successfully')

