import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { useTranslationContext } from "../context/TranslationContext";
import { LABELS } from "../translations";
import "./Login.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("BUSINESS");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const t = useTranslate();
  const { language, setLanguage } = useTranslationContext();
  usePageTranslation(LABELS.LOGIN);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/login/", {
        username,
        password,
      });
      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);
      alert(t("Login Successful 🎉"));
      const role = response.data.role;
      localStorage.setItem("role", role);
      localStorage.setItem("username", username);
      localStorage.setItem("owner_name", response.data.owner_name);
      localStorage.setItem("business_name", response.data.business_name);
      localStorage.setItem("business_type", response.data.business_type);
      const userRole = response.data.role;
      localStorage.setItem("role", userRole);
      if (userRole === "BUSINESS") {
        navigate("/business-dashboard");
      } else if (userRole === "NGO") {
        navigate("/ngo-dashboard");
      } else if (userRole === "DELIVERY") {
        navigate("/delivery-dashboard");
      } else if (userRole === "ADMIN") {
        navigate("/admin-dashboard");
      } else if (userRole === "INDIVIDUAL") {
        navigate("/individual");
      }
    } catch (error) {
      console.log(error.response?.data);
      alert(t("Invalid Credentials"));
    }
  };

  return (
    <div className="fb-auth-page">
      {/* Compact Top Navigation Header */}
      <header className="fb-auth-header">
        <div className="container-fluid px-3 px-lg-4 d-flex align-items-center justify-content-between">
          <Link to="/" className="fb-auth-brand">
            <span className="fb-auth-brand-icon" aria-hidden="true">
              <i className="bi bi-box-seam-fill"></i>
            </span>
            <span className="fb-auth-brand-text">
              FoodBridge <span className="text-primary">AI</span>
            </span>
          </Link>

          <div className="fb-auth-header-controls">
            <select
              className="form-select form-select-sm fb-lang-select"
              aria-label="Language Selector"
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

            <Link to="/" className="fb-auth-nav-link d-none d-sm-inline-flex">
              <i className="bi bi-house me-1"></i>
              <span>{t("Home")}</span>
            </Link>

            <Link to="/register" className="fb-auth-nav-btn">
              <span>{t("Register")}</span>
              <i className="bi bi-arrow-right-short ms-1"></i>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Authentication Area */}
      <main className="fb-auth-main">
        <div className="container fb-auth-container">
          <div className="row g-3 g-xl-4 align-items-stretch justify-content-center">
            {/* Left Column: Login Card */}
            <section className="col-lg-6 col-xl-6">
              <div className="fb-login-card">
                <div className="fb-login-card-header">
                  <span className="fb-auth-kicker">{t("Welcome back")}</span>
                  <h1 className="fb-auth-heading">{t("Login")}</h1>
                  <p className="fb-auth-subheading">
                    {t("Sign in to continue creating a difference.")}
                  </p>
                </div>

                <form onSubmit={handleLogin}>
                  {/* Username Field */}
                  <div className="mb-2">
                    <label className="fb-auth-label">{t("Username")}</label>
                    <div className="fb-auth-input-wrap">
                      <i className="bi bi-person"></i>
                      <input
                        type="text"
                        className="form-control fb-auth-input"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Role Selector (Public Roles Only) */}
                  <div className="mb-2">
                    <label className="fb-auth-label">{t("Login As")}</label>
                    <div className="fb-role-toggle-group" role="tablist">
                      <button
                        type="button"
                        className={`fb-role-toggle-btn ${role === "BUSINESS" ? "active" : ""}`}
                        onClick={() => setRole("BUSINESS")}
                      >
                        <i className="bi bi-shop"></i>
                        <span>{t("Business")}</span>
                      </button>
                      <button
                        type="button"
                        className={`fb-role-toggle-btn ${role === "NGO" ? "active" : ""}`}
                        onClick={() => setRole("NGO")}
                      >
                        <i className="bi bi-buildings"></i>
                        <span>{t("NGO")}</span>
                      </button>
                      <button
                        type="button"
                        className={`fb-role-toggle-btn ${role === "DELIVERY" ? "active" : ""}`}
                        onClick={() => setRole("DELIVERY")}
                      >
                        <i className="bi bi-truck"></i>
                        <span>{t("Delivery Partner")}</span>
                      </button>
                      <button
                        type="button"
                        className={`fb-role-toggle-btn ${role === "INDIVIDUAL" ? "active" : ""}`}
                        onClick={() => setRole("INDIVIDUAL")}
                      >
                        <i className="bi bi-person-heart"></i>
                        <span>{t("Individual Donor")}</span>
                      </button>
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="mb-2">
                    <label className="fb-auth-label">{t("Password")}</label>
                    <div className="fb-auth-input-wrap">
                      <i className="bi bi-lock"></i>
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control fb-auth-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="fb-auth-pw-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex="-1"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                      </button>
                    </div>
                  </div>

                  {/* Primary Submit CTA */}
                  <button type="submit" className="btn fb-auth-submit-btn w-100">
                    <span>{t("Login")}</span>
                    <i className="bi bi-arrow-right"></i>
                  </button>

                  {/* Switch to Register */}
                  <div className="text-center fb-auth-switch">
                    <span>{t("Don't have an account?")}</span>
                    <Link to="/register" className="fb-auth-switch-link">
                      {t("Register")}
                    </Link>
                  </div>
                </form>
              </div>
            </section>

            {/* Right Column: Supporting Visual & Brand Highlights */}
            <section className="col-lg-6 col-xl-6 d-none d-lg-flex">
              <div className="fb-login-brand-panel w-100">
                <div>
                  <div className="fb-brand-tag">
                    <i className="bi bi-stars"></i>
                    <span>{t("Smarter food impact")}</span>
                  </div>
                  <h2 className="fb-brand-title">{t("FoodBridge AI")}</h2>
                  <p className="fb-brand-desc">
                    {t(
                      "Connect surplus food with the people and communities who need it most."
                    )}
                  </p>
                </div>

                <div className="fb-brand-features">
                  <div className="fb-brand-feature-item">
                    <i className="bi bi-diagram-3-fill text-info"></i>
                    <span>{t("Multi-Stakeholder Coordination")}</span>
                  </div>
                  <div className="fb-brand-feature-item">
                    <i className="bi bi-clock-history text-warning"></i>
                    <span>{t("Expiry Date Monitoring")}</span>
                  </div>
                  <div className="fb-brand-feature-item">
                    <i className="bi bi-box2-heart-fill text-danger"></i>
                    <span>{t("Structured Food Redistribution")}</span>
                  </div>
                </div>

                <div className="fb-brand-footer">
                  <div className="fb-brand-chip">
                    <i className="bi bi-check-circle-fill text-success me-1"></i>
                    <span>{t("Every meal matters")}</span>
                  </div>
                  <div className="fb-brand-guarantee">
                    <i className="bi bi-shield-check text-info me-1"></i>
                    <span>{t("Secure, simple and built for impact.")}</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Login;
