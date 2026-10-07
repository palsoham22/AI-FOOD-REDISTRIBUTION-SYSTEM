import { Link, useNavigate } from "react-router-dom";
import { useTranslate } from "../hooks/useTranslate";
import "../styles/Footer.css";

function Footer() {
  const navigate = useNavigate();
  const t = useTranslate();

  const handlePortalClick = (targetRole, targetPath) => {
    const token = localStorage.getItem("access");
    const currentRole = localStorage.getItem("role");

    if (!token) {
      navigate("/login", {
        state: {
          intendedRole: targetRole,
          redirectTo: targetPath,
        },
      });
      return;
    }

    if (currentRole === targetRole) {
      navigate(targetPath);
      return;
    }

    alert(
      t(
        "Access restricted: Your account role does not match the selected portal. Redirecting to your dashboard."
      )
    );

    const roleDashboardMap = {
      BUSINESS: "/business-dashboard",
      NGO: "/ngo-dashboard",
      DELIVERY: "/delivery-dashboard",
      INDIVIDUAL: "/individual",
      ADMIN: "/admin-dashboard",
    };

    navigate(roleDashboardMap[currentRole] || "/");
  };

  const handleScroll = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = `/#${id}`;
    }
  };

  return (
    <footer className="fb-footer">
      <div className="container">
        <div className="row g-4 justify-content-between">
          {/* Brand Col */}
          <div className="col-lg-4 col-md-6">
            <div className="fb-footer-brand">
              <Link to="/" className="fb-footer-logo">
                <span className="fb-footer-logo-icon" aria-hidden="true">
                  <i className="bi bi-box-seam-fill"></i>
                </span>
                <span>FoodBridge AI</span>
              </Link>
              <p className="fb-footer-desc">
                {t(
                  "AI-Based Food Redistribution System for Waste Reduction and Surplus Inventory Management. Connecting surplus food with communities in need."
                )}
              </p>
              <div className="d-flex align-items-center gap-2 mt-2">
                <span className="fb-footer-pill">
                  <i className="bi bi-heart-pulse-fill text-primary"></i>
                  <span>{t("Community Surplus Redistribution")}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links Col */}
          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="fb-footer-title">{t("Navigation")}</h6>
            <ul className="fb-footer-list">
              <li>
                <button
                  type="button"
                  className="fb-footer-link"
                  onClick={() => handleScroll("home")}
                >
                  <i className="bi bi-chevron-right text-primary small"></i>
                  {t("Home")}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="fb-footer-link"
                  onClick={() => handleScroll("about")}
                >
                  <i className="bi bi-chevron-right text-primary small"></i>
                  {t("About")}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="fb-footer-link"
                  onClick={() => handleScroll("how-it-works")}
                >
                  <i className="bi bi-chevron-right text-primary small"></i>
                  {t("How It Works")}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="fb-footer-link"
                  onClick={() => handleScroll("features")}
                >
                  <i className="bi bi-chevron-right text-primary small"></i>
                  {t("Features")}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="fb-footer-link"
                  onClick={() => handleScroll("impact")}
                >
                  <i className="bi bi-chevron-right text-primary small"></i>
                  {t("Impact")}
                </button>
              </li>
            </ul>
          </div>

          {/* Platform Roles Col */}
          <div className="col-lg-3 col-md-3 col-6">
            <h6 className="fb-footer-title">{t("Platform Roles")}</h6>
            <ul className="fb-footer-list">
              <li>
                <button
                  type="button"
                  onClick={() => handlePortalClick("BUSINESS", "/business-dashboard")}
                  className="fb-footer-link"
                >
                  <i className="bi bi-building small text-primary"></i>
                  {t("Business Portal")}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handlePortalClick("NGO", "/ngo-dashboard")}
                  className="fb-footer-link"
                >
                  <i className="bi bi-people small text-primary"></i>
                  {t("NGO & Food Banks")}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handlePortalClick("DELIVERY", "/delivery-dashboard")}
                  className="fb-footer-link"
                >
                  <i className="bi bi-truck small text-primary"></i>
                  {t("Delivery Partner")}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handlePortalClick("INDIVIDUAL", "/individual")}
                  className="fb-footer-link"
                >
                  <i className="bi bi-person-heart small text-primary"></i>
                  {t("Individual Donor")}
                </button>
              </li>

            </ul>
          </div>

          {/* Quick Access Col */}
          <div className="col-lg-3 col-md-6">
            <h6 className="fb-footer-title">{t("Get Started")}</h6>
            <p className="text-secondary small mb-3">
              {t(
                "Join our growing network of donors, NGOs, and delivery partners helping divert surplus food from waste."
              )}
            </p>
            <div className="d-flex flex-column gap-2">
              <Link to="/register" className="btn btn-primary btn-sm fw-semibold">
                {t("Register / Create Account")}
              </Link>
              <Link to="/login" className="btn btn-outline-light btn-sm fw-semibold">
                {t("Sign In to Portal")}
              </Link>
            </div>
          </div>
        </div>

        <hr className="fb-footer-divider" />

        <div className="fb-footer-bottom">
          <div>
            &copy; {new Date().getFullYear()} {t("FoodBridge AI. All rights reserved.")}
          </div>
          <div className="d-flex align-items-center gap-3">
            <span>{t("Reduce Food Waste. Redistribute Surplus. Create Impact.")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

