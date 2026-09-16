import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { LABELS } from "../translations";
import Navbar from "../components/Navbar";
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
    const navigate = useNavigate();
    const t = useTranslate();
    usePageTranslation(LABELS.REGISTER);

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://127.0.0.1:8000/api/register/", { owner_name, business_name, business_type, username, email, phone, password, role });
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
        <div className="fr-auth-page">
            <Navbar />
            <main className="container fr-auth-container">
                <div className="row g-4 align-items-stretch justify-content-center">
                    <section className="col-lg-5 d-none d-lg-flex">
                        <div className="fr-brand-panel w-100">
                            <div><span className="fr-eyebrow"><i className="bi bi-stars"></i> {t("Join the movement")}</span><h1>{t("FoodBridge AI")}</h1><p>{t("A smarter network for rescuing food, reducing waste and strengthening communities.")}</p></div>
                            <div className="fr-illustration" aria-hidden="true"><div className="fr-ring fr-ring-one"></div><div className="fr-ring fr-ring-two"></div><i className="bi bi-box2-heart-fill"></i><span className="fr-mini-card fr-card-one"><i className="bi bi-arrow-repeat"></i></span><span className="fr-mini-card fr-card-two"><i className="bi bi-people-fill"></i></span><span className="fr-pledge"><i className="bi bi-leaf-fill"></i> {t("Less waste, more good")}</span></div>
                            <div className="fr-brand-footer"><i className="bi bi-shield-check"></i> {t("Your impact journey starts here.")}</div>
                        </div>
                    </section>
                    <section className="col-lg-7 col-md-10 col-xl-6">
                        <div className="card fr-auth-card border-0"><div className="card-body p-4 p-md-5">
                            <div className="fr-mobile-brand d-lg-none"><span><i className="bi bi-basket2-fill"></i></span>{t("FoodBridge AI")}</div>
                            <div className="mb-4"><span className="fr-kicker">{t("Create your account")}</span><h2>{t("Register")}</h2><p>{t("Get started with FoodBridge AI in a few simple steps.")}</p></div>
                            <form onSubmit={handleRegister}>
                                <div className="mb-3"><label className="form-label fr-label">{t("Register As")}</label><div className="fr-select-wrap"><i className="bi bi-person-badge"></i><select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}><option value="BUSINESS">{t("Business")}</option><option value="NGO">{t("NGO")}</option><option value="DELIVERY">{t("Delivery Partner")}</option><option value="INDIVIDUAL">{t("Individual Donor")}</option></select></div></div>
                                {role === "BUSINESS" && (<><div className="mb-3"><label className="form-label fr-label">{t("Business Owner Name")}</label><div className="fr-input-wrap"><i className="bi bi-person"></i><input type="text" className="form-control" value={owner_name} onChange={(e)=>setOwnerName(e.target.value)} /></div></div><div className="mb-3"><label className="form-label fr-label">{t("Business Name")}</label><div className="fr-input-wrap"><i className="bi bi-shop"></i><input type="text" className="form-control" value={business_name} onChange={(e)=>setBusinessName(e.target.value)} /></div></div><div className="mb-3"><label className="form-label fr-label">
    {t("Business Type")}
</label><div className="fr-select-wrap"><i className="bi bi-grid"></i><select className="form-select" value={business_type} onChange={(e)=>setBusinessType(e.target.value)}><option>{t("Supermarket")}</option><option>{t("Restaurant")}</option><option>{t("Bakery")}</option><option>{t("Cafe")}</option><option>{t("Hotel")}</option><option>{t("Cloud Kitchen")}</option></select></div></div></>)}
                                {role === "NGO" && (<><div className="mb-3"><label className="form-label fr-label">{t("Organization Name")}</label><div className="fr-input-wrap"><i className="bi bi-buildings"></i><input type="text" className="form-control" value={business_name} onChange={(e)=>setBusinessName(e.target.value)} /></div></div><div className="mb-3"><label className="form-label fr-label">
    {t("Registration Number")}
</label><div className="fr-input-wrap"><i className="bi bi-patch-check"></i><input type="text" className="form-control" value={owner_name} onChange={(e)=>setOwnerName(e.target.value)} /></div></div></>)}
                                <div className="row g-3"><div className="col-md-6"><label className="form-label fr-label">
    {t("Username")}
</label><div className="fr-input-wrap"><i className="bi bi-at"></i><input type="text" className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} /></div></div><div className="col-md-6"><label className="form-label fr-label">
    {t("Phone")}
</label><div className="fr-input-wrap"><i className="bi bi-telephone"></i><input type="text" className="form-control" value={phone} onChange={(e) => setPhone(e.target.value)} /></div></div></div>
                                <div className="row g-3 mt-0"><div className="col-md-6"><label className="form-label fr-label">
    {t("Email")}
</label><div className="fr-input-wrap"><i className="bi bi-envelope"></i><input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} /></div></div><div className="col-md-6"><label className="form-label fr-label">
    {t("Password")}
</label><div className="fr-input-wrap"><i className="bi bi-lock"></i><input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} /></div></div></div>
                               <button type="submit" className="btn fr-submit w-100">
    {t("Register")}
    <i className="bi bi-arrow-right"></i>
</button>
                                <div className="text-center fr-switch">{t("Already have an account?")}<button type="button" className="btn btn-link" onClick={()=>navigate("/login")}>{t("Login")}</button></div>
                            </form>
                        </div></div>
                    </section>
                </div>
            </main>
        </div>
    );
}

export default Register;
