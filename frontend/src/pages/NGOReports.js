import React, { useState, useMemo } from "react";
import NGOSidebar from "../components/NGOSidebar";
import TopNavbar from "../components/TopNavbar";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { LABELS } from "../translations";
import { buildDynamicLabels } from "../utils/buildDynamicLabels";
import { formatLocalizedNumber } from "../utils/formatNumber";
import { useTranslationContext } from "../context/TranslationContext";
import "../styles/NGOReports.css";

function NGOReports() {
    // Dynamic reports state (populated from real data or cache, defaults honestly to empty)
    const [reportData] = useState(() => {
        try {
            const cached = localStorage.getItem("ngo_reports");
            if (cached) {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) {
            console.error("Failed to parse cached report data:", e);
        }
        return [];
    });

    const t = useTranslate();
    const { language } = useTranslationContext();

    const dynamicLabels = useMemo(
        () =>
            buildDynamicLabels(
                [
                    ...LABELS.NGO_REPORTS,
                    ...LABELS.NGO_SIDEBAR
                ],
                reportData,
                [
                    "month",
                    "status"
                ]
            ),
        [reportData]
    );

    usePageTranslation(dynamicLabels);

    // Calculated metrics if real report records exist in the future
    const totalDonations = useMemo(() => {
        return reportData.reduce((sum, item) => sum + (Number(item.donations) || 0), 0);
    }, [reportData]);

    const totalMeals = useMemo(() => {
        return reportData.reduce((sum, item) => sum + (Number(item.meals_served) || 0), 0);
    }, [reportData]);

    return (
        <>
            <NGOSidebar />

            <div className="reports-page">
                <TopNavbar />

                {/* 1. Page Header Card */}
                <div className="reports-header-card mb-4">
                    <div className="reports-header-main">
                        <div className="reports-avatar-box">
                            <span className="reports-avatar-icon">📊</span>
                        </div>
                        <div className="reports-header-info">
                            <div className="d-flex align-items-center flex-wrap gap-2 mb-1">
                                <h1 className="reports-title mb-0">{t("NGO Reports")}</h1>
                                <span className="badge reports-status-pill">
                                    <span className="reports-pulse-dot" aria-hidden="true"></span>
                                    {reportData.length > 0
                                        ? `${formatLocalizedNumber(reportData.length, language)} ${t("Monthly Summary")}`
                                        : t("No Report Data Available")}
                                </span>
                            </div>
                            <p className="reports-subtitle mb-0">
                                {t("View donation, pickup, and impact reports when data is available.")}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. Key Statistics Summary Cards (Rendered ONLY when real report data exists; no fake numbers) */}
                {reportData.length > 0 && (
                    <div className="row g-3 mb-4">
                        <div className="col-lg-6 col-12">
                            <div className="reports-kpi-card reports-kpi-blue">
                                <div className="reports-kpi-top">
                                    <span className="reports-kpi-label">{t("Donations")}</span>
                                    <span className="reports-kpi-icon-wrap">
                                        <i className="bi bi-box-seam"></i>
                                    </span>
                                </div>
                                <div className="reports-kpi-value">
                                    {formatLocalizedNumber(totalDonations, language)}
                                </div>
                                <div className="reports-kpi-bottom">
                                    <span>{t("Monthly Summary")}</span>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-6 col-12">
                            <div className="reports-kpi-card reports-kpi-green">
                                <div className="reports-kpi-top">
                                    <span className="reports-kpi-label">{t("Meals Served")}</span>
                                    <span className="reports-kpi-icon-wrap">
                                        <i className="bi bi-heart"></i>
                                    </span>
                                </div>
                                <div className="reports-kpi-value">
                                    {formatLocalizedNumber(totalMeals, language)}
                                </div>
                                <div className="reports-kpi-bottom">
                                    <span>{t("Completed")}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. Main Report Card */}
                <div className="reports-main-card">
                    <div className="reports-card-header">
                        <div className="d-flex align-items-center gap-2">
                            <h2 className="reports-card-title mb-0">{t("Monthly Summary")}</h2>
                            <span className="badge reports-count-badge">
                                {formatLocalizedNumber(reportData.length, language)} {t("Donations")}
                            </span>
                        </div>
                    </div>

                    <div className="card-body p-0">
                        {reportData.length === 0 ? (
                            /* Polished, honest Empty State */
                            <div className="reports-empty-state">
                                <div className="reports-empty-icon" aria-hidden="true">
                                    📊
                                </div>
                                <h3 className="reports-empty-title">
                                    {t("No Report Data Available")}
                                </h3>
                                <p className="reports-empty-sub mb-4">
                                    {t("Reports will appear here once sufficient donation, pickup, and impact data is available.")}
                                </p>

                                {/* Informational feature previews */}
                                <div className="reports-preview-grid">
                                    <div className="reports-preview-card">
                                        <div className="reports-preview-icon">📦</div>
                                        <div className="reports-preview-info">
                                            <h4 className="reports-preview-title">
                                                {t("Donation & Impact Summaries")}
                                            </h4>
                                            <p className="reports-preview-desc mb-0">
                                                {t("Track all donated products and their current status.")}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="reports-preview-card">
                                        <div className="reports-preview-icon">🚚</div>
                                        <div className="reports-preview-info">
                                            <h4 className="reports-preview-title">
                                                {t("Pickup & Delivery Metrics")}
                                            </h4>
                                            <p className="reports-preview-desc mb-0">
                                                {t("Track all donated products and their current status.")}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="reports-preview-card">
                                        <div className="reports-preview-icon">📈</div>
                                        <div className="reports-preview-info">
                                            <h4 className="reports-preview-title">
                                                {t("Monthly Performance Analytics")}
                                            </h4>
                                            <p className="reports-preview-desc mb-0">
                                                {t("View monthly NGO performance and impact statistics.") || t("View donation, pickup, and impact reports when data is available.")}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Real table rendered when real reports exist */
                            <div className="table-responsive">
                                <table className="table reports-table">
                                    <thead>
                                        <tr>
                                            <th scope="col">{t("Month")}</th>
                                            <th scope="col">{t("Donations")}</th>
                                            <th scope="col" className="text-end">{t("Meals Served")}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.map((item, index) => (
                                            <tr key={item.id || `report-${index}`}>
                                                <td>
                                                    <span className="fw-semibold text-primary">
                                                        {t(item.month)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="fw-medium text-main">
                                                        {formatLocalizedNumber(item.donations, language)}
                                                    </span>
                                                </td>
                                                <td className="text-end">
                                                    <span className="badge reports-meals-badge">
                                                        {formatLocalizedNumber(item.meals_served, language)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default NGOReports;
