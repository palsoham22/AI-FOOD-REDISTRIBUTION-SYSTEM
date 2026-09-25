import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BusinessLayout from "../components/BusinessLayout";
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
  const { language } = useTranslationContext();

  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const dynamicLabels = useMemo(
    () =>
      buildDynamicLabels(
        LABELS.BUSINESS_DASHBOARD,
        products,
        ["product_name", "category", "unit", "status"]
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
        setProducts(response.data);
      })
      .catch((error) => {
        console.error("Failed to load inventory products:", error);
      });
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const username = localStorage.getItem("username") || "User";
  const ownerName = localStorage.getItem("owner_name") || username;
  const businessName = localStorage.getItem("business_name") || t("FoodBridge");
  const businessType = localStorage.getItem("business_type") || t("Business");

  const today = useMemo(() => new Date(), []);

  const nearExpiry = useMemo(() => {
    return products.filter((product) => {
      const expiry = new Date(product.expiry_date);
      const difference = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
      return difference >= 0 && difference <= 5;
    });
  }, [products, today]);

  const criticalProducts = useMemo(() => {
    return products.filter((product) => {
      if (product.status !== "Available") {
        return false;
      }
      const expiry = new Date(product.expiry_date);
      const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
      return daysLeft >= 0 && daysLeft <= 2;
    });
  }, [products, today]);

  const availableCount = useMemo(() => {
    return products.filter((item) => item.status === "Available").length;
  }, [products]);

  const donatedCount = useMemo(() => {
    return products.filter((item) => item.status === "Donated").length;
  }, [products]);

  const acceptedCount = useMemo(() => {
    return products.filter((item) => item.status === "Accepted").length;
  }, [products]);

  const foodSavedKg = useMemo(() => {
    return products
      .filter((item) => item.status === "Donated" || item.status === "Accepted")
      .reduce((sum, item) => {
        const qty = parseFloat(item.quantity) || 0;
        return item.unit === "Kg" ? sum + qty : sum;
      }, 0);
  }, [products]);

  const getExpiryStatus = (expiryDate) => {
    const expiry = new Date(expiryDate);
    const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      return {
        text: "Expired",
        badgeClass: "fb-expiry-expired",
        daysLeft
      };
    }
    if (daysLeft <= 2) {
      return {
        text: "Critical",
        badgeClass: "fb-expiry-critical",
        daysLeft
      };
    }
    if (daysLeft <= 5) {
      return {
        text: "Warning",
        badgeClass: "fb-expiry-warning",
        daysLeft
      };
    }
    return {
      text: "Safe",
      badgeClass: "fb-expiry-safe",
      daysLeft
    };
  };

  const categoriesSummary = useMemo(() => {
    const total = products.length || 1;
    const cats = [
      { name: "Dairy", color: "#2563EB", icon: "🥛" },
      { name: "Bakery", color: "#F59E0B", icon: "🍞" },
      { name: "Fruits", color: "#3B82F6", icon: "🍎" },
      { name: "Vegetables", color: "#0F766E", icon: "🥦" },
      { name: "Other", color: "#64748B", icon: "📦" }
    ];
    return cats.map((cat) => {
      const count = products.filter((p) => {
        if (cat.name === "Other") {
          return (
            p.category === "Other" ||
            p.category === "Others" ||
            !["Dairy", "Bakery", "Fruits", "Vegetables"].includes(p.category)
          );
        }
        return p.category === cat.name;
      }).length;
      const pct = Math.round((count / total) * 100);
      return { ...cat, count, pct };
    });
  }, [products]);

  const shelfLifeRisk = useMemo(() => {
    let safe = 0;
    let warning = 0;
    let critical = 0;
    let expired = 0;

    products.forEach((p) => {
      const expiry = new Date(p.expiry_date);
      const diff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
      if (diff < 0) expired++;
      else if (diff <= 2) critical++;
      else if (diff <= 5) warning++;
      else safe++;
    });

    return { safe, warning, critical, expired };
  }, [products, today]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (statusFilter === "Available" && product.status !== "Available") {
        return false;
      }
      if (statusFilter === "Donated" && product.status !== "Donated") {
        return false;
      }
      if (statusFilter === "NearExpiry") {
        const expiry = new Date(product.expiry_date);
        const diff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        if (!(diff >= 0 && diff <= 5)) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = (product.product_name || "").toLowerCase().includes(q);
        const catMatch = (product.category || "").toLowerCase().includes(q);
        const barcodeMatch = (product.barcode || "").toLowerCase().includes(q);
        if (!nameMatch && !catMatch && !barcodeMatch) return false;
      }

      return true;
    });
  }, [products, statusFilter, searchQuery, today]);

  const deleteProduct = async (id) => {
    if (!window.confirm(t("Delete this product?"))) {
      return;
    }
    const token = localStorage.getItem("access");
    try {
      await axios.delete(`http://127.0.0.1:8000/api/inventory/delete/${id}/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
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
    } catch (error) {
      console.error("CSV upload failed:", error.response?.data);
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
    } catch (err) {
      console.error("POS sync failed:", err);
      alert(t("POS Import Failed"));
    }
  };

  return (
    <BusinessLayout>
      <div className="fb-dashboard-content">

          {/* 1. Welcome / Identity Banner */}
          <div className="fb-welcome-card">
            <div className="fb-welcome-top">
              <div>
                <span className="fb-welcome-eyebrow">
                  🌱 {t("AI Food Redistribution Dashboard")}
                </span>
                <h1 className="fb-welcome-title">
                  🏪 {businessName}
                </h1>
                <div className="fb-welcome-meta">
                  <span className="fb-welcome-meta-item">
                    <i className="bi bi-person-badge text-primary"></i>
                    <span>{t("Owner")}:</span>
                    <strong>{ownerName}</strong>
                  </span>
                  <span className="fb-welcome-meta-item">
                    <i className="bi bi-shop text-primary"></i>
                    <span>{t("Business Type")}:</span>
                    <strong>{businessType}</strong>
                  </span>
                  <span className="fb-welcome-meta-item">
                    <span>👋 {t("Welcome")},</span>
                    <strong>{username}</strong>
                  </span>
                </div>
              </div>
              <div className="fb-welcome-badge-status">
                <span className="pulse-dot"></span>
                <span>
                  {t("Available")}: {formatLocalizedNumber(availableCount, language)} {t("Items")}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Expiry Warning or Healthy Status Alert */}
          {criticalProducts.length > 0 ? (
            <div className="fb-alert-banner fb-alert-banner-warning">
              <div className="fb-alert-left">
                <div className="fb-alert-icon-box fb-alert-icon-warning">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                </div>
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <h4 className="fb-alert-title">{t("Expiry Alert")}</h4>
                    <span className="badge bg-warning text-dark">
                      {criticalProducts.length} {t("Items")}
                    </span>
                  </div>
                  <p className="fb-alert-text">
                    <b>{criticalProducts.length}</b> {t("product(s) will expire within the next")} <b>2 {t("days")}</b>.
                  </p>
                </div>
              </div>
              <button
                className="btn fb-btn-alert-warning"
                onClick={() => navigate("/inventory")}
              >
                <i className="bi bi-arrow-right-circle me-1"></i>
                {t("Review Inventory")}
              </button>
            </div>
          ) : (
            <div className="fb-alert-banner fb-alert-banner-success">
              <div className="fb-alert-left">
                <div className="fb-alert-icon-box fb-alert-icon-success">
                  <i className="bi bi-shield-check"></i>
                </div>
                <div>
                  <h4 className="fb-alert-title">{t("Inventory Healthy")}</h4>
                  <p className="fb-alert-text">
                    {t("No products require immediate attention.")}
                  </p>
                </div>
              </div>
              <span className="fb-healthy-pill">
                <i className="bi bi-check-circle-fill me-1"></i> {t("Safe")}
              </span>
            </div>
          )}

          {/* 3. KPI Stat Cards (Light-Blue / White SaaS Theme) */}
          <div className="row g-3 fb-kpi-grid">
            <div className="col-xl-3 col-md-6 col-12">
              <div
                className="fb-kpi-card fb-kpi-blue"
                onClick={() => navigate("/inventory")}
              >
                <div className="fb-kpi-top">
                  <span className="fb-kpi-label">{t("Products")}</span>
                  <span className="fb-kpi-icon-wrap">
                    <i className="bi bi-box-seam"></i>
                  </span>
                </div>
                <div className="fb-kpi-value">
                  {formatLocalizedNumber(products.length, language)}
                </div>
                <div className="fb-kpi-bottom">
                  <span>{t("Total Inventory Items")}</span>
                  <span className="fb-kpi-link">
                    {t("Click to View")} →
                  </span>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-md-6 col-12">
              <div
                className="fb-kpi-card fb-kpi-amber"
                onClick={() => navigate("/inventory")}
              >
                <div className="fb-kpi-top">
                  <span className="fb-kpi-label">{t("Near Expiry")}</span>
                  <span className="fb-kpi-icon-wrap">
                    <i className="bi bi-hourglass-split"></i>
                  </span>
                </div>
                <div className="fb-kpi-value">
                  {formatLocalizedNumber(nearExpiry.length, language)}
                </div>
                <div className="fb-kpi-bottom">
                  <span>0–5 {t("days")}</span>
                  <span className="fb-kpi-link">
                    {t("Click to View")} →
                  </span>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-md-6 col-12">
              <div
                className="fb-kpi-card fb-kpi-indigo"
                onClick={() => navigate("/business-donations")}
              >
                <div className="fb-kpi-top">
                  <span className="fb-kpi-label">{t("Donations")}</span>
                  <span className="fb-kpi-icon-wrap">
                    <i className="bi bi-gift"></i>
                  </span>
                </div>
                <div className="fb-kpi-value">
                  {formatLocalizedNumber(donatedCount, language)}
                </div>
                <div className="fb-kpi-bottom">
                  <span>{t("Accepted")}: {acceptedCount}</span>
                  <span className="fb-kpi-link">
                    {t("Click to View")} →
                  </span>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-md-6 col-12">
              <div className="fb-kpi-card fb-kpi-teal">
                <div className="fb-kpi-top">
                  <span className="fb-kpi-label">{t("Food Saved")}</span>
                  <span className="fb-kpi-icon-wrap">
                    <i className="bi bi-globe-americas"></i>
                  </span>
                </div>
                <div className="fb-kpi-value">
                  {foodSavedKg > 0
                    ? `${formatLocalizedNumber(foodSavedKg, language)} Kg`
                    : "0 Kg"}
                </div>
                <div className="fb-kpi-bottom">
                  <span>{t("Redistribute Surplus.")}</span>
                  <span className="text-primary fw-semibold">
                    🌐 FoodBridge Impact
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Quick Action Toolbar */}
          <div className="fb-toolbar-card">
            <div className="fb-toolbar-left">
              <span className="fb-toolbar-title">
                <i className="bi bi-lightning-charge-fill text-warning"></i>
                {t("Quick Insights")}
              </span>
            </div>

            <div className="fb-toolbar-actions">
              <button
                className="btn fb-btn-primary-action"
                onClick={() => navigate("/add-product")}
              >
                <i className="bi bi-plus-lg"></i>
                {t("Add Product")}
              </button>

              <input
                type="file"
                id="csvFile"
                accept=".csv"
                style={{ display: "none" }}
                onChange={uploadCSV}
              />

              <button
                className="btn fb-btn-secondary-action"
                onClick={() => document.getElementById("csvFile").click()}
              >
                <i className="bi bi-file-earmark-spreadsheet text-primary"></i>
                {t("Upload CSV")}
              </button>

              <button
                className="btn fb-btn-secondary-action"
                onClick={() => navigate("/barcode-scanner")}
              >
                <i className="bi bi-upc-scan text-primary"></i>
                {t("Scan Barcode")}
              </button>

              <button
                className="btn fb-btn-secondary-action"
                onClick={importPOSProducts}
              >
                <i className="bi bi-arrow-repeat text-primary"></i>
                {t("Import From POS")}
              </button>
            </div>
          </div>

          {/* 5. Inventory Overview & Waste-Risk Breakdown (Visual Analytics) */}
          <div className="row g-3 fb-overview-grid">
            <div className="col-lg-6 col-12">
              <div className="fb-analytics-card">
                <div className="fb-analytics-header">
                  <h3 className="fb-analytics-title">
                    <i className="bi bi-pie-chart-fill text-primary"></i>
                    {t("Category Distribution")}
                  </h3>
                  <span className="badge bg-light text-dark border">
                    {formatLocalizedNumber(products.length, language)} {t("Items")}
                  </span>
                </div>

                {categoriesSummary.map((cat) => (
                  <div key={cat.name} className="fb-progress-row">
                    <div className="fb-progress-label">
                      <span>
                        <span className="me-2">{cat.icon}</span>
                        {t(cat.name)}
                      </span>
                      <small>
                        {formatLocalizedNumber(cat.count, language)} ({cat.pct}%)
                      </small>
                    </div>
                    <div className="fb-progress-bar-bg">
                      <div
                        className="fb-progress-bar-fill"
                        style={{
                          width: `${cat.pct}%`,
                          backgroundColor: cat.color
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-lg-6 col-12">
              <div className="fb-analytics-card">
                <div className="fb-analytics-header">
                  <h3 className="fb-analytics-title">
                    <i className="bi bi-shield-exclamation text-warning"></i>
                    {t("Inventory Overview")}
                  </h3>
                  <span className="badge bg-light text-dark border">
                    {t("Expiry Alert")}
                  </span>
                </div>

                <div className="fb-risk-row fb-risk-safe">
                  <div className="fb-risk-indicator">
                    <span className="fb-risk-dot"></span>
                    <span>{t("Safe")} (&gt; 5 {t("days")})</span>
                  </div>
                  <span className="fb-risk-badge bg-success-subtle text-success">
                    {formatLocalizedNumber(shelfLifeRisk.safe, language)} {t("Items")}
                  </span>
                </div>

                <div className="fb-risk-row fb-risk-warning">
                  <div className="fb-risk-indicator">
                    <span className="fb-risk-dot"></span>
                    <span>{t("Warning")} (3–5 {t("days")})</span>
                  </div>
                  <span className="fb-risk-badge bg-warning-subtle text-warning">
                    {formatLocalizedNumber(shelfLifeRisk.warning, language)} {t("Items")}
                  </span>
                </div>

                <div className="fb-risk-row fb-risk-critical">
                  <div className="fb-risk-indicator">
                    <span className="fb-risk-dot"></span>
                    <span>{t("Critical")} (0–2 {t("days")})</span>
                  </div>
                  <span className="fb-risk-badge bg-danger-subtle text-danger">
                    {formatLocalizedNumber(shelfLifeRisk.critical, language)} {t("Items")}
                  </span>
                </div>

                <div className="fb-risk-row fb-risk-expired">
                  <div className="fb-risk-indicator">
                    <span className="fb-risk-dot"></span>
                    <span>{t("Expired")}</span>
                  </div>
                  <span className="fb-risk-badge bg-secondary-subtle text-secondary">
                    {formatLocalizedNumber(shelfLifeRisk.expired, language)} {t("Items")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 6. Recent Products Table Card */}
          <div className="fb-table-card">
            <div className="fb-table-card-header">
              <h3 className="fb-table-title">
                <i className="bi bi-receipt text-primary"></i>
                {t("Recent Products")}
                <span className="badge bg-primary-subtle text-primary ms-1">
                  {filteredProducts.length}
                </span>
              </h3>

              <div className="fb-table-controls">
                <div className="fb-search-wrap">
                  <i className="bi bi-search"></i>
                  <input
                    type="text"
                    className="fb-search-input"
                    placeholder={t("Search Product...")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="fb-filter-tabs">
                  <button
                    type="button"
                    className={`fb-filter-btn ${
                      statusFilter === "ALL" ? "active" : ""
                    }`}
                    onClick={() => setStatusFilter("ALL")}
                  >
                    {t("Products")} ({products.length})
                  </button>
                  <button
                    type="button"
                    className={`fb-filter-btn ${
                      statusFilter === "Available" ? "active" : ""
                    }`}
                    onClick={() => setStatusFilter("Available")}
                  >
                    {t("Available")} ({availableCount})
                  </button>
                  <button
                    type="button"
                    className={`fb-filter-btn ${
                      statusFilter === "NearExpiry" ? "active" : ""
                    }`}
                    onClick={() => setStatusFilter("NearExpiry")}
                  >
                    {t("Near Expiry")} ({nearExpiry.length})
                  </button>
                  <button
                    type="button"
                    className={`fb-filter-btn ${
                      statusFilter === "Donated" ? "active" : ""
                    }`}
                    onClick={() => setStatusFilter("Donated")}
                  >
                    {t("Donated")} ({donatedCount})
                  </button>
                </div>
              </div>
            </div>

            <div className="fb-table-responsive">
              <table className="table fb-table align-middle">
                <thead>
                  <tr>
                    <th>{t("Name")}</th>
                    <th>{t("Category")}</th>
                    <th>{t("Quantity")}</th>
                    <th>{t("Expiry")}</th>
                    <th>{t("Status")}</th>
                    <th className="text-end">{t("Action")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-0">
                        <div className="fb-empty-state">
                          <div className="fb-empty-icon">
                            <i className="bi bi-box-seam"></i>
                          </div>
                          <h4 className="fb-empty-title">{t("No Products Yet")}</h4>
                          <p className="fb-empty-text">
                            {t("No products require immediate attention.")}
                          </p>
                          <button
                            className="btn fb-btn-primary-action btn-sm"
                            onClick={() => navigate("/add-product")}
                          >
                            <i className="bi bi-plus-lg me-1"></i>
                            {t("Add Product")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => {
                      const expiryInfo = getExpiryStatus(product.expiry_date);
                      return (
                        <tr key={product.id}>
                          <td>
                            <div className="fb-product-name">
                              <span>{t(product.product_name)}</span>
                            </div>
                          </td>
                          <td>
                            <span className="fb-category-chip">
                              {t(product.category)}
                            </span>
                          </td>
                          <td>
                            <span className="fb-qty-pill">
                              {formatLocalizedNumber(product.quantity, language)}{" "}
                              {t(product.unit)}
                            </span>
                          </td>
                          <td>
                            <div className="fb-date-text">
                              {formatLocalizedDate(product.expiry_date, language)}
                            </div>
                            {product.status === "Available" ? (
                              <span
                                className={`fb-expiry-badge ${expiryInfo.badgeClass}`}
                              >
                                <i className="bi bi-clock-history"></i>
                                {t(expiryInfo.text)}
                                {expiryInfo.daysLeft >= 0 && (
                                  <span> ({expiryInfo.daysLeft} {t("days")})</span>
                                )}
                              </span>
                            ) : (
                              <span className="text-muted small">—</span>
                            )}
                          </td>
                          <td>
                            <span
                              className={`fb-status-badge ${
                                product.status === "Available"
                                  ? "fb-status-available"
                                  : product.status === "Donated"
                                  ? "fb-status-donated"
                                  : "fb-status-accepted"
                              }`}
                            >
                              <i
                                className={`bi ${
                                  product.status === "Available"
                                    ? "bi-check-circle-fill"
                                    : product.status === "Donated"
                                    ? "bi-gift-fill"
                                    : "bi-arrow-left-right"
                                }`}
                              ></i>
                              {t(product.status)}
                            </span>
                          </td>
                          <td className="text-end">
                            <div className="fb-action-group justify-content-end">
                              {product.status === "Available" ? (
                                <>
                                  <button
                                    className="fb-table-btn fb-btn-edit"
                                    onClick={() =>
                                      navigate(`/edit-product/${product.id}`)
                                    }
                                    title={t("Edit")}
                                  >
                                    <i className="bi bi-pencil-fill"></i>
                                    {t("Edit")}
                                  </button>
                                  <button
                                    className="fb-table-btn fb-btn-donate"
                                    onClick={() => donateProduct(product.id)}
                                    title={t("Donate")}
                                  >
                                    <i className="bi bi-heart-fill"></i>
                                    {t("Donate")}
                                  </button>
                                  <button
                                    className="fb-table-btn fb-btn-delete"
                                    onClick={() => deleteProduct(product.id)}
                                    title={t("Delete")}
                                  >
                                    <i className="bi bi-trash3-fill"></i>
                                    {t("Delete")}
                                  </button>
                                </>
                              ) : product.status === "Donated" ? (
                                <button
                                  className="fb-table-btn fb-btn-disabled"
                                  disabled
                                >
                                  <i className="bi bi-box-seam me-1"></i>
                                  {t("Donated")}
                                </button>
                              ) : (
                                <button
                                  className="fb-table-btn fb-btn-disabled"
                                  disabled
                                >
                                  <i className="bi bi-check2-circle me-1"></i>
                                  {t("Accepted")}
                                </button>
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

export default BusinessDashboard;
