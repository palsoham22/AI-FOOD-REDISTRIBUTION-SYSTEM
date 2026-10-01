import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DeliverySidebar from "../components/DeliverySidebar";
import TopNavbar from "../components/TopNavbar";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { LABELS } from "../translations";
import { useTheme, THEMES } from "../context/ThemeContext";
import { useTranslationContext } from "../context/TranslationContext";
import "../styles/DeliverySettings.css";

function DeliverySettings() {
    const navigate = useNavigate();
    const t = useTranslate();
    usePageTranslation(LABELS.DELIVERY_SETTINGS);

    // Global Theme Context
    const { theme, setTheme } = useTheme();

    // Global Language Context
    const { language, setLanguage } = useTranslationContext();

    // In-App Notification Preference (persisted in localStorage)
    const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
        const saved = localStorage.getItem("delivery_notifications_enabled");
        return saved !== "false";
    });

    // Save Feedback State
    const [savedSuccess, setSavedSuccess] = useState(false);

    // Password Change State
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordFeedback, setPasswordFeedback] = useState(null);

    const showSavedFeedback = () => {
        setSavedSuccess(true);
        setTimeout(() => {
            setSavedSuccess(false);
        }, 3000);
    };

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
        showSavedFeedback();
    };

    const handleLanguageChange = (e) => {
        setLanguage(e.target.value);
        showSavedFeedback();
    };

    const handleNotificationsChange = (e) => {
        const val = e.target.value === "Enabled";
        setNotificationsEnabled(val);
        localStorage.setItem("delivery_notifications_enabled", val ? "true" : "false");
        showSavedFeedback();
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordFeedback(null);

        if (!oldPassword.trim()) {
            setPasswordFeedback({
                type: "danger",
                message: t("Current password is required."),
            });
            return;
        }

        if (newPassword.length < 6) {
            setPasswordFeedback({
                type: "danger",
                message: t("Password must be at least 6 characters long."),
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordFeedback({
                type: "danger",
                message: t("Passwords do not match."),
            });
            return;
        }

        const token = localStorage.getItem("access");
        if (!token) {
            navigate("/login");
            return;
        }

        setPasswordLoading(true);
        try {
            const response = await axios.post(
                "http://127.0.0.1:8000/api/inventory/change-password/",
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
        } catch (error) {
            const errorMsg =
                error.response?.data?.error ||
                error.response?.data?.message ||
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
        localStorage.clear();
        navigate("/login");
    };

    const username = localStorage.getItem("username") || "Driver";

    return (
        <div className="delivery-settings-layout">
            <DeliverySidebar />

            <main className="delivery-settings-page">
                <TopNavbar />

                {/* Header Card */}
                <header className="delivery-settings-header-card">
                    <div className="delivery-settings-header-left">
                        <div className="delivery-settings-avatar-box">
                            <span role="img" aria-label="Settings">
                                ⚙️
                            </span>
                        </div>
                        <div className="delivery-settings-header-text">
                            <div className="delivery-settings-title-row">
                                <h1 className="delivery-settings-title">
                                    {t("Delivery Settings")}
                                </h1>
                                <span className="delivery-settings-status-pill">
                                    <span
                                        className="delivery-settings-pulse-dot"
                                        aria-hidden="true"
                                    ></span>
                                    {t("Active")}
                                </span>
                            </div>
                            <p className="delivery-settings-subtitle">
                                {t(
                                    "Manage your delivery preferences, appearance, language, and security settings."
                                )}
                            </p>
                        </div>
                    </div>
                </header>

                {/* Feedback Notification Banner */}
                {savedSuccess && (
                    <div
                        className="delivery-settings-alert delivery-settings-alert-success"
                        role="alert"
                    >
                        <span>✓ {t("Settings Saved Successfully")}</span>
                    </div>
                )}

                {/* Settings Grid */}
                <div className="delivery-settings-grid">
                    {/* Section 1: Appearance & Theme */}
                    <section className="delivery-settings-card">
                        <div className="delivery-settings-card-header">
                            <div className="d-flex align-items-center gap-2">
                                <span className="delivery-settings-section-icon">🎨</span>
                                <div>
                                    <h2 className="delivery-settings-card-title">
                                        {t("Appearance")}
                                    </h2>
                                    <p className="delivery-settings-card-subtitle">
                                        {t("Choose your preferred interface theme.")}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="delivery-settings-card-body">
                            <label className="delivery-settings-control-label mb-3">
                                {t("Theme")}
                            </label>

                            <div className="delivery-theme-options-grid">
                                {/* Light Theme Card */}
                                <div
                                    className={`delivery-theme-card ${
                                        theme === THEMES.LIGHT ? "active" : ""
                                    }`}
                                    onClick={() => handleThemeChange(THEMES.LIGHT)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) =>
                                        e.key === "Enter" && handleThemeChange(THEMES.LIGHT)
                                    }
                                    aria-label={t("Light")}
                                >
                                    <div className="delivery-theme-card-icon text-warning">
                                        ☀️
                                    </div>
                                    <div className="delivery-theme-card-info">
                                        <div className="delivery-theme-card-name">
                                            {t("Light")}
                                        </div>
                                        <div className="delivery-theme-card-desc">
                                            {t("SaaS Pure White")}
                                        </div>
                                    </div>
                                    {theme === THEMES.LIGHT && (
                                        <div className="delivery-theme-card-check">✓</div>
                                    )}
                                </div>

                                {/* Dark Theme Card */}
                                <div
                                    className={`delivery-theme-card ${
                                        theme === THEMES.DARK ? "active" : ""
                                    }`}
                                    onClick={() => handleThemeChange(THEMES.DARK)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) =>
                                        e.key === "Enter" && handleThemeChange(THEMES.DARK)
                                    }
                                    aria-label={t("Dark")}
                                >
                                    <div className="delivery-theme-card-icon text-primary">
                                        🌙
                                    </div>
                                    <div className="delivery-theme-card-info">
                                        <div className="delivery-theme-card-name">
                                            {t("Dark")}
                                        </div>
                                        <div className="delivery-theme-card-desc">
                                            {t("High-Contrast Slate")}
                                        </div>
                                    </div>
                                    {theme === THEMES.DARK && (
                                        <div className="delivery-theme-card-check">✓</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Language & Notifications */}
                    <section className="delivery-settings-card">
                        <div className="delivery-settings-card-header">
                            <div className="d-flex align-items-center gap-2">
                                <span className="delivery-settings-section-icon">🌐</span>
                                <div>
                                    <h2 className="delivery-settings-card-title">
                                        {t("Language")} & {t("Notifications")}
                                    </h2>
                                    <p className="delivery-settings-card-subtitle">
                                        {t(
                                            "Select your preferred language and notification alerts."
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="delivery-settings-card-body">
                            <div className="delivery-setting-item mb-4">
                                <label
                                    htmlFor="delivery-settings-language-select"
                                    className="delivery-settings-control-label mb-2"
                                >
                                    {t("Language")}
                                </label>
                                <select
                                    id="delivery-settings-language-select"
                                    className="delivery-settings-select"
                                    value={language}
                                    onChange={handleLanguageChange}
                                    aria-label={t("Language")}
                                >
                                    <option value="en-IN">🌐 English</option>
                                    <option value="hi-IN">🇮🇳 हिन्दी (Hindi)</option>
                                    <option value="bn-IN">🇮🇳 বাংলা (Bengali)</option>
                                    <option value="ta-IN">🇮🇳 தமிழ் (Tamil)</option>
                                    <option value="te-IN">🇮🇳 తెలుగు (Telugu)</option>
                                    <option value="ml-IN">🇮🇳 മലയാളം (Malayalam)</option>
                                </select>
                            </div>

                            <div className="delivery-setting-item">
                                <label
                                    htmlFor="delivery-settings-notification-select"
                                    className="delivery-settings-control-label mb-1"
                                >
                                    {t("In-App Notifications")}
                                </label>
                                <p className="delivery-settings-control-desc mb-2">
                                    {t(
                                        "Receive alerts regarding assigned pickups, navigation updates, and delivery confirmations."
                                    )}
                                </p>
                                <select
                                    id="delivery-settings-notification-select"
                                    className="delivery-settings-select"
                                    value={notificationsEnabled ? "Enabled" : "Disabled"}
                                    onChange={handleNotificationsChange}
                                    aria-label={t("In-App Notifications")}
                                >
                                    <option value="Enabled">{t("Enabled")}</option>
                                    <option value="Disabled">{t("Disabled")}</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* Section 3: Security (Change Password) */}
                    <section className="delivery-settings-card">
                        <div className="delivery-settings-card-header">
                            <div className="d-flex align-items-center gap-2">
                                <span className="delivery-settings-section-icon">🔒</span>
                                <div>
                                    <h2 className="delivery-settings-card-title">
                                        {t("Security")}
                                    </h2>
                                    <p className="delivery-settings-card-subtitle">
                                        {t(
                                            "Update your account password to maintain security."
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="delivery-settings-card-body">
                            {passwordFeedback && (
                                <div
                                    className={`delivery-settings-alert delivery-settings-alert-${passwordFeedback.type} mb-3`}
                                    role="alert"
                                >
                                    <span>{passwordFeedback.message}</span>
                                    <button
                                        type="button"
                                        className="delivery-settings-alert-close"
                                        onClick={() => setPasswordFeedback(null)}
                                        aria-label="Close"
                                    >
                                        ×
                                    </button>
                                </div>
                            )}

                            <form onSubmit={handlePasswordChange}>
                                <div className="delivery-form-group mb-3">
                                    <label
                                        htmlFor="delivery-old-password"
                                        className="delivery-settings-control-label"
                                    >
                                        {t("Current Password")}
                                    </label>
                                    <input
                                        type="password"
                                        id="delivery-old-password"
                                        className="delivery-settings-input"
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                    />
                                </div>

                                <div className="delivery-form-group mb-3">
                                    <label
                                        htmlFor="delivery-new-password"
                                        className="delivery-settings-control-label"
                                    >
                                        {t("New Password")}
                                    </label>
                                    <input
                                        type="password"
                                        id="delivery-new-password"
                                        className="delivery-settings-input"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        autoComplete="new-password"
                                    />
                                </div>

                                <div className="delivery-form-group mb-4">
                                    <label
                                        htmlFor="delivery-confirm-password"
                                        className="delivery-settings-control-label"
                                    >
                                        {t("Confirm New Password")}
                                    </label>
                                    <input
                                        type="password"
                                        id="delivery-confirm-password"
                                        className="delivery-settings-input"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        autoComplete="new-password"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="delivery-settings-btn-primary"
                                    disabled={passwordLoading}
                                >
                                    {passwordLoading ? (
                                        <>
                                            <span className="delivery-settings-spinner-sm me-2"></span>
                                            {t("Updating...")}
                                        </>
                                    ) : (
                                        <>
                                            <span className="me-2">🔑</span>
                                            {t("Update Password")}
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </section>

                    {/* Section 4: Account & Session */}
                    <section className="delivery-settings-card">
                        <div className="delivery-settings-card-header">
                            <div className="d-flex align-items-center gap-2">
                                <span className="delivery-settings-section-icon">👤</span>
                                <div>
                                    <h2 className="delivery-settings-card-title">
                                        {t("Account & Session")}
                                    </h2>
                                    <p className="delivery-settings-card-subtitle">
                                        {t("Manage your active delivery session.")}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="delivery-settings-card-body">
                            <div className="delivery-account-info-box mb-4">
                                <div className="delivery-account-user-row">
                                    <span className="delivery-account-avatar">🚚</span>
                                    <div>
                                        <div className="delivery-account-username">
                                            {username}
                                        </div>
                                        <div className="delivery-account-role">
                                            {t("Delivery Partner")}
                                        </div>
                                    </div>
                                </div>
                                <span className="delivery-account-badge">
                                    ✓ {t("Active Driver")}
                                </span>
                            </div>

                            <p className="delivery-settings-control-desc mb-4">
                                {t(
                                    "Profile information is managed through your verified FoodBridge AI account."
                                )}
                            </p>

                            <button
                                type="button"
                                className="delivery-settings-btn-danger"
                                onClick={handleLogout}
                            >
                                <span className="me-2">🚪</span>
                                {t("Log Out")}
                            </button>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}

export default DeliverySettings;
