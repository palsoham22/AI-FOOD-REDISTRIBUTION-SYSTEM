import DeliverySidebar from "../components/DeliverySidebar";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { LABELS } from "../translations";

function DeliverySettings() {

    const t = useTranslate();

    usePageTranslation(LABELS.DELIVERY_SETTINGS);

    return (

        <>

            <DeliverySidebar />

            <style>
                {`

                /* =========================================
                   DELIVERY SETTINGS PAGE
                   Pastel Blue Theme
                ========================================= */

                .delivery-settings-page {

                    margin-left: 260px;

                    min-height: 100vh;

                    padding: 25px;

                    background:
                        linear-gradient(
                            135deg,
                            #eef4ff 0%,
                            #f5f8ff 55%,
                            #edf3ff 100%
                        );

                    color: #344b70;

                    transition:
                        margin-left 0.3s ease;
                }


                /* =========================================
                   HEADER
                ========================================= */

                .delivery-settings-header {

                    display: flex;

                    justify-content: space-between;

                    align-items: center;

                    flex-wrap: wrap;

                    gap: 20px;

                    margin-bottom: 25px;
                }


                .delivery-settings-header h2 {

                    margin: 0;

                    font-size: 34px;

                    font-weight: 700;

                    color: #2f55a4;

                    letter-spacing: -0.5px;
                }


                .delivery-settings-header p {

                    color: #647895;

                    margin-top: 6px;

                    margin-bottom: 0;

                    font-size: 15px;
                }


                /* =========================================
                   DRIVER SETTINGS BADGE
                ========================================= */

                .driver-settings-badge {

                    background:
                        linear-gradient(
                            135deg,
                            #6d8fe8,
                            #5278df
                        );

                    color: #ffffff;

                    padding: 10px 22px;

                    border-radius: 30px;

                    font-weight: 700;

                    box-shadow:
                        0 6px 16px
                        rgba(82,120,223,0.18);

                    white-space: nowrap;
                }


                /* =========================================
                   MAIN SETTINGS CARD
                ========================================= */

                .delivery-settings-card {

                    max-width: 1000px;

                    background: #ffffff;

                    border: 1px solid #dce6f7;

                    border-radius: 22px;

                    box-shadow:
                        0 10px 25px
                        rgba(54,83,130,0.08);

                    overflow: hidden;
                }


                .delivery-settings-card-body {

                    padding: 30px;
                }


                /* =========================================
                   SETTINGS GROUP
                ========================================= */

                .delivery-setting-group {

                    margin-bottom: 24px;
                }


                .delivery-setting-label {

                    display: block;

                    margin-bottom: 8px;

                    color: #3156b3;

                    font-weight: 700;

                    font-size: 15px;
                }


                /* =========================================
                   SELECT BOX
                ========================================= */

                .delivery-setting-select {

                    width: 100%;

                    min-height: 48px;

                    padding: 12px 14px;

                    border-radius: 12px;

                    border: 2px solid #cbd8ed;

                    background-color: #fbfdff;

                    color: #344b70;

                    font-size: 15px;

                    outline: none;

                    transition:
                        border-color 0.2s ease,
                        box-shadow 0.2s ease,
                        background-color 0.2s ease;
                }


                .delivery-setting-select:hover {

                    border-color: #b9c9e6;

                    background-color: #ffffff;
                }


                .delivery-setting-select:focus {

                    border-color: #7d9dea;

                    background-color: #ffffff;

                    box-shadow:
                        0 0 0 3px
                        rgba(109,143,232,0.14);
                }


                /* =========================================
                   SAVE BUTTON
                ========================================= */

                .delivery-save-btn {

                    padding: 12px 30px;

                    border: 1px solid #5d81df;

                    border-radius: 12px;

                    font-weight: 700;

                    color: #ffffff;

                    background:
                        linear-gradient(
                            135deg,
                            #6d8fe8,
                            #5278df
                        );

                    box-shadow:
                        0 6px 14px
                        rgba(82,120,223,0.16);

                    cursor: pointer;

                    transition:
                        transform 0.2s ease,
                        box-shadow 0.2s ease,
                        background 0.2s ease;
                }


                .delivery-save-btn:hover {

                    background:
                        linear-gradient(
                            135deg,
                            #5d81df,
                            #476dcc
                        );

                    transform: translateY(-2px);

                    box-shadow:
                        0 9px 18px
                        rgba(82,120,223,0.22);
                }


                .delivery-save-btn:active {

                    transform: translateY(0);
                }


                /* =========================================
                   TABLET
                ========================================= */

                @media (max-width: 992px) {

                    .delivery-settings-page {

                        margin-left: 0;

                        padding:
                            90px
                            16px
                            24px;
                    }


                    .delivery-settings-header h2 {

                        font-size: 28px;
                    }


                    .delivery-settings-card {

                        max-width: 100%;

                    }

                }


                /* =========================================
                   MOBILE
                ========================================= */

                @media (max-width: 576px) {

                    .delivery-settings-page {

                        padding:
                            82px
                            12px
                            20px;
                    }


                    .delivery-settings-header {

                        align-items: flex-start;

                        flex-direction: column;

                        gap: 14px;
                    }


                    .delivery-settings-header h2 {

                        font-size: 25px;
                    }


                    .delivery-settings-header p {

                        font-size: 14px;

                        line-height: 1.5;
                    }


                    .driver-settings-badge {

                        padding: 9px 16px;

                        font-size: 14px;
                    }


                    .delivery-settings-card-body {

                        padding: 20px;
                    }


                    .delivery-setting-label {

                        font-size: 14px;
                    }


                    .delivery-setting-select {

                        min-height: 46px;

                        font-size: 14px;
                    }


                    .delivery-save-btn {

                        width: 100%;

                        padding: 12px 20px;
                    }

                }

                `}
            </style>


            <div className="delivery-settings-page">


                {/* =========================================
                    HEADER
                ========================================= */}

                <div className="delivery-settings-header">

                    <div>

                        <h2>
                            ⚙ {t("Delivery Settings")}
                        </h2>


                        <p>
                            Manage your delivery preferences and application settings.
                        </p>

                    </div>


                    <div className="driver-settings-badge">

                        🚚 Driver Settings

                    </div>

                </div>


                {/* =========================================
                    SETTINGS CARD
                ========================================= */}

                <div className="delivery-settings-card">

                    <div className="delivery-settings-card-body">


                        {/* =================================
                            NOTIFICATION
                        ================================= */}

                        <div className="delivery-setting-group">

                            <label className="delivery-setting-label">

                                🔔 {t("Notification Preference")}

                            </label>


                            <select
                                className="delivery-setting-select"
                            >

                                <option>
                                    {t("Enabled")}
                                </option>

                                <option>
                                    {t("Disabled")}
                                </option>

                            </select>

                        </div>


                        {/* =================================
                            LANGUAGE
                        ================================= */}

                        <div className="delivery-setting-group">

                            <label className="delivery-setting-label">

                                🌐 {t("Language")}

                            </label>


                            <select
                                className="delivery-setting-select"
                            >

                                <option>
                                    {t("English")}
                                </option>

                                <option>
                                    {t("Hindi")}
                                </option>

                            </select>

                        </div>


                        {/* =================================
                            THEME
                        ================================= */}

                        <div className="delivery-setting-group">

                            <label className="delivery-setting-label">

                                🎨 {t("Theme")}

                            </label>


                            <select
                                className="delivery-setting-select"
                            >

                                <option>
                                    {t("Light")}
                                </option>

                                <option>
                                    {t("Dark")}
                                </option>

                            </select>

                        </div>


                        {/* =================================
                            SAVE SETTINGS
                        ================================= */}

                        <button
                            className="delivery-save-btn"
                        >

                            💾 {t("Save Settings")}

                        </button>


                    </div>

                </div>


            </div>

        </>

    );
}

export default DeliverySettings;