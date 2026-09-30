import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import DeliverySidebar from "../components/DeliverySidebar";
import TopNavbar from "../components/TopNavbar";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { LABELS } from "../translations";
import { buildDynamicLabels } from "../utils/buildDynamicLabels";
import { formatLocalizedNumber } from "../utils/formatNumber";
import { useTranslationContext } from "../context/TranslationContext";
import "../styles/Navigation.css";

// Configure default leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function Navigation() {
    const navigate = useNavigate();
    const t = useTranslate();
    const { language } = useTranslationContext();

    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [driverCoords, setDriverCoords] = useState({ lat: 22.5726, lng: 88.3639 });
    const [gpsActive, setGpsActive] = useState(false);
    const [actionLoading, setActionLoading] = useState({});
    const [feedback, setFeedback] = useState(null);
    const [completedSessionCount, setCompletedSessionCount] = useState(0);

    const dynamicLabels = useMemo(
        () =>
            buildDynamicLabels(LABELS.DELIVERY_NAVIGATION, deliveries, [
                "product_name",
                "unit",
                "status",
            ]),
        [deliveries]
    );

    usePageTranslation(dynamicLabels);

    const showFeedback = useCallback((type, message) => {
        setFeedback({ type, message });
        setTimeout(() => {
            setFeedback(null);
        }, 5000);
    }, []);

    // 1. Sync live coordinates with backend
    const updateLocation = useCallback((latitude, longitude) => {
        const token = localStorage.getItem("access");
        if (!token) return;

        axios
            .post(
                "http://127.0.0.1:8000/api/delivery/update-location/",
                { latitude, longitude },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )
            .catch((error) => {
                console.warn("Delivery location sync failed:", error);
            });
    }, []);

    // 2. Fetch deliveries that are currently out for pickup
    const loadDeliveries = useCallback(async () => {
        const token = localStorage.getItem("access");
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const response = await axios.get(
                "http://127.0.0.1:8000/api/inventory/out-for-pickup/",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = Array.isArray(response.data) ? response.data : [];
            setDeliveries(data);
        } catch (error) {
            console.error("Failed to load active deliveries:", error);
            showFeedback("error", t("Failed to load active deliveries."));
        } finally {
            setLoading(false);
        }
    }, [navigate, showFeedback, t]);

    // 3. Setup live GPS watcher
    useEffect(() => {
        if (!navigator.geolocation) {
            console.warn("Geolocation not supported");
            setGpsActive(false);
            return;
        }

        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                setDriverCoords({ lat, lng });
                setGpsActive(true);
                updateLocation(lat, lng);
            },
            (err) => {
                console.warn("GPS watch position error:", err.message);
                setGpsActive(false);
            },
            {
                enableHighAccuracy: true,
                maximumAge: 10000,
                timeout: 10000,
            }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, [updateLocation]);

    useEffect(() => {
        loadDeliveries();
    }, [loadDeliveries]);

    // 4. Open External Google Maps Turn-by-Turn Navigation
    const openNavigation = useCallback(
        (address, lat, lng) => {
            let url = "";

            if (lat && lng) {
                url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
            } else if (address && address.trim()) {
                url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address.trim())}`;
            } else {
                url = `https://www.google.com/maps?q=${driverCoords.lat},${driverCoords.lng}`;
            }

            window.open(url, "_blank");
        },
        [driverCoords]
    );

    // 5. Mark Delivered Action
    const markDelivered = useCallback(
        async (id) => {
            const token = localStorage.getItem("access");
            if (!token) return;

            setActionLoading((prev) => ({ ...prev, [id]: true }));

            try {
                await axios.post(
                    `http://127.0.0.1:8000/api/inventory/mark-delivered/${id}/`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                showFeedback("success", t("Delivery Completed Successfully 🎉"));
                setCompletedSessionCount((prev) => prev + 1);
                await loadDeliveries();
            } catch (error) {
                console.error("Failed to mark delivered:", error);
                showFeedback("error", t("Failed"));
            } finally {
                setActionLoading((prev) => ({ ...prev, [id]: false }));
            }
        },
        [loadDeliveries, showFeedback, t]
    );

    // 6. Summary metrics
    const outForPickupCount = useMemo(() => {
        return deliveries.filter((d) => d.status === "Out For Pickup").length;
    }, [deliveries]);

    return (
        <>
            <DeliverySidebar />

            <div className="navigation-page">
                <TopNavbar />

                {/* Feedback Notification Banner */}
                {feedback && (
                    <div className={`nav-feedback-banner feedback-${feedback.type}`}>
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
                <div className="navigation-header-banner">
                    <div className="navigation-header-info">
                        <h1 className="navigation-main-title">
                            🗺️ {t("Navigation")}
                        </h1>
                        <p className="navigation-main-subtitle">
                            {t("Navigate active deliveries and complete them successfully.")}
                        </p>
                    </div>

                    <div className="navigation-header-actions">
                        <div className={`gps-status-pill ${gpsActive ? "gps-active" : "gps-inactive"}`}>
                            <span className="gps-dot"></span>
                            <span>{gpsActive ? t("GPS Active") : t("GPS Unavailable")}</span>
                        </div>

                        <div className="navigation-active-badge">
                            <span className="badge-count">
                                {formatLocalizedNumber(deliveries.length, language)}
                            </span>
                            <span>{t("Active Delivery")}</span>
                        </div>
                    </div>
                </div>

                {/* 2. KPI Summary Grid */}
                <div className="navigation-kpi-grid mb-4">
                    {/* KPI 1: Active Deliveries */}
                    <div className="navigation-kpi-card kpi-blue">
                        <div className="kpi-card-top">
                            <span className="kpi-card-label">{t("Active Deliveries")}</span>
                            <span className="kpi-card-icon">🗺️</span>
                        </div>
                        <div className="kpi-card-number">
                            {formatLocalizedNumber(deliveries.length, language)}
                        </div>
                        <div className="kpi-card-footer">
                            <span>{t("En Route")}</span>
                        </div>
                    </div>

                    {/* KPI 2: Out For Delivery */}
                    <div className="navigation-kpi-card kpi-sky">
                        <div className="kpi-card-top">
                            <span className="kpi-card-label">{t("Out For Delivery")}</span>
                            <span className="kpi-card-icon">🚚</span>
                        </div>
                        <div className="kpi-card-number">
                            {formatLocalizedNumber(outForPickupCount, language)}
                        </div>
                        <div className="kpi-card-footer">
                            <span>{t("In Transit")}</span>
                        </div>
                    </div>

                    {/* KPI 3: Completed Session Deliveries */}
                    <div className="navigation-kpi-card kpi-emerald">
                        <div className="kpi-card-top">
                            <span className="kpi-card-label">{t("Completed Deliveries")}</span>
                            <span className="kpi-card-icon">✅</span>
                        </div>
                        <div className="kpi-card-number">
                            {formatLocalizedNumber(completedSessionCount, language)}
                        </div>
                        <div className="kpi-card-footer">
                            <span>{t("Session Completed")}</span>
                        </div>
                    </div>
                </div>

                {/* 3. Interactive Leaflet Delivery Map Card */}
                <div className="navigation-map-card mb-4">
                    <div className="map-card-header">
                        <div className="header-left">
                            <span className="section-icon">📍</span>
                            <h2 className="section-title">
                                {t("Live Navigation & Route Map")}
                            </h2>
                        </div>

                        <div className="coords-display-pill">
                            <span className="pulse-coords-dot"></span>
                            <span>
                                {driverCoords.lat.toFixed(4)}, {driverCoords.lng.toFixed(4)}
                            </span>
                        </div>
                    </div>

                    <div className="map-card-body">
                        <div className="leaflet-map-frame">
                            <MapContainer
                                center={[driverCoords.lat, driverCoords.lng]}
                                zoom={14}
                                style={{ height: "420px", width: "100%", borderRadius: "14px" }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                />

                                {/* Live Driver Location Marker */}
                                <Marker position={[driverCoords.lat, driverCoords.lng]}>
                                    <Popup>
                                        <strong>🚚 {t("Live Driver Location")}</strong>
                                        <br />
                                        <small>
                                            {driverCoords.lat.toFixed(5)}, {driverCoords.lng.toFixed(5)}
                                        </small>
                                    </Popup>
                                </Marker>

                                {/* Delivery Destination Markers (if coordinates exist) */}
                                {deliveries.map((item) => {
                                    if (item.current_latitude && item.current_longitude) {
                                        return (
                                            <Marker
                                                key={item.id}
                                                position={[item.current_latitude, item.current_longitude]}
                                            >
                                                <Popup>
                                                    <strong>📦 {item.product_name}</strong>
                                                    <br />
                                                    <small>{item.pickup_address || t("Destination")}</small>
                                                </Popup>
                                            </Marker>
                                        );
                                    }
                                    return null;
                                })}
                            </MapContainer>
                        </div>
                    </div>
                </div>

                {/* 4. Active Deliveries Table / Truthful Empty State */}
                <div className="navigation-section-card">
                    <div className="navigation-section-header">
                        <div className="header-left">
                            <span className="section-icon">📦</span>
                            <h2 className="section-title">
                                {t("Active Deliveries")}
                            </h2>
                            <span className="section-count-badge">
                                {formatLocalizedNumber(deliveries.length, language)}
                            </span>
                        </div>

                        {deliveries.length > 0 && (
                            <button
                                className="section-header-link"
                                onClick={() => navigate("/assigned-pickups")}
                            >
                                {t("View Assigned Pickups")} →
                            </button>
                        )}
                    </div>

                    <div className="navigation-section-body">
                        {loading ? (
                            <div className="navigation-loading-state">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="mt-3 text-muted">{t("Loading deliveries...")}</p>
                            </div>
                        ) : deliveries.length === 0 ? (
                            /* Truthful Empty State */
                            <div className="navigation-empty-state">
                                <div className="empty-state-icon">
                                    <span>🗺️</span>
                                </div>
                                <h3 className="empty-state-title">
                                    {t("No Active Deliveries")}
                                </h3>
                                <p className="empty-state-desc">
                                    {t("Active Deliveries en route will appear here with live navigation.")}
                                </p>
                                <button
                                    className="btn btn-primary empty-cta-btn"
                                    onClick={() => navigate("/assigned-pickups")}
                                >
                                    📦 {t("View Assigned Pickups")}
                                </button>
                            </div>
                        ) : (
                            <div className="table-responsive navigation-table-wrap">
                                <table className="table navigation-data-table align-middle">
                                    <thead>
                                        <tr>
                                            <th>{t("Product")}</th>
                                            <th>{t("Quantity")}</th>
                                            <th>{t("Vehicle")}</th>
                                            <th>{t("Donor & Address")}</th>
                                            <th>{t("Status")}</th>
                                            <th className="text-end">{t("Action")}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {deliveries.map((item) => (
                                            <tr key={item.id} className="navigation-table-row">
                                                {/* Product Info */}
                                                <td>
                                                    <div className="product-info-cell">
                                                        <span className="product-name fw-bold">
                                                            {t(item.product_name)}
                                                        </span>
                                                        <span className="category-pill">
                                                            {item.category || "Food"}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Quantity */}
                                                <td>
                                                    <span className="fw-semibold quantity-cell">
                                                        {formatLocalizedNumber(item.quantity, language)}{" "}
                                                        <small className="text-muted">
                                                            {t(item.unit || "Units")}
                                                        </small>
                                                    </span>
                                                </td>

                                                {/* Vehicle */}
                                                <td>
                                                    <span className="vehicle-plate-pill">
                                                        {item.vehicle_number || "—"}
                                                    </span>
                                                </td>

                                                {/* Donor & Address */}
                                                <td>
                                                    <div className="address-info-cell">
                                                        {item.business_name && (
                                                            <strong className="donor-name">
                                                                🏪 {item.business_name}
                                                            </strong>
                                                        )}
                                                        <span className="address-text" title={item.pickup_address}>
                                                            📍 {item.pickup_address || t("Address specified upon arrival")}
                                                        </span>
                                                        {item.contact_number && (
                                                            <small className="contact-text">
                                                                📞 {item.contact_number}
                                                            </small>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Status Badge */}
                                                <td>
                                                    <span className="badge status-pill-transit">
                                                        {t(item.status)}
                                                    </span>
                                                </td>

                                                {/* Action Buttons */}
                                                <td className="text-end">
                                                    <div className="action-buttons-wrap">
                                                        <button
                                                            className="btn btn-sm btn-primary open-nav-btn"
                                                            onClick={() =>
                                                                openNavigation(
                                                                    item.pickup_address,
                                                                    item.current_latitude,
                                                                    item.current_longitude
                                                                )
                                                            }
                                                            title={t("Open Navigation")}
                                                        >
                                                            🗺️ {t("Open Navigation")}
                                                        </button>

                                                        <button
                                                            className="btn btn-sm btn-success mark-delivered-btn"
                                                            disabled={actionLoading[item.id]}
                                                            onClick={() => markDelivered(item.id)}
                                                        >
                                                            {actionLoading[item.id] ? (
                                                                <span className="spinner-border spinner-border-sm"></span>
                                                            ) : (
                                                                "✅ " + t("Mark Delivered")
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default Navigation;
