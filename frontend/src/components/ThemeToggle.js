import React from "react";
import { useTheme } from "../context/ThemeContext";
import { useTranslate } from "../hooks/useTranslate";

function ThemeToggle({ className = "", compact = false }) {
    const { isDark, toggleTheme } = useTheme();
    const t = useTranslate();

    const label = isDark ? t("Light Mode") : t("Dark Mode");

    return (
        <button
            type="button"
            className={`fb-theme-toggle ${compact ? "fb-theme-toggle-compact" : ""} ${className}`}
            onClick={toggleTheme}
            aria-label={label}
            title={label}
        >
            <span className="theme-toggle-icon" aria-hidden="true">
                {isDark ? (
                    <i className="bi bi-sun-fill"></i>
                ) : (
                    <i className="bi bi-moon-stars-fill"></i>
                )}
            </span>
            {!compact && (
                <span className="theme-toggle-text d-none d-md-inline ms-1">
                    {isDark ? t("Light Mode") : t("Dark Mode")}
                </span>
            )}
        </button>
    );
}

export default ThemeToggle;
