import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminSidebar from "../components/AdminSidebar";
import TopNavbar from "../components/TopNavbar";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { LABELS } from "../translations";
import { useTheme, THEMES } from "../context/ThemeContext";
import { useTranslationContext } from "../context/TranslationContext";
import "../styles/AdminSettings.css";

const LANGUAGE_OPTIONS = [
    { code: "en-IN", name: "English" },
    { code: "hi-IN", name: "हिन्दी (Hindi)" },
    { code: "ta-IN", name: "தமிழ் (Tamil)" },
    { code: "te-IN", name: "తెలుగు (Telugu)" },
    { code: "ml-IN", name: "മലയാളം (Malayalam)" },
    { code: "bn-IN", name: "বাংলা (Bengali)" }
];

function AdminSettings() {
    const navigate = useNavigate();
    const t = useTranslate();
    usePageTranslation(LABELS.ADMIN_SETTINGS);

    // Global Theme Context
    const { theme, setTheme } = useTheme();

    // Global Language Context
    const { language, setLanguage } = useTranslationContext();

    // Profile States
    const [profile, setProfile] = useState({});
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileError, setProfileError] = useState(null);

    // In-App Local Notification Preference (persisted in localStorage)
    const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
        const saved = localStorage.getItem("admin_notifications_enabled");
        return saved !== "false";
    });

    // Saved Feedback Toast State
    const [savedFeedback, setSavedFeedback] = useState(false);

    // Password Change States
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordErrors, setPasswordErrors] = useState({});
    const [passwordFeedback, setPasswordFeedback] = useState(null);

    // Fetch Profile Data
    const fetchProfile = useCallback(async () => {
        setProfileLoading(true);
        setProfileError(null);

        const token = localStorage.getItem("access");
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const response = await axios.get(
                process.env.REACT_APP_API_URL + "/api/inventory/profile/",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data) {
                setProfile(response.data);
            }
        } catch (err) {
            console.error("Failed to load admin profile:", err);
            setProfileError(t("Unable to load profile data."));
        } finally {
            setProfileLoading(false);
        }
    }, [navigate, t]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const showSavedToast = () => {
        setSavedFeedback(true);
        setTimeout(() => {
            setSavedFeedback(false);
        }, 3000);
    };

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
        showSavedToast();
    };

    const handleLanguageChange = (e) => {
        setLanguage(e.target.value);
        showSavedToast();
    };

    const handleNotificationsChange = (e) => {
        const isEnabled = e.target.value === "true";
        setNotificationsEnabled(isEnabled);
        localStorage.setItem("admin_notifications_enabled", isEnabled ? "true" : "false");
        showSavedToast();
    };

    // Password Validation & Submission
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordFeedback(null);
        setPasswordErrors({});

        const errors = {};

        if (!oldPassword.trim()) {
            errors.oldPassword = t("Current password is required.");
        }

        if (newPassword.length < 6) {
            errors.newPassword = t("Password must be at least 6 characters long.");
        }

        if (newPassword !== confirmPassword) {
            errors.confirmPassword = t("Passwords do not match");
        }

        if (Object.keys(errors).length > 0) {
            setPasswordErrors(errors);
            return;
        }

        const token = localStorage.getItem("access");
        if (!token) {
            navigate("/login");
            return;
        }

        setPasswordLoading(true);

        try {
            // Correct backend endpoint: POST /api/inventory/change-password/
            const response = await axios.post(
                process.env.REACT_APP_API_URL + "/api/inventory/change-password/",
                {
                    old_password: oldPassword,
                    new_password: newPassword
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setPasswordFeedback({
                type: "success",
                message: response.data.message || t("Password changed successfully")
            });

            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setPasswordErrors({});
        } catch (err) {
            const errorMsg =
                err.response?.data?.error ||
                err.response?.data?.message ||
                t("Failed to update password.");

            setPasswordFeedback({
                type: "danger",
                message: errorMsg
            });
        } finally {
            setPasswordLoading(false);
        }
    };

    // Secure Admin Logout preserving user preferences
    const handleLogout = () => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("role");
        localStorage.removeItem("username");
        localStorage.removeItem("email");
        navigate("/login");
    };

    return (
        <div className="admin-wrapper">
            <AdminSidebar />

            <div className="admin-settings-page">
                <TopNavbar />

                {/* Hero Banner */}
                <header className="admin-set-hero-banner">
                    <div className="admin-set-hero-content">
                        <div className="admin-set-hero-badge">
                            <i className="bi bi-shield-lock-fill me-2"></i>
                            {t("Administrator")}
                        </div>
                        <h1 className="admin-set-hero-title">{t("Admin Settings")}</h1>
                        <p className="admin-set-hero-subtitle">
                            {t("Manage your profile and application settings.")}
                        </p>
                    </div>
                </header>

                {/* Saved Feedback Toast */}
                {savedFeedback && (
                    <div className="admin-set-toast" role="status" aria-live="polite">
                        <i className="bi bi-check-circle-fill"></i>
                        <span>{t("Settings updated successfully.")}</span>
                    </div>
                )}

                {/* Settings Grid */}
                <div className="admin-set-grid">
                    {/* Card 1: Profile Information */}
                    <div className="admin-set-card">
                        <div className="admin-set-card-header">
                            <h2 className="admin-set-card-title">
                                <i className="bi bi-person-badge text-primary"></i>
                                <span>{t("Admin Profile")}</span>
                            </h2>
                            {profileLoading && (
                                <span className="spinner-border spinner-border-sm text-primary" role="status"></span>
                            )}
                        </div>

                        {profileError ? (
                            <div className="admin-set-alert admin-set-alert-danger" role="alert">
                                <i className="bi bi-exclamation-triangle-fill"></i>
                                <span>{profileError}</span>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger ms-auto"
                                    onClick={fetchProfile}
                                >
                                    {t("Retry")}
                                </button>
                            </div>
                        ) : (
                            <div className="admin-set-profile-list">
                                <div className="admin-set-profile-item">
                                    <span className="admin-set-profile-label">{t("Username")}</span>
                                    <span className="admin-set-profile-value">{profile.username || "—"}</span>
                                </div>

                                <div className="admin-set-profile-item">
                                    <span className="admin-set-profile-label">{t("Email")}</span>
                                    <span className="admin-set-profile-value">{profile.email || "—"}</span>
                                </div>

                                <div className="admin-set-profile-item">
                                    <span className="admin-set-profile-label">{t("Role")}</span>
                                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle fw-semibold">
                                        {t("Administrator")}
                                    </span>
                                </div>

                                <div className="admin-set-profile-item">
                                    <span className="admin-set-profile-label">{t("Phone")}</span>
                                    <span className="admin-set-profile-value">
                                        {profile.phone || t("Not Available")}
                                    </span>
                                </div>

                                <div className="admin-set-profile-item">
                                    <span className="admin-set-profile-label">{t("Security Privileges")}</span>
                                    <span className="badge bg-success-subtle text-success border border-success-subtle fw-semibold">
                                        <i className="bi bi-check-circle-fill me-1"></i>
                                        {t("Full Administrative Access")}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Card 2: Change Password */}
                    <div className="admin-set-card">
                        <div className="admin-set-card-header">
                            <h2 className="admin-set-card-title">
                                <i className="bi bi-key-fill text-warning"></i>
                                <span>{t("Change Password")}</span>
                            </h2>
                        </div>

                        {passwordFeedback && (
                            <div
                                className={`admin-set-alert admin-set-alert-${passwordFeedback.type}`}
                                role="alert"
                            >
                                <i
                                    className={`bi ${
                                        passwordFeedback.type === "success"
                                            ? "bi-check-circle-fill"
                                            : "bi-exclamation-triangle-fill"
                                    }`}
                                ></i>
                                <span>{passwordFeedback.message}</span>
                            </div>
                        )}

                        <form onSubmit={handlePasswordChange} noValidate>
                            {/* Current Password */}
                            <div className="admin-set-form-group">
                                <label htmlFor="adminOldPassword" className="admin-set-label">
                                    {t("Current Password")}
                                </label>
                                <div className="admin-set-input-wrap">
                                    <input
                                        id="adminOldPassword"
                                        type={showOldPassword ? "text" : "password"}
                                        className={`admin-set-input ${passwordErrors.oldPassword ? "is-invalid" : ""}`}
                                        placeholder={t("Current Password")}
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        autoComplete="current-password"
                                        disabled={passwordLoading}
                                    />
                                    <button
                                        type="button"
                                        className="admin-set-pwd-toggle"
                                        onClick={() => setShowOldPassword(!showOldPassword)}
                                        aria-label={showOldPassword ? t("Hide password") : t("Show password")}
                                        tabIndex="-1"
                                    >
                                        <i className={`bi ${showOldPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                                    </button>
                                </div>
                                {passwordErrors.oldPassword && (
                                    <span className="admin-set-error-text">{passwordErrors.oldPassword}</span>
                                )}
                            </div>

                            {/* New Password */}
                            <div className="admin-set-form-group">
                                <label htmlFor="adminNewPassword" className="admin-set-label">
                                    {t("New Password")}
                                </label>
                                <div className="admin-set-input-wrap">
                                    <input
                                        id="adminNewPassword"
                                        type={showNewPassword ? "text" : "password"}
                                        className={`admin-set-input ${passwordErrors.newPassword ? "is-invalid" : ""}`}
                                        placeholder={t("New Password")}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        autoComplete="new-password"
                                        disabled={passwordLoading}
                                    />
                                    <button
                                        type="button"
                                        className="admin-set-pwd-toggle"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        aria-label={showNewPassword ? t("Hide password") : t("Show password")}
                                        tabIndex="-1"
                                    >
                                        <i className={`bi ${showNewPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                                    </button>
                                </div>
                                {passwordErrors.newPassword && (
                                    <span className="admin-set-error-text">{passwordErrors.newPassword}</span>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div className="admin-set-form-group">
                                <label htmlFor="adminConfirmPassword" className="admin-set-label">
                                    {t("Confirm Password")}
                                </label>
                                <div className="admin-set-input-wrap">
                                    <input
                                        id="adminConfirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        className={`admin-set-input ${passwordErrors.confirmPassword ? "is-invalid" : ""}`}
                                        placeholder={t("Confirm Password")}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        autoComplete="new-password"
                                        disabled={passwordLoading}
                                    />
                                    <button
                                        type="button"
                                        className="admin-set-pwd-toggle"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        aria-label={showConfirmPassword ? t("Hide password") : t("Show password")}
                                        tabIndex="-1"
                                    >
                                        <i className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                                    </button>
                                </div>
                                {passwordErrors.confirmPassword && (
                                    <span className="admin-set-error-text">{passwordErrors.confirmPassword}</span>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="admin-set-btn-primary"
                                disabled={passwordLoading}
                            >
                                {passwordLoading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm" role="status"></span>
                                        <span>{t("Updating Password...")}</span>
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-shield-check"></i>
                                        <span>{t("Change Password")}</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Card 3: Appearance & Language Preferences */}
                    <div className="admin-set-card">
                        <div className="admin-set-card-header">
                            <h2 className="admin-set-card-title">
                                <i className="bi bi-palette-fill text-info"></i>
                                <span>{t("Appearance & Theme")}</span>
                            </h2>
                        </div>

                        {/* Theme Toggle */}
                        <div className="mb-4">
                            <label className="admin-set-label">
                                {t("Appearance & Theme")}
                            </label>
                            <div className="admin-set-theme-grid">
                                <button
                                    type="button"
                                    className={`admin-set-theme-btn ${theme === THEMES.LIGHT ? "active" : ""}`}
                                    onClick={() => handleThemeChange(THEMES.LIGHT)}
                                    aria-pressed={theme === THEMES.LIGHT}
                                >
                                    <i className="bi bi-sun-fill text-warning"></i>
                                    <span>{t("Light Mode")}</span>
                                </button>
                                <button
                                    type="button"
                                    className={`admin-set-theme-btn ${theme === THEMES.DARK ? "active" : ""}`}
                                    onClick={() => handleThemeChange(THEMES.DARK)}
                                    aria-pressed={theme === THEMES.DARK}
                                >
                                    <i className="bi bi-moon-stars-fill text-primary"></i>
                                    <span>{t("Dark Mode")}</span>
                                </button>
                            </div>
                        </div>

                        {/* Language Selector */}
                        <div className="mb-4">
                            <label htmlFor="adminLanguageSelect" className="admin-set-label">
                                {t("Language Preferences")}
                            </label>
                            <select
                                id="adminLanguageSelect"
                                className="admin-set-select"
                                value={language}
                                onChange={handleLanguageChange}
                            >
                                {LANGUAGE_OPTIONS.map((lang) => (
                                    <option key={lang.code} value={lang.code}>
                                        {lang.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Notification Preferences */}
                        <div>
                            <label className="admin-set-label">
                                {t("Notification Preferences")}
                            </label>
                            <div className="admin-set-radio-group">
                                <label className="admin-set-radio-label">
                                    <input
                                        type="radio"
                                        name="adminNotifications"
                                        value="true"
                                        checked={notificationsEnabled === true}
                                        onChange={handleNotificationsChange}
                                    />
                                    <span>{t("Enabled")}</span>
                                </label>
                                <label className="admin-set-radio-label">
                                    <input
                                        type="radio"
                                        name="adminNotifications"
                                        value="false"
                                        checked={notificationsEnabled === false}
                                        onChange={handleNotificationsChange}
                                    />
                                    <span>{t("Disabled")}</span>
                                </label>
                            </div>
                            <small className="text-muted d-block mt-1">
                                {t("Local preference for administrative system and dispatch alerts.")}
                            </small>
                        </div>
                    </div>

                    {/* Card 4: System Information & Session */}
                    <div className="admin-set-card">
                        <div className="admin-set-card-header">
                            <h2 className="admin-set-card-title">
                                <i className="bi bi-cpu text-secondary"></i>
                                <span>{t("Platform Details")}</span>
                            </h2>
                        </div>

                        <div className="admin-set-profile-list mb-4">
                            <div className="admin-set-profile-item">
                                <span className="admin-set-profile-label">{t("Application")}</span>
                                <span className="admin-set-profile-value">FoodBridge AI</span>
                            </div>

                            <div className="admin-set-profile-item">
                                <span className="admin-set-profile-label">{t("Version")}</span>
                                <span className="badge bg-secondary-subtle text-secondary border">v1.0.0-production</span>
                            </div>
                        </div>

                        {/* Honest System Health Notice */}
                        <div className="admin-set-health-notice mb-4">
                            <i className="bi bi-info-circle-fill"></i>
                            <div className="admin-set-health-notice-text">
                                <strong>{t("System Health Monitoring")}</strong>:{" "}
                                {t("Live server telemetry and background heartbeat monitoring are not currently connected to this panel.")}
                            </div>
                        </div>

                        {/* Session / Logout */}
                        <div className="admin-set-logout-box border-top pt-3">
                            <h3 className="admin-set-label mb-1">{t("Account Session")}</h3>
                            <p className="admin-set-logout-desc">
                                {t("Click below to securely end your current administrative session.")}
                            </p>
                            <button
                                type="button"
                                className="admin-set-btn-danger"
                                onClick={handleLogout}
                            >
                                <i className="bi bi-box-arrow-right"></i>
                                <span>{t("Logout")}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminSettings;