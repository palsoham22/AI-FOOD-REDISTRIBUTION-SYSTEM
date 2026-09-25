import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslate } from "../hooks/useTranslate";
import BusinessLayout from "../components/BusinessLayout";

function EditProduct() {
    const t = useTranslate();
    const { id } = useParams();

    const navigate = useNavigate();

    const [product_name, setProductName] = useState("");

    const [category, setCategory] = useState("");

    const [quantity, setQuantity] = useState("");

    const [unit, setUnit] = useState("");

    const [expiry_date, setExpiryDate] = useState("");

    const [storage_type, setStorageType] = useState("");

    useEffect(() => {

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

        const product = response.data.find(
            (item) => item.id === parseInt(id)
        );

        if (product) {

            setProductName(product.product_name);
            setCategory(product.category);
            setQuantity(product.quantity);
            setUnit(product.unit);
            setExpiryDate(product.expiry_date);
            setStorageType(product.storage_type);

        }

    })
    .catch((err) => {

        console.log(err);

    });

}, [id]);

    const handleUpdate = async (e) => {

        e.preventDefault();

        try {

            const token = localStorage.getItem("access");

await axios.put(

    `http://127.0.0.1:8000/api/inventory/update/${id}/`,

    {

        product_name,
        category,
        quantity,
        unit,
        expiry_date,
        storage_type,
        status:"Available"

    },

    {

        headers:{

            Authorization:`Bearer ${token}`

        }

    }

);

            alert(t("Product Updated Successfully 🎉"));

            navigate("/business-dashboard");

        }

        catch (err) {

    console.log(err.response?.data);

    alert(JSON.stringify(err.response?.data));

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
                                        {t("✏ Edit Product")}
                                    </h2>
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary btn-sm"
                                        onClick={() => navigate("/inventory")}
                                    >
                                        ← {t("Back to Inventory")}
                                    </button>
                                </div>

                                <form onSubmit={handleUpdate}>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">{t("Product Name")}</label>
                                        <input
                                            className="form-control"
                                            value={product_name}
                                            onChange={(e) => setProductName(e.target.value)}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">{t("Category")}</label>
                                        <select
                                            className="form-select"
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                        >
                                            <option value="Dairy">{t("Dairy")}</option>
                                            <option value="Bakery">{t("Bakery")}</option>
                                            <option value="Fruits">{t("Fruits")}</option>
                                            <option value="Vegetables">{t("Vegetables")}</option>
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">{t("Quantity")}</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={quantity}
                                            onChange={(e) => setQuantity(e.target.value)}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">{t("Unit")}</label>
                                        <select
                                            className="form-select"
                                            value={unit}
                                            onChange={(e) => setUnit(e.target.value)}
                                        >
                                            <option value="Kg">{t("Kg")}</option>
                                            <option value="Piece">{t("Piece")}</option>
                                            <option value="Packet">{t("Packet")}</option>
                                            <option value="Litre">{t("Litre")}</option>
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">{t("Expiry Date")}</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={expiry_date}
                                            onChange={(e) => setExpiryDate(e.target.value)}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">{t("Storage Type")}</label>
                                        <select
                                            className="form-select"
                                            value={storage_type}
                                            onChange={(e) => setStorageType(e.target.value)}
                                        >
                                            <option value="Refrigerated">{t("Refrigerated")}</option>
                                            <option value="Frozen">{t("Frozen")}</option>
                                            <option value="Room Temperature">{t("Room Temperature")}</option>
                                        </select>
                                    </div>

                                    <button className="btn btn-primary w-100 py-2 fw-semibold">
                                        💾 {t("Update Product")}
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

export default EditProduct;