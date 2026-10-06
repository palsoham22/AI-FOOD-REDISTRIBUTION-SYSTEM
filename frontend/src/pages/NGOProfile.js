import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import NGOSidebar from "../components/NGOSidebar";
import TopNavbar from "../components/TopNavbar";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { LABELS } from "../translations";
import { buildDynamicLabels } from "../utils/buildDynamicLabels";
import "../styles/NGOProfile.css";

function NGOProfile() {
    const [profile, setProfile] = useState({
        username: localStorage.getItem("username") || "",
        email: "",
        phone: "",
        role: localStorage.getItem("role") || "NGO",
        business_name: localStorage.getItem("business_name") || "",
        owner_name: localStorage.getItem("owner_name") || ""
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const t = useTranslate();

    const dynamicLabels = useMemo(
        () =>
            buildDynamicLabels(
                [
                    ...LABELS.NGO_PROFILE,
                    ...LABELS.NGO_SIDEBAR
                ],
                [profile],
                [
                    "role",
                    "business_name",
                    "owner_name"
                ]
            ),
        [profile]
    );

    usePageTranslation(dynamicLabels);

    const loadProfile = () => {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("access");
        const localUsername = localStorage.getItem("username") || "";
        const localRole = localStorage.getItem("role") || "NGO";
        const localBiz = localStorage.getItem("business_name") || "";
        const localOwner = localStorage.getItem("owner_name") || "";

        axios
            .get(process.env.REACT_APP_API_URL + "/api/inventory/profile/", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then((res) => {
                const data = res.data || {};
                setProfile({
                    username: data.username || localUsername,
                    email: data.email || "",
                    phone: data.phone || "",
                    role: data.role || localRole,
                    business_name: data.business_name || localBiz,
                    owner_name: data.owner_name || localOwner
                });
            })
            .catch((err) => {
                console.error("Failed to load profile from API:", err);
                setError(t("Offline Mode: Showing last synced donation history.") || "Offline Mode");
                // Maintain valid session fallback
                setProfile((prev) => ({
                    ...prev,
                    username: prev.username || localUsername,
                    role: prev.role || localRole,
                    business_name: prev.business_name || localBiz,
                    owner_name: prev.owner_name || localOwner
                }));
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        loadProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <NGOSidebar />

            <div className="ngo-page profile-page">
                <TopNavbar />

                {/* 1. Page Header Card */}
                <div className="profile-header-card mb-4">
                    <div className="profile-header-main">
                        <div className="profile-avatar-box">
                            <span className="profile-avatar-icon">🏢</span>
                        </div>
                        <div className="profile-header-info">
                            <div className="d-flex align-items-center flex-wrap gap-2 mb-1">
                                <h1 className="profile-title mb-0">{t("NGO Profile")}</h1>
                                <span className="badge profile-status-pill">
                                    <span className="profile-pulse-dot" aria-hidden="true"></span>
                                    {t("Verified NGO")}
                                </span>
                            </div>
                            <p className="profile-subtitle mb-0">
                                {t("Manage your NGO profile and organization details.")}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Error / Alert banner if API error */}
                {error && (
                    <div className="alert alert-info d-flex align-items-center gap-2 mb-4" role="alert">
                        <i className="bi bi-info-circle-fill"></i>
                        <span>{t("Profile information is managed through your verified FoodBridge AI account.")}</span>
                    </div>
                )}

                {/* 2. Main Profile Content Grid */}
                <div className="row g-4">
                    {/* Left Column: Organization Summary Card */}
                    <div className="col-lg-4 col-12">
                        <div className="profile-identity-card">
                            <div className="profile-card-top-accent"></div>
                            <div className="profile-identity-body text-center">
                                <div className="profile-identity-avatar" aria-hidden="true">
                                    🏢
                                </div>
                                <h2 className="profile-org-name mb-1">
                                    {profile.business_name || profile.username || t("NGO")}
                                </h2>
                                <div className="profile-username-tag mb-3">
                                    @{profile.username}
                                </div>
                                <span className="badge profile-role-badge mb-4">
                                    <i className="bi bi-shield-check me-1"></i>
                                    {t("NGO")}
                                </span>

                                <div className="profile-meta-list">
                                    <div className="profile-meta-item">
                                        <span className="profile-meta-label">{t("Status")}</span>
                                        <span className="badge bg-success-subtle text-success border border-success-subtle fw-semibold px-2 py-1">
                                            {t("Active")}
                                        </span>
                                    </div>
                                    <div className="profile-meta-item">
                                        <span className="profile-meta-label">{t("Role")}</span>
                                        <span className="fw-semibold text-main">{t(profile.role || "NGO")}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Detailed Account & Contact Information */}
                    <div className="col-lg-8 col-12">
                        {/* Section A: Account Details */}
                        <div className="profile-section-card mb-4">
                            <div className="profile-section-header">
                                <div className="d-flex align-items-center gap-2">
                                    <span className="profile-section-icon">
                                        <i className="bi bi-building"></i>
                                    </span>
                                    <h3 className="profile-section-title mb-0">{t("Account Details")}</h3>
                                </div>
                            </div>
                            <div className="profile-section-body">
                                <div className="row g-3">
                                    <div className="col-md-6 col-12">
                                        <div className="profile-field-box">
                                            <label className="profile-field-label">
                                                {t("Organization")}
                                            </label>
                                            <div className="profile-field-value">
                                                {loading ? (
                                                    <span className="placeholder col-6"></span>
                                                ) : (
                                                    profile.business_name || t("Not Provided")
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-6 col-12">
                                        <div className="profile-field-box">
                                            <label className="profile-field-label">
                                                {t("Username")}
                                            </label>
                                            <div className="profile-field-value">
                                                {loading ? (
                                                    <span className="placeholder col-4"></span>
                                                ) : (
                                                    profile.username || "—"
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-6 col-12">
                                        <div className="profile-field-box">
                                            <label className="profile-field-label">
                                                {t("Role")}
                                            </label>
                                            <div className="profile-field-value">
                                                {loading ? (
                                                    <span className="placeholder col-4"></span>
                                                ) : (
                                                    t(profile.role || "NGO")
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-6 col-12">
                                        <div className="profile-field-box">
                                            <label className="profile-field-label">
                                                {t("Status")}
                                            </label>
                                            <div className="profile-field-value text-success fw-semibold">
                                                <i className="bi bi-check-circle-fill me-1"></i>
                                                {t("Active")}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section B: Contact Information */}
                        <div className="profile-section-card mb-4">
                            <div className="profile-section-header">
                                <div className="d-flex align-items-center gap-2">
                                    <span className="profile-section-icon">
                                        <i className="bi bi-person-lines-fill"></i>
                                    </span>
                                    <h3 className="profile-section-title mb-0">{t("Contact Information")}</h3>
                                </div>
                            </div>
                            <div className="profile-section-body">
                                <div className="row g-3">
                                    <div className="col-md-6 col-12">
                                        <div className="profile-field-box">
                                            <label className="profile-field-label">
                                                {t("Contact Person")}
                                            </label>
                                            <div className="profile-field-value">
                                                {loading ? (
                                                    <span className="placeholder col-6"></span>
                                                ) : (
                                                    profile.owner_name || t("Not Provided")
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-6 col-12">
                                        <div className="profile-field-box">
                                            <label className="profile-field-label">
                                                {t("Phone:") || t("Phone")}
                                            </label>
                                            <div className="profile-field-value">
                                                {loading ? (
                                                    <span className="placeholder col-5"></span>
                                                ) : (
                                                    profile.phone || t("Not Provided")
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-12">
                                        <div className="profile-field-box">
                                            <label className="profile-field-label">
                                                {t("Email:") || t("Email")}
                                            </label>
                                            <div className="profile-field-value text-break">
                                                {loading ? (
                                                    <span className="placeholder col-7"></span>
                                                ) : (
                                                    profile.email || t("Not Provided")
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section C: Verified Security Notice */}
                        <div className="profile-notice-card">
                            <div className="d-flex align-items-start gap-3">
                                <div className="profile-notice-icon">
                                    <i className="bi bi-shield-lock-fill"></i>
                                </div>
                                <div className="profile-notice-text">
                                    <h4 className="profile-notice-title mb-1">
                                        {t("Verified NGO")}
                                    </h4>
                                    <p className="profile-notice-desc mb-0">
                                        {t("Profile information is managed through your verified FoodBridge AI account.")}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default NGOProfile;