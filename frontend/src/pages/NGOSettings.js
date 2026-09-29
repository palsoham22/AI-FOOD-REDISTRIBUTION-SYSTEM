import React, { useState } from "react";
import NGOSidebar from "../components/NGOSidebar";
import TopNavbar from "../components/TopNavbar";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { LABELS } from "../translations";
import { useTheme, THEMES } from "../context/ThemeContext";
import { useTranslationContext } from "../context/TranslationContext";
import "../styles/NGOSettings.css";

function NGOSettings() {
    const t = useTranslate();
    usePageTranslation(LABELS.NGO_SETTINGS);

    // Global Theme Context
    const { theme, setTheme } = useTheme();

    // Global Language Context
    const { language, setLanguage } = useTranslationContext();

    // In-App Notification Preference (stored in localStorage)
    const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
        const saved = localStorage.getItem("ngo_notifications_enabled");
        return saved !== "false";
    });

    // Save Feedback State
    const [savedSuccess, setSavedSuccess] = useState(false);

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
        showFeedback();
    };

    const handleLanguageChange = (e) => {
        setLanguage(e.target.value);
        showFeedback();
    };

    const handleNotificationsChange = (e) => {
        const val = e.target.value === "Enabled";
        setNotificationsEnabled(val);
        localStorage.setItem("ngo_notifications_enabled", val ? "true" : "false");
        showFeedback();
    };

    const showFeedback = () => {
        setSavedSuccess(true);
        setTimeout(() => {
            setSavedSuccess(false);
        }, 3000);
    };

    const handleSaveAll = (e) => {
        e.preventDefault();
        localStorage.setItem("ngo_notifications_enabled", notificationsEnabled ? "true" : "false");
        showFeedback();
    };

    return (
        <>
            <NGOSidebar />

            <div className="ngo-page ngo-settings-page">
                <TopNavbar />

                {/* 1. Page Header Card */}
                <div className="ngo-settings-header-card mb-4">
                    <div className="ngo-settings-header-main">
                        <div className="ngo-settings-avatar-box">
                            <span className="ngo-settings-avatar-icon">⚙️</span>
                        </div>
                        <div className="ngo-settings-header-info">
                            <div className="d-flex align-items-center flex-wrap gap-2 mb-1">
                                <h1 className="ngo-settings-title mb-0">{t("NGO Settings")}</h1>
                                <span className="badge ngo-settings-status-pill">
                                    <span className="ngo-settings-pulse-dot" aria-hidden="true"></span>
                                    {t("Active")}
                                </span>
                            </div>
                            <p className="ngo-settings-subtitle mb-0">
                                {t("Manage your NGO preferences and application settings.")}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Feedback Notification Banner */}
                {savedSuccess && (
                    <div className="alert alert-success ngo-settings-alert d-flex align-items-center gap-2 mb-4" role="alert">
                        <i className="bi bi-check-circle-fill"></i>
                        <span>{t("Settings Saved Successfully")}</span>
                    </div>
                )}

                {/* 2. Main Settings Grid */}
                <div className="row g-4">
                    {/* Left Column: Appearance & Theme Settings */}
                    <div className="col-lg-6 col-12">
                        <div className="ngo-settings-card h-100">
                            <div className="ngo-settings-card-header">
                                <div className="d-flex align-items-center gap-2">
                                    <span className="ngo-settings-section-icon">
                                        <i className="bi bi-palette"></i>
                                    </span>
                                    <div>
                                        <h2 className="ngo-settings-card-title mb-0">{t("Appearance")}</h2>
                                        <p className="ngo-settings-card-subtitle mb-0">
                                            {t("Choose your preferred interface theme.")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="ngo-settings-card-body">
                                <label className="ngo-settings-control-label mb-3">
                                    {t("Theme")}
                                </label>

                                <div className="ngo-theme-options-grid">
                                    {/* Light Theme Card */}
                                    <div
                                        className={`ngo-theme-card ${theme === THEMES.LIGHT ? "active" : ""}`}
                                        onClick={() => handleThemeChange(THEMES.LIGHT)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => e.key === "Enter" && handleThemeChange(THEMES.LIGHT)}
                                        aria-label={t("Light")}
                                    >
                                        <div className="ngo-theme-card-icon text-warning">
                                            <i className="bi bi-sun-fill"></i>
                                        </div>
                                        <div className="ngo-theme-card-info">
                                            <div className="ngo-theme-card-name">{t("Light")}</div>
                                            <div className="ngo-theme-card-desc">SaaS Pure White</div>
                                        </div>
                                        {theme === THEMES.LIGHT && (
                                            <div className="ngo-theme-card-check">
                                                <i className="bi bi-check-circle-fill"></i>
                                            </div>
                                        )}
                                    </div>

                                    {/* Dark Theme Card */}
                                    <div
                                        className={`ngo-theme-card ${theme === THEMES.DARK ? "active" : ""}`}
                                        onClick={() => handleThemeChange(THEMES.DARK)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => e.key === "Enter" && handleThemeChange(THEMES.DARK)}
                                        aria-label={t("Dark")}
                                    >
                                        <div className="ngo-theme-card-icon text-primary">
                                            <i className="bi bi-moon-stars-fill"></i>
                                        </div>
                                        <div className="ngo-theme-card-info">
                                            <div className="ngo-theme-card-name">{t("Dark")}</div>
                                            <div className="ngo-theme-card-desc">High-Contrast Slate</div>
                                        </div>
                                        {theme === THEMES.DARK && (
                                            <div className="ngo-theme-card-check">
                                                <i className="bi bi-check-circle-fill"></i>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Language & Preferences */}
                    <div className="col-lg-6 col-12">
                        <div className="ngo-settings-card h-100">
                            <div className="ngo-settings-card-header">
                                <div className="d-flex align-items-center gap-2">
                                    <span className="ngo-settings-section-icon">
                                        <i className="bi bi-translate"></i>
                                    </span>
                                    <div>
                                        <h2 className="ngo-settings-card-title mb-0">{t("Language")}</h2>
                                        <p className="ngo-settings-card-subtitle mb-0">
                                            {t("Select your preferred language for the application.")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="ngo-settings-card-body">
                                <div className="mb-4">
                                    <label htmlFor="ngo-settings-language-select" className="ngo-settings-control-label mb-2">
                                        {t("Language")}
                                    </label>
                                    <select
                                        id="ngo-settings-language-select"
                                        className="form-select ngo-settings-select"
                                        value={language}
                                        onChange={handleLanguageChange}
                                        aria-label={t("Language")}
                                    >
                                        <option value="en-IN">🌐 English</option>
                                        <option value="hi-IN">🇮🇳 हिन्दी (Hindi)</option>
                                        <option value="ta-IN">🇮🇳 தமிழ் (Tamil)</option>
                                        <option value="te-IN">🇮🇳 తెలుగు (Telugu)</option>
                                        <option value="ml-IN">🇮🇳 മലയാളം (Malayalam)</option>
                                        <option value="bn-IN">🇮🇳 বাংলা (Bengali)</option>
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="ngo-settings-notification-select" className="ngo-settings-control-label mb-2">
                                        {t("In-App Notifications")}
                                    </label>
                                    <p className="ngo-settings-control-desc mb-2">
                                        {t("Receive alerts regarding donations, pickups, and deliveries.")}
                                    </p>
                                    <select
                                        id="ngo-settings-notification-select"
                                        className="form-select ngo-settings-select"
                                        value={notificationsEnabled ? "Enabled" : "Disabled"}
                                        onChange={handleNotificationsChange}
                                        aria-label={t("In-App Notifications")}
                                    >
                                        <option value="Enabled">{t("Enabled")}</option>
                                        <option value="Disabled">{t("Disabled")}</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Action Footer Card */}
                    <div className="col-12">
                        <div className="ngo-settings-card ngo-settings-footer-card">
                            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                                <div className="d-flex align-items-center gap-2 text-muted small">
                                    <i className="bi bi-shield-check text-primary"></i>
                                    <span>{t("Profile information is managed through your verified FoodBridge AI account.")}</span>
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-primary ngo-settings-save-btn"
                                    onClick={handleSaveAll}
                                >
                                    <i className="bi bi-floppy me-2"></i>
                                    {t("Save Settings")}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default NGOSettings;
