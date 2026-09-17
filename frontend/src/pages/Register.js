import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { useTranslationContext } from "../context/TranslationContext";
import { LABELS } from "../translations";
import "./Register.css";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("BUSINESS");
  const [owner_name, setOwnerName] = useState("");
  const [business_name, setBusinessName] = useState("");
  const [business_type, setBusinessType] = useState("Supermarket");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const t = useTranslate();
  const { language, setLanguage } = useTranslationContext();
  usePageTranslation(LABELS.REGISTER);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/register/", {
        owner_name,
        business_name,
        business_type,
        username,
        email,
        phone,
        password,
        role,
      });
      alert(t("Registration Successful 🎉"));
      setUsername("");
      setEmail("");
      setPhone("");
      setPassword("");
      setRole("BUSINESS");
      navigate("/login");
      console.log(response.data);
    } catch (error) {
      console.log(error);
      alert(t("Registration Failed"));
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

            <Link to="/login" className="fb-auth-nav-btn">
              <span>{t("Login")}</span>
              <i className="bi bi-box-arrow-in-right ms-1"></i>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="fb-auth-main">
        <div className="container fb-auth-container">
          <div className="row g-3 g-xl-4 align-items-stretch justify-content-center">
            {/* Left Column: Registration Form Card */}
            <section className="col-lg-7 col-xl-7">
              <div className="fb-register-card">
                <div className="fb-register-card-header">
                  <span className="fb-auth-kicker">{t("Create your account")}</span>
                  <h1 className="fb-auth-heading">{t("Register")}</h1>
                  <p className="fb-auth-subheading">
                    {t("Get started with FoodBridge AI in a few simple steps.")}
                  </p>
                </div>

                <form onSubmit={handleRegister}>
                  {/* Role Selector */}
                  <div className="mb-2">
                    <label className="fb-auth-label">{t("Register As")}</label>
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

                  {/* Role-Specific Fields */}
                  {role === "BUSINESS" && (
                    <>
                      <div className="row g-2 mb-2">
                        <div className="col-md-6">
                          <label className="fb-auth-label">{t("Business Owner Name")}</label>
                          <div className="fb-auth-input-wrap">
                            <i className="bi bi-person"></i>
                            <input
                              type="text"
                              className="form-control fb-auth-input"
                              value={owner_name}
                              onChange={(e) => setOwnerName(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <label className="fb-auth-label">{t("Business Name")}</label>
                          <div className="fb-auth-input-wrap">
                            <i className="bi bi-shop"></i>
                            <input
                              type="text"
                              className="form-control fb-auth-input"
                              value={business_name}
                              onChange={(e) => setBusinessName(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row g-2 mb-2">
                        <div className="col-md-6">
                          <label className="fb-auth-label">{t("Business Type")}</label>
                          <div className="fb-auth-input-wrap">
                            <i className="bi bi-grid"></i>
                            <select
                              className="form-select fb-auth-input"
                              value={business_type}
                              onChange={(e) => setBusinessType(e.target.value)}
                            >
                              <option>{t("Supermarket")}</option>
                              <option>{t("Restaurant")}</option>
                              <option>{t("Bakery")}</option>
                              <option>{t("Cafe")}</option>
                              <option>{t("Hotel")}</option>
                              <option>{t("Cloud Kitchen")}</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <label className="fb-auth-label">{t("Username")}</label>
                          <div className="fb-auth-input-wrap">
                            <i className="bi bi-at"></i>
                            <input
                              type="text"
                              className="form-control fb-auth-input"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row g-2 mb-2">
                        <div className="col-md-6">
                          <label className="fb-auth-label">{t("Phone")}</label>
                          <div className="fb-auth-input-wrap">
                            <i className="bi bi-telephone"></i>
                            <input
                              type="text"
                              className="form-control fb-auth-input"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <label className="fb-auth-label">{t("Email")}</label>
                          <div className="fb-auth-input-wrap">
                            <i className="bi bi-envelope"></i>
                            <input
                              type="email"
                              className="form-control fb-auth-input"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row g-2 mb-2">
                        <div className="col-12">
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
                      </div>
                    </>
                  )}

                  {role === "NGO" && (
                    <>
                      <div className="row g-2 mb-2">
                        <div className="col-md-6">
                          <label className="fb-auth-label">{t("Organization Name")}</label>
                          <div className="fb-auth-input-wrap">
                            <i className="bi bi-buildings"></i>
                            <input
                              type="text"
                              className="form-control fb-auth-input"
                              value={business_name}
                              onChange={(e) => setBusinessName(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <label className="fb-auth-label">{t("Registration Number")}</label>
                          <div className="fb-auth-input-wrap">
                            <i className="bi bi-patch-check"></i>
                            <input
                              type="text"
                              className="form-control fb-auth-input"
                              value={owner_name}
                              onChange={(e) => setOwnerName(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row g-2 mb-2">
                        <div className="col-md-6">
                          <label className="fb-auth-label">{t("Username")}</label>
                          <div className="fb-auth-input-wrap">
                            <i className="bi bi-at"></i>
                            <input
                              type="text"
                              className="form-control fb-auth-input"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <label className="fb-auth-label">{t("Phone")}</label>
                          <div className="fb-auth-input-wrap">
                            <i className="bi bi-telephone"></i>
                            <input
                              type="text"
                              className="form-control fb-auth-input"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row g-2 mb-2">
                        <div className="col-md-6">
                          <label className="fb-auth-label">{t("Email")}</label>
                          <div className="fb-auth-input-wrap">
                            <i className="bi bi-envelope"></i>
                            <input
                              type="email"
                              className="form-control fb-auth-input"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
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
                      </div>
                    </>
                  )}

                  {(role === "DELIVERY" || role === "INDIVIDUAL") && (
                    <>
                      <div className="row g-2 mb-2">
                        <div className="col-md-6">
                          <label className="fb-auth-label">{t("Username")}</label>
                          <div className="fb-auth-input-wrap">
                            <i className="bi bi-at"></i>
                            <input
                              type="text"
                              className="form-control fb-auth-input"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <label className="fb-auth-label">{t("Phone")}</label>
                          <div className="fb-auth-input-wrap">
                            <i className="bi bi-telephone"></i>
                            <input
                              type="text"
                              className="form-control fb-auth-input"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row g-2 mb-2">
                        <div className="col-md-6">
                          <label className="fb-auth-label">{t("Email")}</label>
                          <div className="fb-auth-input-wrap">
                            <i className="bi bi-envelope"></i>
                            <input
                              type="email"
                              className="form-control fb-auth-input"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
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
                      </div>
                    </>
                  )}

                  {/* Primary CTA Submit */}
                  <button type="submit" className="btn fb-auth-submit-btn w-100">
                    <span>{t("Register")}</span>
                    <i className="bi bi-arrow-right"></i>
                  </button>

                  {/* Switch to Login */}
                  <div className="text-center fb-auth-switch">
                    <span>{t("Already have an account?")}</span>
                    <Link to="/login" className="fb-auth-switch-link">
                      {t("Login")}
                    </Link>
                  </div>
                </form>
              </div>
            </section>

            {/* Right Column: Supporting Visual & Brand Highlights */}
            <section className="col-lg-5 col-xl-5 d-none d-lg-flex">
              <div className="fb-register-brand-panel w-100">
                <div>
                  <div className="fb-brand-tag">
                    <i className="bi bi-stars"></i>
                    <span>{t("Join the movement")}</span>
                  </div>
                  <h2 className="fb-brand-title">{t("FoodBridge AI")}</h2>
                  <p className="fb-brand-desc">
                    {t(
                      "A smarter network for rescuing food, reducing waste and strengthening communities."
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
                    <i className="bi bi-leaf-fill text-success me-1"></i>
                    <span>{t("Less waste, more good")}</span>
                  </div>
                  <div className="fb-brand-guarantee">
                    <i className="bi bi-shield-check text-info me-1"></i>
                    <span>{t("Your impact journey starts here.")}</span>
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

export default Register;
