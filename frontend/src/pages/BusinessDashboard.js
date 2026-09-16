import DashboardCard from "../components/DashboardCard";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import TopNavbar from "../components/TopNavbar";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { LABELS } from "../translations";
import { buildDynamicLabels } from "../utils/buildDynamicLabels";
import { useTranslationContext } from "../context/TranslationContext";
import { formatLocalizedDate } from "../utils/formatDate";
import { formatLocalizedNumber } from "../utils/formatNumber";
import "../styles/BusinessDashboard.css";


function BusinessDashboard() {

  const navigate = useNavigate();

  const t = useTranslate();

  const [products, setProducts] = useState([]);

  const dynamicLabels = useMemo(() =>

    buildDynamicLabels(

        LABELS.BUSINESS_DASHBOARD,

        products,

        [

            "product_name",

            "category",

            "unit",

            "status"

        ]

    ),

    [products]

);

usePageTranslation(dynamicLabels);

  const { language } = useTranslationContext();

  const loadProducts = () => {

    const token = localStorage.getItem("access");

    axios.get(

    "http://127.0.0.1:8000/api/inventory/list/",

    {

        headers: {

            Authorization: `Bearer ${token}`

        }

    }

    )
        .then((response) => {

            setProducts(response.data);

        })
        .catch((error) => {

            console.log(error);

        });

    };

    useEffect(() => {

    loadProducts();

    }, []);

    const username = localStorage.getItem("username");

    const ownerName = localStorage.getItem("owner_name");

    const businessName = localStorage.getItem("business_name");

    const businessType = localStorage.getItem("business_type");


    const today = new Date();

    const nearExpiry = products.filter((product) => {

        const expiry = new Date(product.expiry_date);

        const difference = Math.ceil(
            (expiry - today) / (1000 * 60 * 60 * 24)
        );

        return difference >= 0 && difference <= 5;

    });

    const criticalProducts = products.filter((product) => {

    if (product.status !== "Available") {

        return false;

    }

    const expiry = new Date(product.expiry_date);

    const daysLeft = Math.ceil(

        (expiry - today) / (1000 * 60 * 60 * 24)

    );

    return daysLeft >= 0 && daysLeft <= 2;

});

    const getExpiryStatus = (expiryDate) => {

    const expiry = new Date(expiryDate);

    const daysLeft = Math.ceil(
        (expiry - today) / (1000 * 60 * 60 * 24)
    );

    if (daysLeft < 0) {

        return {
            text: "Expired",
            color: "danger"
        };

    }

    if (daysLeft <= 2) {

        return {
            text: "Critical",
            color: "danger"
        };

    }

    if (daysLeft <= 5) {

        return {
            text: "Warning",
            color: "warning"
        };

    }

    return {

        text: "Safe",
        color: "success"

    };

};

const deleteProduct = async(id)=>{

    if(!window.confirm(t("Delete this product?"))){

        return;

    }

    const token = localStorage.getItem("access");

await axios.delete(

    `http://127.0.0.1:8000/api/inventory/delete/${id}/`,

    {

        headers: {

            Authorization: `Bearer ${token}`

        }

    }

);

    setProducts(

        products.filter((item)=>item.id!==id)

    );

};

const donateProduct = async (id) => {

    if (!window.confirm(t("Donate this product?"))) {
        return;
    }

    const token = localStorage.getItem("access");

    try {

        await axios.post(

            `http://127.0.0.1:8000/api/inventory/donate/${id}/`,

            {},

            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }

        );

        alert(t("Product Donated Successfully 🎉"));

        loadProducts();

    }

    catch (error) {

        console.log(error);

        alert(t("Donation Failed"));

    }

};

const uploadCSV = async (e) => {

    const file = e.target.files[0];

    if (!file) return;

    const token = localStorage.getItem("access");

    const formData = new FormData();

    formData.append("file", file);

    try {

        await axios.post(

            "http://127.0.0.1:8000/api/inventory/upload-csv/",

            formData,

            {

                headers: {

                    Authorization: `Bearer ${token}`,

                    "Content-Type": "multipart/form-data"

                }

            }

        );

        alert(t("CSV Uploaded Successfully 🎉"));

        loadProducts();

    }

    catch (error) {

        console.log(error.response?.data);

        alert(t("CSV Upload Failed"));

    }

};

