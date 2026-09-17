import React, { useState } from "react";
import IndividualSidebar from "../components/IndividualSidebar";
import TopNavbar from "../components/TopNavbar";
import axios from "axios";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { LABELS } from "../translations";

function DonateFood() {

    const [foodName, setFoodName] = useState("");
    const [category, setCategory] = useState("");
    const [quantity, setQuantity] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [pickupAddress, setPickupAddress] = useState("");
    const [contactNumber, setContactNumber] = useState("");
    const [description, setDescription] = useState("");

    const t = useTranslate();

    usePageTranslation(LABELS.DONATE_FOOD);


    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const token = localStorage.getItem("access");

            await axios.post(
                "http://127.0.0.1:8000/api/inventory/individual/donate/",
                {
                    product_name: foodName,
                    category: category,
                    quantity: quantity,
                    unit: "Kg",
                    expiry_date: expiryDate,
                    storage_type: "Room Temperature",
                    pickup_address: pickupAddress,
                    contact_number: contactNumber,
                    description: description
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert(`🎉 ${t("Donation Submitted Successfully!")}`);

            setFoodName("");
            setCategory("");
            setQuantity("");
            setExpiryDate("");
            setPickupAddress("");
            setContactNumber("");
            setDescription("");

        }

        catch (error) {

            console.log(error.response?.data);

            alert(t("Failed to submit donation."));

        }

    };


    return (
        <>

            <IndividualSidebar />

            <style>
                {`

                /* =========================================
                   DONATE FOOD PAGE
                ========================================= */

                .donate-page {
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


                /* =========================================
                   PAGE HEADER
                ========================================= */

                .donate-header {
                    margin-top: 18px;

                    margin-bottom: 22px;

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


                .donate-header-content {
                    display: flex;

                    align-items: center;

                    justify-content: space-between;

                    gap: 20px;
                }


                .donate-title-area {
                    display: flex;

                    align-items: center;

                    gap: 14px;
                }


                .donate-title-icon {
                    width: 52px;
                    height: 52px;

                    display: flex;

                    align-items: center;
                    justify-content: center;

                    border-radius: 15px;

                    background: rgba(255,255,255,0.75);

                    font-size: 1.55rem;

                    box-shadow:
                        0 5px 15px rgba(25,91,67,0.08);
                }


                .donate-title {
                    margin: 0;

                    color: #124d3c;

                    font-size: 1.85rem;

                    font-weight: 750;

                    letter-spacing: -0.03em;
                }


                .donate-subtitle {
                    margin: 5px 0 0;

                    color: #5c7b70;

                    font-size: 0.95rem;
                }


                .donate-badge {
                    padding: 9px 15px;

                    border-radius: 999px;

                    background: rgba(255,255,255,0.75);

                    color: #26765d;

                    font-size: 0.84rem;

                    font-weight: 700;

                    white-space: nowrap;
                }


                /* =========================================
                   FORM CARD
                ========================================= */

                .donate-card {
                    max-width: 1100px;

                    margin: 0 auto;

                    background: #ffffff;

                    border: 1px solid rgba(22,84,63,0.10);

                    border-radius: 20px;

                    box-shadow:
                        0 10px 30px rgba(22,84,63,0.07);

                    overflow: hidden;
                }


                .donate-card-header {
                    padding: 20px 26px;

                    border-bottom: 1px solid #e4efeb;

                    background: #fbfefd;
                }


                .donate-card-header h3 {
                    margin: 0;

                    color: #164c3d;

                    font-size: 1.15rem;

                    font-weight: 700;
                }


                .donate-card-header p {
                    margin: 5px 0 0;

                    color: #789087;

                    font-size: 0.88rem;
                }


                .donate-form {
                    padding: 26px;
                }


                /* =========================================
                   FORM GRID
                ========================================= */

                .donate-form-grid {
                    display: grid;

                    grid-template-columns:
                        repeat(2, minmax(0, 1fr));

                    gap: 20px 24px;
                }


                .donate-field {
                    display: flex;

                    flex-direction: column;
                }


                .donate-field.full-width {
                    grid-column: 1 / -1;
                }


                .donate-label {
                    margin-bottom: 7px;

                    color: #315c4e;

                    font-size: 0.88rem;

                    font-weight: 700;
                }


                .donate-input,
                .donate-textarea {
                    width: 100%;

                    padding: 11px 13px;

                    border: 1px solid #cfe1da;

                    border-radius: 10px;

                    background: #fbfefd;

                    color: #173c32;

                    font-size: 0.94rem;

                    outline: none;

                    transition:
                        border-color 0.2s ease,
                        box-shadow 0.2s ease,
                        background 0.2s ease;
                }


                .donate-input {
                    height: 46px;
                }


                .donate-textarea {
                    min-height: 105px;

                    resize: vertical;
                }


                .donate-input::placeholder,
                .donate-textarea::placeholder {
                    color: #9aada6;
                }


                .donate-input:focus,
                .donate-textarea:focus {
                    border-color: #29916f;

                    background: #ffffff;

                    box-shadow:
                        0 0 0 3px rgba(41,145,111,0.10);
                }


                /* =========================================
                   FORM FOOTER
                ========================================= */

                .donate-form-footer {
                    display: flex;

                    align-items: center;

                    justify-content: space-between;

                    gap: 20px;

                    margin-top: 26px;

                    padding-top: 22px;

                    border-top: 1px solid #e5efeb;
                }


                .donate-note {
                    margin: 0;

                    color: #789087;

                    font-size: 0.83rem;

                    line-height: 1.5;
                }


                .donate-submit {
                    min-width: 165px;

                    height: 46px;

                    padding: 0 22px;

                    border: none;

                    border-radius: 10px;

                    background:
                        linear-gradient(
                            135deg,
                            #21855f,
                            #176d4e
                        );

                    color: #ffffff;

                    font-size: 0.95rem;

                    font-weight: 700;

                    cursor: pointer;

                    box-shadow:
                        0 7px 16px rgba(25,112,78,0.18);

                    transition:
                        transform 0.2s ease,
                        box-shadow 0.2s ease,
                        background 0.2s ease;
                }


                .donate-submit:hover {
                    background:
                        linear-gradient(
                            135deg,
                            #27966d,
                            #1a7655
                        );

                    transform: translateY(-2px);

                    box-shadow:
                        0 10px 20px rgba(25,112,78,0.22);
                }


                .donate-submit:active {
                    transform: translateY(0);
                }


                /* =========================================
                   TABLET
                ========================================= */

                @media (max-width: 1000px) {

                    .donate-page {
                        padding: 24px 22px 40px;
                    }

                    .donate-header {
                        padding: 22px;
                    }

                    .donate-form {
                        padding: 22px;
                    }

                }


                /* =========================================
                   MOBILE
                ========================================= */

                @media (max-width: 768px) {

                    .donate-page {
                        margin-left: 0;

                        width: 100%;

                        padding:
                            80px
                            16px
                            30px;
                    }


                    .donate-header {
                        margin-top: 0;

                        padding: 20px;

                        border-radius: 17px;
                    }


                    .donate-header-content {
                        align-items: flex-start;

                        flex-direction: column;
                    }


                    .donate-title {
                        font-size: 1.55rem;
                    }


                    .donate-title-icon {
                        width: 46px;
                        height: 46px;

                        font-size: 1.3rem;
                    }


                    .donate-badge {
                        align-self: flex-start;
                    }


                    .donate-card {
                        border-radius: 17px;
                    }


                    .donate-form-grid {
                        grid-template-columns: 1fr;

                        gap: 18px;
                    }


                    .donate-field.full-width {
                        grid-column: auto;
                    }


                    .donate-form {
                        padding: 20px;
                    }


                    .donate-form-footer {
                        align-items: stretch;

                        flex-direction: column;
                    }


                    .donate-submit {
                        width: 100%;
                    }

                }


                /* =========================================
                   SMALL MOBILE
                ========================================= */

                @media (max-width: 480px) {

                    .donate-page {
                        padding-left: 12px;
                        padding-right: 12px;
                    }


                    .donate-header {
                        padding: 18px;
                    }


                    .donate-title {
                        font-size: 1.4rem;
                    }


                    .donate-subtitle {
                        font-size: 0.88rem;
                    }


                    .donate-card-header {
                        padding: 18px;
                    }


                    .donate-form {
                        padding: 18px;
                    }

                }

                `}
            </style>


            <div className="donate-page">

                <TopNavbar />


                {/* =====================================
                    PAGE HEADER
                ===================================== */}

                <section className="donate-header">

                    <div className="donate-header-content">

                        <div className="donate-title-area">

                            <div className="donate-title-icon">
                                🍱
                            </div>

                            <div>

                                <h1 className="donate-title">
                                    {t("Donate Food")}
                                </h1>

                                <p className="donate-subtitle">
                                    Share surplus food and help make a difference in your community.
                                </p>

                            </div>

                        </div>


                        <div className="donate-badge">
                            🤝 Make an Impact
                        </div>

                    </div>

                </section>


                {/* =====================================
                    DONATION FORM
                ===================================== */}

                <section className="donate-card">

                    <div className="donate-card-header">

                        <h3>
                            🍽️ Donation Details
                        </h3>

                        <p>
                            Enter the details of the food you would like to donate.
                        </p>

                    </div>


                    <form
                        className="donate-form"
                        onSubmit={handleSubmit}
                    >

                        <div className="donate-form-grid">


                            {/* Food Name */}

                            <div className="donate-field">

                                <label className="donate-label">
                                    {t("Food Name")}
                                </label>

                                <input
                                    type="text"
                                    className="donate-input"
                                    placeholder={t("e.g. Fresh vegetables")}
                                    value={foodName}
                                    onChange={(e) =>
                                        setFoodName(e.target.value)
                                    }
                                    required
                                />

                            </div>


                            {/* Category */}

                            <div className="donate-field">

                                <label className="donate-label">
                                    {t("Category")}
                                </label>

                                <input
                                    type="text"
                                    className="donate-input"
                                    placeholder={t("e.g. Vegetables")}
                                    value={category}
                                    onChange={(e) =>
                                        setCategory(e.target.value)
                                    }
                                    required
                                />

                            </div>


                            {/* Quantity */}

                            <div className="donate-field">

                                <label className="donate-label">
                                    {t("Quantity")}
                                </label>

                                <input
                                    type="number"
                                    min="1"
                                    className="donate-input"
                                    placeholder={t("Enter quantity in Kg")}
                                    value={quantity}
                                    onChange={(e) =>
                                        setQuantity(e.target.value)
                                    }
                                    required
                                />

                            </div>


                            {/* Expiry Date */}

                            <div className="donate-field">

                                <label className="donate-label">
                                    {t("Expiry Date")}
                                </label>

                                <input
                                    type="date"
                                    className="donate-input"
                                    value={expiryDate}
                                    onChange={(e) =>
                                        setExpiryDate(e.target.value)
                                    }
                                    required
                                />

                            </div>


                            {/* Pickup Address */}

                            <div className="donate-field full-width">

                                <label className="donate-label">
                                    {t("Pickup Address")}
                                </label>

                                <textarea
                                    className="donate-textarea"
                                    placeholder={t("Enter the complete pickup address")}
                                    rows="3"
                                    value={pickupAddress}
                                    onChange={(e) =>
                                        setPickupAddress(e.target.value)
                                    }
                                    required
                                />

                            </div>


                            {/* Contact Number */}

                            <div className="donate-field">

                                <label className="donate-label">
                                    {t("Contact Number")}
                                </label>

                                <input
                                    type="text"
                                    className="donate-input"
                                    placeholder={t("Enter contact number")}
                                    value={contactNumber}
                                    onChange={(e) =>
                                        setContactNumber(e.target.value)
                                    }
                                    required
                                />

                            </div>


                            {/* Description */}

                            <div className="donate-field">

                                <label className="donate-label">
                                    {t("Description")}
                                </label>

                                <textarea
                                    className="donate-textarea"
                                    placeholder={t("Add any additional information")}
                                    rows="3"
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                />

                            </div>

                        </div>


                        {/* =================================
                            SUBMIT
                        ================================= */}

                        <div className="donate-form-footer">

                            <p className="donate-note">
                                💚 {t("Your donation can help reduce food waste and support someone in need.")}
                            </p>

                            <button
                                type="submit"
                                className="donate-submit"
                            >
                                🤝 {t("Donate Food")}
                            </button>

                        </div>

                    </form>

                </section>

            </div>

        </>
    );
}

export default DonateFood;