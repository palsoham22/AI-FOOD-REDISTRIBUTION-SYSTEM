import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import TopNavbar from "../components/TopNavbar";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { LABELS } from "../translations";

function AdminSettings() {

    const navigate = useNavigate();

    const [profile, setProfile] = useState({});

    const [oldPassword, setOldPassword] = useState("");

    const [newPassword, setNewPassword] = useState("");

    const [confirmPassword, setConfirmPassword] = useState("");
    const t = useTranslate();

    usePageTranslation(LABELS.ADMIN_SETTINGS);

    useEffect(() => {

    const token = localStorage.getItem("access");

    axios.get(
        "http://127.0.0.1:8000/api/inventory/profile/",
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    )
    .then((response) => {

        setProfile(response.data);

    })
    .catch((error) => {

        console.log(error);

    });

}, []);

const changePassword = () => {

    if (newPassword !== confirmPassword) {

        alert(t("Passwords do not match"));

        return;
    }

    const token = localStorage.getItem("access");

    axios.post(
        "http://127.0.0.1:8000/api/change-password/",
        {
            old_password: oldPassword,
            new_password: newPassword
        },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    )
    .then(() => {

        alert(t("Password Changed Successfully"));

        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");

    })
    .catch(() => {

        alert(t("Current password is incorrect"));

    });

};

const logout = () => {

    localStorage.clear();

    navigate("/login");

};

    return (
        <>
            <AdminSidebar />

            <div
                className="container-fluid"
                style={{
                    marginLeft: "260px",
                    width: "calc(100% - 260px)",
                    padding: "30px"
                }}
            >

                <TopNavbar />

    

            <div className="mt-5 pt-3">

    <h2 className="fw-bold">
        ⚙️ {t("Admin Settings")}
    </h2>

    <p className="text-muted">
        {t("Manage your profile and application settings.")}
    </p>

    <div className="row g-4 mt-4">

        {/* Profile */}

        <div className="col-lg-6 mb-4">

            <div className="card shadow border-0">

                <div className="card-header bg-primary text-white">

                    <h5 className="mb-0">
                        👤 {t("Admin Profile")}
                    </h5>

                </div>

                <div className="card-body">

                    <p>
                        <strong>{t("Username :")}</strong> {profile.username}
                    </p>

                    <p>
                        <strong>{t("Email :")}</strong> {profile.email}
                    </p>

                    <p>
                        <strong>{t("Role :")}</strong> {t(profile.role)}
                    </p>

                    <p>
                        <strong>{t("Phone :")}</strong> {profile.phone || t("Not Available")}
                    </p>

                </div>

            </div>

        </div>

        {/* Password */}

        <div className="col-lg-6 mb-4">

            <div className="card shadow border-0">

                <div className="card-header bg-warning">

                    <h5 className="mb-0">
                        🔒 {t("Change Password")}
                    </h5>

                </div>

                <div className="card-body">

                    <input
                        type="password"
                        className="form-control mb-3"
                        placeholder={t("Current Password")}
                        value={oldPassword}
                        onChange={(e)=>setOldPassword(e.target.value)}
                    />

                    <input
                        type="password"
                        className="form-control mb-3"
                        placeholder={t("New Password")}
                        value={newPassword}
                        onChange={(e)=>setNewPassword(e.target.value)}
                    />

                    <input
                        type="password"
                        className="form-control mb-3"
                        placeholder={t("Confirm Password")}
                        value={confirmPassword}
                        onChange={(e)=>setConfirmPassword(e.target.value)}
                    />

                    <button
                        className="btn btn-warning w-100"
                        onClick={changePassword}
                    >
                        {t("Change Password")}
                    </button>

                </div>

            </div>

        </div>

    </div>

    <div className="row">

    <div className="col-lg-6 mb-4">

        <div className="card shadow border-0">

            <div className="card-header bg-success text-white">

                <h5 className="mb-0">
                    🖥️ {t("System Information")}
                </h5>

            </div>

            <div className="card-body">

                <p>
                    <strong>{t("Application :")}</strong> FoodBridge AI
                </p>

                <p>
                    <strong>{t("Version :")}</strong> 1.0
                </p>

                <p>
                    <strong>{t("Backend :")}</strong>

                    <span className="badge bg-success ms-2">
                        {t("Running")}
                    </span>

                </p>

                <p>
                    <strong>{t("Database :")}</strong>

                    <span className="badge bg-success ms-2">
                        {t("Connected")}
                    </span>

                </p>

            </div>

        </div>

    </div>

    <div className="col-lg-6 mb-4">

        <div className="card shadow border-0">

            <div className="card-header bg-danger text-white">

                <h5 className="mb-0">
                    🚪 {t("Logout")}
                </h5>

            </div>

            <div
    className="card-body d-flex flex-column justify-content-center align-items-center"
    style={{ minHeight: "180px" }}
>

                <p>
                    {t("Click below to securely logout.")}.
                </p>

                <button
                    className="btn btn-danger btn-lg"
                    onClick={logout}
                >
                    {t("Logout")}
                </button>

            </div>

        </div>

    </div>

                </div>

            </div>
 </div>
        

</>

    );
}

export default AdminSettings;