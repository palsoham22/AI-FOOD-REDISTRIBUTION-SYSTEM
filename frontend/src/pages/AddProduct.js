import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { saveOfflineProduct } from "../utils/offlineQueue";
import { useTranslate } from "../hooks/useTranslate";
import BusinessLayout from "../components/BusinessLayout";

function AddProduct() {
    const t = useTranslate();
    const [product_name, setProductName] = useState("");
    const [category, setCategory] = useState("Dairy");
    const [quantity, setQuantity] = useState("");
    const [unit, setUnit] = useState("Kg");
    const [expiry_date, setExpiryDate] = useState("");
    const [storage_type, setStorageType] = useState("Refrigerated");
    const navigate = useNavigate();
    const [barcode, setBarcode] = useState("");
    const [image, setImage] = useState("");

    useEffect(() => {

    const savedBarcode = localStorage.getItem("barcode");
    const savedProduct = localStorage.getItem("product_name");
    const savedCategory = localStorage.getItem("category");
    const savedImage = localStorage.getItem("image");

    if (savedBarcode) {
        setBarcode(savedBarcode);
    }

    if (savedProduct) {
        setProductName(savedProduct);
    }

    if (savedCategory) {
        setCategory(savedCategory);
    }

    if (savedImage) {
        setImage(savedImage);
    }

    }, []);

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!product_name.trim()) {
            alert(t("Please enter a product name."));
            return;
        }

        const qtyNum = parseInt(quantity, 10);
        if (isNaN(qtyNum) || qtyNum <= 0) {
            alert(t("Quantity must be a positive number."));
            return;
        }

        if (!expiry_date) {
            alert(t("Please select an expiry date."));
            return;
        }

        try {

            const token = localStorage.getItem("access");

            // If internet is not available
if (!navigator.onLine) {

    saveOfflineProduct({

        product_name,
        barcode,
        brand: localStorage.getItem("brand") || "",
        image_url: image,
        category,
        quantity,
        unit,
        expiry_date,
        storage_type,
        status: "Available"

    });

    alert(t("📦 Product saved offline. It will sync automatically when internet is back."));

    // Register Background Sync
    if ("serviceWorker" in navigator && "SyncManager" in window) {

        const registration = await navigator.serviceWorker.ready;

        await registration.sync.register("foodbridge-sync");

    }

    navigate("/business-dashboard");

    return;
}

            await axios.post(

    "http://127.0.0.1:8000/api/inventory/add/",

    {
    product_name,
    barcode,
    brand: localStorage.getItem("brand") || "",
    image_url: image,
    category,
    quantity,
    unit,
    expiry_date,
    storage_type,
    status: "Available"
    },

    {

        headers: {

            Authorization: `Bearer ${token}`

        }

    }

);

            alert(t("Product Added Successfully 🎉"));

            localStorage.removeItem("barcode");
            localStorage.removeItem("product_name");
            localStorage.removeItem("brand");
            localStorage.removeItem("category");
            localStorage.removeItem("image");

            navigate("/business-dashboard");

        }

        catch (err) {

    console.log("FULL ERROR:", err);

    console.log("Response:", err.response);

    console.log("Response Data:", err.response?.data);

    alert(
        JSON.stringify(err.response?.data)
    );

}

    };

    return (
        <BusinessLayout>
            <div className="product-form-page">
                <div className="container py-4">
                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <div className="card shadow-sm p-4 border-0" style={{ borderRadius: "16px", background: "#ffffff" }}>
            <div className="d-flex align-items-center justify-content-between mb-4">
                                    <h2 className="m-0 fw-bold" style={{ color: "#0F172A", fontSize: "1.5rem" }}>
                                        {t("📦 Add New Product")}
                                    </h2>
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary btn-sm"
                                        onClick={() => navigate("/inventory")}
                                    >
                                        ← {t("Back to Inventory")}
                                    </button>
                                </div>

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">
                        {t("Barcode")}
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        value={barcode}
                        readOnly
                    />
                </div>

                {image && (
                    <div className="mb-3 text-center">
                        <img
                            src={image}
                            alt="Product"
                            style={{
                                width: "180px",
                                height: "180px",
                                objectFit: "contain",
                                border: "1px solid #ccc",
                                borderRadius: "10px",
                                padding: "10px"
                            }}
                        />
                    </div>
                )}

                <div className="mb-3">
                    <label className="form-label">
                        {t("Product Name")}
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder={t("Enter Product Name")}
                        value={product_name}
                        onChange={(e)=>setProductName(e.target.value)}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">
                        {t("Category")}
                    </label>
                    <select
                        className="form-select"
                        value={category}
                        onChange={(e)=>setCategory(e.target.value)}
                    >
                        <option value="Dairy">{t("Dairy")}</option>
                        <option value="Bakery">{t("Bakery")}</option>
                        <option value="Fruits">{t("Fruits")}</option>
                        <option value="Vegetables">{t("Vegetables")}</option>
                        <option value="Beverages">{t("Beverages")}</option>
                        <option value="Others">{t("Others")}</option>
                    </select>
                </div>

                <div className="mb-3">
                    <label className="form-label">
                        {t("Quantity")}
                    </label>
                    <input
                        type="number"
                        className="form-control"
                        placeholder={t("Enter Quantity")}
                        value={quantity}
                        onChange={(e)=>setQuantity(e.target.value)}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">
                        {t("Unit")}
                    </label>
                    <select
                        className="form-select"
                        value={unit}
                        onChange={(e)=>setUnit(e.target.value)}
                    >
                        <option value="Kg">{t("Kg")}</option>
                        <option value="Litre">{t("Litre")}</option>
                        <option value="Piece">{t("Piece")}</option>
                        <option value="Packet">{t("Packet")}</option>
                    </select>
                </div>

                <div className="mb-3">
                    <label className="form-label">
                        {t("Expiry Date")}
                    </label>
                    <input
                        type="date"
                        className="form-control"
                        value={expiry_date}
                        onChange={(e)=>setExpiryDate(e.target.value)}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">
                        {t("Storage Type")}
                    </label>
                    <select
                        className="form-select"
                        value={storage_type}
                        onChange={(e)=>setStorageType(e.target.value)}
                    >
                        <option value="Refrigerated">{t("Refrigerated")}</option>
                        <option value="Frozen">{t("Frozen")}</option>
                        <option value="Room Temperature">{t("Room Temperature")}</option>
                    </select>
                </div>

                <button
                    type="submit"
                    className="btn btn-primary w-100 py-2 fw-semibold" style={{ backgroundColor: "#2563EB", borderColor: "#2563EB" }}
                >
                    💾 {t("Save Product")}
                </button>
            </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </BusinessLayout>
    );
}

export default AddProduct;