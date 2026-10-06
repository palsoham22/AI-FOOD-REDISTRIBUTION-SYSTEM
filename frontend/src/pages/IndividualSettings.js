import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import IndividualSidebar from "../components/IndividualSidebar";
import TopNavbar from "../components/TopNavbar";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { LABELS } from "../translations";
import { useTheme, THEMES } from "../context/ThemeContext";
import { useTranslationContext } from "../context/TranslationContext";
import { formatLocalizedNumber } from "../utils/formatNumber";
import "../styles/IndividualSettings.css";

const LANGUAGE_OPTIONS = [
    { code: "en-IN", name: "English" },
    { code: "hi-IN", name: "हिन्दी (Hindi)" },
    { code: "ta-IN", name: "தமிழ் (Tamil)" },
    { code: "te-IN", name: "తెలుగు (Telugu)" },
    { code: "ml-IN", name: "മലയാളം (Malayalam)" },
    { code: "bn-IN", name: "বাংলা (Bengali)" },
];

function IndividualSettings() {
    const navigate = useNavigate();
    const t = useTranslate();
    usePageTranslation(LABELS.INDIVIDUAL_SETTINGS);

    // Global Theme Context
    const { theme, setTheme } = useTheme();

    // Global Language Context
    const { language, setLanguage } = useTranslationContext();

    // Profile & Dashboard States
    const [profile, setProfile] = useState({});
    const [dashboard, setDashboard] = useState({ total_donations: 0 });
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileError, setProfileError] = useState(null);

    // In-App Local Notification Preference (persisted in localStorage)
    const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
        const saved = localStorage.getItem("individual_notifications_enabled");
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

    // Fetch Profile and Dashboard Data
    const fetchProfileAndDashboard = useCallback(async () => {
        setProfileLoading(true);
        setProfileError(null);

        const token = localStorage.getItem("access");
        if (!token) {
            navigate("/login");
            return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        try {
            const [profileRes, dashRes] = await Promise.all([
                axios.get(process.env.REACT_APP_API_URL + "/api/inventory/profile/", { headers }),
                axios.get(process.env.REACT_APP_API_URL + "/api/inventory/individual/dashboard/", { headers })
            ]);

            if (profileRes.data) {
                setProfile(profileRes.data);
            }
            if (dashRes.data) {
                setDashboard(dashRes.data);
            }
        } catch (err) {
            console.error("Failed to load profile data:", err);
            setProfileError(t("Unable to load profile data."));
        } finally {
            setProfileLoading(false);
        }
    }, [navigate, t]);

    useEffect(() => {
        fetchProfileAndDashboard();
    }, [fetchProfileAndDashboard]);

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
        localStorage.setItem("individual_notifications_enabled", isEnabled ? "true" : "false");
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
            // Fix: Use correct endpoint /api/inventory/change-password/
            const response = await axios.post(
                process.env.REACT_APP_API_URL + "/api/inventory/change-password/",
                {
                    old_password: oldPassword,
                    new_password: newPassword,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setPasswordFeedback({
                type: "success",
                message: response.data.message || t("Password changed successfully"),
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
                message: errorMsg,
            });
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("role");
        localStorage.removeItem("username");
        localStorage.removeItem("owner_name");
        navigate("/login");
    };

    return (
        <>
            <IndividualSidebar />

            <main className="individual-settings-page">
                <TopNavbar />

                {/* Page Header Banner */}
                <header className="settings-header-banner">
                    <div className="settings-header-left">
                        <div className="settings-header-icon-wrap" aria-hidden="true">
                            <i className="bi bi-gear-wide-connected"></i>
                        </div>
                        <div className="settings-header-text">
                            <h1 className="settings-title">{t("Individual Settings")}</h1>
                            <p className="settings-subtitle">
                                {t("Manage your profile, security, and account preferences.")}
                            </p>
                        </div>
                    </div>

                    <div className="settings-header-actions">
                        <span className="settings-header-badge">
                            <i className="bi bi-shield-lock-fill" style={{ fontSize: "0.85rem" }}></i>
                            <span>{t("Individual Donor")}</span>
                        </span>
                    </div>
                </header>

                {/* Preferences Saved Toast Banner */}
                {savedFeedback && (
                    <div className="settings-feedback-banner success" role="alert">
                        <i className="bi bi-check-circle-fill"></i>
                        <span>{t("Settings Saved Successfully")}</span>
                    </div>
                )}

                {/* Profile Load Error Banner */}
                {profileError && (
                    <div className="settings-feedback-banner danger" role="alert">
                        <i className="bi bi-exclamation-triangle-fill"></i>
                        <span>{profileError}</span>
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-danger ms-auto"
                            onClick={fetchProfileAndDashboard}
                        >
                            {t("Retry")}
                        </button>
                    </div>
                )}

                {/* Settings Cards Grid */}
                <div className="settings-grid">
                    {/* Card 1: Profile & Account Information */}
                    <section className="settings-card">
                        <header className="settings-card-header">
                            <div className="settings-card-header-left">
                                <div className="settings-card-icon" aria-hidden="true">
                                    <i className="bi bi-person-badge-fill"></i>
                                </div>
                                <h2 className="settings-card-title">{t("Profile")}</h2>
                            </div>
                        </header>

                        <div className="settings-card-body">
                            {profileLoading ? (
                                <div className="profile-info-list" aria-busy="true">
                                    {[1, 2, 3, 4].map((idx) => (
                                        <div key={idx} className="profile-info-row">
                                            <div className="skeleton-bar" style={{ width: "35%", height: "16px" }}></div>
                                            <div className="skeleton-bar" style={{ width: "45%", height: "16px" }}></div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="profile-info-list">
                                    <div className="profile-info-row">
                                        <span className="profile-info-label">{t("Username")}</span>
                                        <span className="profile-info-value">{profile.username || "—"}</span>
                                    </div>

                                    <div className="profile-info-row">
                                        <span className="profile-info-label">{t("Email")}</span>
                                        <span className="profile-info-value">{profile.email || "—"}</span>
                                    </div>

                                    {profile.phone && (
                                        <div className="profile-info-row">
                                            <span className="profile-info-label">{t("Phone")}</span>
                                            <span className="profile-info-value">{profile.phone}</span>
                                        </div>
                                    )}

                                    <div className="profile-info-row">
                                        <span className="profile-info-label">{t("Role")}</span>
                                        <span className="profile-role-badge">
                                            <i className="bi bi-person-check-fill"></i>
                                            {t("Individual Donor")}
                                        </span>
                                    </div>

                                    <div className="profile-info-row">
                                        <span className="profile-info-label">{t("Total Donations")}</span>
                                        <span className="profile-stat-badge">
                                            {formatLocalizedNumber(dashboard.total_donations || 0, language)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Card 2: Appearance & Preferences */}
                    <section className="settings-card">
                        <header className="settings-card-header">
                            <div className="settings-card-header-left">
                                <div className="settings-card-icon" aria-hidden="true">
                                    <i className="bi bi-sliders"></i>
                                </div>
                                <h2 className="settings-card-title">{t("Appearance")} &amp; {t("Language")}</h2>
                            </div>
                        </header>

                        <div className="settings-card-body">
                            {/* Theme Choice */}
                            <div className="preference-group">
                                <label className="preference-label">{t("Theme")}</label>
                                <p className="preference-description">
                                    {t("Select your preferred visual mode for FoodBridge AI.")}
                                </p>
                                <div className="theme-toggle-group">
                                    <button
                                        type="button"
                                        className={`btn-theme-choice ${theme === THEMES.LIGHT ? "active" : ""}`}
                                        onClick={() => handleThemeChange(THEMES.LIGHT)}
                                        aria-pressed={theme === THEMES.LIGHT}
                                    >
                                        <i className="bi bi-sun-fill text-warning"></i>
                                        <span>{t("Light")}</span>
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn-theme-choice ${theme === THEMES.DARK ? "active" : ""}`}
                                        onClick={() => handleThemeChange(THEMES.DARK)}
                                        aria-pressed={theme === THEMES.DARK}
                                    >
                                        <i className="bi bi-moon-stars-fill text-primary"></i>
                                        <span>{t("Dark")}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Language Choice */}
                            <div className="preference-group">
                                <label htmlFor="language-selector" className="preference-label">
                                    {t("Language")}
                                </label>
                                <p className="preference-description">
                                    {t("Select your preferred language for the application.")}
                                </p>
                                <select
                                    id="language-selector"
                                    className="settings-select"
                                    value={language}
                                    onChange={handleLanguageChange}
                                    aria-label={t("Language")}
                                >
                                    {LANGUAGE_OPTIONS.map((lang) => (
                                        <option key={lang.code} value={lang.code}>
                                            {lang.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Notifications Choice */}
                            <div className="preference-group">
                                <label htmlFor="notifications-selector" className="preference-label">
                                    {t("In-App Notifications")}
                                </label>
                                <p className="preference-description">
                                    {t("Receive alerts regarding donations, pickups, and status updates.")}
                                </p>
                                <select
                                    id="notifications-selector"
                                    className="settings-select"
                                    value={notificationsEnabled ? "true" : "false"}
                                    onChange={handleNotificationsChange}
                                    aria-label={t("In-App Notifications")}
                                >
                                    <option value="true">{t("Enabled")}</option>
                                    <option value="false">{t("Disabled")}</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* Card 3: Change Password */}
                    <section className="settings-card">
                        <header className="settings-card-header">
                            <div className="settings-card-header-left">
                                <div className="settings-card-icon" aria-hidden="true">
                                    <i className="bi bi-key-fill"></i>
                                </div>
                                <h2 className="settings-card-title">{t("Change Password")}</h2>
                            </div>
                        </header>

                        <div className="settings-card-body">
                            {passwordFeedback && (
                                <div
                                    className={`settings-feedback-banner ${passwordFeedback.type === "success" ? "success" : "danger"}`}
                                    role="alert"
                                >
                                    <i className={`bi ${passwordFeedback.type === "success" ? "bi-check-circle-fill" : "bi-exclamation-octagon-fill"}`}></i>
                                    <span>{passwordFeedback.message}</span>
                                </div>
                            )}

                            <form onSubmit={handlePasswordChange} noValidate>
                                {/* Current Password */}
                                <div className="password-field-wrap">
                                    <label htmlFor="old-password-input" className="password-label">
                                        <span>{t("Current Password")}</span>
                                        <span className="text-danger">*</span>
                                    </label>
                                    <div className="password-input-group">
                                        <input
                                            id="old-password-input"
                                            type={showOldPassword ? "text" : "password"}
                                            className={`password-input ${passwordErrors.oldPassword ? "has-error" : ""}`}
                                            value={oldPassword}
                                            onChange={(e) => setOldPassword(e.target.value)}
                                            placeholder={t("Old Password")}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="btn-toggle-pw"
                                            onClick={() => setShowOldPassword(!showOldPassword)}
                                            aria-label={showOldPassword ? "Hide password" : "Show password"}
                                        >
                                            <i className={`bi ${showOldPassword ? "bi-eye-slash-fill" : "bi-eye-fill"}`}></i>
                                        </button>
                                    </div>
                                    {passwordErrors.oldPassword && (
                                        <span className="field-error-msg">
                                            <i className="bi bi-exclamation-circle-fill"></i>
                                            {passwordErrors.oldPassword}
                                        </span>
                                    )}
                                </div>

                                {/* New Password */}
                                <div className="password-field-wrap">
                                    <label htmlFor="new-password-input" className="password-label">
                                        <span>{t("New Password")}</span>
                                        <span className="text-danger">*</span>
                                    </label>
                                    <div className="password-input-group">
                                        <input
                                            id="new-password-input"
                                            type={showNewPassword ? "text" : "password"}
                                            className={`password-input ${passwordErrors.newPassword ? "has-error" : ""}`}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder={t("New Password")}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="btn-toggle-pw"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            aria-label={showNewPassword ? "Hide password" : "Show password"}
                                        >
                                            <i className={`bi ${showNewPassword ? "bi-eye-slash-fill" : "bi-eye-fill"}`}></i>
                                        </button>
                                    </div>
                                    {passwordErrors.newPassword && (
                                        <span className="field-error-msg">
                                            <i className="bi bi-exclamation-circle-fill"></i>
                                            {passwordErrors.newPassword}
                                        </span>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div className="password-field-wrap">
                                    <label htmlFor="confirm-password-input" className="password-label">
                                        <span>{t("Confirm Password")}</span>
                                        <span className="text-danger">*</span>
                                    </label>
                                    <div className="password-input-group">
                                        <input
                                            id="confirm-password-input"
                                            type={showConfirmPassword ? "text" : "password"}
                                            className={`password-input ${passwordErrors.confirmPassword ? "has-error" : ""}`}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder={t("Confirm Password")}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="btn-toggle-pw"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                        >
                                            <i className={`bi ${showConfirmPassword ? "bi-eye-slash-fill" : "bi-eye-fill"}`}></i>
                                        </button>
                                    </div>
                                    {passwordErrors.confirmPassword && (
                                        <span className="field-error-msg">
                                            <i className="bi bi-exclamation-circle-fill"></i>
                                            {passwordErrors.confirmPassword}
                                        </span>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="btn-submit-password"
                                    disabled={passwordLoading}
                                >
                                    {passwordLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            <span>{t("Changing Password...")}</span>
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-shield-check"></i>
                                            <span>{t("Update Password")}</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </section>

                    {/* Card 4: Account Actions & Logout */}
                    <section className="settings-card logout-card">
                        <header className="settings-card-header">
                            <div className="settings-card-header-left">
                                <div className="settings-card-icon" aria-hidden="true">
                                    <i className="bi bi-box-arrow-right"></i>
                                </div>
                                <h2 className="settings-card-title">{t("Logout")}</h2>
                            </div>
                        </header>

                        <div className="settings-card-body d-flex flex-column justify-content-between">
                            <p className="logout-desc">
                                {t("Sign out of your FoodBridge AI account. You can log in again anytime.")}
                            </p>

                            <button
                                type="button"
                                className="btn-settings-logout"
                                onClick={handleLogout}
                            >
                                <i className="bi bi-box-arrow-right"></i>
                                <span>{t("Logout")}</span>
                            </button>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}

export default IndividualSettings;