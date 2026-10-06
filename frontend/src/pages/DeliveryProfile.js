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
import "../styles/DeliveryProfile.css";

function DeliveryProfile() {
    const navigate = useNavigate();
    const t = useTranslate();
    const { language } = useTranslationContext();

    const [profile, setProfile] = useState({
        username: localStorage.getItem("username") || "",
        email: "",
        phone: "",
        vehicle_type: "",
        vehicle_number: "",
        availability: "AVAILABLE",
        role: "DELIVERY",
        date_joined: "",
    });

    const [stats, setStats] = useState({
        assigned: 0,
        out_for_pickup: 0,
        completed: 0,
    });

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const dynamicLabels = useMemo(
        () =>
            buildDynamicLabels(LABELS.DELIVERY_PROFILE, [profile], [
                "username",
                "vehicle_type",
                "availability",
                "role",
            ]),
        [profile]
    );

    usePageTranslation(dynamicLabels);

    const showFeedback = useCallback((type, message) => {
        setFeedback({ type, message });
        setTimeout(() => {
            setFeedback(null);
        }, 5000);
    }, []);

    // 1. Fetch authentic driver profile and operational stats
    const loadProfileData = useCallback(
        async (isManual = false) => {
            const token = localStorage.getItem("access");
            if (!token) {
                navigate("/login");
                return;
            }

            if (isManual) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const headers = { Authorization: `Bearer ${token}` };

            try {
                const [profileRes, statsRes] = await Promise.all([
                    axios.get(process.env.REACT_APP_API_URL + "/api/delivery/profile/", {
                        headers,
                    }),
                    axios.get(process.env.REACT_APP_API_URL + "/api/delivery/dashboard/", {
                        headers,
                    }),
                ]);

                if (profileRes.data) {
                    const data = profileRes.data;
                    setProfile({
                        username: data.username || localStorage.getItem("username") || "",
                        email: data.email || "",
                        phone: data.phone || "",
                        vehicle_type: data.vehicle_type || "",
                        vehicle_number: data.vehicle_number || "",
                        availability: data.availability || "AVAILABLE",
                        role: data.role || "DELIVERY",
                        date_joined: data.date_joined || "",
                    });
                    localStorage.setItem(
                        "offline_delivery_profile",
                        JSON.stringify(data)
                    );
                }

                if (statsRes.data) {
                    setStats({
                        assigned: statsRes.data.assigned || 0,
                        out_for_pickup: statsRes.data.out_for_pickup || 0,
                        completed: statsRes.data.completed || 0,
                    });
                    localStorage.setItem(
                        "offline_delivery_stats",
                        JSON.stringify(statsRes.data)
                    );
                }
            } catch (error) {
                console.error("Failed to load delivery profile data:", error);
                const cachedProfile = localStorage.getItem("offline_delivery_profile");
                const cachedStats = localStorage.getItem("offline_delivery_stats");

                if (cachedProfile) {
                    try {
                        const parsed = JSON.parse(cachedProfile);
                        setProfile((prev) => ({
                            ...prev,
                            ...parsed,
                        }));
                        showFeedback(
                            "info",
                            t("📶 Offline Mode: Showing last synced profile details.")
                        );
                    } catch (e) {
                        // ignore parse error
                    }
                } else {
                    showFeedback("danger", t("Failed to load profile data."));
                }

                if (cachedStats) {
                    try {
                        const parsedStats = JSON.parse(cachedStats);
                        setStats({
                            assigned: parsedStats.assigned || 0,
                            out_for_pickup: parsedStats.out_for_pickup || 0,
                            completed: parsedStats.completed || 0,
                        });
                    } catch (e) {
                        // ignore parse error
                    }
                }
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [navigate, showFeedback, t]
    );

    useEffect(() => {
        loadProfileData();
    }, [loadProfileData]);

    const availabilityStatusText = useMemo(() => {
        if (profile.availability === "AVAILABLE") return t("Available");
        if (profile.availability === "BUSY") return t("Busy");
        if (profile.availability === "OFFLINE") return t("Offline");
        return t("Available");
    }, [profile.availability, t]);

    const availabilityClass = useMemo(() => {
        const val = (profile.availability || "").toLowerCase();
        if (val === "busy") return "status-busy";
        if (val === "offline") return "status-offline";
        return "status-available";
    }, [profile.availability]);

    return (
        <div className="delivery-profile-layout">
            <DeliverySidebar />

            <main className="delivery-profile-page">
                <TopNavbar />

                {/* Feedback Notification Banner */}
                {feedback && (
                    <div
                        className={`delivery-profile-alert delivery-profile-alert-${feedback.type}`}
                        role="alert"
                    >
                        <span>{feedback.message}</span>
                        <button
                            type="button"
                            className="delivery-profile-alert-close"
                            onClick={() => setFeedback(null)}
                            aria-label="Close"
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* Header Card */}
                <header className="delivery-profile-header-card">
                    <div className="delivery-profile-header-left">
                        <div className="delivery-profile-avatar-box">
                            <span role="img" aria-label="Profile">
                                👤
                            </span>
                        </div>
                        <div className="delivery-profile-header-text">
                            <div className="delivery-profile-title-row">
                                <h1 className="delivery-profile-title">
                                    {t("Delivery Partner Profile")}
                                </h1>
                                <span className={`delivery-profile-status-pill ${availabilityClass}`}>
                                    <span
                                        className="delivery-profile-pulse-dot"
                                        aria-hidden="true"
                                    ></span>
                                    {availabilityStatusText}
                                </span>
                            </div>
                            <p className="delivery-profile-subtitle">
                                {t("Manage and review your verified delivery credentials and vehicle assignment.")}
                            </p>
                        </div>
                    </div>

                    <div className="delivery-profile-header-actions">
                        <button
                            type="button"
                            className="delivery-profile-btn-secondary"
                            onClick={() => loadProfileData(true)}
                            disabled={loading || refreshing}
                        >
                            <span
                                className={`delivery-profile-btn-icon ${
                                    refreshing ? "delivery-profile-spinning" : ""
                                }`}
                            >
                                🔄
                            </span>
                            <span>{t("Refresh")}</span>
                        </button>
                    </div>
                </header>

                {/* Operational Statistics Strip (Real API Data) */}
                <section
                    className="delivery-profile-stats-grid"
                    aria-label="Operational Statistics"
                >
                    <div className="delivery-profile-stat-card">
                        <div className="delivery-profile-stat-header">
                            <span className="delivery-profile-stat-label">
                                {t("Assigned Pickups")}
                            </span>
                            <span className="delivery-profile-stat-icon">📦</span>
                        </div>
                        <div className="delivery-profile-stat-val">
                            {formatLocalizedNumber(stats.assigned, language)}
                        </div>
                        <div className="delivery-profile-stat-subtext">
                            {t("Pending Pickup")}
                        </div>
                    </div>

                    <div className="delivery-profile-stat-card">
                        <div className="delivery-profile-stat-header">
                            <span className="delivery-profile-stat-label">
                                {t("Active in Transit")}
                            </span>
                            <span className="delivery-profile-stat-icon">🚚</span>
                        </div>
                        <div className="delivery-profile-stat-val">
                            {formatLocalizedNumber(stats.out_for_pickup, language)}
                        </div>
                        <div className="delivery-profile-stat-subtext">
                            {t("Out For Pickup")}
                        </div>
                    </div>

                    <div className="delivery-profile-stat-card">
                        <div className="delivery-profile-stat-header">
                            <span className="delivery-profile-stat-label">
                                {t("Completed Deliveries")}
                            </span>
                            <span className="delivery-profile-stat-icon">✅</span>
                        </div>
                        <div className="delivery-profile-stat-val">
                            {formatLocalizedNumber(stats.completed, language)}
                        </div>
                        <div className="delivery-profile-stat-subtext">
                            {t("Delivered")}
                        </div>
                    </div>
                </section>

                {/* Profile Main Content Grid */}
                <div className="delivery-profile-content-grid">
                    {/* Left Column: Driver Identity Card */}
                    <div className="delivery-profile-identity-col">
                        <div className="delivery-profile-identity-card">
                            <div className="delivery-profile-card-top-accent"></div>
                            <div className="delivery-profile-identity-body">
                                <div
                                    className="delivery-profile-large-avatar"
                                    aria-hidden="true"
                                >
                                    {profile.vehicle_type === "Bike" ? "🛵" : "🚚"}
                                </div>
                                <h2 className="delivery-profile-driver-name">
                                    {profile.username || "—"}
                                </h2>
                                <div className="delivery-profile-driver-handle">
                                    @{profile.username}
                                </div>
                                <span className="delivery-profile-role-badge">
                                    🛡️ {t("Delivery Partner")}
                                </span>

                                <div className="delivery-profile-meta-list">
                                    <div className="delivery-profile-meta-item">
                                        <span className="delivery-profile-meta-label">
                                            {t("Status")}
                                        </span>
                                        <span
                                            className={`delivery-profile-meta-badge ${availabilityClass}`}
                                        >
                                            {availabilityStatusText}
                                        </span>
                                    </div>

                                    <div className="delivery-profile-meta-item">
                                        <span className="delivery-profile-meta-label">
                                            {t("Verified Partner")}
                                        </span>
                                        <span className="delivery-profile-verified-text">
                                            ✓ {t("Active Driver")}
                                        </span>
                                    </div>

                                    {profile.date_joined && (
                                        <div className="delivery-profile-meta-item">
                                            <span className="delivery-profile-meta-label">
                                                {t("Member Since")}
                                            </span>
                                            <span className="delivery-profile-date-text">
                                                {formatLocalizedDate(
                                                    profile.date_joined,
                                                    language
                                                )}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Detailed Credentials & Vehicle Specifications */}
                    <div className="delivery-profile-details-col">
                        {/* Section 1: Account Details */}
                        <div className="delivery-profile-section-card">
                            <div className="delivery-profile-section-header">
                                <div className="d-flex align-items-center gap-2">
                                    <span className="delivery-profile-section-icon">🪪</span>
                                    <h3 className="delivery-profile-section-title">
                                        {t("Account Details")}
                                    </h3>
                                </div>
                            </div>
                            <div className="delivery-profile-section-body">
                                <div className="delivery-profile-fields-grid">
                                    <div className="delivery-profile-field-box">
                                        <label className="delivery-profile-field-label">
                                            {t("Username")}
                                        </label>
                                        <div className="delivery-profile-field-val">
                                            {loading ? (
                                                <span className="delivery-profile-skeleton-line short"></span>
                                            ) : (
                                                profile.username || "—"
                                            )}
                                        </div>
                                    </div>

                                    <div className="delivery-profile-field-box">
                                        <label className="delivery-profile-field-label">
                                            {t("Email Address")}
                                        </label>
                                        <div className="delivery-profile-field-val">
                                            {loading ? (
                                                <span className="delivery-profile-skeleton-line"></span>
                                            ) : (
                                                profile.email || t("Not Provided")
                                            )}
                                        </div>
                                    </div>

                                    <div className="delivery-profile-field-box">
                                        <label className="delivery-profile-field-label">
                                            {t("Contact Phone")}
                                        </label>
                                        <div className="delivery-profile-field-val">
                                            {loading ? (
                                                <span className="delivery-profile-skeleton-line short"></span>
                                            ) : (
                                                profile.phone || t("Not Provided")
                                            )}
                                        </div>
                                    </div>

                                    <div className="delivery-profile-field-box">
                                        <label className="delivery-profile-field-label">
                                            {t("Role")}
                                        </label>
                                        <div className="delivery-profile-field-val">
                                            {loading ? (
                                                <span className="delivery-profile-skeleton-line short"></span>
                                            ) : (
                                                t("Delivery Partner")
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Vehicle Information */}
                        <div className="delivery-profile-section-card">
                            <div className="delivery-profile-section-header">
                                <div className="d-flex align-items-center gap-2">
                                    <span className="delivery-profile-section-icon">🚗</span>
                                    <h3 className="delivery-profile-section-title">
                                        {t("Vehicle Information")}
                                    </h3>
                                </div>
                            </div>
                            <div className="delivery-profile-section-body">
                                <div className="delivery-profile-fields-grid">
                                    <div className="delivery-profile-field-box">
                                        <label className="delivery-profile-field-label">
                                            {t("Vehicle Type")}
                                        </label>
                                        <div className="delivery-profile-field-val">
                                            {loading ? (
                                                <span className="delivery-profile-skeleton-line short"></span>
                                            ) : (
                                                profile.vehicle_type
                                                    ? t(profile.vehicle_type)
                                                    : t("Not Assigned")
                                            )}
                                        </div>
                                    </div>

                                    <div className="delivery-profile-field-box">
                                        <label className="delivery-profile-field-label">
                                            {t("Vehicle Number")}
                                        </label>
                                        <div className="delivery-profile-field-val delivery-profile-mono">
                                            {loading ? (
                                                <span className="delivery-profile-skeleton-line short"></span>
                                            ) : (
                                                profile.vehicle_number || t("Not Assigned")
                                            )}
                                        </div>
                                    </div>

                                    <div className="delivery-profile-field-box">
                                        <label className="delivery-profile-field-label">
                                            {t("Operational Status")}
                                        </label>
                                        <div className="delivery-profile-field-val">
                                            {loading ? (
                                                <span className="delivery-profile-skeleton-line short"></span>
                                            ) : (
                                                availabilityStatusText
                                            )}
                                        </div>
                                    </div>

                                    <div className="delivery-profile-field-box">
                                        <label className="delivery-profile-field-label">
                                            {t("Fleet Assignment")}
                                        </label>
                                        <div className="delivery-profile-field-val">
                                            {loading ? (
                                                <span className="delivery-profile-skeleton-line"></span>
                                            ) : (
                                                t("FoodBridge Logistics Network")
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Verified Notice Card */}
                        <div className="delivery-profile-notice-card">
                            <div className="delivery-profile-notice-icon">ℹ️</div>
                            <div className="delivery-profile-notice-text">
                                {t(
                                    "Delivery credentials, vehicle assignments, and identity verification are managed through your authorized FoodBridge AI partner account. To update vehicle or contact details, please contact platform dispatch or administration."
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default DeliveryProfile;