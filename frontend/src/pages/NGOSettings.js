import NGOSidebar from "../components/NGOSidebar";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { LABELS } from "../translations";

function NGOSettings() {

    const t = useTranslate();

    usePageTranslation(LABELS.NGO_SETTINGS);

    return (

        <>

            <NGOSidebar />

            <div
    style={{
        marginLeft: "260px",
        minHeight: "100vh",
        padding: "25px",
        background: "linear-gradient(135deg,#eef4ff,#f7f2ff)"
    }}
>

                <div
    style={{
        display:"flex",
        justifyContent:"space-between",
        alignItems:"center",
        flexWrap:"wrap",
        marginBottom:"25px",
        gap:"20px"
    }}
>

<div>

<h2
    style={{
        fontSize:"34px",
        fontWeight:"700",
        color:"#3b5bdb"
    }}
>

⚙ {t("NGO Settings")}

</h2>

<p
    style={{
        color:"#6c757d",
        marginTop:"6px"
    }}
>

Manage your NGO preferences and application settings.

</p>

</div>

<div
    style={{
        background:"linear-gradient(135deg,#3b82f6,#7c3aed)",
        color:"white",
        padding:"10px 22px",
        borderRadius:"30px",
        fontWeight:"700"
    }}
>

Settings

</div>

</div>

                <div
    style={{
        background:"#fff",
        borderRadius:"22px",
        boxShadow:"0 10px 25px rgba(0,0,0,.08)",
        overflow:"hidden"
    }}
>

                    <div
    style={{
        padding:"35px"
    }}
>

                        <div className="mb-3">

                            <label
    className="form-label"
    style={{
        color:"#3b5bdb",
        fontWeight:"600"
    }}
>
    {t("Notifications")}

</label>

                            <select className="form-select">

                                <option>{t("Enabled")}</option>

<option>{t("Disabled")}</option>

                            </select>

                        </div>

                        <div className="mb-3">

                            <label
    className="form-label"
    style={{
        color:"#3b5bdb",
        fontWeight:"600"
    }}
>

    {t("Language")}

</label>

                            <select className="form-select">

                                <option>{t("English")}</option>

<option>{t("Hindi")}</option>

                            </select>

                        </div>

                        <div className="mb-3">

                            <label
    className="form-label"
    style={{
        color:"#3b5bdb",
        fontWeight:"600"
    }}
>

    {t("Theme")}

</label>

                            <select className="form-select">

                                <option>{t("Light")}</option>

<option>{t("Dark")}</option>

                            </select>

                        </div>

                        <div className="mb-3">

                            <label
    className="form-label"
    style={{
        color:"#3b5bdb",
        fontWeight:"600"
    }}
>

    {t("Email Alerts")}

</label>

                            <select
    className="form-select"
    style={{
        borderRadius:"12px",
        padding:"12px",
        border:"2px solid #dbe4ff",
        boxShadow:"none"
    }}
>

                                <option>{t("Enabled")}</option>

<option>{t("Disabled")}</option>

                            </select>

                        </div>

                        <button
    className="btn btn-primary"
    style={{
        marginTop:"15px",
        padding:"12px 30px",
        borderRadius:"14px",
        background:"linear-gradient(135deg,#3b82f6,#7c3aed)",
        border:"none",
        fontWeight:"700"
    }}
>

                            💾 {t("Save Settings")}

                        </button>

                    </div>

                </div>

            </div>

        </>

    );

}

export default NGOSettings;