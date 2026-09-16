import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import AdminSidebar from "../components/AdminSidebar";
import TopNavbar from "../components/TopNavbar";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { LABELS } from "../translations";
import { buildDynamicLabels } from "../utils/buildDynamicLabels";
import { formatLocalizedDate } from "../utils/formatDate";
import { formatLocalizedNumber } from "../utils/formatNumber";
import { useTranslationContext } from "../context/TranslationContext";
import "../styles/AdminInventory.css";

function AdminInventory() {

    const [products, setProducts] = useState([]);

    const dynamicLabels = useMemo(
    () =>
        buildDynamicLabels(
            LABELS.ADMIN_INVENTORY,
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


    const [search, setSearch] = useState("");

    const t = useTranslate();

    const { language } = useTranslationContext();

    usePageTranslation(dynamicLabels);

    useEffect(() => {

        const token = localStorage.getItem("access");

        axios.get(
            "http://127.0.0.1:8000/api/inventory/admin/inventory/",
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

    }, []);

    const filteredProducts = products.filter((item) =>
    item.product_name.toLowerCase().includes(search.toLowerCase())
);

    return (

    <>

        <AdminSidebar />

        <div className="admin-inventory-page">

            <TopNavbar />

            {/* Header */}

            <div className="inventory-header">

                <div>

                    <h2 className="inventory-title">

                        📦 {t("Inventory Management")}

                    </h2>

                    <p className="inventory-subtitle">

                        Monitor and manage all inventory items across the FoodBridge AI platform.

                    </p>

                </div>

                <div className="inventory-badge">

                    {formatLocalizedNumber(filteredProducts.length, language)} {t("Items")}

                </div>

            </div>

            {/* Summary Cards */}

            <div className="inventory-summary">

                <div className="inventory-card">

                    <h6>{t("Total Inventory Items")}</h6>

                    <h2>

                        {formatLocalizedNumber(filteredProducts.length, language)}

                    </h2>

                </div>

                <div className="inventory-card">

                    <h6>{t("Available Products")}</h6>

                    <h2>

                        {

                            filteredProducts.filter(

                                item => item.status === "Available"

                            ).length

                        }

                    </h2>

                </div>

                <div className="inventory-card">

                    <h6>{t("Categories")}</h6>

                    <h2>

                        {

                            new Set(

                                filteredProducts.map(

                                    item => item.category

                                )

                            ).size

                        }

                    </h2>

                </div>

            </div>

            {/* Search */}

            <div className="search-card">

                <div className="row">

                    <div className="col-md-4">

                        <input

                            type="text"

                            className="form-control"

                            placeholder={`🔍 ${t("Search Product...")}`}

                            value={search}

                            onChange={(e) => setSearch(e.target.value)}

                        />

                    </div>

                </div>

            </div>

            {/* Inventory Table */}

            <div className="inventory-table-card">

                <div className="table-responsive">

                    <table className="table inventory-table">

                        <thead>

                            <tr>

                                <th>{t("ID")}</th>

                                <th>{t("Product")}</th>

                                <th>{t("Category")}</th>

                                <th>{t("Quantity")}</th>

                                <th>{t("Status")}</th>

                                <th>{t("Expiry")}</th>

                            </tr>

                        </thead>

                        <tbody>

                            {

                                filteredProducts.length === 0 ?

                                (

                                    <tr>

                                        <td

                                            colSpan="6"

                                            className="text-center"

                                        >

                                            {t("No Products Found")}

                                        </td>

                                    </tr>

                                )

                                :

                                (

                                    filteredProducts.map((item) => (

                                        <tr key={item.id}>

                                            <td>{item.id}</td>

                                            <td>{t(item.product_name)}</td>

                                            <td>{t(item.category)}</td>

                                            <td>

                                                {formatLocalizedNumber(item.quantity, language)} {t(item.unit)}

                                            </td>

                                            <td>

                                                <span className="badge bg-success rounded-pill px-3 py-2">

                                                    {t(item.status)}

                                                </span>

                                            </td>

                                            <td>

                                                {formatLocalizedDate(item.expiry_date, language)}

                                            </td>

                                        </tr>

                                    ))

                                )

                            }

                        </tbody>

                    </table>

                </div>

            </div>

        </div>

    </>

);

}

export default AdminInventory;