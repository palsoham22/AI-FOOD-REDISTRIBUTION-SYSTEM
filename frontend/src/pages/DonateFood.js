import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import IndividualSidebar from "../components/IndividualSidebar";
import TopNavbar from "../components/TopNavbar";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { LABELS } from "../translations";
import "../styles/DonateFood.css";

const CATEGORY_OPTIONS = [
    "Vegetables",
    "Fruits",
    "Dairy",
    "Bakery",
    "Beverages",
    "Others"
];

const UNIT_OPTIONS = [
    "Kg",
    "Litre",
    "Packet",
    "Piece"
];

const STORAGE_OPTIONS = [
    "Room Temperature",
    "Refrigerated",
    "Frozen"
];

function DonateFood() {
    const navigate = useNavigate();
    const t = useTranslate();

    usePageTranslation(LABELS.DONATE_FOOD);

    const [formData, setFormData] = useState({
        product_name: "",
        category: "",
        quantity: "",
        unit: "Kg",
        expiry_date: "",
        storage_type: "Room Temperature",
        pickup_address: "",
        contact_number: "",
        description: ""
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    // Calculate today's date in YYYY-MM-DD for min expiry date
    const todayStr = new Date().toISOString().split("T")[0];

    // Optional profile prefill for contact number
    useEffect(() => {
        let isMounted = true;
        const fetchProfile = async () => {
            const token = localStorage.getItem("access");
            if (!token) return;

            try {
                const response = await axios.get(
                    process.env.REACT_APP_API_URL + "/api/inventory/profile/",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                if (isMounted && response.data && response.data.phone) {
                    setFormData((prev) => ({
                        ...prev,
                        contact_number: prev.contact_number || response.data.phone
                    }));
                }
            } catch {
                // Non-blocking fallback
            }
        };

        fetchProfile();
        return () => {
            isMounted = false;
        };
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors((prev) => {
                const updated = { ...prev };
                delete updated[name];
                return updated;
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.product_name.trim()) {
            newErrors.product_name = t("Please enter the food name.");
        }

        if (!formData.category) {
            newErrors.category = t("Select Category");
        }

        const qtyNum = parseInt(formData.quantity, 10);
        if (!formData.quantity || isNaN(qtyNum) || qtyNum <= 0) {
            newErrors.quantity = t("Please provide a valid quantity greater than zero.");
        }

        if (!formData.unit) {
            newErrors.unit = t("Select Unit");
        }

        if (!formData.expiry_date) {
            newErrors.expiry_date = t("Please select an expiry date.");
        } else {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const selectedDate = new Date(formData.expiry_date + "T00:00:00");
            if (selectedDate < today) {
                newErrors.expiry_date = t("Expiry date cannot be in the past.");
            }
        }

        if (!formData.storage_type) {
            newErrors.storage_type = t("Select Storage Type");
        }

        if (!formData.pickup_address.trim()) {
            newErrors.pickup_address = t("Please enter a pickup address.");
        }

        if (!formData.contact_number.trim()) {
            newErrors.contact_number = t("Please enter a contact number.");
        } else {
            const digits = formData.contact_number.replace(/\D/g, "");
            if (digits.length < 7 || formData.contact_number.length > 15) {
                newErrors.contact_number = t("Please enter a valid contact number (at least 7 digits).");
            }
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setSubmitError(null);
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setSubmitError(t("Please fix the highlighted errors before submitting."));
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }

        setIsSubmitting(true);

        try {
            const token = localStorage.getItem("access");
            const payload = {
                product_name: formData.product_name.trim(),
                category: formData.category,
                quantity: parseInt(formData.quantity, 10),
                unit: formData.unit,
                expiry_date: formData.expiry_date,
                storage_type: formData.storage_type,
                pickup_address: formData.pickup_address.trim(),
                contact_number: formData.contact_number.trim(),
                description: formData.description.trim()
            };

            await axios.post(
                process.env.REACT_APP_API_URL + "/api/inventory/individual/donate/",
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setSubmitSuccess(true);
            setSubmitError(null);
            setErrors({});

            // Reset specific donation fields while preserving pickup info
            setFormData((prev) => ({
                product_name: "",
                category: "",
                quantity: "",
                unit: "Kg",
                expiry_date: "",
                storage_type: "Room Temperature",
                pickup_address: prev.pickup_address,
                contact_number: prev.contact_number,
                description: ""
            }));

            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (error) {
            let errorMsg = t("Failed to submit donation.");
            if (error.response?.data) {
                const data = error.response.data;
                if (typeof data === "string") {
                    errorMsg = data;
                } else if (typeof data === "object") {
                    const firstKey = Object.keys(data)[0];
                    if (firstKey && Array.isArray(data[firstKey])) {
                        errorMsg = `${firstKey}: ${data[firstKey][0]}`;
                    } else if (firstKey && typeof data[firstKey] === "string") {
                        errorMsg = `${firstKey}: ${data[firstKey]}`;
                    }
                }
            }
            setSubmitError(errorMsg);
            setSubmitSuccess(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        setFormData({
            product_name: "",
            category: "",
            quantity: "",
            unit: "Kg",
            expiry_date: "",
            storage_type: "Room Temperature",
            pickup_address: "",
            contact_number: "",
            description: ""
        });
        setErrors({});
        setSubmitError(null);
        setSubmitSuccess(false);
    };

    return (
        <>
            <IndividualSidebar />

            <main className="donate-page">
                <TopNavbar />

                {/* Page Header */}
                <header className="donate-header-banner">
                    <div className="donate-header-left">
                        <div className="donate-header-icon-wrap" aria-hidden="true">
                            <i className="bi bi-box-seam-fill"></i>
                        </div>
                        <div className="donate-header-text">
                            <h1 className="donate-title">
                                {t("Donate Food")}
                            </h1>
                            <p className="donate-subtitle">
                                {t("Share surplus food and help make a difference in your community.")}
                            </p>
                        </div>
                    </div>

                    <div className="donate-header-actions">
                        <span className="donate-header-badge">
                            <i className="bi bi-heart-fill" style={{ fontSize: "0.8rem" }}></i>
                            {t("Make an Impact")}
                        </span>
                        <Link
                            to="/my-donations"
                            className="btn-header-secondary"
                            aria-label={t("View My Donations")}
                        >
                            <i className="bi bi-clock-history"></i>
                            <span>{t("View My Donations")}</span>
                        </Link>
                    </div>
                </header>

                {/* Success Banner */}
                {submitSuccess && (
                    <div className="donate-status-banner success" role="alert">
                        <div className="donate-status-content">
                            <i className="bi bi-check-circle-fill donate-status-icon"></i>
                            <div className="donate-status-body">
                                <h3 className="donate-status-title">
                                    {t("Donation Submitted Successfully!")}
                                </h3>
                                <p className="donate-status-message">
                                    {t("Donation submitted and recorded successfully! It is now listed for community pickup.")}
                                </p>
                            </div>
                        </div>
                        <div className="donate-status-actions">
                            <button
                                type="button"
                                className="btn-banner-action primary"
                                onClick={() => navigate("/my-donations")}
                            >
                                <i className="bi bi-list-check"></i>
                                {t("View My Donations")}
                            </button>
                            <button
                                type="button"
                                className="btn-banner-action secondary"
                                onClick={() => setSubmitSuccess(false)}
                            >
                                <i className="bi bi-plus-lg"></i>
                                {t("Donate Another Item")}
                            </button>
                        </div>
                    </div>
                )}

                {/* Error Banner */}
                {submitError && (
                    <div className="donate-status-banner error" role="alert">
                        <div className="donate-status-content">
                            <i className="bi bi-exclamation-octagon-fill donate-status-icon"></i>
                            <div className="donate-status-body">
                                <h3 className="donate-status-title">
                                    {t("Failed to submit donation.")}
                                </h3>
                                <p className="donate-status-message">
                                    {submitError}
                                </p>
                            </div>
                        </div>
                        <div className="donate-status-actions">
                            <button
                                type="button"
                                className="btn-banner-action retry"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                            >
                                <i className="bi bi-arrow-clockwise"></i>
                                {t("Retry")}
                            </button>
                            <button
                                type="button"
                                className="btn-banner-dismiss"
                                onClick={() => setSubmitError(null)}
                                aria-label="Dismiss error"
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                    </div>
                )}

                {/* Main Donation Form Card */}
                <section className="donate-card">
                    <div className="donate-card-header">
                        <div className="donate-card-header-title">
                            <i className="bi bi-card-checklist"></i>
                            <div>
                                <h2>{t("Donation Details")}</h2>
                                <p>{t("Enter the details of the food you would like to donate.")}</p>
                            </div>
                        </div>
                    </div>

                    <div className="donate-card-body">
                        <form onSubmit={handleSubmit} noValidate>
                            {/* Section 1: Food Information */}
                            <fieldset className="donate-form-section">
                                <div className="donate-section-header">
                                    <div className="donate-section-icon" aria-hidden="true">
                                        <i className="bi bi-basket-fill"></i>
                                    </div>
                                    <h3 className="donate-section-title">{t("Food Information")}</h3>
                                </div>

                                <div className="donate-grid">
                                    {/* Product / Food Name */}
                                    <div className="donate-field-group">
                                        <label htmlFor="product_name" className="donate-label">
                                            <span>{t("Food Name")}</span>
                                            <span className="required-star" aria-hidden="true">*</span>
                                        </label>
                                        <input
                                            id="product_name"
                                            name="product_name"
                                            type="text"
                                            maxLength={100}
                                            className={`donate-input ${errors.product_name ? "has-error" : ""}`}
                                            placeholder={t("e.g. Fresh Apples, Cooked Rice")}
                                            value={formData.product_name}
                                            onChange={handleChange}
                                            aria-invalid={!!errors.product_name}
                                            aria-describedby={errors.product_name ? "product_name-error" : undefined}
                                            required
                                        />
                                        {errors.product_name && (
                                            <span id="product_name-error" className="field-error-msg">
                                                <i className="bi bi-exclamation-circle-fill"></i>
                                                {errors.product_name}
                                            </span>
                                        )}
                                    </div>

                                    {/* Category */}
                                    <div className="donate-field-group">
                                        <label htmlFor="category" className="donate-label">
                                            <span>{t("Category")}</span>
                                            <span className="required-star" aria-hidden="true">*</span>
                                        </label>
                                        <select
                                            id="category"
                                            name="category"
                                            className={`donate-select ${errors.category ? "has-error" : ""}`}
                                            value={formData.category}
                                            onChange={handleChange}
                                            aria-invalid={!!errors.category}
                                            aria-describedby={errors.category ? "category-error" : undefined}
                                            required
                                        >
                                            <option value="">{t("Select Category")}</option>
                                            {CATEGORY_OPTIONS.map((cat) => (
                                                <option key={cat} value={cat}>
                                                    {t(cat)}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.category && (
                                            <span id="category-error" className="field-error-msg">
                                                <i className="bi bi-exclamation-circle-fill"></i>
                                                {errors.category}
                                            </span>
                                        )}
                                    </div>

                                    {/* Quantity */}
                                    <div className="donate-field-group">
                                        <label htmlFor="quantity" className="donate-label">
                                            <span>{t("Quantity")}</span>
                                            <span className="required-star" aria-hidden="true">*</span>
                                        </label>
                                        <input
                                            id="quantity"
                                            name="quantity"
                                            type="number"
                                            min="1"
                                            step="1"
                                            className={`donate-input ${errors.quantity ? "has-error" : ""}`}
                                            placeholder={t("e.g. 5 or 10")}
                                            value={formData.quantity}
                                            onChange={handleChange}
                                            aria-invalid={!!errors.quantity}
                                            aria-describedby={errors.quantity ? "quantity-error" : undefined}
                                            required
                                        />
                                        {errors.quantity && (
                                            <span id="quantity-error" className="field-error-msg">
                                                <i className="bi bi-exclamation-circle-fill"></i>
                                                {errors.quantity}
                                            </span>
                                        )}
                                    </div>

                                    {/* Unit */}
                                    <div className="donate-field-group">
                                        <label htmlFor="unit" className="donate-label">
                                            <span>{t("Unit")}</span>
                                            <span className="required-star" aria-hidden="true">*</span>
                                        </label>
                                        <select
                                            id="unit"
                                            name="unit"
                                            className={`donate-select ${errors.unit ? "has-error" : ""}`}
                                            value={formData.unit}
                                            onChange={handleChange}
                                            aria-invalid={!!errors.unit}
                                            aria-describedby={errors.unit ? "unit-error" : undefined}
                                            required
                                        >
                                            {UNIT_OPTIONS.map((u) => (
                                                <option key={u} value={u}>
                                                    {t(u)}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.unit && (
                                            <span id="unit-error" className="field-error-msg">
                                                <i className="bi bi-exclamation-circle-fill"></i>
                                                {errors.unit}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </fieldset>

                            {/* Section 2: Expiry & Storage */}
                            <fieldset className="donate-form-section">
                                <div className="donate-section-header">
                                    <div className="donate-section-icon" aria-hidden="true">
                                        <i className="bi bi-calendar-check-fill"></i>
                                    </div>
                                    <h3 className="donate-section-title">{t("Expiry & Storage")}</h3>
                                </div>

                                <div className="donate-grid">
                                    {/* Expiry Date */}
                                    <div className="donate-field-group">
                                        <label htmlFor="expiry_date" className="donate-label">
                                            <span>{t("Expiry Date")}</span>
                                            <span className="required-star" aria-hidden="true">*</span>
                                        </label>
                                        <input
                                            id="expiry_date"
                                            name="expiry_date"
                                            type="date"
                                            min={todayStr}
                                            className={`donate-input ${errors.expiry_date ? "has-error" : ""}`}
                                            value={formData.expiry_date}
                                            onChange={handleChange}
                                            aria-invalid={!!errors.expiry_date}
                                            aria-describedby={errors.expiry_date ? "expiry_date-error" : undefined}
                                            required
                                        />
                                        {errors.expiry_date && (
                                            <span id="expiry_date-error" className="field-error-msg">
                                                <i className="bi bi-exclamation-circle-fill"></i>
                                                {errors.expiry_date}
                                            </span>
                                        )}
                                    </div>

                                    {/* Storage Type */}
                                    <div className="donate-field-group">
                                        <label htmlFor="storage_type" className="donate-label">
                                            <span>{t("Storage Type")}</span>
                                            <span className="required-star" aria-hidden="true">*</span>
                                        </label>
                                        <select
                                            id="storage_type"
                                            name="storage_type"
                                            className={`donate-select ${errors.storage_type ? "has-error" : ""}`}
                                            value={formData.storage_type}
                                            onChange={handleChange}
                                            aria-invalid={!!errors.storage_type}
                                            aria-describedby={errors.storage_type ? "storage_type-error" : undefined}
                                            required
                                        >
                                            {STORAGE_OPTIONS.map((st) => (
                                                <option key={st} value={st}>
                                                    {t(st)}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.storage_type && (
                                            <span id="storage_type-error" className="field-error-msg">
                                                <i className="bi bi-exclamation-circle-fill"></i>
                                                {errors.storage_type}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </fieldset>

                            {/* Section 3: Pickup Information */}
                            <fieldset className="donate-form-section">
                                <div className="donate-section-header">
                                    <div className="donate-section-icon" aria-hidden="true">
                                        <i className="bi bi-geo-alt-fill"></i>
                                    </div>
                                    <h3 className="donate-section-title">{t("Pickup Information")}</h3>
                                </div>

                                <div className="donate-grid">
                                    {/* Pickup Address */}
                                    <div className="donate-field-group full-width">
                                        <label htmlFor="pickup_address" className="donate-label">
                                            <span>{t("Pickup Address")}</span>
                                            <span className="required-star" aria-hidden="true">*</span>
                                        </label>
                                        <textarea
                                            id="pickup_address"
                                            name="pickup_address"
                                            rows="3"
                                            className={`donate-textarea ${errors.pickup_address ? "has-error" : ""}`}
                                            placeholder={t("Enter the complete pickup address")}
                                            value={formData.pickup_address}
                                            onChange={handleChange}
                                            aria-invalid={!!errors.pickup_address}
                                            aria-describedby={errors.pickup_address ? "pickup_address-error" : undefined}
                                            required
                                        />
                                        {errors.pickup_address && (
                                            <span id="pickup_address-error" className="field-error-msg">
                                                <i className="bi bi-exclamation-circle-fill"></i>
                                                {errors.pickup_address}
                                            </span>
                                        )}
                                    </div>

                                    {/* Contact Number */}
                                    <div className="donate-field-group">
                                        <label htmlFor="contact_number" className="donate-label">
                                            <span>{t("Contact Number")}</span>
                                            <span className="required-star" aria-hidden="true">*</span>
                                        </label>
                                        <input
                                            id="contact_number"
                                            name="contact_number"
                                            type="tel"
                                            maxLength={15}
                                            className={`donate-input ${errors.contact_number ? "has-error" : ""}`}
                                            placeholder={t("Enter contact number")}
                                            value={formData.contact_number}
                                            onChange={handleChange}
                                            aria-invalid={!!errors.contact_number}
                                            aria-describedby={errors.contact_number ? "contact_number-error" : undefined}
                                            required
                                        />
                                        {errors.contact_number && (
                                            <span id="contact_number-error" className="field-error-msg">
                                                <i className="bi bi-exclamation-circle-fill"></i>
                                                {errors.contact_number}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </fieldset>

                            {/* Section 4: Additional Information */}
                            <fieldset className="donate-form-section">
                                <div className="donate-section-header">
                                    <div className="donate-section-icon" aria-hidden="true">
                                        <i className="bi bi-info-circle-fill"></i>
                                    </div>
                                    <h3 className="donate-section-title">{t("Additional Information")}</h3>
                                </div>

                                <div className="donate-grid">
                                    <div className="donate-field-group full-width">
                                        <label htmlFor="description" className="donate-label">
                                            <span>{t("Description")}</span>
                                        </label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            rows="3"
                                            className="donate-textarea"
                                            placeholder={t("Add any additional information")}
                                            value={formData.description}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </fieldset>

                            {/* Form Footer */}
                            <div className="donate-form-footer">
                                <p className="donate-footer-note">
                                    <i className="bi bi-shield-check"></i>
                                    <span>{t("Your donation can help reduce food waste and support someone in need.")}</span>
                                </p>

                                <div className="donate-footer-actions">
                                    <button
                                        type="button"
                                        className="btn-donate-reset"
                                        onClick={handleReset}
                                        disabled={isSubmitting}
                                    >
                                        <i className="bi bi-arrow-counterclockwise"></i>
                                        <span>{t("Reset Form")}</span>
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn-donate-submit"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="spinner-donate" aria-hidden="true"></span>
                                                <span>{t("Submitting...")}</span>
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-box-arrow-up-right"></i>
                                                <span>{t("Submit Donation")}</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </section>
            </main>
        </>
    );
}

export default DonateFood;