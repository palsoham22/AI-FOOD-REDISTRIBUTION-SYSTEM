import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DeliverySidebar from "../components/DeliverySidebar";
import TopNavbar from "../components/TopNavbar";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { LABELS } from "../translations";
import { buildDynamicLabels } from "../utils/buildDynamicLabels";
import { formatLocalizedDate } from "../utils/formatDate";
import { formatLocalizedNumber } from "../utils/formatNumber";
import { useTranslationContext } from "../context/TranslationContext";
import "../styles/AssignedPickups.css";

function AssignedPickups() {
    const navigate = useNavigate();
    const t = useTranslate();
    const { language } = useTranslationContext();

    const [pickups, setPickups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [pickupOtp, setPickupOtp] = useState({});
    const [deliveryOtp, setDeliveryOtp] = useState({});
    const [actionLoading, setActionLoading] = useState({});
    const [feedback, setFeedback] = useState(null);

    const dynamicLabels = useMemo(
        () =>
            buildDynamicLabels(LABELS.ASSIGNED_PICKUPS, pickups, [
                "product_name",
                "category",
                "unit",
                "status",
            ]),
        [pickups]
    );

    usePageTranslation(dynamicLabels);

    const showFeedback = useCallback((type, message) => {
        setFeedback({ type, message });
        setTimeout(() => {
            setFeedback(null);
        }, 5000);
    }, []);

    // 1. Fetch authenticated delivery partner assigned pickups
    const loadPickups = useCallback(async () => {
        const token = localStorage.getItem("access");
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const response = await axios.get(
                process.env.REACT_APP_API_URL + "/api/inventory/delivery/my-pickups/",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = Array.isArray(response.data) ? response.data : [];
            setPickups(data);
            localStorage.setItem("offline_assigned_pickups", JSON.stringify(data));
        } catch (error) {
            console.error("Failed to load assigned pickups:", error);

            const cached = localStorage.getItem("offline_assigned_pickups");
            if (cached) {
                try {
                    setPickups(JSON.parse(cached));
                    showFeedback("info", t("📶 Offline Mode: Showing last synced assigned pickups."));
                } catch (e) {
                    setPickups([]);
                }
            } else {
                showFeedback("error", t("Failed to load assigned pickups. Please try again."));
            }
        } finally {
            setLoading(false);
        }
    }, [navigate, showFeedback, t]);

    useEffect(() => {
        loadPickups();
    }, [loadPickups]);

    // 2. Start Pickup (transition to Out For Pickup)
    const startPickup = useCallback(
        async (id) => {
            const token = localStorage.getItem("access");
            if (!token) return;

            setActionLoading((prev) => ({ ...prev, [`start_${id}`]: true }));

            try {
                await axios.post(
                    `${process.env.REACT_APP_API_URL}/api/inventory/start-pickup/${id}/`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                showFeedback("success", t("Pickup Started Successfully 🚚"));
                await loadPickups();
            } catch (error) {
                console.error("Failed to start pickup:", error);
                showFeedback("error", t("Failed to Start Pickup"));
            } finally {
                setActionLoading((prev) => ({ ...prev, [`start_${id}`]: false }));
            }
        },
        [loadPickups, showFeedback, t]
    );

    // 3. Verify Pickup OTP (entered from donor)
    const verifyPickupOtp = useCallback(
        async (id) => {
            const token = localStorage.getItem("access");
            if (!token) return;

            const otpVal = (pickupOtp[id] || "").trim();
            if (!otpVal) {
                showFeedback("error", t("Please enter the 6-digit OTP provided by the donor."));
                return;
            }

            setActionLoading((prev) => ({ ...prev, [`pickup_${id}`]: true }));

            try {
                await axios.post(
                    `${process.env.REACT_APP_API_URL}/api/inventory/verify-pickup-otp/${id}/`,
                    { pickup_otp: otpVal },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                showFeedback("success", `✅ ${t("Pickup OTP Verified")}`);
                setPickupOtp((prev) => ({ ...prev, [id]: "" }));
                await loadPickups();
            } catch (error) {
                console.error("Failed to verify pickup OTP:", error);
                const errMsg = error.response?.data?.error || t("Verification Failed");
                showFeedback("error", errMsg);
            } finally {
                setActionLoading((prev) => ({ ...prev, [`pickup_${id}`]: false }));
            }
        },
        [pickupOtp, loadPickups, showFeedback, t]
    );

    // 4. Verify Delivery OTP (entered from recipient NGO)
    const verifyDeliveryOtp = useCallback(
        async (id) => {
            const token = localStorage.getItem("access");
            if (!token) return;

            const otpVal = (deliveryOtp[id] || "").trim();
            if (!otpVal) {
                showFeedback("error", t("Please enter the 6-digit OTP provided by the recipient NGO."));
                return;
            }

            setActionLoading((prev) => ({ ...prev, [`delivery_${id}`]: true }));

            try {
                await axios.post(
                    `${process.env.REACT_APP_API_URL}/api/inventory/verify-delivery-otp/${id}/`,
                    { delivery_otp: otpVal },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                showFeedback("success", `✅ ${t("Delivery Completed Successfully")}`);
                setDeliveryOtp((prev) => ({ ...prev, [id]: "" }));
                await loadPickups();
            } catch (error) {
                console.error("Failed to verify delivery OTP:", error);
                const errMsg = error.response?.data?.error || t("Verification Failed");
                showFeedback("error", errMsg);
            } finally {
                setActionLoading((prev) => ({ ...prev, [`delivery_${id}`]: false }));
            }
        },
        [deliveryOtp, loadPickups, showFeedback, t]
    );

    // 5. Computed Counts for KPI Cards
    const summaryCounts = useMemo(() => {
        const total = pickups.length;
        const scheduled = pickups.filter((p) => p.status === "Scheduled").length;
        const inTransit = pickups.filter((p) => p.status === "Out For Pickup").length;
        const delivered = pickups.filter((p) => p.delivery_verified || p.status === "Delivered").length;

        return { total, scheduled, inTransit, delivered };
    }, [pickups]);

    // 6. Filtered Pickups List
    const filteredPickups = useMemo(() => {
        return pickups.filter((item) => {
            const matchesStatus =
                statusFilter === "All" ||
                (statusFilter === "Delivered"
                    ? item.status === "Delivered" || item.delivery_verified
                    : item.status === statusFilter);

            const q = searchQuery.toLowerCase().trim();
            const matchesSearch =
                !q ||
                (item.product_name && item.product_name.toLowerCase().includes(q)) ||
                (item.category && item.category.toLowerCase().includes(q)) ||
                (item.donor_name && item.donor_name.toLowerCase().includes(q)) ||
                (item.recipient_name && item.recipient_name.toLowerCase().includes(q)) ||
                (item.vehicle_number && item.vehicle_number.toLowerCase().includes(q));

            return matchesStatus && matchesSearch;
        });
    }, [pickups, statusFilter, searchQuery]);

    return (
        <>
            <DeliverySidebar />

            <div className="assigned-page">
                <TopNavbar />

                {/* Feedback Notification Banner */}
                {feedback && (
                    <div className={`assigned-feedback-banner feedback-${feedback.type}`}>
                        <span>{feedback.message}</span>
                        <button
                            className="feedback-close-btn"
                            onClick={() => setFeedback(null)}
                            aria-label="Dismiss feedback"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* 1. Header Banner */}
                <div className="assigned-header-banner">
                    <div className="assigned-header-info">
                        <h1 className="assigned-main-title">
                            📦 {t("Assigned Pickups")}
                        </h1>
                        <p className="assigned-main-subtitle">
                            {t("Manage all assigned pickups and complete OTP verification.")}
                        </p>
                    </div>

                    <div className="assigned-header-actions">
                        <div className="assigned-total-badge">
                            <span className="badge-count">
                                {formatLocalizedNumber(summaryCounts.total, language)}
                            </span>
                            <span>{t("Assigned")}</span>
                        </div>

                        <button
                            className="btn btn-outline-primary header-nav-btn"
                            onClick={() => navigate("/delivery-map")}
                        >
                            🗺️ {t("Navigate")}
                        </button>
                    </div>
                </div>

                {/* 2. KPI Summary Grid */}
                <div className="assigned-kpi-grid mb-4">
                    {/* KPI 1: Total Assigned */}
                    <div
                        className={`assigned-kpi-box kpi-blue ${statusFilter === "All" ? "active-filter" : ""}`}
                        onClick={() => setStatusFilter("All")}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && setStatusFilter("All")}
                    >
                        <div className="kpi-box-top">
                            <span className="kpi-box-title">{t("Total Assigned")}</span>
                            <span className="kpi-box-icon">📦</span>
                        </div>
                        <div className="kpi-box-number">
                            {formatLocalizedNumber(summaryCounts.total, language)}
                        </div>
                        <div className="kpi-box-sub">
                            <span>{t("All")}</span>
                            <span className="kpi-filter-tag">
                                {statusFilter === "All" ? "✓" : "→"}
                            </span>
                        </div>
                    </div>

                    {/* KPI 2: Scheduled */}
                    <div
                        className={`assigned-kpi-box kpi-amber ${statusFilter === "Scheduled" ? "active-filter" : ""}`}
                        onClick={() => setStatusFilter("Scheduled")}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && setStatusFilter("Scheduled")}
                    >
                        <div className="kpi-box-top">
                            <span className="kpi-box-title">{t("Pending Pickup")}</span>
                            <span className="kpi-box-icon">⏳</span>
                        </div>
                        <div className="kpi-box-number">
                            {formatLocalizedNumber(summaryCounts.scheduled, language)}
                        </div>
                        <div className="kpi-box-sub">
                            <span>{t("Scheduled")}</span>
                            <span className="kpi-filter-tag">
                                {statusFilter === "Scheduled" ? "✓" : "→"}
                            </span>
                        </div>
                    </div>

                    {/* KPI 3: Out For Pickup */}
                    <div
                        className={`assigned-kpi-box kpi-sky ${statusFilter === "Out For Pickup" ? "active-filter" : ""}`}
                        onClick={() => setStatusFilter("Out For Pickup")}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && setStatusFilter("Out For Pickup")}
                    >
                        <div className="kpi-box-top">
                            <span className="kpi-box-title">{t("Out For Pickup")}</span>
                            <span className="kpi-box-icon">🚚</span>
                        </div>
                        <div className="kpi-box-number">
                            {formatLocalizedNumber(summaryCounts.inTransit, language)}
                        </div>
                        <div className="kpi-box-sub">
                            <span>{t("In Transit")}</span>
                            <span className="kpi-filter-tag">
                                {statusFilter === "Out For Pickup" ? "✓" : "→"}
                            </span>
                        </div>
                    </div>

                    {/* KPI 4: Delivered */}
                    <div
                        className={`assigned-kpi-box kpi-emerald ${statusFilter === "Delivered" ? "active-filter" : ""}`}
                        onClick={() => setStatusFilter("Delivered")}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && setStatusFilter("Delivered")}
                    >
                        <div className="kpi-box-top">
                            <span className="kpi-box-title">{t("Completed Deliveries")}</span>
                            <span className="kpi-box-icon">✅</span>
                        </div>
                        <div className="kpi-box-number">
                            {formatLocalizedNumber(summaryCounts.delivered, language)}
                        </div>
                        <div className="kpi-box-sub">
                            <span>{t("Delivered")}</span>
                            <span className="kpi-filter-tag">
                                {statusFilter === "Delivered" ? "✓" : "→"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 3. Filter & Search Controls Card */}
                <div className="assigned-controls-card mb-4">
                    <div className="search-input-wrapper">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            className="form-control assigned-search-input"
                            placeholder={t("Search pickups...")}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                className="search-clear-btn"
                                onClick={() => setSearchQuery("")}
                                title={t("Clear Filters")}
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    <div className="status-filter-pills">
                        {["All", "Scheduled", "Out For Pickup", "Delivered"].map((st) => (
                            <button
                                key={st}
                                className={`filter-pill-btn ${statusFilter === st ? "active" : ""}`}
                                onClick={() => setStatusFilter(st)}
                            >
                                {t(st)}
                            </button>
                        ))}
                    </div>

                    <button
                        className="btn btn-outline-secondary refresh-btn"
                        onClick={loadPickups}
                        title={t("Retry")}
                    >
                        🔄
                    </button>
                </div>

                {/* 4. Table / Content Section */}
                <div className="assigned-card-container">
                    {loading ? (
                        <div className="assigned-loading-state">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-3 text-muted">{t("Loading assigned pickups...")}</p>
                        </div>
                    ) : pickups.length === 0 ? (
                        /* Honest Empty State when NO pickups exist */
                        <div className="assigned-empty-state">
                            <div className="empty-state-icon-wrap">
                                <span>📦</span>
                            </div>
                            <h3 className="empty-state-title">
                                {t("No Assigned Pickups")}
                            </h3>
                            <p className="empty-state-desc">
                                {t("Assigned pickup requests will appear here when they are available.")}
                            </p>
                            <button
                                className="btn btn-primary empty-cta-button"
                                onClick={() => navigate("/delivery-dashboard")}
                            >
                                🏠 {t("Dashboard")}
                            </button>
                        </div>
                    ) : filteredPickups.length === 0 ? (
                        /* Empty State when filter yields 0 matches */
                        <div className="assigned-empty-state">
                            <div className="empty-state-icon-wrap">
                                <span>🔍</span>
                            </div>
                            <h3 className="empty-state-title">
                                {t("No matching pickups found")}
                            </h3>
                            <p className="empty-state-desc">
                                {t("Try adjusting your search query or status filter.")}
                            </p>
                            <button
                                className="btn btn-outline-primary empty-cta-button"
                                onClick={() => {
                                    setSearchQuery("");
                                    setStatusFilter("All");
                                }}
                            >
                                {t("Clear Filters")}
                            </button>
                        </div>
                    ) : (
                        <div className="table-responsive assigned-table-wrapper">
                            <table className="table assigned-data-table align-middle">
                                <thead>
                                    <tr>
                                        <th>{t("Product")}</th>
                                        <th>{t("Quantity")}</th>
                                        <th>{t("Pickup Schedule")}</th>
                                        <th>{t("Vehicle")}</th>
                                        <th>{t("Location & Contact")}</th>
                                        <th>{t("Status")}</th>
                                        <th>{t("Verification Status")}</th>
                                        <th className="text-end">{t("Action")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPickups.map((item) => {
                                        const isScheduled = item.status === "Scheduled";
                                        const isOutForPickup = item.status === "Out For Pickup";
                                        const isDelivered = item.delivery_verified || item.status === "Delivered";

                                        return (
                                            <tr key={item.id} className="assigned-table-row">
                                                {/* Product & Donor */}
                                                <td>
                                                    <div className="product-info-cell">
                                                        <span className="product-title fw-bold">
                                                            {t(item.product_name)}
                                                        </span>
                                                        <div className="product-sub-row">
                                                            <span className="category-pill">
                                                                {item.category || "Food"}
                                                            </span>
                                                            {item.donor_name && (
                                                                <small className="donor-text">
                                                                    🏪 {item.donor_name}
                                                                </small>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Quantity */}
                                                <td>
                                                    <span className="fw-bold quantity-cell">
                                                        {formatLocalizedNumber(item.quantity, language)}{" "}
                                                        <small className="text-muted">
                                                            {t(item.unit || "Units")}
                                                        </small>
                                                    </span>
                                                </td>

                                                {/* Scheduled Date & Time */}
                                                <td>
                                                    <div className="schedule-cell">
                                                        <span className="schedule-date">
                                                            📅 {formatLocalizedDate(item.pickup_date, language)}
                                                        </span>
                                                        {item.pickup_time && (
                                                            <span className="schedule-time">
                                                                ⏰ {item.pickup_time}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Vehicle Plate & Spec */}
                                                <td>
                                                    <div className="vehicle-cell">
                                                        <span className="vehicle-plate">
                                                            {item.vehicle_number || "—"}
                                                        </span>
                                                        {item.recommended_vehicle && (
                                                            <small className="vehicle-rec">
                                                                {item.recommended_vehicle}
                                                            </small>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Address & Contact */}
                                                <td>
                                                    <div className="address-cell">
                                                        <span className="pickup-address" title={item.pickup_address}>
                                                            📍 {item.pickup_address || "Specified upon arrival"}
                                                        </span>
                                                        {item.contact_number && (
                                                            <small className="contact-phone">
                                                                📞 {item.contact_number}
                                                            </small>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Status Badge */}
                                                <td>
                                                    <span
                                                        className={`badge status-pill ${
                                                            isOutForPickup
                                                                ? "pill-out"
                                                                : isDelivered
                                                                ? "pill-delivered"
                                                                : "pill-scheduled"
                                                        }`}
                                                    >
                                                        {t(item.status)}
                                                    </span>
                                                </td>

                                                {/* Verification Chips */}
                                                <td>
                                                    <div className="verification-chips-stack">
                                                        <span
                                                            className={`v-chip ${
                                                                item.pickup_verified ? "v-verified" : "v-pending"
                                                            }`}
                                                        >
                                                            {item.pickup_verified
                                                                ? `✓ ${t("Pickup OTP Verified")}`
                                                                : `⏳ ${t("Pickup OTP Pending")}`}
                                                        </span>
                                                        <span
                                                            className={`v-chip ${
                                                                item.delivery_verified ? "v-verified" : "v-pending"
                                                            }`}
                                                        >
                                                            {item.delivery_verified
                                                                ? `✓ ${t("Delivery OTP Verified")}`
                                                                : `⏳ ${t("Delivery OTP Pending")}`}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Step-by-Step Action Controls */}
                                                <td className="text-end">
                                                    <div className="actions-cell-wrap">
                                                        {/* Step 1: Start Pickup */}
                                                        {isScheduled && (
                                                            <button
                                                                className="btn btn-sm btn-primary action-btn start-pickup-btn"
                                                                disabled={actionLoading[`start_${item.id}`]}
                                                                onClick={() => startPickup(item.id)}
                                                            >
                                                                {actionLoading[`start_${item.id}`] ? (
                                                                    <span className="spinner-border spinner-border-sm me-1"></span>
                                                                ) : (
                                                                    "🚚 "
                                                                )}
                                                                {t("Start Pickup")}
                                                            </button>
                                                        )}

                                                        {/* Step 2: Verify Pickup OTP */}
                                                        {isOutForPickup && !item.pickup_verified && (
                                                            <div className="otp-action-box">
                                                                <div className="input-group input-group-sm">
                                                                    <input
                                                                        type="text"
                                                                        className="form-control otp-input"
                                                                        placeholder={t("Enter Pickup OTP")}
                                                                        maxLength={6}
                                                                        value={pickupOtp[item.id] || ""}
                                                                        onChange={(e) =>
                                                                            setPickupOtp({
                                                                                ...pickupOtp,
                                                                                [item.id]: e.target.value,
                                                                            })
                                                                        }
                                                                    />
                                                                    <button
                                                                        className="btn btn-success verify-btn"
                                                                        disabled={actionLoading[`pickup_${item.id}`]}
                                                                        onClick={() => verifyPickupOtp(item.id)}
                                                                    >
                                                                        {actionLoading[`pickup_${item.id}`] ? (
                                                                            <span className="spinner-border spinner-border-sm"></span>
                                                                        ) : (
                                                                            "🔐 " + t("Verify Pickup OTP")
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Step 3: Verify Delivery OTP */}
                                                        {item.pickup_verified && !item.delivery_verified && (
                                                            <div className="otp-action-box">
                                                                <div className="input-group input-group-sm">
                                                                    <input
                                                                        type="text"
                                                                        className="form-control otp-input"
                                                                        placeholder={t("Enter Delivery OTP")}
                                                                        maxLength={6}
                                                                        value={deliveryOtp[item.id] || ""}
                                                                        onChange={(e) =>
                                                                            setDeliveryOtp({
                                                                                ...deliveryOtp,
                                                                                [item.id]: e.target.value,
                                                                            })
                                                                        }
                                                                    />
                                                                    <button
                                                                        className="btn btn-primary verify-btn"
                                                                        disabled={actionLoading[`delivery_${item.id}`]}
                                                                        onClick={() => verifyDeliveryOtp(item.id)}
                                                                    >
                                                                        {actionLoading[`delivery_${item.id}`] ? (
                                                                            <span className="spinner-border spinner-border-sm"></span>
                                                                        ) : (
                                                                            "🚚 " + t("Verify Delivery OTP")
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Step 4: Fully Delivered */}
                                                        {isDelivered && (
                                                            <span className="delivered-complete-tag">
                                                                ✅ {t("Delivered")}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default AssignedPickups;