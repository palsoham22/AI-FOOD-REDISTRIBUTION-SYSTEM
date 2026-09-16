import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { LABELS } from "../translations";
import Navbar from "../components/Navbar";
import "./Login.css";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("BUSINESS");
    const navigate = useNavigate();
    const t = useTranslate();
    usePageTranslation(LABELS.LOGIN);

    const handleLogin = async (e) => {
    e.preventDefault();
    try {
        const response = await axios.post("http://127.0.0.1:8000/api/login/", { username, password });
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
        if (userRole === "BUSINESS") { navigate("/business-dashboard"); }
        else if (userRole === "NGO") { navigate("/ngo-dashboard"); }
        else if (userRole === "DELIVERY") { navigate("/delivery-dashboard"); }
        else if (userRole === "ADMIN") { navigate("/admin-dashboard"); }
        else if (userRole === "INDIVIDUAL") { navigate("/individual"); }
    } catch (error) {
        console.log(error.response?.data);
        alert(t("Invalid Credentials"));
    }
};

    return (
        <div className="fb-auth-page fb-login-page">
            <Navbar />
            <main className="container fb-auth-container">
                <div className="row g-4 align-items-stretch justify-content-center">
                    <section className="col-lg-6 d-none d-lg-flex">
                        <div className="fb-auth-brand-panel w-100">
                            <div><span className="fb-auth-eyebrow"><i className="bi bi-stars"></i> {t("Smarter food impact")}</span><h1>{t("FoodBridge AI")}</h1><p>{t("Connect surplus food with the people and communities who need it most.")}</p></div>
                            <div className="fb-auth-illustration" aria-hidden="true"><div className="fb-orbit fb-orbit-one"></div><div className="fb-orbit fb-orbit-two"></div><i className="bi bi-basket2-fill"></i><span className="fb-floating-icon fb-leaf"><i className="bi bi-leaf-fill"></i></span><span className="fb-floating-icon fb-heart"><i className="bi bi-heart-fill"></i></span><span className="fb-impact-chip"><i className="bi bi-check-circle-fill"></i> {t("Every meal matters")}</span></div>
                            <div className="fb-brand-footer"><i className="bi bi-shield-check"></i> {t("Secure, simple and built for impact.")}</div>
                        </div>
                    </section>
                    <section className="col-lg-6 col-md-10 col-xl-5">
                        <div className="card fb-auth-card border-0 h-100"><div className="card-body p-4 p-md-5">
                            <div className="fb-mobile-brand d-lg-none"><span className="fb-mobile-logo"><i className="bi bi-basket2-fill"></i></span><span>{t("FoodBridge AI")}</span></div>
                            <div className="mb-4"><span className="fb-section-kicker">{t("Welcome back")}</span><h2 className="fb-auth-title">{t("Login")}</h2><p className="fb-auth-subtitle">{t("Sign in to continue creating a difference.")}</p></div>
                            <form onSubmit={handleLogin}>
                                <div className="mb-4"><label className="form-label fb-form-label">{t("Username")}</label><div className="input-group fb-input-group"><span className="input-group-text"><i className="bi bi-person"></i></span><input type="text" className="form-control" value={username} onChange={(e)=>setUsername(e.target.value)} /></div></div>
                                <div className="mb-4"><label className="form-label fb-form-label">{t("Login As")}</label><div className="fb-role-grid">
                                    <button type="button" className={`fb-role-card ${role === "BUSINESS" ? "active" : ""}`} onClick={() => setRole("BUSINESS")}><span className="fb-role-icon"><i className="bi bi-shop"></i></span><span><strong>{t("Business")}</strong><small>{t("Manage inventory, surplus food and donations.")}</small></span><i className="bi bi-check-circle-fill fb-role-check"></i></button>
                                    <button type="button" className={`fb-role-card ${role === "NGO" ? "active" : ""}`} onClick={() => setRole("NGO")}><span className="fb-role-icon"><i className="bi bi-buildings"></i></span><span><strong>{t("NGO")}</strong><small>{t("Receive and distribute donated food.")}</small></span><i className="bi bi-check-circle-fill fb-role-check"></i></button>
                                    <button type="button" className={`fb-role-card ${role === "DELIVERY" ? "active" : ""}`} onClick={() => setRole("DELIVERY")}><span className="fb-role-icon"><i className="bi bi-truck"></i></span><span><strong>{t("Delivery Partner")}</strong><small>{t("Pickup and deliver food donations.")}</small></span><i className="bi bi-check-circle-fill fb-role-check"></i></button>
                                    <button type="button" className={`fb-role-card ${role === "INDIVIDUAL" ? "active" : ""}`} onClick={() => setRole("INDIVIDUAL")}><span className="fb-role-icon"><i className="bi bi-person-heart"></i></span><span><strong>{t("Individual Donor")}</strong><small>{t("Donate surplus food directly.")}</small></span><i className="bi bi-check-circle-fill fb-role-check"></i></button>
                                    <button type="button" className={`fb-role-card fb-role-card-wide ${role === "ADMIN" ? "active" : ""}`} onClick={() => setRole("ADMIN")}><span className="fb-role-icon"><i className="bi bi-gear"></i></span><span><strong>{t("Admin")}</strong><small>{t("Manage the complete FoodBridge platform.")}</small></span><i className="bi bi-check-circle-fill fb-role-check"></i></button>
                                </div></div>
                                <div className="mb-4"><label className="form-label fb-form-label">{t("Password")}</label><div className="input-group fb-input-group"><span className="input-group-text"><i className="bi bi-lock"></i></span><input type="password" className="form-control" value={password} onChange={(e)=>setPassword(e.target.value)} /></div></div>
                                <button type="submit" className="btn fb-auth-submit w-100">{t("Login")} <i className="bi bi-arrow-right"></i></button>
                            </form>
                            <div className="text-center fb-auth-switch">{t("Don't have an account?")}<button type="button" className="btn btn-link" onClick={() => navigate("/register")}>{t("Register")}</button></div>
                        </div></div>
                    </section>
                </div>
            </main>
        </div>
    );
}

export default Login;