const importPOSProducts = async () => {

    try {

        const token = localStorage.getItem("access");

        await axios.post(
    "http://127.0.0.1:8000/api/pos/import/",
    {},
    {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }
);

alert(t("POS Inventory Synced Successfully 🎉"));

navigate("/inventory");

    }

    catch (err) {

        console.log(err);

        alert(t("POS Import Failed"));

    }

};


    return (
            <>
            <Sidebar />

            <div className="fb-dashboard">
            <div
    className="container fb-page-shell"
>
    <TopNavbar />

            <div className="card fb-welcome-card mb-4">

    <div className="card-body">

        <span className="fb-welcome-eyebrow">
            🌱 {t("AI Food Redistribution Dashboard")}
        </span>

        <h2>

            🏪 {businessName}

        </h2>

        <div className="fb-welcome-meta">

            <span className="fb-welcome-meta-item">
                👤 {t("Owner")} : <b>{ownerName}</b>
            </span>

            <span className="fb-welcome-meta-item">
                🏬 {t("Business Type")} : <b>{businessType}</b>
            </span>

        </div>

        <hr />

        <p>

    {t("Welcome")} <b>{username}</b> 👋

</p>

    </div>

</div>

{
criticalProducts.length > 0 ?

<div className="fb-alert fb-alert-warning shadow-sm mb-4">

    <div className="fb-alert-body">

        <span className="fb-alert-icon">⚠️</span>

        <div>
            <h5>
    {t("Expiry Alert")}
</h5>

            <p>
    <b>{criticalProducts.length}</b> {t("product(s) will expire within the next")} <b>2 {t("days")}</b>.
</p>
        </div>

    </div>

    <button

        className="btn btn-warning"

        onClick={()=>navigate("/inventory")}

    >

        {t("Review Inventory")}

    </button>

</div>

:

<div className="fb-alert fb-alert-success shadow-sm mb-4">

    <div className="fb-alert-body">

        <span className="fb-alert-icon">✅</span>

        <div>
            <h5>
{t("Inventory Healthy")}
</h5>

            <p>
{t("No products require immediate attention.")}
</p>
        </div>

    </div>

</div>

}

            <div className="row mt-4 mb-4">

    <div className="col-lg-3 col-md-6 mb-3">
        <div className="fb-kpi-tile fb-kpi-tile--green">
            <span className="fb-kpi-icon">📦</span>
            <DashboardCard
                title={t("Products")}
                value={products.length}
                color="green"
            />
        </div>
    </div>

    <div className="col-lg-3 col-md-6 mb-3">
        <div className="fb-kpi-tile fb-kpi-tile--orange">
            <span className="fb-kpi-icon">⏳</span>
            <DashboardCard
                title={t("Near Expiry")}
                value={nearExpiry.length}
                color="orange"
            />
        </div>
    </div>

    <div className="col-lg-3 col-md-6 mb-3">
        <div className="fb-kpi-tile fb-kpi-tile--blue">
            <span className="fb-kpi-icon">🤝</span>
            <DashboardCard
                title={t("Donations")}
                value={
                    products.filter(
                        (item) => item.status === "Donated"
                    ).length
                }
                color="blue"
            />
        </div>
    </div>

    <div className="col-lg-3 col-md-6 mb-3">
        <div className="fb-kpi-tile fb-kpi-tile--purple">
            <span className="fb-kpi-icon">🌍</span>
            <DashboardCard
                title={t("Food Saved")}
                value="0 Kg"
                color="purple"
            />
        </div>
    </div>

</div>

            <div className="fb-toolbar d-flex flex-wrap gap-3 mt-4 mb-4">

    <button
        className="btn btn-success"
        onClick={() => navigate("/add-product")}
    >
        ➕ {t("Add Product")}
    </button>

    <>
<input
    type="file"
    id="csvFile"
    accept=".csv"
    style={{ display: "none" }}
    onChange={uploadCSV}
/>

<button
    className="btn btn-primary"
    onClick={() => document.getElementById("csvFile").click()}
>
    📄 {t("Upload CSV")}
</button>

<button
    className="btn btn-dark"
    onClick={() => navigate("/barcode-scanner")}
>
    📷 {t("Scan Barcode")}
</button>

<button

    className="btn btn-primary ms-2"

    onClick={importPOSProducts}

>

    📥 {t("Import From POS")}

</button>

</>

</div>

            <div className="fb-table-card mt-5 mb-5">

    <h3>
        🧾 {t("Recent Products")}
    </h3>

    <div className="table-responsive">

        <table className="table fb-table table-hover align-middle">

        <thead>

    <tr>

        <th>{t("Name")}</th>

        <th>{t("Category")}</th>

        <th>{t("Quantity")}</th>

        <th>{t("Expiry")}</th>

        <th>{t("Status")}</th>

        <th>{t("Action")}</th>

    </tr>

</thead>

        <tbody>

{
products.length === 0 ?

<tr>

<td colSpan="6" className="text-center text-muted">

{t("No Products Yet")}

</td>

</tr>

:

products.map((product)=>(

<tr key={product.id}>

<td>{t(product.product_name)}</td>

<td>{t(product.category)}</td>

<td className="fb-qty">{formatLocalizedNumber(product.quantity, language)} {t(product.unit)}</td>

<td className="fb-date">{product.expiry_date}</td>

<td>

<span
    className={`badge ${
        product.status === "Available"
            ? "bg-success"
            : product.status === "Donated"
            ? "bg-primary"
            : "bg-secondary"
    }`}
>
    {t(product.status)}
</span>

<br /><br />

{
product.status === "Available"

?

<span
className={`badge bg-${getExpiryStatus(product.expiry_date).color}`}
>
    {formatLocalizedDate(product.expiry_date, language)}
</span>

:

<span className="text-muted">
    -
</span>

}

</td>

<td>

{
product.status === "Available"

?

<>

<button
className="btn btn-warning btn-sm me-2"
onClick={() => navigate(`/edit-product/${product.id}`)}
>

{t("Edit")}

</button>

<button
className="btn btn-danger btn-sm me-2"
onClick={()=>deleteProduct(product.id)}
>

{t("Delete")}

</button>

<button
className="btn btn-success btn-sm"
onClick={()=>donateProduct(product.id)}
>

{t("Donate")}

</button>

</>

:

product.status==="Donated"

?

<button
className="btn btn-primary btn-sm"
disabled
>

📦 {t("Donated")}

</button>

:

<button
className="btn btn-secondary btn-sm"
disabled
>

🤝 {t("Accepted")}

</button>

}

</td>

</tr>

))

}

</tbody>

    </table>
    </div>

</div>

        </div>
        </div>

</>

    );

}

export default BusinessDashboard;