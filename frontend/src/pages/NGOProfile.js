import NGOSidebar from "../components/NGOSidebar";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { LABELS } from "../translations";

function NGOProfile() {

    const t = useTranslate();

    usePageTranslation(LABELS.NGO_PROFILE);

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
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        marginBottom: "25px",
        gap: "20px"
    }}
>

<div>

<h2
    style={{
        fontSize: "34px",
        fontWeight: "700",
        color: "#3b5bdb"
    }}
>

🏢 {t("NGO Profile")}

</h2>

<p
    style={{
        color: "#6c757d",
        marginTop: "6px"
    }}
>

Manage your NGO profile and organization details.

</p>

</div>

<div
    style={{
        background: "linear-gradient(135deg,#3b82f6,#7c3aed)",
        color: "white",
        padding: "10px 22px",
        borderRadius: "30px",
        fontWeight: "700"
    }}
>

Verified NGO ✅

</div>

</div>

                <div
    style={{
        background: "#fff",
        borderRadius: "22px",
        boxShadow: "0 10px 25px rgba(0,0,0,.08)",
        overflow: "hidden"
    }}
>

                    <div
    style={{
        padding: "35px"
    }}
>

                        <h3
    style={{
        color: "#3b5bdb",
        fontWeight: "700",
        marginBottom: "10px"
    }}
>

                            Helping Hands NGO

                        </h3>

                        <hr
    style={{
        margin: "20px 0",
        opacity: ".15"
    }}
/>

                        <p style={{marginBottom:"16px"}}>

<strong style={{color:"#3b5bdb"}}>

{t("Registration No:")}

</strong>

{" "}NGO-2026-001

</p>
<p style={{marginBottom:"16px"}}>

<strong style={{color:"#3b5bdb"}}>

{t("Address:")}

</strong>

{" "}Howrah, West Bengal

</p>
<p style={{marginBottom:"16px"}}>

<strong style={{color:"#3b5bdb"}}>

{t("Service Area:")}

</strong>

{" "}Howrah, West Bengal

</p>
<p style={{marginBottom:"16px"}}>

<strong style={{color:"#3b5bdb"}}>

{t("Contact Person:")}

</strong>

{" "}Rahul Pal

</p>
<p style={{marginBottom:"16px"}}>

<strong style={{color:"#3b5bdb"}}>

{t("Phone:")}

</strong>

{" "}+91 9876543210

</p>
<p style={{marginBottom:"16px"}}>

<strong style={{color:"#3b5bdb"}}>

{t("Email:")}

</strong>

{" "}ngo@foodbridge.ai

</p>
<p style={{marginBottom:"16px"}}>

<strong style={{color:"#3b5bdb"}}>

{t("Operating Hours:")}

</strong>

{" "}9:00 AM - 6:00 PM

</p>

                        <button
    className="btn btn-primary"
    style={{
        borderRadius: "14px",
        padding: "12px 28px",
        fontWeight: "700",
        background: "linear-gradient(135deg,#3b82f6,#7c3aed)",
        border: "none",
        marginTop: "10px"
    }}
>

                            ✏ {t("Edit Profile")}

                        </button>

                    </div>

                </div>

            </div>

        </>

    );

}

export default NGOProfile;