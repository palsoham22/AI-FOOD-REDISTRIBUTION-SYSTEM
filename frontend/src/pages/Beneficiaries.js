import React, { useState, useMemo } from "react";
import NGOSidebar from "../components/NGOSidebar";
import TopNavbar from "../components/TopNavbar";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { LABELS } from "../translations";
import { buildDynamicLabels } from "../utils/buildDynamicLabels";
import { formatLocalizedNumber } from "../utils/formatNumber";
import { useTranslationContext } from "../context/TranslationContext";
import "../styles/Beneficiaries.css";

function Beneficiaries() {
    // Dynamic beneficiary state (populated from real data or cache, defaults honestly to empty)
    const [beneficiaries] = useState(() => {
        try {
            const cached = localStorage.getItem("ngo_beneficiaries");
            if (cached) {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch (e) {
            console.error("Failed to parse cached beneficiaries:", e);
        }
        return [];
    });

    const t = useTranslate();
    const { language } = useTranslationContext();

    const dynamicLabels = useMemo(
        () =>
            buildDynamicLabels(
                [
                    ...LABELS.NGO_BENEFICIARIES,
                    ...LABELS.NGO_SIDEBAR
                ],
                beneficiaries,
                [
                    "name",
                    "category",
                    "contact_person",
                    "status"
                ]
            ),
        [beneficiaries]
    );

    usePageTranslation(dynamicLabels);

    // Dynamic metrics calculated only when real beneficiary records exist
    const activeCount = useMemo(() => {
        return beneficiaries.filter((b) => b.status === "Active").length;
    }, [beneficiaries]);

    const totalMealsServed = useMemo(() => {
        return beneficiaries.reduce((sum, b) => sum + (Number(b.meals_served) || 0), 0);
    }, [beneficiaries]);

    return (
        <>
            <NGOSidebar />

            <div className="beneficiaries-page">
                <TopNavbar />

                {/* 1. Page Header Card */}
                <div className="beneficiaries-header-card mb-4">
                    <div className="beneficiaries-header-main">
                        <div className="beneficiaries-avatar-box">
                            <span className="beneficiaries-avatar-icon">👥</span>
                        </div>
                        <div className="beneficiaries-header-info">
                            <div className="d-flex align-items-center flex-wrap gap-2 mb-1">
                                <h1 className="beneficiaries-title mb-0">{t("Beneficiaries")}</h1>
                                <span className="badge beneficiaries-status-pill">
                                    <span className="beneficiaries-pulse-dot" aria-hidden="true"></span>
                                    {formatLocalizedNumber(beneficiaries.length, language)} {t("Registered Beneficiaries")}
                                </span>
                            </div>
                            <p className="beneficiaries-subtitle mb-0">
                                {t("Organizations receiving food through the FoodBridge AI platform.")}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. Key Statistics Summary Cards (Displayed ONLY when real records exist; no fake values) */}
                {beneficiaries.length > 0 && (
                    <div className="row g-3 mb-4">
                        <div className="col-lg-4 col-md-6 col-12">
                            <div className="beneficiaries-kpi-card beneficiaries-kpi-blue">
                                <div className="beneficiaries-kpi-top">
                                    <span className="beneficiaries-kpi-label">{t("Total Beneficiaries")}</span>
                                    <span className="beneficiaries-kpi-icon-wrap">
                                        <i className="bi bi-people"></i>
                                    </span>
                                </div>
                                <div className="beneficiaries-kpi-value">
                                    {formatLocalizedNumber(beneficiaries.length, language)}
                                </div>
                                <div className="beneficiaries-kpi-bottom">
                                    <span>{t("Registered Beneficiaries")}</span>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-4 col-md-6 col-12">
                            <div className="beneficiaries-kpi-card beneficiaries-kpi-green">
                                <div className="beneficiaries-kpi-top">
                                    <span className="beneficiaries-kpi-label">{t("Active Beneficiaries")}</span>
                                    <span className="beneficiaries-kpi-icon-wrap">
                                        <i className="bi bi-check-circle"></i>
                                    </span>
                                </div>
                                <div className="beneficiaries-kpi-value">
                                    {formatLocalizedNumber(activeCount, language)}
                                </div>
                                <div className="beneficiaries-kpi-bottom">
                                    <span>{t("Active")}</span>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-4 col-md-12 col-12">
                            <div className="beneficiaries-kpi-card beneficiaries-kpi-orange">
                                <div className="beneficiaries-kpi-top">
                                    <span className="beneficiaries-kpi-label">{t("Meals Served")}</span>
                                    <span className="beneficiaries-kpi-icon-wrap">
                                        <i className="bi bi-heart"></i>
                                    </span>
                                </div>
                                <div className="beneficiaries-kpi-value">
                                    {formatLocalizedNumber(totalMealsServed, language)}
                                </div>
                                <div className="beneficiaries-kpi-bottom">
                                    <span>{t("Meals Served")}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. Beneficiaries Table Card */}
                <div className="beneficiaries-table-card">
                    <div className="beneficiaries-card-header">
                        <div className="d-flex align-items-center gap-2">
                            <h2 className="beneficiaries-card-title mb-0">{t("Registered Beneficiaries")}</h2>
                            <span className="badge beneficiaries-count-badge">
                                {formatLocalizedNumber(beneficiaries.length, language)} {t("Registered Beneficiaries")}
                            </span>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table beneficiaries-table">
                            <thead>
                                <tr>
                                    <th scope="col">{t("Organization")}</th>
                                    <th scope="col">{t("Category")}</th>
                                    <th scope="col">{t("Contact Person")}</th>
                                    <th scope="col">{t("Meals Served")}</th>
                                    <th scope="col" className="text-end">{t("Status")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {beneficiaries.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5">
                                            <div className="beneficiaries-empty-state">
                                                <div className="beneficiaries-empty-icon">
                                                    👥
                                                </div>
                                                <h3 className="beneficiaries-empty-title">
                                                    {t("No Beneficiaries Registered")}
                                                </h3>
                                                <p className="beneficiaries-empty-sub mb-0">
                                                    {t("Beneficiary records will appear here once registered.")}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    beneficiaries.map((b, index) => (
                                        <tr key={b.id || `b-${index}`}>
                                            <td>
                                                <div className="fw-semibold text-primary beneficiaries-org-title">
                                                    {t(b.name)}
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge beneficiaries-category-badge">
                                                    {t(b.category)}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="fw-medium text-main">
                                                    {b.contact_person || "—"}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="fw-bold text-main">
                                                    {formatLocalizedNumber(b.meals_served || 0, language)}
                                                </span>
                                            </td>
                                            <td className="text-end">
                                                <span
                                                    className={`badge beneficiaries-status-badge ${
                                                        b.status === "Active"
                                                            ? "status-active"
                                                            : "status-pending"
                                                    }`}
                                                >
                                                    <i
                                                        className={`bi ${
                                                            b.status === "Active"
                                                                ? "bi-check-circle"
                                                                : "bi-clock"
                                                        } me-1`}
                                                    ></i>
                                                    {t(b.status || "Active")}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Beneficiaries;
