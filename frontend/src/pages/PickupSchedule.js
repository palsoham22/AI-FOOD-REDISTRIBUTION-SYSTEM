import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import NGOSidebar from "../components/NGOSidebar";
import TopNavbar from "../components/TopNavbar";
import NGOMap from "../components/NGOMap";
import { useTranslate } from "../hooks/useTranslate";
import "../styles/PickupSchedule.css";

function PickupSchedule() {
    const { id } = useParams();
    const navigate = useNavigate();
    const t = useTranslate();

    const [pickupDate, setPickupDate] = useState("");
    const [pickupTime, setPickupTime] = useState("");
    const [volunteerName, setVolunteerName] = useState("");
    const [driverStatus, setDriverStatus] = useState("");
    const [recommendedVehicle, setRecommendedVehicle] = useState("");
    const [productName, setProductName] = useState("");
    const [category, setCategory] = useState("");
    const [quantity, setQuantity] = useState("");
    const [storageType, setStorageType] = useState("");
    const [vehicleType, setVehicleType] = useState("");
    const [driverVehicleNumber, setDriverVehicleNumber] = useState("");
    const [deliveryPartners, setDeliveryPartners] = useState([]);
    const [driverId, setDriverId] = useState(null);
    const [loadingDonation, setLoadingDonation] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchDonation = async () => {
            const token = localStorage.getItem("access");
            try {
                const res = await axios.get(
                    `http://127.0.0.1:8000/api/inventory/schedule/${id}/`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setProductName(res.data.product_name);
                setCategory(res.data.category);
                setQuantity(res.data.quantity);
                setStorageType(res.data.storage_type);
                setRecommendedVehicle(res.data.recommended_vehicle);
            } catch (error) {
                console.error("Failed to fetch donation details:", error);
            } finally {
                setLoadingDonation(false);
            }
        };

        const fetchDeliveryPartners = async () => {
            const token = localStorage.getItem("access");
            try {
                const res = await axios.get(
                    "http://127.0.0.1:8000/api/available-delivery-partners/",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                setDeliveryPartners(Array.isArray(res.data) ? res.data : []);
            } catch (error) {
                console.error("Failed to fetch delivery partners:", error);
            }
        };

        fetchDonation();
        fetchDeliveryPartners();
    }, [id]);

    const saveSchedule = async (e) => {
        if (e && e.preventDefault) e.preventDefault();

        if (!pickupDate || !pickupTime || !volunteerName) {
            alert(t("Please fill in all required scheduling fields."));
            return;
        }

        setSubmitting(true);
        const token = localStorage.getItem("access");

        try {
            const response = await axios.post(
                `http://127.0.0.1:8000/api/inventory/schedule/${id}/`,
                {
                    pickup_date: pickupDate,
                    pickup_time: pickupTime,
                    volunteer_name: volunteerName,
                    vehicle_number: driverVehicleNumber
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert(
                `Pickup Scheduled Successfully!

Pickup OTP: ${response.data.pickup_otp}

Delivery OTP: ${response.data.delivery_otp}`
            );

            navigate("/pickup-schedule");
        } catch (error) {
            console.error("Failed to schedule pickup:", error);
            alert(t("Scheduling Failed"));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <NGOSidebar />

            <div className="pickup-page">
                <TopNavbar />

                {/* 1. Header Card */}
                <div className="pickup-header-card mb-4">
                    <div className="pickup-header-main">
                        <div className="pickup-avatar-box">
                            <span className="pickup-avatar-icon">🚚</span>
                        </div>
                        <div className="pickup-header-info">
                            <div className="d-flex align-items-center flex-wrap gap-2 mb-1">
                                <h1 className="pickup-title mb-0">{t("Pickup Schedule")}</h1>
                                <span className="badge pickup-status-pill">
                                    <span className="pickup-pulse-dot" aria-hidden="true"></span>
                                    {t("Schedule Pickup")}
                                </span>
                            </div>
                            <p className="pickup-subtitle mb-0">
                                {t("Coordinate pickup timing and logistics details between donor facilities and community partners.")}
                            </p>
                        </div>
                    </div>
                    <div className="pickup-header-actions">
                        <Link to="/accepted-donations" className="btn btn-outline-secondary btn-sm me-2">
                            <i className="bi bi-arrow-left me-1"></i>
                            {t("Accepted Donations")}
                        </Link>
                        <Link to="/pickup-schedule" className="btn btn-outline-primary btn-sm">
                            <i className="bi bi-list-check me-1"></i>
                            {t("Scheduled Pickups")}
                        </Link>
                    </div>
                </div>

                {/* 2. Main Two-Column Scheduling Grid */}
                <div className="row g-4">
                    {/* Left Column: Donation Summary, Vehicle Recommendation & Live Tracking */}
                    <div className="col-lg-5 col-12">
                        {/* Donation & Recommended Vehicle Card */}
                        <div className="pickup-info-card mb-4">
                            <div className="pickup-card-header">
                                <h3 className="pickup-card-title mb-0">
                                    <i className="bi bi-box-seam me-2 text-primary"></i>
                                    {t("Recommended Vehicle")}
                                </h3>
                            </div>
                            <div className="pickup-card-body">
                                {loadingDonation ? (
                                    <div className="text-center py-4 text-muted">
                                        <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                                        {t("Calculating...")}
                                    </div>
                                ) : (
                                    <>
                                        <div className="pickup-details-grid mb-3">
                                            <div className="pickup-detail-item">
                                                <span className="detail-label">{t("Product")}:</span>
                                                <span className="detail-value fw-semibold text-primary">
                                                    {productName || "—"}
                                                </span>
                                            </div>
                                            <div className="pickup-detail-item">
                                                <span className="detail-label">{t("Category")}:</span>
                                                <span className="badge category-badge">
                                                    {t(category) || "—"}
                                                </span>
                                            </div>
                                            <div className="pickup-detail-item">
                                                <span className="detail-label">{t("Quantity")}:</span>
                                                <span className="detail-value fw-bold">
                                                    {quantity || "—"}
                                                </span>
                                            </div>
                                            <div className="pickup-detail-item">
                                                <span className="detail-label">{t("Storage")}:</span>
                                                <span className="badge storage-badge">
                                                    {storageType || "Standard"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="vehicle-recommend-box">
                                            <div className="recommend-header">
                                                <span className="recommend-kicker">{t("Recommended Vehicle")}</span>
                                                <i className="bi bi-truck text-primary fs-5"></i>
                                            </div>
                                            <div className="recommend-vehicle-name">
                                                {recommendedVehicle || t("Calculating...")}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Assigned Partner Details Card (When Selected) */}
                        {vehicleType && (
                            <div className="pickup-info-card mb-4">
                                <div className="pickup-card-header">
                                    <h3 className="pickup-card-title mb-0">
                                        <i className="bi bi-person-badge me-2 text-primary"></i>
                                        {t("Assigned Delivery Partner")}
                                    </h3>
                                </div>
                                <div className="pickup-card-body">
                                    <div className="row g-3">
                                        <div className="col-6">
                                            <span className="detail-label">{t("Volunteer")}:</span>
                                            <div className="fw-semibold text-main">{volunteerName}</div>
                                        </div>
                                        <div className="col-6">
                                            <span className="detail-label">{t("Status")}:</span>
                                            <div className="fw-semibold text-success">{driverStatus}</div>
                                        </div>
                                        <div className="col-6">
                                            <span className="detail-label">{t("Vehicle Type")}:</span>
                                            <div className="fw-semibold text-main">{vehicleType}</div>
                                        </div>
                                        <div className="col-6">
                                            <span className="detail-label">{t("Vehicle Number")}:</span>
                                            <div className="fw-semibold text-main">{driverVehicleNumber}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Live Tracking Map Card (When Driver ID Available) */}
                        {driverId && (
                            <div className="pickup-info-card mb-4">
                                <div className="pickup-card-header">
                                    <h3 className="pickup-card-title mb-0">
                                        <i className="bi bi-geo-alt me-2 text-primary"></i>
                                        {t("Live Driver Tracking")}
                                    </h3>
                                </div>
                                <div className="pickup-card-body p-0 map-container-body">
                                    <NGOMap driverId={driverId} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Scheduling Form Card */}
                    <div className="col-lg-7 col-12">
                        <div className="pickup-form-card">
                            <div className="pickup-card-header">
                                <h3 className="pickup-card-title mb-0">
                                    <i className="bi bi-calendar-event me-2 text-primary"></i>
                                    {t("Schedule Pickup")}
                                </h3>
                            </div>
                            <div className="pickup-card-body">
                                <form onSubmit={saveSchedule}>
                                    <div className="row g-3">
                                        <div className="col-md-6 col-12">
                                            <label className="form-label pickup-form-label">
                                                📅 {t("Pickup Date")} <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                className="form-control pickup-input"
                                                value={pickupDate}
                                                onChange={(e) => setPickupDate(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-6 col-12">
                                            <label className="form-label pickup-form-label">
                                                🕒 {t("Pickup Time")} <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="time"
                                                className="form-control pickup-input"
                                                value={pickupTime}
                                                onChange={(e) => setPickupTime(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="col-12">
                                            <label className="form-label pickup-form-label">
                                                👤 {t("Select Delivery Partner")} <span className="text-danger">*</span>
                                            </label>
                                            <select
                                                className="form-select pickup-input"
                                                value={volunteerName}
                                                onChange={(e) => {
                                                    const selected = e.target.value;
                                                    setVolunteerName(selected);
                                                    const partner = deliveryPartners.find(
                                                        (p) => p.username === selected
                                                    );
                                                    if (partner) {
                                                        setDriverId(partner.id);
                                                        setDriverStatus("🟢 Available");
                                                        setVehicleType(partner.vehicle_type || "Not Assigned");
                                                        setDriverVehicleNumber(
                                                            partner.vehicle_number || "Not Assigned"
                                                        );
                                                    } else {
                                                        setDriverId(null);
                                                        setDriverStatus("");
                                                        setVehicleType("");
                                                        setDriverVehicleNumber("");
                                                    }
                                                }}
                                                required
                                            >
                                                <option value="">-- {t("Select Delivery Partner")} --</option>
                                                {deliveryPartners.map((partner) => (
                                                    <option key={partner.id} value={partner.username}>
                                                        {partner.username} 🟢 ({partner.vehicle_type || "Vehicle"})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="col-12">
                                            <label className="form-label pickup-form-label">
                                                🚚 {t("Vehicle Number")}
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control pickup-input bg-light"
                                                value={driverVehicleNumber}
                                                readOnly
                                                placeholder={t("Vehicle Number")}
                                            />
                                        </div>

                                        <div className="col-12 pt-3">
                                            <button
                                                type="submit"
                                                className="btn btn-primary w-100 save-btn"
                                                disabled={submitting}
                                            >
                                                {submitting ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                        {t("Save Pickup Schedule")}...
                                                    </>
                                                ) : (
                                                    <>
                                                        💾 {t("Save Pickup Schedule")}
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default PickupSchedule;
