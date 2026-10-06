import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DeliverySidebar from "../components/DeliverySidebar";
import TopNavbar from "../components/TopNavbar";
import DriverMap from "../components/DriverMap";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { LABELS } from "../translations";
import { formatLocalizedNumber } from "../utils/formatNumber";
import { formatLocalizedDate } from "../utils/formatDate";
import { useTranslationContext } from "../context/TranslationContext";
import "../styles/DeliveryDashboard.css";

function DeliveryDashboard() {
    const navigate = useNavigate();
    const t = useTranslate();
    const { language } = useTranslationContext();

    usePageTranslation(LABELS.DELIVERY_DASHBOARD);

    const [profile, setProfile] = useState({});
    const [stats, setStats] = useState({
        assigned: 0,
        out_for_pickup: 0,
        completed: 0,
    });
    const [pickups, setPickups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentCoords, setCurrentCoords] = useState({ lat: 22.5726, lng: 88.3639 });

    // 1. Send live coordinates to backend
    const updateLocation = useCallback((latitude, longitude) => {
        const token = localStorage.getItem("access");
        if (!token) return;

        axios
            .post(
                process.env.REACT_APP_API_URL + "/api/delivery/update-location/",
                { latitude, longitude },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )
            .then(() => {
                // Location successfully synced
            })
            .catch((error) => {
                console.warn("Delivery location update failed:", error);
            });
    }, []);

    // 2. Fetch authenticated driver dashboard data
    const loadDashboardData = useCallback(async () => {
        const token = localStorage.getItem("access");
        if (!token) {
            navigate("/login");
            return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        try {
            const [profileRes, statsRes, pickupsRes] = await Promise.all([
                axios.get(process.env.REACT_APP_API_URL + "/api/delivery/profile/", { headers }).catch(() => ({ data: {} })),
                axios.get(process.env.REACT_APP_API_URL + "/api/delivery/dashboard/", { headers }).catch(() => ({ data: {} })),
                axios.get(process.env.REACT_APP_API_URL + "/api/inventory/delivery/my-pickups/", { headers }).catch(() => ({ data: [] })),
            ]);

            if (profileRes.data) {
                setProfile(profileRes.data);
            }
            if (statsRes.data) {
                setStats(statsRes.data);
            }
            if (Array.isArray(pickupsRes.data)) {
                setPickups(pickupsRes.data);
            }
        } catch (error) {
            console.error("Failed to load delivery dashboard data:", error);
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    // 3. Geolocation watcher
    useEffect(() => {
        if (!navigator.geolocation) {
            console.warn("Geolocation is not supported by this browser.");
            return;
        }

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                setCurrentCoords({ lat, lng });
                updateLocation(lat, lng);
            },
            (error) => {
                console.warn("Geolocation watch error:", error.message);
            },
            {
                enableHighAccuracy: true,
                maximumAge: 10000,
                timeout: 10000,
            }
        );

        return () => {
            navigator.geolocation.clearWatch(watchId);
        };
    }, [updateLocation]);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    // 4. Derive genuine metrics from real data
    const pendingCount = useMemo(() => {
        return Math.max(0, (stats.assigned || 0) - (stats.completed || 0) - (stats.out_for_pickup || 0));
    }, [stats]);

    const activeAssignments = useMemo(() => {
        return pickups.filter((p) => p.status !== "Delivered");
    }, [pickups]);

    // 5. Build dynamic notifications based on real state
    const notificationList = useMemo(() => {
        const list = [];

        if ((stats.out_for_pickup || 0) > 0) {
            list.push({
                key: "pickup",
                icon: "🚚",
                text: t("You are currently delivering food."),
                badge: t("In Transit"),
                badgeClass: "badge-in-transit",
            });
        }

        if (pendingCount > 0) {
            list.push({
                key: "assigned",
                icon: "📦",
                text: t("You have new pickup assignments."),
                badge: t("Pending Pickups"),
                badgeClass: "badge-pending",
            });
        }

        if ((stats.completed || 0) > 0) {
            list.push({
                key: "completed",
                icon: "✅",
                text: t("Great job! Deliveries completed successfully."),
                badge: t("Completed"),
                badgeClass: "badge-completed",
            });
        }

        if (list.length === 0) {
            list.push({
                key: "waiting",
                icon: "🎉",
                text: t("No pending pickups. Waiting for next assignment."),
                badge: t("System Ready"),
                badgeClass: "badge-ready",
            });
        }

        return list;
    }, [stats, pendingCount, t]);

    const availabilityStatus = profile.availability || "AVAILABLE";

    return (
        <>
            <DeliverySidebar />

            <div className="delivery-page">
                <TopNavbar />

                {/* 1. Header Banner */}
                <div className="delivery-header-banner">
                    <div className="delivery-header-info">
                        <h1 className="delivery-main-title">
                            🚚 {t("Delivery Partner Dashboard")}
                        </h1>
                        <p className="delivery-main-subtitle">
                            {t("Welcome Delivery Partner")} •{" "}
                            <span className="driver-highlight">
                                {profile.username || t("Delivery Partner")}
                            </span>
                        </p>
                    </div>

                    <div className="delivery-header-actions">
                        <div className={`delivery-status-pill status-${availabilityStatus.toLowerCase()}`}>
                            <span className="pulse-indicator"></span>
                            <span className="status-text">
                                {t(availabilityStatus)}
                            </span>
                        </div>

                        <button
                            className="delivery-profile-btn"
                            onClick={() => navigate("/delivery-profile")}
                            title={t("Vehicle & Profile")}
                        >
                            ⚙️ {t("Vehicle & Profile")}
                        </button>
                    </div>
                </div>

                {/* 2. Driver & Vehicle Profile Card */}
                <div className="delivery-driver-card mb-4">
                    <div className="driver-card-avatar">
                        <span className="avatar-icon">🚛</span>
                    </div>

                    <div className="driver-card-details">
                        <div className="driver-meta-grid">
                            <div className="driver-meta-item">
                                <span className="meta-label">👤 {t("Name:")}</span>
                                <span className="meta-value">
                                    {profile.username || t("Not Specified")}
                                </span>
                            </div>

                            <div className="driver-meta-item">
                                <span className="meta-label">📞 {t("Phone:")}</span>
                                <span className="meta-value">
                                    {profile.phone || t("Not Specified")}
                                </span>
                            </div>

                            <div className="driver-meta-item">
                                <span className="meta-label">🚚 {t("Vehicle Number:")}</span>
                                <span className="meta-value plate-number">
                                    {profile.vehicle_number || t("Not Specified")}
                                </span>
                            </div>

                            <div className="driver-meta-item">
                                <span className="meta-label">🛡️ {t("Vehicle Type")}:</span>
                                <span className="meta-value">
                                    {profile.vehicle_type || t("Standard Vehicle")}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="driver-card-badge-wrap">
                        <span className="driver-role-badge">
                            {t("Active Driver")}
                        </span>
                    </div>
                </div>

                {/* 3. Real KPI Cards Grid */}
                <div className="row g-3 mb-4">
                    {/* Card 1: Total Assigned */}
                    <div className="col-xl-3 col-md-6 col-12">
                        <div
                            className="delivery-kpi-card kpi-blue"
                            onClick={() => navigate("/assigned-pickups")}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === "Enter" && navigate("/assigned-pickups")}
                        >
                            <div className="kpi-top">
                                <span className="kpi-label">{t("Total Assigned")}</span>
                                <span className="kpi-icon-wrap">
                                    <i className="bi bi-box-seam"></i>
                                </span>
                            </div>
                            <div className="kpi-value">
                                {formatLocalizedNumber(stats.assigned || 0, language)}
                            </div>
                            <div className="kpi-footer">
                                <span>{t("Active Assignments")}</span>
                                <span className="kpi-link-arrow">→</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Pending Pickups */}
                    <div className="col-xl-3 col-md-6 col-12">
                        <div
                            className="delivery-kpi-card kpi-amber"
                            onClick={() => navigate("/assigned-pickups")}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === "Enter" && navigate("/assigned-pickups")}
                        >
                            <div className="kpi-top">
                                <span className="kpi-label">{t("Pending Pickups")}</span>
                                <span className="kpi-icon-wrap">
                                    <i className="bi bi-clock-history"></i>
                                </span>
                            </div>
                            <div className="kpi-value">
                                {formatLocalizedNumber(pendingCount, language)}
                            </div>
                            <div className="kpi-footer">
                                <span>{t("Awaiting Pickup")}</span>
                                <span className="kpi-link-arrow">→</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Out For Pickup (In Transit) */}
                    <div className="col-xl-3 col-md-6 col-12">
                        <div
                            className="delivery-kpi-card kpi-sky"
                            onClick={() => navigate("/delivery-map")}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === "Enter" && navigate("/delivery-map")}
                        >
                            <div className="kpi-top">
                                <span className="kpi-label">{t("Out For Pickup")}</span>
                                <span className="kpi-icon-wrap">
                                    <i className="bi bi-truck"></i>
                                </span>
                            </div>
                            <div className="kpi-value">
                                {formatLocalizedNumber(stats.out_for_pickup || 0, language)}
                            </div>
                            <div className="kpi-footer">
                                <span>{t("In Transit")}</span>
                                <span className="kpi-link-arrow">→</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 4: Completed Deliveries */}
                    <div className="col-xl-3 col-md-6 col-12">
                        <div
                            className="delivery-kpi-card kpi-emerald"
                            onClick={() => navigate("/completed-deliveries")}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === "Enter" && navigate("/completed-deliveries")}
                        >
                            <div className="kpi-top">
                                <span className="kpi-label">{t("Completed Deliveries")}</span>
                                <span className="kpi-icon-wrap">
                                    <i className="bi bi-check2-circle"></i>
                                </span>
                            </div>
                            <div className="kpi-value">
                                {formatLocalizedNumber(stats.completed || 0, language)}
                            </div>
                            <div className="kpi-footer">
                                <span>{t("View History")}</span>
                                <span className="kpi-link-arrow">→</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Quick Actions Grid */}
                <div className="delivery-quick-actions-bar mb-4">
                    <div
                        className="quick-action-tile"
                        onClick={() => navigate("/assigned-pickups")}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && navigate("/assigned-pickups")}
                    >
                        <span className="action-tile-icon">📦</span>
                        <div className="action-tile-text">
                            <strong>{t("Assigned Pickups")}</strong>
                            <small>{t("Review active pickup schedules")}</small>
                        </div>
                        <span className="action-tile-arrow">→</span>
                    </div>

                    <div
                        className="quick-action-tile"
                        onClick={() => navigate("/delivery-map")}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && navigate("/delivery-map")}
                    >
                        <span className="action-tile-icon">🗺️</span>
                        <div className="action-tile-text">
                            <strong>{t("Start Navigation")}</strong>
                            <small>{t("Live route & destination map")}</small>
                        </div>
                        <span className="action-tile-arrow">→</span>
                    </div>

                    <div
                        className="quick-action-tile"
                        onClick={() => navigate("/completed-deliveries")}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && navigate("/completed-deliveries")}
                    >
                        <span className="action-tile-icon">✅</span>
                        <div className="action-tile-text">
                            <strong>{t("View Completed")}</strong>
                            <small>{t("Delivered food log & history")}</small>
                        </div>
                        <span className="action-tile-arrow">→</span>
                    </div>

                    <div
                        className="quick-action-tile"
                        onClick={() => navigate("/delivery-settings")}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && navigate("/delivery-settings")}
                    >
                        <span className="action-tile-icon">⚙️</span>
                        <div className="action-tile-text">
                            <strong>{t("Settings")}</strong>
                            <small>{t("Preferences, theme & languages")}</small>
                        </div>
                        <span className="action-tile-arrow">→</span>
                    </div>
                </div>

                {/* 5. Active Assignments Table / Honest Empty State */}
                <div className="delivery-section-card mb-4">
                    <div className="delivery-section-header">
                        <div className="header-left">
                            <span className="section-icon">📦</span>
                            <h2 className="section-title">
                                {t("Active Pickup Assignments")}
                            </h2>
                            <span className="section-count-badge">
                                {formatLocalizedNumber(activeAssignments.length, language)}
                            </span>
                        </div>

                        {activeAssignments.length > 0 && (
                            <button
                                className="section-header-link"
                                onClick={() => navigate("/assigned-pickups")}
                            >
                                {t("View All Pickups")} →
                            </button>
                        )}
                    </div>

                    <div className="delivery-section-body">
                        {loading ? (
                            <div className="delivery-loading-box">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : activeAssignments.length === 0 ? (
                            <div className="delivery-empty-state">
                                <div className="empty-icon-wrap">
                                    <span>🚚</span>
                                </div>
                                <h3 className="empty-title">
                                    {t("No active pickups assigned")}
                                </h3>
                                <p className="empty-desc">
                                    {t("When new food donations are assigned to your vehicle, they will appear here in real time.")}
                                </p>
                                <button
                                    className="btn btn-primary empty-cta-btn"
                                    onClick={() => navigate("/assigned-pickups")}
                                >
                                    {t("View All Pickups")}
                                </button>
                            </div>
                        ) : (
                            <div className="table-responsive delivery-table-wrap">
                                <table className="table delivery-table align-middle">
                                    <thead>
                                        <tr>
                                            <th>{t("Item Name")}</th>
                                            <th>{t("Category")}</th>
                                            <th>{t("Quantity")}</th>
                                            <th>{t("Pickup Schedule")}</th>
                                            <th>{t("Status")}</th>
                                            <th>{t("Verification")}</th>
                                            <th className="text-end">{t("Action")}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activeAssignments.slice(0, 5).map((item) => (
                                            <tr key={item.id}>
                                                <td className="fw-semibold text-main">
                                                    {item.product_name}
                                                </td>
                                                <td>
                                                    <span className="table-cat-badge">
                                                        {item.category || "Food"}
                                                    </span>
                                                </td>
                                                <td className="fw-medium">
                                                    {formatLocalizedNumber(item.quantity, language)} {t("Units")}
                                                </td>
                                                <td>
                                                    <div className="schedule-meta">
                                                        <span>📅 {formatLocalizedDate(item.pickup_date, language)}</span>
                                                        {item.pickup_time && (
                                                            <small className="text-muted d-block">
                                                                ⏰ {item.pickup_time}
                                                            </small>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span
                                                        className={`badge table-status-badge ${
                                                            item.status === "Out For Pickup"
                                                                ? "bg-primary"
                                                                : item.status === "Scheduled"
                                                                ? "bg-warning text-dark"
                                                                : "bg-secondary"
                                                        }`}
                                                    >
                                                        {t(item.status)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="otp-status-stack">
                                                        <span
                                                            className={`otp-chip ${
                                                                item.pickup_verified ? "otp-verified" : "otp-pending"
                                                            }`}
                                                        >
                                                            {item.pickup_verified ? "Pickup OTP ✓" : "Pickup OTP ⏳"}
                                                        </span>
                                                        <span
                                                            className={`otp-chip ${
                                                                item.delivery_verified ? "otp-verified" : "otp-pending"
                                                            }`}
                                                        >
                                                            {item.delivery_verified ? "Delivery OTP ✓" : "Delivery OTP ⏳"}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="text-end">
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => navigate("/assigned-pickups")}
                                                    >
                                                        {t("View Details")}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* 6. Notifications & Map Grid */}
                <div className="row g-4">
                    {/* Live Notifications Feed */}
                    <div className="col-lg-5 col-12">
                        <div className="delivery-section-card h-100">
                            <div className="delivery-section-header">
                                <div className="header-left">
                                    <span className="section-icon">🔔</span>
                                    <h2 className="section-title">
                                        {t("Notifications")}
                                    </h2>
                                </div>
                            </div>

                            <div className="delivery-section-body p-3">
                                <div className="notification-list-stack">
                                    {notificationList.map((note) => (
                                        <div key={note.key} className="notification-item-card">
                                            <div className="note-icon-col">
                                                <span className="note-emoji">{note.icon}</span>
                                            </div>
                                            <div className="note-content-col">
                                                <p className="note-title">{note.text}</p>
                                                <span className={`note-badge ${note.badgeClass}`}>
                                                    {note.badge}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Live Driver Map */}
                    <div className="col-lg-7 col-12">
                        <div className="delivery-section-card h-100">
                            <div className="delivery-section-header">
                                <div className="header-left">
                                    <span className="section-icon">📍</span>
                                    <h2 className="section-title">
                                        {t("Live Driver Location")}
                                    </h2>
                                </div>

                                <div className="coords-pill">
                                    <span className="coords-dot"></span>
                                    <span>
                                        {currentCoords.lat.toFixed(4)}, {currentCoords.lng.toFixed(4)}
                                    </span>
                                </div>
                            </div>

                            <div className="delivery-section-body p-3">
                                <div className="map-frame-wrap">
                                    <DriverMap />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default DeliveryDashboard;