import DeliverySidebar from "../components/DeliverySidebar";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { LABELS } from "../translations";

function DeliveryProfile() {

    const t = useTranslate();

    usePageTranslation(LABELS.DELIVERY_PROFILE);

    return (

        <>

            <DeliverySidebar />

            <div
                className="delivery-profile-page"
                style={{
                    marginLeft: "260px",
                    minHeight: "100vh",
                    padding: "25px",

                    background:
                        "linear-gradient(135deg,#eef4ff 0%,#f5f8ff 55%,#edf3ff 100%)",

                    color: "#344b70"
                }}
            >

                {/* =========================================
                    HEADER
                ========================================= */}

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "20px",
                        marginBottom: "25px",

                        paddingBottom: "18px",

                        borderBottom: "1px solid #d7e2f5"
                    }}
                >

                    <div>

                        <h2
                            style={{
                                fontSize: "34px",
                                fontWeight: "700",
                                color: "#2f55a4",
                                margin: 0,
                                letterSpacing: "-0.5px"
                            }}
                        >
                            👤 {t("Delivery Partner Profile")}
                        </h2>


                        <p
                            style={{
                                color: "#647895",
                                marginTop: "7px",
                                marginBottom: 0,
                                fontSize: "15px"
                            }}
                        >
                            Manage your delivery profile and vehicle information.
                        </p>

                    </div>


                    {/* Active Driver */}

                    <div
                        style={{
                            background:
                                "linear-gradient(135deg,#6d8fe8,#5278df)",

                            color: "white",

                            padding: "10px 22px",

                            borderRadius: "30px",

                            fontWeight: "700",

                            boxShadow:
                                "0 6px 16px rgba(82,120,223,.18)"
                        }}
                    >
                        🚚 Active Driver
                    </div>

                </div>


                {/* =========================================
                    PROFILE CARD
                ========================================= */}

                <div
                    style={{
                        background: "#ffffff",

                        border: "1px solid #dce6f7",

                        borderRadius: "22px",

                        boxShadow:
                            "0 10px 25px rgba(54,83,130,.08)",

                        overflow: "hidden",

                        maxWidth: "1000px"
                    }}
                >

                    <div
                        style={{
                            padding: "30px"
                        }}
                    >

                        {/* Username */}

                        <h3
                            style={{
                                color: "#2f55a4",
                                fontWeight: "700",
                                marginBottom: "10px",
                                fontSize: "24px"
                            }}
                        >
                            {localStorage.getItem("username")}
                        </h3>


                        <hr
                            style={{
                                border: 0,
                                borderTop: "1px solid #dce6f7",
                                opacity: 1,
                                margin: "20px 0"
                            }}
                        />


                        {/* =================================
                            EMAIL
                        ================================= */}

                        <p
                            style={{
                                marginBottom: "16px",
                                color: "#405674",
                                fontSize: "15px"
                            }}
                        >

                            <strong
                                style={{
                                    color: "#3156b3"
                                }}
                            >
                                📧 {t("Email:")}
                            </strong>

                            {" "}delivery@foodbridge.ai

                        </p>


                        {/* =================================
                            PHONE
                        ================================= */}

                        <p
                            style={{
                                marginBottom: "16px",
                                color: "#405674",
                                fontSize: "15px"
                            }}
                        >

                            <strong
                                style={{
                                    color: "#3156b3"
                                }}
                            >
                                📞 {t("Phone:")}
                            </strong>

                            {" "}+91 9876543210

                        </p>


                        {/* =================================
                            VEHICLE NUMBER
                        ================================= */}

                        <p
                            style={{
                                marginBottom: "16px",
                                color: "#405674",
                                fontSize: "15px"
                            }}
                        >

                            <strong
                                style={{
                                    color: "#3156b3"
                                }}
                            >
                                🚚 {t("Vehicle Number:")}
                            </strong>

                            {" "}WB12AB1234

                        </p>


                        {/* =================================
                            LICENSE NUMBER
                        ================================= */}

                        <p
                            style={{
                                marginBottom: "16px",
                                color: "#405674",
                                fontSize: "15px"
                            }}
                        >

                            <strong
                                style={{
                                    color: "#3156b3"
                                }}
                            >
                                🪪 {t("License Number:")}
                            </strong>

                            {" "}DL-123456789

                        </p>


                        {/* =================================
                            EXPERIENCE
                        ================================= */}

                        <p
                            style={{
                                marginBottom: "16px",
                                color: "#405674",
                                fontSize: "15px"
                            }}
                        >

                            <strong
                                style={{
                                    color: "#3156b3"
                                }}
                            >
                                ⭐ {t("Experience:")}
                            </strong>

                            {" "}3 {t("Years")}

                        </p>


                        {/* =================================
STATUS
================================= */}

<p
    style={{
        marginBottom: "20px",
        color: "#405674",
        fontSize: "15px"
    }}
>

    <strong
        style={{
            color: "#3156B3"
        }}
    >
        📍 {t("Status:")}
    </strong>

    <span
        className="badge rounded-pill ms-2 px-3 py-2"
        style={{
            backgroundColor: "#DCE7FF",
            color: "#3156B3",
            border: "1px solid #AFC6F5",
            fontWeight: "700"
        }}
    >
        {t("Available")}
    </span>

</p>


                        {/* =================================
                            EDIT PROFILE
                        ================================= */}

                        <button
                            className="btn"
                            style={{
                                padding: "12px 28px",

                                border: "1px solid #5d81df",

                                borderRadius: "12px",

                                fontWeight: "700",

                                color: "#ffffff",

                                background:
                                    "linear-gradient(135deg,#6d8fe8,#5278df)",

                                boxShadow:
                                    "0 6px 14px rgba(82,120,223,.16)",

                                cursor: "pointer"
                            }}
                        >
                            ✏ {t("Edit Profile")}
                        </button>

                    </div>

                </div>


                {/* =========================================
                    RESPONSIVE STYLES
                ========================================= */}

                <style>
                    {`

                    @media (max-width: 992px) {

                        .delivery-profile-page {
                            margin-left: 0 !important;
                            padding: 90px 16px 24px !important;
                        }

                    }

                    @media (max-width: 576px) {

                        .delivery-profile-page {
                            padding: 82px 12px 20px !important;
                        }

                    }

                    `}
                </style>

            </div>

        </>

    );

}

export default DeliveryProfile;