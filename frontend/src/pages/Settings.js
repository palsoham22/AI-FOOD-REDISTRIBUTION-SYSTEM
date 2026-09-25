import { useState, useEffect } from "react";
import BusinessLayout from "../components/BusinessLayout";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { LABELS } from "../translations";
import "../styles/Settings.css";

function Settings() {

    const t = useTranslate();

    usePageTranslation(LABELS.SETTINGS);

    const [username, setUsername] = useState("");

    const [ownerName, setOwnerName] = useState("");

    const [businessName, setBusinessName] = useState("");

    const [businessType, setBusinessType] = useState("");

    useEffect(() => {

        setUsername(localStorage.getItem("username"));

        setOwnerName(localStorage.getItem("owner_name"));

        setBusinessName(localStorage.getItem("business_name"));

        setBusinessType(localStorage.getItem("business_type"));

    }, []);

    const saveChanges = () => {

        localStorage.setItem("owner_name", ownerName);

        localStorage.setItem("business_name", businessName);

        localStorage.setItem("business_type", businessType);

        alert(t("Profile Updated Successfully ✅"));

    };

    return (
        <BusinessLayout>
            <div className="settings-page-content">

<div className="settings-header">

<div>

<h2 className="settings-title">

⚙ {t("Business Settings")}

</h2>

<p className="settings-subtitle">
    {t("Manage your business profile and account information.")}
</p>

</div>

</div>

<div className="settings-card">

<div className="profile-avatar">

{ownerName ? ownerName.charAt(0).toUpperCase() : "B"}

</div>

<div className="text-center mb-4">

<h4 className="fw-bold">

{ownerName}

</h4>

<p className="text-muted">

🏪 {businessName}

</p>

</div>

<div className="row">

<div className="col-md-6">

<div className="mb-4">

<label>

{t("Username")}

</label>

<input

className="form-control"

value={username}

readOnly

/>

</div>

</div>

<div className="col-md-6">

<div className="mb-4">

<label>

{t("Owner Name")}

</label>

<input

className="form-control"

value={ownerName}

onChange={(e)=>setOwnerName(e.target.value)}

/>

</div>

</div>

<div className="col-md-6">

<div className="mb-4">

<label>

{t("Business Name")}

</label>

<input

className="form-control"

value={businessName}

onChange={(e)=>setBusinessName(e.target.value)}

/>

</div>

</div>

<div className="col-md-6">

<div className="mb-4">

<label>

{t("Business Type")}

</label>

<input

className="form-control"

value={businessType}

onChange={(e)=>setBusinessType(e.target.value)}

/>

</div>

</div>

</div>

<hr className="my-4"/>

<div className="row text-center mb-4">

<div className="col-md-4">

<h5 className="text-success">

📦

</h5>

<h6>

{t("Inventory")}

</h6>

<p className="text-muted">
    {t("Manage products efficiently.")}
</p>

</div>

<div className="col-md-4">

<h5 className="text-primary">

🎁

</h5>

<h6>

{t("Donations")}

</h6>

<p className="text-muted">
    {t("Track donated products.")}
</p>

</div>

<div className="col-md-4">

<h5 className="text-warning">

📊

</h5>

<h6>

{t("Analytics")}

</h6>

<p className="text-muted">
    {t("Monitor business insights.")}
</p>

</div>

</div>

<button

className="btn btn-success save-btn"

onClick={saveChanges}

>

💾 {t("Save Changes")}

</button>

</div>
            </div>
        </BusinessLayout>
    );
}

export default Settings;