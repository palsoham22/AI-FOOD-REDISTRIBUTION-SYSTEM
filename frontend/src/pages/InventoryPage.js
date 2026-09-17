import { useEffect, useState } from "react";
import axios from "../services/axiosInstance";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { LABELS } from "../translations";
import { useTranslationContext } from "../context/TranslationContext";
import { translateValue } from "../utils/translateValue";
import { buildDynamicLabels } from "../utils/buildDynamicLabels";
import "../styles/InventoryPage.css";

function InventoryPage() {

    const t = useTranslate();

    const { language } = useTranslationContext();

    const [products, setProducts] = useState([]);

    const dynamicLabels = buildDynamicLabels(

    LABELS.INVENTORY,

    products,

    [

        "product_name",

        "category",

        "brand",

        "unit",

        "status"

    ]

);

    usePageTranslation(dynamicLabels);

    const navigate = useNavigate();

    useEffect(() => {

    axios.get("inventory/list/")

    .then((response) => {

    setProducts(response.data);

    localStorage.setItem(
        "offline_inventory",
        JSON.stringify(response.data)
    );

})

    .catch((error) => {

    console.log(error);

    const cachedInventory = localStorage.getItem("offline_inventory");

    if (cachedInventory) {

        setProducts(JSON.parse(cachedInventory));

        alert(t("📶 Offline Mode: Showing last synced inventory."));

    }

});

}, []);

    const deleteProduct = async(id)=>{

        if(!window.confirm(t("Delete this product?"))){

            return;

        }

        const token = localStorage.getItem("access");

        await axios.delete(

            `http://127.0.0.1:8000/api/inventory/delete/${id}/`,

            {

                headers:{

                    Authorization:`Bearer ${token}`

                }

            }

        );

        setProducts(products.filter(item=>item.id!==id));

    };

    const getRisk = (category) => {

    if (category === "Dairy" || category === "Bakery") {

        return {
            text: "High",
            color: "danger"
        };

    }

    if (category === "Fruits" || category === "Vegetables") {

        return {
            text: "Medium",
            color: "warning"
        };

    }

    return {
        text: "Low",
        color: "success"
    };

};

const totalProducts = products.length;

const highRisk = products.filter(
    (p) => getRisk(p.category).text === "High"
).length;

const mediumRisk = products.filter(
    (p) => getRisk(p.category).text === "Medium"
).length;

const lowRisk = products.filter(
    (p) => getRisk(p.category).text === "Low"
).length;

    return (

<>
    <Sidebar />

    <div className="inventory-page">

        <div className="inventory-header">

            <div>

                <h2 className="inventory-title">
                    📦 {t("Inventory")}
                </h2>

                <p className="inventory-subtitle">
    {t("Manage and monitor all your inventory products.")}
</p>

            </div>

            <div className="inventory-count">
                {products.length} {t("Products")}
            </div>

        </div>

        <div className="inventory-summary">

<div className="summary-card summary-green">

<h6>

📦 {t("Total Products")}

</h6>

<h2>

{totalProducts}

</h2>

</div>

<div className="summary-card summary-red">

<h6>

⚠ {t("High Risk")}

</h6>

<h2>

{highRisk}

</h2>

</div>

<div className="summary-card summary-yellow">

<h6>

🟡 {t("Medium Risk")}

</h6>

<h2>

{mediumRisk}

</h2>

</div>

<div className="summary-card summary-blue">

<h6>

🟢 {t("Low Risk")}

</h6>

<h2>

{lowRisk}

</h2>

</div>

</div>

        <div className="inventory-card">

            <div className="table-responsive">

                <table className="table inventory-table">

                    <thead>

                        <tr>

                            <th>{t("Image")}</th>

                            <th>{t("Product")}</th>

                            <th>{t("Brand")}</th>

                            <th>{t("Barcode")}</th>

                            <th>{t("Category")}</th>

                            <th>{t("Risk")}</th>

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

                                <td
                                    colSpan="10"
                                    className="text-center text-muted py-5"
                                >

                                    {t("No Products")}

                                </td>

                            </tr>

                            :

                            products.map((product) => (

                                <tr key={product.id}>

                                    <td>

                                        {

                                            product.image_url ?

                                            <img
                                                src={product.image_url}
                                                alt={product.product_name}
                                                className="product-image"
                                            />

                                            :

                                            <span>{t("No Image")}</span>

                                        }

                                    </td>

                                    <td>

                                        {translateValue(product.product_name, t)}

                                    </td>

                                    <td>

                                        {

                                            product.brand

                                            ?

                                            translateValue(product.brand, t)

                                            :

                                            "-"

                                        }

                                    </td>

                                    <td>

                                        {product.barcode || "-"}

                                    </td>

                                    <td>

                                        {translateValue(product.category, t)}

                                    </td>

                                    <td>

                                        {

                                            product.status === "Available"

                                            ?

                                            <span
                                                className={`badge risk-${getRisk(product.category).text.toLowerCase()}`}
                                            >

                                                {translateValue(getRisk(product.category).text, t)}

                                            </span>

                                            :

                                            <span className="text-muted">

                                                -

                                            </span>

                                        }

                                    </td>

                                    <td>

                                        {product.quantity} {translateValue(product.unit, t)}

                                    </td>

                                    <td>

                                        {product.expiry_date}

                                    </td>

                                    <td>

                                        {translateValue(product.status, t)}

                                    </td>

                                    <td>

                                        <div className="inventory-actions">

                                        {

                                            product.status === "Available"

                                            ?

                                            <>

                                                <button

                                                    className="btn btn-warning btn-sm"

                                                    onClick={() => navigate(`/edit-product/${product.id}`)}

                                                >

                                                    {t("Edit")}

                                                </button>

                                                <button

                                                    className="btn btn-danger btn-sm"

                                                    onClick={() => deleteProduct(product.id)}

                                                >

                                                    {t("Delete")}

                                                </button>

                                            </>

                                            :

                                            <button

                                                className="btn btn-secondary btn-sm"

                                                disabled

                                            >

                                                🔒 {t("Locked")}

                                            </button>

                                        }

                                        </div>

                                    </td>

                                </tr>

                            ))

                        }

                    </tbody>

                </table>

            </div>

        </div>

    </div>

</>

);

}

export default InventoryPage;