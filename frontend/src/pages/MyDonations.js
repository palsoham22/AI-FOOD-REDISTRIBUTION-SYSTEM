import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import IndividualSidebar from "../components/IndividualSidebar";
import TopNavbar from "../components/TopNavbar";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { useTranslationContext } from "../context/TranslationContext";
import { LABELS } from "../translations";
import { buildDynamicLabels } from "../utils/buildDynamicLabels";
import { formatLocalizedDate } from "../utils/formatDate";
import { formatLocalizedNumber } from "../utils/formatNumber";
import "../styles/MyDonations.css";

const STATUS_FILTER_OPTIONS = [
    { value: "ALL", labelKey: "All Statuses" },
    { value: "Available", labelKey: "Available" },
    { value: "Accepted", labelKey: "Accepted" },
    { value: "Scheduled", labelKey: "Scheduled" },
    { value: "Out For Pickup", labelKey: "Out For Pickup" },
    { value: "Delivered", labelKey: "Delivered" },
    { value: "Expired", labelKey: "Expired" }
];

function MyDonations() {
    const t = useTranslate();
    const { language } = useTranslationContext();

    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [selectedDonation, setSelectedDonation] = useState(null);

    const dynamicLabels = useMemo(
        () =>
            buildDynamicLabels(
                LABELS.MY_DONATIONS,
                donations,
                [
                    "product_name",
                    "category",
                    "unit",
                    "status"
                ]
            ),
        [donations]
    );

    usePageTranslation(dynamicLabels);

    const fetchDonations = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("access");
            const response = await axios.get(
                "http://127.0.0.1:8000/api/inventory/individual/my-donations/",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            if (Array.isArray(response.data)) {
                setDonations(response.data);
            } else {
                setDonations([]);
            }
        } catch (err) {
            console.error("Failed to fetch donations:", err);
            setError(t("Unable to load donations."));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchDonations();
    }, [fetchDonations]);

    // Handle ESC key to dismiss modal
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && selectedDonation) {
                setSelectedDonation(null);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedDonation]);

    // Client-side search and filtering based on real fields
    const filteredDonations = useMemo(() => {
        return donations.filter((item) => {
            const query = searchQuery.trim().toLowerCase();
            const matchesQuery =
                !query ||
                (item.product_name && item.product_name.toLowerCase().includes(query)) ||
                (item.category && item.category.toLowerCase().includes(query)) ||
                (item.status && item.status.toLowerCase().includes(query)) ||
                (item.pickup_address && item.pickup_address.toLowerCase().includes(query));

            const matchesStatus =
                statusFilter === "ALL" ||
                (item.status && item.status.toLowerCase() === statusFilter.toLowerCase());

            return matchesQuery && matchesStatus;
        });
    }, [donations, searchQuery, statusFilter]);

    const getStatusBadge = (status) => {
        const raw = (status || "").toLowerCase().trim();
        let badgeClass = "status-default";

        if (raw === "delivered") {
            badgeClass = "status-delivered";
        } else if (raw === "accepted") {
            badgeClass = "status-accepted";
        } else if (raw === "scheduled") {
            badgeClass = "status-scheduled";
        } else if (raw === "out for pickup" || raw === "out_for_pickup") {
            badgeClass = "status-out-for-pickup";
        } else if (raw === "available") {
            badgeClass = "status-available";
        } else if (raw === "expired") {
            badgeClass = "status-expired";
        } else if (raw === "pending") {
            badgeClass = "status-pending";
        }

        return (
            <span className={`my-status-badge ${badgeClass}`}>
                <span className="status-dot" aria-hidden="true"></span>
                <span>{t(status || "Available")}</span>
            </span>
        );
    };

    const handleClearFilters = () => {
        setSearchQuery("");
        setStatusFilter("ALL");
    };

    return (
        <>
            <IndividualSidebar />

            <main className="my-donations-page">
                <TopNavbar />

                {/* Page Header Banner */}
                <header className="my-donations-header-banner">
                    <div className="my-donations-header-left">
                        <div className="my-donations-header-icon-wrap" aria-hidden="true">
                            <i className="bi bi-box2-heart-fill"></i>
                        </div>
                        <div className="my-donations-header-text">
                            <h1 className="my-donations-title">{t("My Donations")}</h1>
                            <p className="my-donations-subtitle">
                                {t("Track and manage all your submitted food donations.")}
                            </p>
                        </div>
                    </div>

                    <div className="my-donations-header-actions">
                        <span className="my-donations-count-badge">
                            <i className="bi bi-box-seam" aria-hidden="true"></i>
                            <span>
                                {formatLocalizedNumber(donations.length, language)} {t("Total Donations")}
                            </span>
                        </span>
                        <Link
                            to="/donate-food"
                            className="btn-donate-cta"
                            aria-label={t("Donate Food")}
                        >
                            <i className="bi bi-plus-circle-fill"></i>
                            <span>{t("Donate Food")}</span>
                        </Link>
                    </div>
                </header>

                {/* Error Banner */}
                {error && (
                    <div className="my-donations-error-banner" role="alert">
                        <div className="my-donations-error-left">
                            <i className="bi bi-exclamation-triangle-fill"></i>
                            <span>{error}</span>
                        </div>
                        <button
                            type="button"
                            className="btn-error-retry"
                            onClick={fetchDonations}
                        >
                            <i className="bi bi-arrow-clockwise"></i>
                            <span>{t("Retry")}</span>
                        </button>
                    </div>
                )}

                {/* Search & Filter Bar */}
                <section className="my-donations-controls-card" aria-label={t("Filter by Status")}>
                    <div className="my-donations-search-wrap">
                        <i className="bi bi-search my-donations-search-icon" aria-hidden="true"></i>
                        <input
                            type="text"
                            className="my-donations-search-input"
                            placeholder={t("Search donations...")}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            aria-label={t("Search donations...")}
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                className="my-donations-search-clear"
                                onClick={() => setSearchQuery("")}
                                aria-label="Clear search"
                            >
                                <i className="bi bi-x-circle-fill"></i>
                            </button>
                        )}
                    </div>

                    <div className="my-donations-filters-wrap">
                        <select
                            className="my-donations-filter-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            aria-label={t("Filter by Status")}
                        >
                            {STATUS_FILTER_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {t(opt.labelKey)}
                                </option>
                            ))}
                        </select>

                        {(searchQuery || statusFilter !== "ALL") && (
                            <button
                                type="button"
                                className="btn-clear-filters"
                                onClick={handleClearFilters}
                            >
                                <i className="bi bi-x-lg"></i>
                                <span>{t("Clear Filters")}</span>
                            </button>
                        )}
                    </div>
                </section>

                {/* Main Table Card */}
                <section className="my-donations-table-card">
                    <div className="my-donations-table-header">
                        <div className="my-donations-table-header-left">
                            <i className="bi bi-clock-history"></i>
                            <div>
                                <h2>{t("Donation Details")}</h2>
                                <p>{t("Track your food donations and their current status.")}</p>
                            </div>
                        </div>

                        {!loading && (
                            <span className="my-donations-showing-count">
                                {formatLocalizedNumber(filteredDonations.length, language)} / {formatLocalizedNumber(donations.length, language)}
                            </span>
                        )}
                    </div>

                    {loading ? (
                        /* Skeleton Loading Rows */
                        <div
                            className="my-donations-table-wrapper"
                            aria-busy="true"
                            aria-label={t("Loading donations...")}
                        >
                            <table className="my-donations-table">
                                <thead>
                                    <tr>
                                        <th>{t("Food")}</th>
                                        <th>{t("Quantity")}</th>
                                        <th>{t("Expiry")}</th>
                                        <th>{t("Submitted On")}</th>
                                        <th>{t("Status")}</th>
                                        <th>{t("Actions")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[1, 2, 3, 4, 5].map((idx) => (
                                        <tr key={idx} className="my-donations-skeleton-row">
                                            <td>
                                                <div className="skeleton-bar" style={{ width: "65%" }}></div>
                                            </td>
                                            <td>
                                                <div className="skeleton-bar" style={{ width: "50%" }}></div>
                                            </td>
                                            <td>
                                                <div className="skeleton-bar" style={{ width: "60%" }}></div>
                                            </td>
                                            <td>
                                                <div className="skeleton-bar" style={{ width: "55%" }}></div>
                                            </td>
                                            <td>
                                                <div className="skeleton-bar" style={{ width: "45%" }}></div>
                                            </td>
                                            <td>
                                                <div className="skeleton-bar" style={{ width: "40%", marginLeft: "auto" }}></div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : donations.length === 0 ? (
                        /* Zero Total Donations Empty State */
                        <div className="my-donations-empty">
                            <div className="my-donations-empty-icon" aria-hidden="true">
                                <i className="bi bi-inbox-fill"></i>
                            </div>
                            <h3 className="my-donations-empty-title">{t("No donations found")}</h3>
                            <p className="my-donations-empty-desc">
                                {t("You have not submitted any food donations yet.")}
                            </p>
                            <Link to="/donate-food" className="btn-donate-cta">
                                <i className="bi bi-plus-circle-fill"></i>
                                <span>{t("Donate Food")}</span>
                            </Link>
                        </div>
                    ) : filteredDonations.length === 0 ? (
                        /* Zero Matches for Search/Filter */
                        <div className="my-donations-empty">
                            <div className="my-donations-empty-icon" aria-hidden="true">
                                <i className="bi bi-search"></i>
                            </div>
                            <h3 className="my-donations-empty-title">{t("No matching donations")}</h3>
                            <p className="my-donations-empty-desc">
                                {t("No donations match your search or filter criteria.")}
                            </p>
                            <button
                                type="button"
                                className="btn-clear-filters"
                                onClick={handleClearFilters}
                            >
                                <i className="bi bi-x-lg"></i>
                                <span>{t("Clear Filters")}</span>
                            </button>
                        </div>
                    ) : (
                        /* Polished Responsive Table */
                        <div className="my-donations-table-wrapper">
                            <table className="my-donations-table">
                                <thead>
                                    <tr>
                                        <th>{t("Food")}</th>
                                        <th>{t("Quantity")}</th>
                                        <th>{t("Expiry")}</th>
                                        <th>{t("Submitted On")}</th>
                                        <th>{t("Status")}</th>
                                        <th>{t("Actions")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredDonations.map((item) => (
                                        <tr key={item.id}>
                                            <td>
                                                <div className="cell-product-name">
                                                    <span className="cell-product-title">
                                                        {t(item.product_name)}
                                                    </span>
                                                    {item.category && (
                                                        <span className="cell-category-pill">
                                                            {t(item.category)}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <span>
                                                    {formatLocalizedNumber(item.quantity, language)}{" "}
                                                    {t(item.unit || "Kg")}
                                                </span>
                                            </td>
                                            <td>
                                                <span>
                                                    {formatLocalizedDate(item.expiry_date, language)}
                                                </span>
                                            </td>
                                            <td>
                                                <span>
                                                    {formatLocalizedDate(item.created_at, language)}
                                                </span>
                                            </td>
                                            <td>
                                                {getStatusBadge(item.status)}
                                            </td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="btn-action-view"
                                                    onClick={() => setSelectedDonation(item)}
                                                    aria-label={`${t("View Details")} - ${item.product_name}`}
                                                >
                                                    <i className="bi bi-eye"></i>
                                                    <span>{t("View Details")}</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </main>

            {/* View Details Accessible Modal */}
            {selectedDonation && (
                <div
                    className="my-modal-backdrop"
                    onClick={() => setSelectedDonation(null)}
                    role="presentation"
                >
                    <div
                        className="my-modal-dialog"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="modal-details-title"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <header className="my-modal-header">
                            <div className="my-modal-header-left">
                                <div className="my-modal-icon" aria-hidden="true">
                                    <i className="bi bi-info-circle-fill"></i>
                                </div>
                                <h3 id="modal-details-title" className="my-modal-title">
                                    {t("Donation Details")}
                                </h3>
                            </div>
                            <button
                                type="button"
                                className="btn-modal-close"
                                onClick={() => setSelectedDonation(null)}
                                aria-label={t("Close")}
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </header>

                        <div className="my-modal-body">
                            <div className="my-modal-grid">
                                <div className="my-modal-field">
                                    <span className="my-modal-label">{t("Food Name")}</span>
                                    <span className="my-modal-value">{selectedDonation.product_name}</span>
                                </div>

                                <div className="my-modal-field">
                                    <span className="my-modal-label">{t("Category")}</span>
                                    <span className="my-modal-value">{t(selectedDonation.category || "-")}</span>
                                </div>

                                <div className="my-modal-field">
                                    <span className="my-modal-label">{t("Quantity")}</span>
                                    <span className="my-modal-value">
                                        {formatLocalizedNumber(selectedDonation.quantity, language)}{" "}
                                        {t(selectedDonation.unit || "Kg")}
                                    </span>
                                </div>

                                <div className="my-modal-field">
                                    <span className="my-modal-label">{t("Storage Type")}</span>
                                    <span className="my-modal-value">{t(selectedDonation.storage_type || "-")}</span>
                                </div>

                                <div className="my-modal-field">
                                    <span className="my-modal-label">{t("Expiry Date")}</span>
                                    <span className="my-modal-value">
                                        {formatLocalizedDate(selectedDonation.expiry_date, language)}
                                    </span>
                                </div>

                                <div className="my-modal-field">
                                    <span className="my-modal-label">{t("Status")}</span>
                                    <div>{getStatusBadge(selectedDonation.status)}</div>
                                </div>

                                <div className="my-modal-field">
                                    <span className="my-modal-label">{t("Submitted On")}</span>
                                    <span className="my-modal-value">
                                        {formatLocalizedDate(selectedDonation.created_at, language)}
                                    </span>
                                </div>

                                {selectedDonation.contact_number && (
                                    <div className="my-modal-field">
                                        <span className="my-modal-label">{t("Contact Number")}</span>
                                        <span className="my-modal-value">{selectedDonation.contact_number}</span>
                                    </div>
                                )}

                                {selectedDonation.pickup_address && (
                                    <div className="my-modal-field full-width">
                                        <span className="my-modal-label">{t("Pickup Address")}</span>
                                        <span className="my-modal-value">{selectedDonation.pickup_address}</span>
                                    </div>
                                )}

                                {selectedDonation.description && (
                                    <div className="my-modal-field full-width">
                                        <span className="my-modal-label">{t("Description")}</span>
                                        <span className="my-modal-value">{selectedDonation.description}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <footer className="my-modal-footer">
                            <button
                                type="button"
                                className="btn-modal-footer-close"
                                onClick={() => setSelectedDonation(null)}
                            >
                                {t("Close")}
                            </button>
                        </footer>
                    </div>
                </div>
            )}
        </>
    );
}

export default MyDonations;
