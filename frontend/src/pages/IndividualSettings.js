import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import IndividualSidebar from "../components/IndividualSidebar";
import TopNavbar from "../components/TopNavbar";

import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { LABELS } from "../translations";

function IndividualSettings() {

    const navigate = useNavigate();

    const t = useTranslate();

    usePageTranslation(LABELS.INDIVIDUAL_SETTINGS);


    const [profile, setProfile] = useState({});

    const [dashboard, setDashboard] = useState({
        total_donations: 0
    });


    const [oldPassword, setOldPassword] = useState("");

    const [newPassword, setNewPassword] = useState("");

    const [confirmPassword, setConfirmPassword] = useState("");


    /* ==========================================
       FETCH PROFILE + DASHBOARD
    ========================================== */

    useEffect(() => {

        fetchProfile();

        fetchDashboard();

    }, []);


    const fetchProfile = async () => {

        try {

            const token = localStorage.getItem("access");

            const response = await axios.get(
                "http://127.0.0.1:8000/api/inventory/profile/",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setProfile(response.data);

        }

        catch (error) {

            console.log(error);

        }

    };


    const fetchDashboard = async () => {

        try {

            const token = localStorage.getItem("access");

            const response = await axios.get(
                "http://127.0.0.1:8000/api/inventory/individual/dashboard/",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setDashboard(response.data);

        }

        catch (error) {

            console.log(error);

        }

    };


    /* ==========================================
       CHANGE PASSWORD
    ========================================== */

    const changePassword = async () => {

        if (newPassword !== confirmPassword) {

            alert(t("Passwords do not match"));

            return;

        }


        try {

            const token = localStorage.getItem("access");

            await axios.post(
                "http://127.0.0.1:8000/api/change-password/",
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


            alert(t("Password Updated Successfully"));


            setOldPassword("");

            setNewPassword("");

            setConfirmPassword("");

        }

        catch (error) {

            alert(t("Failed to Update Password"));

        }

    };


    /* ==========================================
       LOGOUT
    ========================================== */

    const logout = () => {

        localStorage.clear();

        navigate("/login");

    };


    return (

        <>

            <IndividualSidebar />


            <style>
                {`

                /* ==========================================
                   SETTINGS PAGE
                ========================================== */

                .individual-settings-page {

                    min-height: 100vh;

                    margin-left: 250px;

                    width: calc(100% - 250px);

                    padding: 26px 30px 45px;

                    background:
                        linear-gradient(
                            135deg,
                            #f2faf7 0%,
                            #eef8f5 50%,
                            #f7fbfa 100%
                        );

                    color: #173c32;

                    transition:
                        margin-left 0.25s ease,
                        width 0.25s ease;
                }


                /* ==========================================
                   PAGE HEADER
                ========================================== */

                .settings-header {

                    margin-top: 18px;

                    margin-bottom: 24px;

                    padding: 24px 28px;

                    border-radius: 20px;

                    background:
                        linear-gradient(
                            135deg,
                            #e2f5ed,
                            #d7efe5
                        );

                    border: 1px solid rgba(23,96,72,0.10);

                    box-shadow:
                        0 8px 25px rgba(22,84,63,0.06);
                }


                .settings-header-content {

                    display: flex;

                    align-items: center;

                    justify-content: space-between;

                    gap: 20px;
                }


                .settings-title-area {

                    display: flex;

                    align-items: center;

                    gap: 14px;
                }


                .settings-title-icon {

                    width: 52px;

                    height: 52px;

                    display: flex;

                    align-items: center;

                    justify-content: center;

                    border-radius: 15px;

                    background: rgba(255,255,255,0.78);

                    font-size: 1.5rem;

                    box-shadow:
                        0 5px 15px rgba(25,91,67,0.08);
                }


                .settings-title {

                    margin: 0;

                    color: #124d3c;

                    font-size: 1.85rem;

                    font-weight: 750;

                    letter-spacing: -0.03em;
                }


                .settings-subtitle {

                    margin: 5px 0 0;

                    color: #5c7b70;

                    font-size: 0.95rem;
                }


                .settings-badge {

                    padding: 9px 15px;

                    border-radius: 999px;

                    background: rgba(255,255,255,0.75);

                    color: #26765d;

                    font-size: 0.84rem;

                    font-weight: 700;

                    white-space: nowrap;
                }


                /* ==========================================
                   SETTINGS CARD
                ========================================== */

                .settings-card {

                    height: 100%;

                    background: #ffffff;

                    border: 1px solid rgba(22,84,63,0.10);

                    border-radius: 20px;

                    box-shadow:
                        0 10px 30px rgba(22,84,63,0.07);

                    overflow: hidden;

                    transition:
                        transform 0.2s ease,
                        box-shadow 0.2s ease;
                }


                .settings-card:hover {

                    transform: translateY(-2px);

                    box-shadow:
                        0 14px 32px rgba(22,84,63,0.10);
                }


                .settings-card-body {

                    padding: 25px;
                }


                .settings-card-title {

                    display: flex;

                    align-items: center;

                    gap: 9px;

                    margin: 0 0 20px;

                    padding-bottom: 14px;

                    border-bottom: 1px solid #e4efeb;

                    color: #164c3d;

                    font-size: 1.12rem;

                    font-weight: 750;
                }


                /* ==========================================
                   PROFILE INFORMATION
                ========================================== */

                .profile-row {

                    display: flex;

                    align-items: center;

                    justify-content: space-between;

                    gap: 20px;

                    padding: 14px 0;

                    border-bottom: 1px solid #edf3f0;
                }


                .profile-row:last-child {

                    border-bottom: none;

                    padding-bottom: 0;
                }


                .profile-label {

                    color: #6c867d;

                    font-size: 0.88rem;

                    font-weight: 600;
                }


                .profile-value {

                    color: #24594a;

                    font-size: 0.94rem;

                    font-weight: 700;

                    text-align: right;

                    word-break: break-word;
                }


                .profile-role {

                    display: inline-flex;

                    padding: 6px 11px;

                    border-radius: 999px;

                    background: #e2f5ed;

                    color: #176d4e;

                    font-size: 0.76rem;

                    font-weight: 750;
                }


                /* ==========================================
                   PASSWORD INPUT
                ========================================== */

                .settings-label {

                    display: block;

                    margin-bottom: 7px;

                    color: #315c4e;

                    font-size: 0.85rem;

                    font-weight: 700;
                }


                .settings-input {

                    width: 100%;

                    height: 46px;

                    margin-bottom: 16px;

                    padding: 10px 13px;

                    border: 1px solid #cfe1da;

                    border-radius: 10px;

                    background: #fbfefd;

                    color: #173c32;

                    font-size: 0.92rem;

                    outline: none;

                    transition:
                        border-color 0.2s ease,
                        box-shadow 0.2s ease,
                        background 0.2s ease;
                }


                .settings-input::placeholder {

                    color: #9aada6;
                }


                .settings-input:focus {

                    border-color: #29916f;

                    background: #ffffff;

                    box-shadow:
                        0 0 0 3px rgba(41,145,111,0.10);
                }


                /* ==========================================
                   UPDATE PASSWORD BUTTON
                ========================================== */

                .update-password-btn {

                    width: 100%;

                    height: 46px;

                    margin-top: 3px;

                    border: none;

                    border-radius: 10px;

                    background:
                        linear-gradient(
                            135deg,
                            #21855f,
                            #176d4e
                        );

                    color: #ffffff;

                    font-size: 0.93rem;

                    font-weight: 700;

                    cursor: pointer;

                    box-shadow:
                        0 7px 16px rgba(25,112,78,0.17);

                    transition:
                        transform 0.2s ease,
                        box-shadow 0.2s ease,
                        background 0.2s ease;
                }


                .update-password-btn:hover {

                    background:
                        linear-gradient(
                            135deg,
                            #27966d,
                            #1a7655
                        );

                    transform: translateY(-2px);

                    box-shadow:
                        0 10px 20px rgba(25,112,78,0.21);
                }


                /* ==========================================
                   ACCOUNT INFORMATION
                ========================================== */

                .account-stat {

                    display: flex;

                    align-items: center;

                    justify-content: space-between;

                    padding: 15px 0;

                    border-bottom: 1px solid #edf3f0;
                }


                .account-stat:last-child {

                    border-bottom: none;
                }


                .account-stat-label {

                    color: #6c867d;

                    font-size: 0.88rem;

                    font-weight: 600;
                }


                .account-stat-value {

                    color: #176d4e;

                    font-size: 1.1rem;

                    font-weight: 750;
                }


                /* ==========================================
                   LOGOUT CARD
                ========================================== */

                .logout-card {

                    border-color: rgba(190,70,70,0.12);

                    background:
                        linear-gradient(
                            145deg,
                            #ffffff,
                            #fffafa
                        );
                }


                .logout-card .settings-card-title {

                    color: #a84646;

                    border-bottom-color: #f2e3e3;
                }


                .logout-description {

                    margin: 0 0 20px;

                    color: #7e7777;

                    font-size: 0.88rem;

                    line-height: 1.55;
                }


                .logout-btn {

                    width: 100%;

                    height: 45px;

                    border: none;

                    border-radius: 10px;

                    background:
                        linear-gradient(
                            135deg,
                            #c65c5c,
                            #ad4545
                        );

                    color: #ffffff;

                    font-size: 0.92rem;

                    font-weight: 700;

                    cursor: pointer;

                    box-shadow:
                        0 7px 15px rgba(173,69,69,0.14);

                    transition:
                        transform 0.2s ease,
                        box-shadow 0.2s ease,
                        background 0.2s ease;
                }


                .logout-btn:hover {

                    background:
                        linear-gradient(
                            135deg,
                            #d26767,
                            #b74a4a
                        );

                    transform: translateY(-2px);

                    box-shadow:
                        0 10px 20px rgba(173,69,69,0.19);
                }


                /* ==========================================
                   RESPONSIVE
                ========================================== */

                @media (max-width: 1000px) {

                    .individual-settings-page {

                        padding:
                            24px
                            22px
                            40px;
                    }

                    .settings-header {

                        padding: 22px;
                    }

                    .settings-card-body {

                        padding: 22px;
                    }

                }


                @media (max-width: 768px) {

                    .individual-settings-page {

                        margin-left: 0;

                        width: 100%;

                        padding:
                            80px
                            16px
                            30px;
                    }


                    .settings-header {

                        margin-top: 0;

                        padding: 20px;

                        border-radius: 17px;
                    }


                    .settings-header-content {

                        align-items: flex-start;

                        flex-direction: column;
                    }


                    .settings-title {

                        font-size: 1.55rem;
                    }


                    .settings-title-icon {

                        width: 46px;

                        height: 46px;

                        font-size: 1.3rem;
                    }


                    .settings-badge {

                        align-self: flex-start;
                    }


                    .settings-card {

                        border-radius: 17px;
                    }


                    .settings-card-body {

                        padding: 20px;
                    }

                }


                @media (max-width: 480px) {

                    .individual-settings-page {

                        padding-left: 12px;

                        padding-right: 12px;
                    }


                    .settings-header {

                        padding: 18px;
                    }


                    .settings-title {

                        font-size: 1.4rem;
                    }


                    .settings-subtitle {

                        font-size: 0.88rem;
                    }


                    .profile-row {

                        align-items: flex-start;

                        flex-direction: column;

                        gap: 5px;
                    }


                    .profile-value {

                        text-align: left;
                    }

                }

                `}
            </style>


            <div className="individual-settings-page">

                <TopNavbar />


                {/* ==========================================
                    HEADER
                ========================================== */}

                <section className="settings-header">

                    <div className="settings-header-content">

                        <div className="settings-title-area">

                            <div className="settings-title-icon">
                                ⚙️
                            </div>

                            <div>

                                <h1 className="settings-title">
                                    {t("Individual Settings")}
                                </h1>

                                <p className="settings-subtitle">
                                    Manage your profile, security, and account information.
                                </p>

                            </div>

                        </div>


                        <div className="settings-badge">
                            🔐 Account & Security
                        </div>

                    </div>

                </section>


                {/* ==========================================
                    SETTINGS CARDS
                ========================================== */}

                <div className="row g-4">


                    {/* ======================================
                        PROFILE
                    ====================================== */}

                    <div className="col-lg-6">

                        <div className="settings-card">

                            <div className="settings-card-body">

                                <h4 className="settings-card-title">

                                    👤

                                    {t("Profile")}

                                </h4>


                                <div className="profile-row">

                                    <span className="profile-label">
                                        {t("Username:")}
                                    </span>

                                    <span className="profile-value">
                                        {profile.username || "—"}
                                    </span>

                                </div>


                                <div className="profile-row">

                                    <span className="profile-label">
                                        {t("Email:")}
                                    </span>

                                    <span className="profile-value">
                                        {profile.email || "—"}
                                    </span>

                                </div>


                                <div className="profile-row">

                                    <span className="profile-label">
                                        {t("Role:")}
                                    </span>

                                    <span className="profile-role">

                                        {profile.role === "INDIVIDUAL"
                                            ? t("Individual Donor")
                                            : t(profile.role || "Individual Donor")
                                        }

                                    </span>

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* ======================================
                        CHANGE PASSWORD
                    ====================================== */}

                    <div className="col-lg-6">

                        <div className="settings-card">

                            <div className="settings-card-body">

                                <h4 className="settings-card-title">

                                    🔒

                                    {t("Change Password")}

                                </h4>


                                <label className="settings-label">
                                    {t("Old Password")}
                                </label>

                                <input
                                    type="password"
                                    className="settings-input"
                                    placeholder={t("Old Password")}
                                    value={oldPassword}
                                    onChange={(e) =>
                                        setOldPassword(e.target.value)
                                    }
                                />


                                <label className="settings-label">
                                    {t("New Password")}
                                </label>

                                <input
                                    type="password"
                                    className="settings-input"
                                    placeholder={t("New Password")}
                                    value={newPassword}
                                    onChange={(e) =>
                                        setNewPassword(e.target.value)
                                    }
                                />


                                <label className="settings-label">
                                    {t("Confirm Password")}
                                </label>

                                <input
                                    type="password"
                                    className="settings-input"
                                    placeholder={t("Confirm Password")}
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                />


                                <button
                                    className="update-password-btn"
                                    onClick={changePassword}
                                >
                                    🔐 {t("Update Password")}
                                </button>

                            </div>

                        </div>

                    </div>


                    {/* ======================================
                        ACCOUNT INFORMATION
                    ====================================== */}

                    <div className="col-lg-6">

                        <div className="settings-card">

                            <div className="settings-card-body">

                                <h4 className="settings-card-title">

                                    ℹ️

                                    {t("Account Information")}

                                </h4>


                                <div className="account-stat">

                                    <span className="account-stat-label">
                                        {t("Total Donations:")}
                                    </span>

                                    <span className="account-stat-value">
                                        {dashboard.total_donations}
                                    </span>

                                </div>


                                <div className="account-stat">

                                    <span className="account-stat-label">
                                        {t("Role:")}
                                    </span>

                                    <span className="profile-role">
                                        {t("Individual Donor")}
                                    </span>

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* ======================================
                        LOGOUT
                    ====================================== */}

                    <div className="col-lg-6">

                        <div className="settings-card logout-card">

                            <div className="settings-card-body">

                                <h4 className="settings-card-title">

                                    🚪

                                    {t("Logout")}

                                </h4>


                                <p className="logout-description">

                                    {t(
                                        "Sign out of your FoodBridge AI account. You can log in again anytime."
                                    )}

                                </p>


                                <button
                                    className="logout-btn"
                                    onClick={logout}
                                >
                                    🚪 {t("Logout")}
                                </button>

                            </div>

                        </div>

                    </div>


                </div>

            </div>

        </>

    );

}

export default IndividualSettings;