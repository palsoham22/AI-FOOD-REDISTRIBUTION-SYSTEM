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
import "../styles/PickupScheduleList.css";

function PickupScheduleList() {
    const [pickups, setPickups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [confirmingId, setConfirmingId] = useState(null);

    const t = useTranslate();
    const { language } = useTranslationContext();

    const dynamicLabels = useMemo(
        () =>
            buildDynamicLabels(
                [
                    ...LABELS.NGO_PICKUP_SCHEDULE,
                    ...LABELS.NGO_DASHBOARD,
                    ...LABELS.NGO_SIDEBAR
                ],
                pickups,
                [
                    "product_name",
                    "volunteer_name",
                    "vehicle_number",
                    "unit",
                    "status"
                ]
            ),
        [pickups]
    );

    usePageTranslation(dynamicLabels);

    const loadPickups = () => {
        setLoading(true);
        const token = localStorage.getItem("access");

        axios
            .get("http://127.0.0.1:8000/api/inventory/scheduled/", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then((response) => {
                const data = Array.isArray(response.data) ? response.data : [];
                setPickups(data);
                localStorage.setItem("offline_pickups", JSON.stringify(data));
            })
            .catch((error) => {
                console.error("Failed to load pickups:", error);
                const cached = localStorage.getItem("offline_pickups");
                if (cached) {
                    try {
                        setPickups(JSON.parse(cached));
                        alert(t("📶 Offline Mode: Showing last synced pickup schedule."));
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
        loadPickups();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const confirmPickup = async (id) => {
        setConfirmingId(id);
        const token = localStorage.getItem("access");

        try {
            await axios.post(
                `http://127.0.0.1:8000/api/inventory/confirm/${id}/`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert(t("Pickup Confirmed Successfully 🚚"));
            loadPickups();
        } catch (error) {
            console.error("Failed to confirm pickup:", error);
            alert(t("Confirmation Failed") || "Confirmation Failed");
        } finally {
            setConfirmingId(null);
        }
    };

    // Filtered pickups based on search and status
    const filteredPickups = useMemo(() => {
        return pickups.filter((item) => {
            const matchesStatus = statusFilter === "All" || item.status === statusFilter;
            const query = searchQuery.toLowerCase().trim();
            const matchesSearch = !query ||
                (item.product_name && item.product_name.toLowerCase().includes(query)) ||
                (item.volunteer_name && item.volunteer_name.toLowerCase().includes(query)) ||
                (item.vehicle_number && item.vehicle_number.toLowerCase().includes(query));
            return matchesStatus && matchesSearch;
        });
    }, [pickups, statusFilter, searchQuery]);

    // KPI counts
    const pendingCount = useMemo(
        () => pickups.filter((p) => p.status === "Scheduled").length,
        [pickups]
    );
    const confirmedCount = useMemo(
        () => pickups.filter((p) => p.status === "Confirmed").length,
        [pickups]
    );

    const resetFilters = () => {
        setSearchQuery("");
        setStatusFilter("All");
    };

    return (
        <>
            <NGOSidebar />

            <div className="pickup-list-page">
                <TopNavbar />

                {/* 1. Page Header Card */}
                <div className="pickup-list-header-card mb-4">
                    <div className="pickup-list-header-main">
                        <div className="pickup-list-avatar-box">
                            <span className="pickup-list-avatar-icon">🚚</span>
                        </div>
                        <div className="pickup-list-header-info">
                            <div className="d-flex align-items-center flex-wrap gap-2 mb-1">
                                <h1 className="pickup-list-title mb-0">{t("Scheduled Pickups")}</h1>
                                <span className="badge pickup-list-status-pill">
                                    <span className="pickup-list-pulse-dot" aria-hidden="true"></span>
                                    {formatLocalizedNumber(pickups.length, language)} {t("Scheduled")}
                                </span>
                            </div>
                            <p className="pickup-list-subtitle mb-0">
                                {t("Track all donated products and their current status.")}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. Key Statistics Summary Cards */}
                <div className="row g-3 mb-4">
                    {/* Card 1: Total Scheduled */}
                    <div className="col-xl-4 col-md-6 col-12">
                        <div
                            className={`pickup-kpi-card pickup-kpi-blue ${statusFilter === "All" ? "kpi-active" : ""}`}
                            onClick={() => setStatusFilter("All")}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === "Enter" && setStatusFilter("All")}
                        >
                            <div className="pickup-kpi-top">
                                <span className="pickup-kpi-label">{t("Scheduled")}</span>
                                <span className="pickup-kpi-icon-wrap">
                                    <i className="bi bi-calendar-event"></i>
                                </span>
                            </div>
                            <div className="pickup-kpi-value">
                                {formatLocalizedNumber(pickups.length, language)}
                            </div>
                            <div className="pickup-kpi-bottom">
                                <span>{t("Scheduled")}</span>
                                <span className="pickup-kpi-link">
                                    {statusFilter === "All" ? `✓ ${t("All")}` : `${t("All")} →`}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Pending Pickups */}
                    <div className="col-xl-4 col-md-6 col-12">
                        <div
                            className={`pickup-kpi-card pickup-kpi-amber ${statusFilter === "Scheduled" ? "kpi-active" : ""}`}
                            onClick={() => setStatusFilter(statusFilter === "Scheduled" ? "All" : "Scheduled")}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === "Enter" && setStatusFilter(statusFilter === "Scheduled" ? "All" : "Scheduled")}
                        >
                            <div className="pickup-kpi-top">
                                <span className="pickup-kpi-label">{t("Pending")}</span>
                                <span className="pickup-kpi-icon-wrap">
                                    <i className="bi bi-clock-history"></i>
                                </span>
                            </div>
                            <div className="pickup-kpi-value">
                                {formatLocalizedNumber(pendingCount, language)}
                            </div>
                            <div className="pickup-kpi-bottom">
                                <span>{t("Pending")}</span>
                                <span className="pickup-kpi-link">
                                    {statusFilter === "Scheduled" ? `✓ ${t("Scheduled")}` : `${t("Scheduled")} →`}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Confirmed Pickups */}
                    <div className="col-xl-4 col-md-12 col-12">
                        <div
                            className={`pickup-kpi-card pickup-kpi-green ${statusFilter === "Confirmed" ? "kpi-active" : ""}`}
                            onClick={() => setStatusFilter(statusFilter === "Confirmed" ? "All" : "Confirmed")}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === "Enter" && setStatusFilter(statusFilter === "Confirmed" ? "All" : "Confirmed")}
                        >
                            <div className="pickup-kpi-top">
                                <span className="pickup-kpi-label">{t("Confirmed")}</span>
                                <span className="pickup-kpi-icon-wrap">
                                    <i className="bi bi-check-circle-fill"></i>
                                </span>
                            </div>
                            <div className="pickup-kpi-value">
                                {formatLocalizedNumber(confirmedCount, language)}
                            </div>
                            <div className="pickup-kpi-bottom">
                                <span>{t("Confirmed")}</span>
                                <span className="pickup-kpi-link">
                                    {statusFilter === "Confirmed" ? `✓ ${t("Confirmed")}` : `${t("Confirmed")} →`}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Main Content Card (Table & Search/Filter Toolbar) */}
                <div className="pickup-table-card">
                    <div className="pickup-card-header">
                        <div className="d-flex align-items-center gap-2">
                            <h2 className="pickup-card-title mb-0">{t("Scheduled Pickups")}</h2>
                            <span className="badge pickup-count-badge">
                                {formatLocalizedNumber(filteredPickups.length, language)} {t("Scheduled")}
                            </span>
                        </div>

                        {/* Search & Filter Toolbar */}
                        <div className="pickup-filter-toolbar">
                            <div className="pickup-search-wrap">
                                <i className="bi bi-search pickup-search-icon"></i>
                                <input
                                    type="text"
                                    className="form-control form-control-sm pickup-search-input"
                                    placeholder={t("Search Product...")}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    aria-label={t("Search Product...")}
                                />
                            </div>

                            <select
                                className="form-select form-select-sm pickup-filter-select"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                aria-label={t("Status")}
                            >
                                <option value="All">{t("Status")}: {t("All")}</option>
                                <option value="Scheduled">{t("Scheduled")}</option>
                                <option value="Confirmed">{t("Confirmed")}</option>
                            </select>

                            {(searchQuery || statusFilter !== "All") && (
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-secondary pickup-reset-btn"
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
                        <table className="table pickup-table">
                            <thead>
                                <tr>
                                    <th scope="col">{t("Product")}</th>
                                    <th scope="col">{t("Quantity")}</th>
                                    <th scope="col">{t("Pickup Date")}</th>
                                    <th scope="col">{t("Pickup Time")}</th>
                                    <th scope="col">{t("Volunteer")}</th>
                                    <th scope="col">{t("Vehicle")}</th>
                                    <th scope="col">{t("Status")}</th>
                                    <th scope="col" className="text-end">{t("Action")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-5">
                                            <div className="spinner-border text-primary spinner-border-sm me-2" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                            <span className="text-muted fw-semibold">{t("Scheduled Pickups")}...</span>
                                        </td>
                                    </tr>
                                ) : filteredPickups.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-5">
                                            <div className="pickup-empty-state">
                                                <div className="pickup-empty-icon">
                                                    {pickups.length === 0 ? "🚚" : "🔍"}
                                                </div>
                                                <h3 className="pickup-empty-title">
                                                    {pickups.length === 0
                                                        ? t("No Scheduled Pickups")
                                                        : t("No Scheduled Pickups")}
                                                </h3>
                                                <p className="pickup-empty-sub mb-3">
                                                    {searchQuery || statusFilter !== "All"
                                                        ? t("Try adjusting your search or filters.")
                                                        : t("Track all donated products and their current status.")}
                                                </p>
                                                {(searchQuery || statusFilter !== "All") && (
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
                                    filteredPickups.map((item) => {
                                        const isConfirmed = item.status === "Confirmed";
                                        const isConfirming = confirmingId === item.id;

                                        return (
                                            <tr key={item.id}>
                                                <td>
                                                    <div className="fw-semibold text-primary pickup-product-title">
                                                        {t(item.product_name)}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="fw-bold text-main">
                                                        {formatLocalizedNumber(item.quantity, language)}
                                                    </span>{" "}
                                                    <span className="text-muted small">{t(item.unit)}</span>
                                                </td>
                                                <td>
                                                    <span className="pickup-date-text">
                                                        {formatLocalizedDate(item.pickup_date, language)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="pickup-time-badge">
                                                        <i className="bi bi-clock me-1 text-muted"></i>
                                                        {item.pickup_time}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span className="pickup-volunteer-icon">👤</span>
                                                        <span className="fw-medium text-main">
                                                            {item.volunteer_name || "—"}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="badge pickup-vehicle-badge">
                                                        {item.vehicle_number || "—"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge pickup-status-badge ${
                                                        isConfirmed ? "status-confirmed" : "status-scheduled"
                                                    }`}>
                                                        {t(item.status)}
                                                    </span>
                                                </td>
                                                <td className="text-end">
                                                    {isConfirmed ? (
                                                        <span className="badge status-confirmed py-2 px-3">
                                                            <i className="bi bi-check-circle me-1"></i> {t("Confirmed")}
                                                        </span>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            className="btn btn-primary btn-sm confirm-btn"
                                                            onClick={() => confirmPickup(item.id)}
                                                            disabled={isConfirming}
                                                        >
                                                            {isConfirming ? (
                                                                <>
                                                                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                                                    {t("Confirm Pickup")}
                                                                </>
                                                            ) : (
                                                                <>
                                                                    ✅ {t("Confirm Pickup")}
                                                                </>
                                                            )}
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

export default PickupScheduleList;
