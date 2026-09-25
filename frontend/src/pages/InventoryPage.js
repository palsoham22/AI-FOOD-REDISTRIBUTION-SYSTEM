import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import BusinessLayout from "../components/BusinessLayout";
import { useNavigate } from "react-router-dom";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { LABELS } from "../translations";
import { translateValue } from "../utils/translateValue";
import { buildDynamicLabels } from "../utils/buildDynamicLabels";
import "../styles/InventoryPage.css";

function InventoryPage() {
    const t = useTranslate();
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const dynamicLabels = useMemo(
        () =>
            buildDynamicLabels(
                LABELS.INVENTORY,
                products,
                ["product_name", "category", "brand", "unit", "status"]
            ),
        [products]
    );

    usePageTranslation(dynamicLabels);

    const loadProducts = () => {
        const token = localStorage.getItem("access");
        axios
            .get("http://127.0.0.1:8000/api/inventory/list/", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then((response) => {
                const list = Array.isArray(response.data) ? response.data : [];
                setProducts(list);
                try {
                    localStorage.setItem("offline_inventory", JSON.stringify(list));
                } catch (e) {
                    console.error("Storage write error:", e);
                }
            })
            .catch((error) => {
                console.warn("Inventory fetch error:", error.message);
                try {
                    const cachedInventory = localStorage.getItem("offline_inventory");
                    if (cachedInventory) {
                        const parsed = JSON.parse(cachedInventory);
                        setProducts(Array.isArray(parsed) ? parsed : []);
                    }
                } catch (e) {
                    console.error("Cache read error:", e);
                }
            });
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const deleteProduct = async (id) => {
        if (!window.confirm(t("Delete this product?"))) {
            return;
        }
        const token = localStorage.getItem("access");
        try {
            await axios.delete(
                `http://127.0.0.1:8000/api/inventory/delete/${id}/`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setProducts((prev) => prev.filter((item) => item.id !== id));
        } catch (err) {
            console.error("Delete failed:", err);
        }
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
        } catch (error) {
            console.error("Donation failed:", error);
            alert(t("Donation Failed"));
        }
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

    const highRisk = useMemo(() => {
        return products.filter(
            (p) => getRisk(p.category).text === "High"
        ).length;
    }, [products]);

    const mediumRisk = useMemo(() => {
        return products.filter(
            (p) => getRisk(p.category).text === "Medium"
        ).length;
    }, [products]);

    const lowRisk = useMemo(() => {
        return products.filter(
            (p) => getRisk(p.category).text === "Low"
        ).length;
    }, [products]);

    const categories = useMemo(() => {
        const set = new Set(products.map((p) => p.category).filter(Boolean));
        return ["ALL", ...Array.from(set)];
    }, [products]);

    const filteredProducts = useMemo(() => {
        return products.filter((p) => {
            if (!p) return false;
            const q = searchQuery.toLowerCase().trim();
            const matchesSearch =
                !q ||
                (p.product_name && p.product_name.toLowerCase().includes(q)) ||
                (p.category && p.category.toLowerCase().includes(q)) ||
                (p.brand && p.brand.toLowerCase().includes(q)) ||
                (p.barcode && String(p.barcode).includes(q));
            const matchesCategory =
                categoryFilter === "ALL" || p.category === categoryFilter;
            const matchesStatus =
                statusFilter === "ALL" || p.status === statusFilter;
            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [products, searchQuery, categoryFilter, statusFilter]);

    return (
        <BusinessLayout>
            <div className="inventory-page-content">
                {/* Header */}
                <div className="inventory-header">
                    <div>
                        <h2 className="inventory-title">
                            📦 {t("Inventory")}
                        </h2>
                        <p className="inventory-subtitle">
                            {t("Manage and monitor all your inventory products.")}
                        </p>
                    </div>

                    <div className="inventory-header-actions">
                        <button
                            type="button"
                            className="btn btn-primary btn-sm d-flex align-items-center gap-1"
                            onClick={() => navigate("/add-product")}
                            title={t("Add Product")}
                        >
                            <i className="bi bi-plus-lg"></i>
                            <span>{t("Add Product")}</span>
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
                            onClick={() => navigate("/barcode-scanner")}
                            title={t("Barcode Scanner")}
                        >
                            <i className="bi bi-upc-scan"></i>
                            <span>{t("Barcode Scanner")}</span>
                        </button>
                        <div className="inventory-count">
                            {products.length} {t("Products")}
                        </div>
                    </div>
                </div>

                {/* Summary KPI Cards */}
                <div className="inventory-summary">
                    <div className="summary-card summary-total">
                        <h6>📦 {t("Total Products")}</h6>
                        <h2>{totalProducts}</h2>
                    </div>

                    <div className="summary-card summary-red">
                        <h6>⚠ {t("High Risk")}</h6>
                        <h2>{highRisk}</h2>
                    </div>

                    <div className="summary-card summary-yellow">
                        <h6>🟡 {t("Medium Risk")}</h6>
                        <h2>{mediumRisk}</h2>
                    </div>

                    <div className="summary-card summary-green">
                        <h6>🟢 {t("Low Risk")}</h6>
                        <h2>{lowRisk}</h2>
                    </div>
                </div>

                {/* Main Card with Filter Toolbar & Table */}
                <div className="inventory-card">
                    {/* Controls Bar */}
                    <div className="inventory-controls-bar mb-3">
                        <div className="inventory-search-wrap">
                            <i className="bi bi-search"></i>
                            <input
                                type="text"
                                className="inventory-search-input"
                                placeholder={t("Search Product...") || "Search product, category, brand..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="inventory-filters d-flex gap-2 align-items-center flex-wrap">
                            <select
                                className="form-select form-select-sm inventory-cat-select"
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                style={{ width: "auto", minWidth: "140px" }}
                            >
                                <option value="ALL">{t("Category")}: {t("All") || "All"}</option>
                                {categories.filter(c => c !== "ALL").map((cat) => (
                                    <option key={cat} value={cat}>
                                        {translateValue(cat, t)}
                                    </option>
                                ))}
                            </select>

                            <div className="btn-group btn-group-sm">
                                <button
                                    type="button"
                                    className={`btn ${statusFilter === "ALL" ? "btn-primary" : "btn-outline-secondary"}`}
                                    onClick={() => setStatusFilter("ALL")}
                                >
                                    {t("All") || "All"}
                                </button>
                                <button
                                    type="button"
                                    className={`btn ${statusFilter === "Available" ? "btn-primary" : "btn-outline-secondary"}`}
                                    onClick={() => setStatusFilter("Available")}
                                >
                                    {t("Available")}
                                </button>
                                <button
                                    type="button"
                                    className={`btn ${statusFilter === "Donated" ? "btn-primary" : "btn-outline-secondary"}`}
                                    onClick={() => setStatusFilter("Donated")}
                                >
                                    {t("Donated")}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table inventory-table align-middle">
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
                                {filteredProducts.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="10"
                                            className="text-center text-muted py-5"
                                        >
                                            <div className="py-4">
                                                <div className="fs-1 mb-2">📦</div>
                                                <div className="fw-semibold">{t("No Products")}</div>
                                                <small className="text-secondary">
                                                    {searchQuery || categoryFilter !== "ALL" || statusFilter !== "ALL"
                                                        ? t("Try adjusting your search or filters.")
                                                        : t("Add your first product to get started.")}
                                                </small>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProducts.map((product) => {
                                        const risk = getRisk(product.category);
                                        const isAvailable = product.status === "Available";
                                        return (
                                            <tr key={product.id}>
                                                <td>
                                                    {product.image_url || product.image ? (
                                                        <img
                                                            src={product.image_url || product.image}
                                                            alt={product.product_name}
                                                            className="product-image"
                                                        />
                                                    ) : (
                                                        <span className="no-image-badge">{t("No Image")}</span>
                                                    )}
                                                </td>

                                                <td className="fw-semibold text-dark">
                                                    {translateValue(product.product_name, t)}
                                                </td>

                                                <td className="text-muted">
                                                    {product.brand ? translateValue(product.brand, t) : "—"}
                                                </td>

                                                <td>
                                                    <code className="text-secondary small">
                                                        {product.barcode || "—"}
                                                    </code>
                                                </td>

                                                <td>
                                                    <span className="badge bg-light text-dark border">
                                                        {translateValue(product.category, t)}
                                                    </span>
                                                </td>

                                                <td>
                                                    {isAvailable ? (
                                                        <span className={`badge risk-${risk.text.toLowerCase()}`}>
                                                            {translateValue(risk.text, t)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted">—</span>
                                                    )}
                                                </td>

                                                <td className="fw-bold">
                                                    {product.quantity} {translateValue(product.unit, t)}
                                                </td>

                                                <td className="small text-muted">
                                                    {product.expiry_date}
                                                </td>

                                                <td>
                                                    <span
                                                        className={`status-badge ${
                                                            isAvailable
                                                                ? "status-available"
                                                                : product.status === "Donated"
                                                                ? "status-donated"
                                                                : "status-expired"
                                                        }`}
                                                    >
                                                        {translateValue(product.status, t)}
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="inventory-actions">
                                                        {isAvailable ? (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-outline-primary btn-sm"
                                                                    onClick={() => navigate(`/edit-product/${product.id}`)}
                                                                    title={t("Edit")}
                                                                >
                                                                    <i className="bi bi-pencil"></i> {t("Edit")}
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-outline-success btn-sm"
                                                                    onClick={() => donateProduct(product.id)}
                                                                    title={t("Donate")}
                                                                >
                                                                    <i className="bi bi-gift"></i> {t("Donate")}
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-outline-danger btn-sm"
                                                                    onClick={() => deleteProduct(product.id)}
                                                                    title={t("Delete")}
                                                                >
                                                                    <i className="bi bi-trash"></i>
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <span className="badge bg-secondary-subtle text-secondary py-2 px-3">
                                                                🔒 {translateValue(product.status, t) || t("Locked")}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </BusinessLayout>
    );
}

export default InventoryPage;
