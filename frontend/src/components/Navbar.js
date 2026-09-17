import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslationContext } from "../context/TranslationContext";
import { useTranslate } from "../hooks/useTranslate";
import "../styles/Navbar.css";

function Navbar() {
  const { language, setLanguage } = useTranslationContext();
  const t = useTranslate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isHomePage = location.pathname === "/";

  const handleNavClick = (sectionId) => {
    setIsMobileOpen(false);
    if (isHomePage) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      window.location.href = `/#${sectionId}`;
    }
  };

  return (
    <header className="fb-navbar">
      <div className="container">
        {/* Brand Logo & Name */}
        <Link className="fb-brand" to="/" onClick={() => setIsMobileOpen(false)}>
          <span className="fb-brand-icon" aria-hidden="true">
            <i className="bi bi-box-seam-fill"></i>
          </span>
          <span>FoodBridge <span className="text-primary">AI</span></span>
          <span className="fb-brand-badge">{t("Impact")}</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="fb-desktop-nav" aria-label={t("Main Navigation")}>
          <ul className="fb-nav-links">
            <li>
              <button
                type="button"
                className="fb-nav-link"
                onClick={() => handleNavClick("home")}
              >
                {t("Home")}
              </button>
            </li>
            <li>
              <button
                type="button"
                className="fb-nav-link"
                onClick={() => handleNavClick("about")}
              >
                {t("About")}
              </button>
            </li>
            <li>
              <button
                type="button"
                className="fb-nav-link"
                onClick={() => handleNavClick("how-it-works")}
              >
                {t("How It Works")}
              </button>
            </li>
            <li>
              <button
                type="button"
                className="fb-nav-link"
                onClick={() => handleNavClick("features")}
              >
                {t("Features")}
              </button>
            </li>
            <li>
              <button
                type="button"
                className="fb-nav-link"
                onClick={() => handleNavClick("impact")}
              >
                {t("Impact")}
              </button>
            </li>
          </ul>
        </nav>

        {/* Desktop Controls (Language + Auth) */}
        <div className="fb-nav-controls fb-desktop-controls">
          <select
            className="form-select form-select-sm fb-lang-select"
            aria-label={t("Language Selector")}
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="en-IN">English</option>
            <option value="hi-IN">हिन्दी</option>
            <option value="ta-IN">தமிழ்</option>
            <option value="te-IN">తెలుగు</option>
            <option value="ml-IN">മലയാളം</option>
            <option value="bn-IN">বাংলা</option>
          </select>

          <Link className="fb-btn-login" to="/login">
            {t("Login")}
          </Link>

          <Link className="fb-btn-register" to="/register">
            <span>{t("Get Started")}</span>
            <i className="bi bi-arrow-right-short" aria-hidden="true"></i>
          </Link>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          type="button"
          className="fb-mobile-toggle"
          aria-label={t("Toggle navigation menu")}
          aria-expanded={isMobileOpen}
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          <i className={`bi ${isMobileOpen ? "bi-x-lg" : "bi-list"}`}></i>
        </button>
      </div>

      {/* Mobile Collapsible Navigation Menu */}
      <div className="container">
        <div className={`fb-mobile-menu ${isMobileOpen ? "open" : ""}`}>
          <button
            type="button"
            className="fb-nav-link text-start"
            onClick={() => handleNavClick("home")}
          >
            <i className="bi bi-house me-2"></i> {t("Home")}
          </button>
          <button
            type="button"
            className="fb-nav-link text-start"
            onClick={() => handleNavClick("about")}
          >
            <i className="bi bi-info-circle me-2"></i> {t("About")}
          </button>
          <button
            type="button"
            className="fb-nav-link text-start"
            onClick={() => handleNavClick("how-it-works")}
          >
            <i className="bi bi-diagram-3 me-2"></i> {t("How It Works")}
          </button>
          <button
            type="button"
            className="fb-nav-link text-start"
            onClick={() => handleNavClick("features")}
          >
            <i className="bi bi-stars me-2"></i> {t("Features")}
          </button>
          <button
            type="button"
            className="fb-nav-link text-start"
            onClick={() => handleNavClick("impact")}
          >
            <i className="bi bi-heart-pulse me-2"></i> {t("Impact")}
          </button>

          <div className="pt-2">
            <label className="form-label small text-muted mb-1 px-2">
              <i className="bi bi-translate me-1"></i> {t("Language")}
            </label>
            <select
              className="form-select form-select-sm fb-lang-select w-100"
              aria-label={t("Language Selector Mobile")}
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                setIsMobileOpen(false);
              }}
            >
              <option value="en-IN">English</option>
              <option value="hi-IN">हिन्दी</option>
              <option value="ta-IN">தமிழ்</option>
              <option value="te-IN">తెలుగు</option>
              <option value="ml-IN">മലയാളം</option>
              <option value="bn-IN">বাংলা</option>
            </select>
          </div>

          <div className="fb-mobile-actions">
            <Link
              className="fb-btn-login"
              to="/login"
              onClick={() => setIsMobileOpen(false)}
            >
              {t("Login")}
            </Link>
            <Link
              className="fb-btn-register"
              to="/register"
              onClick={() => setIsMobileOpen(false)}
            >
              {t("Get Started")}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;