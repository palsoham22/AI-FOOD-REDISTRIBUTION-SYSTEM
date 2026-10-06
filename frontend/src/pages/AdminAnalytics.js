import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from "recharts";
import AdminSidebar from "../components/AdminSidebar";
import TopNavbar from "../components/TopNavbar";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { LABELS } from "../translations";
import { formatLocalizedNumber } from "../utils/formatNumber";
import { useTranslationContext } from "../context/TranslationContext";
import { useTheme } from "../context/ThemeContext";
import "../styles/AdminAnalytics.css";

const STATUS_COLOR_MAP = {
    Available: "#16A34A",
    Donated: "#16A34A",
    Accepted: "#7C3AED",
    Scheduled: "#F59E0B",
    "Out For Pickup": "#0284C7",
    Delivered: "#0F766E",
    Completed: "#0D9488",
    Expired: "#DC2626"
};

const DEFAULT_CHART_COLOR = "#64748B";

function AdminAnalytics() {
    const t = useTranslate();
    const { language } = useTranslationContext();
    const { isDark } = useTheme();

    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    usePageTranslation(LABELS.ADMIN_ANALYTICS);

    const fetchAnalytics = useCallback(async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        setError(null);

        try {
            const token = localStorage.getItem("access");
            const response = await axios.get(
                process.env.REACT_APP_API_URL + "/api/inventory/admin/analytics/",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setAnalytics(response.data || {});
        } catch (err) {
            console.error("Failed to fetch admin analytics:", err);
            setError(t("Unable to load analytics data."));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [t]);

    useEffect(() => {
        fetchAnalytics(false);
    }, [fetchAnalytics]);

    // Data for Status Distribution Pie/Donut Chart
    const statusPieData = useMemo(() => {
        if (!analytics) return [];
        const dist = analytics.status_distribution || {
            Available: analytics.available || 0,
            Accepted: analytics.accepted || 0,
            Scheduled: analytics.scheduled || 0,
            Delivered: analytics.delivered || 0,
            Completed: analytics.completed || 0,
            "Out For Pickup": analytics.out_for_pickup || 0,
            Donated: analytics.donated || 0,
            Expired: analytics.expired || 0
        };

        return Object.entries(dist)
            .filter(([_, count]) => count > 0)
            .map(([statusKey, count]) => ({
                name: t(statusKey),
                rawStatus: statusKey,
                value: count,
                color: STATUS_COLOR_MAP[statusKey] || DEFAULT_CHART_COLOR
            }));
    }, [analytics, t]);

    // Data for Food Category Breakdown Bar Chart
    const categoryBarData = useMemo(() => {
        if (!analytics || !analytics.category_distribution) return [];
        return Object.entries(analytics.category_distribution)
            .map(([cat, count]) => ({
                category: t(cat),
                rawCategory: cat,
                count: count || 0
            }))
            .sort((a, b) => b.count - a.count);
    }, [analytics, t]);

    // Data for Stakeholder Ecosystem Bar Chart
    const stakeholderBarData = useMemo(() => {
        if (!analytics) return [];
        return [
            {
                role: t("Businesses"),
                count: analytics.businesses || 0,
                fill: "#2563EB"
            },
            {
                role: t("NGOs"),
                count: analytics.ngos || 0,
                fill: "#0F766E"
            },
            {
                role: t("Delivery Partners"),
                count: analytics.delivery || 0,
                fill: "#D97706"
            },
            {
                role: t("Individual Donors"),
                count: analytics.individual_donors || 0,
                fill: "#0284C7"
            }
        ];
    }, [analytics, t]);

    // Totals for textual summaries
    const totalStatusItems = useMemo(
        () => statusPieData.reduce((acc, curr) => acc + curr.value, 0),
        [statusPieData]
    );

    const totalCategoryItems = useMemo(
        () => categoryBarData.reduce((acc, curr) => acc + curr.count, 0),
        [categoryBarData]
    );

    // Chart styling tokens based on theme
    const gridStroke = isDark ? "#334155" : "#E2E8F0";
    const axisStroke = isDark ? "#94A3B8" : "#64748B";
    const tooltipContentStyle = {
        backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
        borderColor: isDark ? "#334155" : "#E2E8F0",
        borderRadius: "12px",
        color: isDark ? "#F8FAFC" : "#0F172A",
        boxShadow: isDark
            ? "0 10px 15px -3px rgba(0, 0, 0, 0.5)"
            : "0 10px 15px -3px rgba(0, 0, 0, 0.08)"
    };
    const tooltipItemStyle = {
        color: isDark ? "#F8FAFC" : "#0F172A",
        fontWeight: 600
    };
    const legendWrapperStyle = {
        color: isDark ? "#CBD5E1" : "#475569",
        fontSize: "13px",
        paddingTop: "12px"
    };

    return (
        <div className="admin-wrapper">
            <AdminSidebar />

            <div className="admin-analytics-page">
                <TopNavbar />

                {/* Hero Banner */}
                <header className="admin-an-hero-banner">
                    <div className="admin-an-hero-content">
                        <div className="admin-an-hero-badge">
                            <i className="bi bi-bar-chart-line-fill me-2"></i>
                            {t("Platform Performance & Analytics")}
                        </div>
                        <h1 className="admin-an-hero-title">{t("Analytics Dashboard")}</h1>
                        <p className="admin-an-hero-subtitle">
                            {t("Real-time operational metrics, donation status distributions, and stakeholder insights.")}
                        </p>
                        <div className="admin-an-hero-disclaimer">
                            <i className="bi bi-info-circle-fill"></i>
                            <span>
                                {t("Operational Notice: Analytics are calculated directly from live database records. No simulated growth projections or payment metrics exist.")}
                            </span>
                        </div>
                    </div>

                    <div className="admin-an-hero-actions">
                        <button
                            type="button"
                            className="admin-an-refresh-btn"
                            onClick={() => fetchAnalytics(true)}
                            disabled={loading || refreshing}
                            title={t("Refresh")}
                            aria-label={t("Refresh")}
                        >
                            <i className={`bi bi-arrow-clockwise ${refreshing ? "spin-icon" : ""}`}></i>
                            <span>{refreshing ? t("Refreshing...") : t("Refresh")}</span>
                        </button>
                    </div>
                </header>

                {/* Error Banner */}
                {error && (
                    <div className="admin-an-error-card" role="alert">
                        <div className="d-flex align-items-center gap-2">
                            <i className="bi bi-exclamation-triangle-fill fs-5"></i>
                            <span>{error}</span>
                        </div>
                        <button
                            type="button"
                            className="admin-an-retry-btn"
                            onClick={() => fetchAnalytics(false)}
                        >
                            <i className="bi bi-arrow-repeat"></i>
                            {t("Retry")}
                        </button>
                    </div>
                )}

                {/* Section 1: Operational Food Metrics */}
                <div className="admin-an-section-header">
                    <h2 className="admin-an-section-title">
                        <i className="bi bi-box2-heart text-primary"></i>
                        <span>{t("Operational Food Metrics")}</span>
                    </h2>
                </div>

                <section className="admin-an-kpi-grid" aria-label="Operational Food Metrics">
                    {loading ? (
                        [...Array(4)].map((_, i) => (
                            <div key={i} className="admin-an-skeleton-kpi"></div>
                        ))
                    ) : (
                        <>
                            <div className="admin-an-kpi-card">
                                <div className="admin-an-kpi-icon blue">
                                    <i className="bi bi-box-seam"></i>
                                </div>
                                <div className="admin-an-kpi-info">
                                    <div className="admin-an-kpi-title">{t("Total Products")}</div>
                                    <div className="admin-an-kpi-value">
                                        {formatLocalizedNumber(analytics?.products || 0, language)}
                                    </div>
                                </div>
                            </div>

                            <div className="admin-an-kpi-card">
                                <div className="admin-an-kpi-icon teal">
                                    <i className="bi bi-check2-all"></i>
                                </div>
                                <div className="admin-an-kpi-info">
                                    <div className="admin-an-kpi-title">{t("Delivered & Completed")}</div>
                                    <div className="admin-an-kpi-value">
                                        {formatLocalizedNumber(
                                            (analytics?.delivered || 0) + (analytics?.completed || 0),
                                            language
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="admin-an-kpi-card">
                                <div className="admin-an-kpi-icon purple">
                                    <i className="bi bi-arrow-repeat"></i>
                                </div>
                                <div className="admin-an-kpi-info">
                                    <div className="admin-an-kpi-title">{t("Active Allocations")}</div>
                                    <div className="admin-an-kpi-value">
                                        {formatLocalizedNumber(
                                            (analytics?.accepted || 0) +
                                                (analytics?.scheduled || 0) +
                                                (analytics?.out_for_pickup || 0),
                                            language
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="admin-an-kpi-card">
                                <div className="admin-an-kpi-icon emerald">
                                    <i className="bi bi-heart-pulse"></i>
                                </div>
                                <div className="admin-an-kpi-info">
                                    <div className="admin-an-kpi-title">{t("Available Surplus")}</div>
                                    <div className="admin-an-kpi-value">
                                        {formatLocalizedNumber(
                                            (analytics?.available || 0) + (analytics?.donated || 0),
                                            language
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </section>

                {/* Section 2: Platform Community & Stakeholders */}
                <div className="admin-an-section-header">
                    <h2 className="admin-an-section-title">
                        <i className="bi bi-people-fill text-primary"></i>
                        <span>{t("Community & Stakeholders")}</span>
                    </h2>
                </div>

                <section className="admin-an-kpi-grid" aria-label="Community & Stakeholders">
                    {loading ? (
                        [...Array(4)].map((_, i) => (
                            <div key={i} className="admin-an-skeleton-kpi"></div>
                        ))
                    ) : (
                        <>
                            <div className="admin-an-kpi-card">
                                <div className="admin-an-kpi-icon blue">
                                    <i className="bi bi-building"></i>
                                </div>
                                <div className="admin-an-kpi-info">
                                    <div className="admin-an-kpi-title">{t("Total Businesses")}</div>
                                    <div className="admin-an-kpi-value">
                                        {formatLocalizedNumber(analytics?.businesses || 0, language)}
                                    </div>
                                </div>
                            </div>

                            <div className="admin-an-kpi-card">
                                <div className="admin-an-kpi-icon teal">
                                    <i className="bi bi-shield-check"></i>
                                </div>
                                <div className="admin-an-kpi-info">
                                    <div className="admin-an-kpi-title">{t("Total NGOs")}</div>
                                    <div className="admin-an-kpi-value">
                                        {formatLocalizedNumber(analytics?.ngos || 0, language)}
                                    </div>
                                </div>
                            </div>

                            <div className="admin-an-kpi-card">
                                <div className="admin-an-kpi-icon amber">
                                    <i className="bi bi-truck"></i>
                                </div>
                                <div className="admin-an-kpi-info">
                                    <div className="admin-an-kpi-title">{t("Delivery Partners")}</div>
                                    <div className="admin-an-kpi-value">
                                        {formatLocalizedNumber(analytics?.delivery || 0, language)}
                                    </div>
                                </div>
                            </div>

                            <div className="admin-an-kpi-card">
                                <div className="admin-an-kpi-icon sky">
                                    <i className="bi bi-person-heart"></i>
                                </div>
                                <div className="admin-an-kpi-info">
                                    <div className="admin-an-kpi-title">{t("Individual Donors")}</div>
                                    <div className="admin-an-kpi-value">
                                        {formatLocalizedNumber(analytics?.individual_donors || 0, language)}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </section>

                {/* Visualizations Row 1: Status Distribution & Category Breakdown */}
                <div className="admin-an-charts-row">
                    {/* Chart 1: Status Distribution Donut Chart */}
                    <div className="admin-an-chart-card">
                        <div className="admin-an-chart-header">
                            <h3 className="admin-an-chart-title">
                                <i className="bi bi-pie-chart-fill text-primary"></i>
                                <span>{t("Status Distribution")}</span>
                            </h3>
                            <p className="admin-an-chart-desc">
                                {t("Breakdown of food items across their operational redistribution lifecycle.")}
                            </p>
                        </div>

                        <div className="admin-an-chart-body">
                            {loading ? (
                                <div className="admin-an-skeleton-chart w-100"></div>
                            ) : statusPieData.length === 0 ? (
                                <div className="admin-an-chart-empty">
                                    <i className="bi bi-inbox"></i>
                                    <div>{t("No items recorded in this distribution.")}</div>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={320}>
                                    <PieChart>
                                        <Pie
                                            data={statusPieData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={105}
                                            paddingAngle={3}
                                        >
                                            {statusPieData.map((entry) => (
                                                <Cell key={entry.rawStatus} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={tooltipContentStyle}
                                            itemStyle={tooltipItemStyle}
                                            formatter={(value, name) => {
                                                const pct = totalStatusItems > 0
                                                    ? ` (${Math.round((value / totalStatusItems) * 100)}%)`
                                                    : "";
                                                return [
                                                    `${formatLocalizedNumber(value, language)}${pct}`,
                                                    name
                                                ];
                                            }}
                                        />
                                        <Legend wrapperStyle={legendWrapperStyle} />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        {/* Accessible Text Summary */}
                        {!loading && statusPieData.length > 0 && (
                            <div className="mt-3 pt-3 border-top d-flex flex-wrap gap-2 justify-content-center">
                                {statusPieData.map((item) => (
                                    <span
                                        key={item.rawStatus}
                                        className="badge bg-light text-dark border d-inline-flex align-items-center gap-1"
                                    >
                                        <span
                                            style={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: "50%",
                                                backgroundColor: item.color,
                                                display: "inline-block"
                                            }}
                                        ></span>
                                        <span className="fw-medium">{item.name}:</span>
                                        <strong>{formatLocalizedNumber(item.value, language)}</strong>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Chart 2: Food Category Breakdown Bar Chart */}
                    <div className="admin-an-chart-card">
                        <div className="admin-an-chart-header">
                            <h3 className="admin-an-chart-title">
                                <i className="bi bi-bar-chart-fill text-primary"></i>
                                <span>{t("Food Category Breakdown")}</span>
                            </h3>
                            <p className="admin-an-chart-desc">
                                {t("Total volume of food items categorized by product classification.")}
                            </p>
                        </div>

                        <div className="admin-an-chart-body">
                            {loading ? (
                                <div className="admin-an-skeleton-chart w-100"></div>
                            ) : categoryBarData.length === 0 ? (
                                <div className="admin-an-chart-empty">
                                    <i className="bi bi-inbox"></i>
                                    <div>{t("No items recorded in this distribution.")}</div>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={320}>
                                    <BarChart
                                        data={categoryBarData}
                                        margin={{ top: 10, right: 15, left: -10, bottom: 25 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                                        <XAxis
                                            dataKey="category"
                                            stroke={axisStroke}
                                            tick={{ fill: axisStroke, fontSize: 12 }}
                                            angle={-20}
                                            textAnchor="end"
                                        />
                                        <YAxis
                                            allowDecimals={false}
                                            stroke={axisStroke}
                                            tick={{ fill: axisStroke, fontSize: 12 }}
                                        />
                                        <Tooltip
                                            contentStyle={tooltipContentStyle}
                                            itemStyle={tooltipItemStyle}
                                            formatter={(value) => {
                                                const pct = totalCategoryItems > 0
                                                    ? ` (${Math.round((value / totalCategoryItems) * 100)}%)`
                                                    : "";
                                                return [
                                                    `${formatLocalizedNumber(value, language)}${pct}`,
                                                    t("Items")
                                                ];
                                            }}
                                        />
                                        <Bar
                                            dataKey="count"
                                            name={t("Items")}
                                            fill="#2563EB"
                                            radius={[6, 6, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        {/* Accessible Text Summary */}
                        {!loading && categoryBarData.length > 0 && (
                            <div className="mt-3 pt-3 border-top d-flex flex-wrap gap-2 justify-content-center">
                                {categoryBarData.map((item) => (
                                    <span
                                        key={item.rawCategory}
                                        className="badge bg-light text-dark border d-inline-flex align-items-center gap-1"
                                    >
                                        <span className="fw-medium">{item.category}:</span>
                                        <strong>{formatLocalizedNumber(item.count, language)}</strong>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Visualizations Row 2: Stakeholder Ecosystem */}
                <div className="admin-an-chart-card mb-4">
                    <div className="admin-an-chart-header">
                        <h3 className="admin-an-chart-title">
                            <i className="bi bi-diagram-3-fill text-primary"></i>
                            <span>{t("Stakeholder Ecosystem")}</span>
                        </h3>
                        <p className="admin-an-chart-desc">
                            {t("Active platform participants registered across operational roles.")}
                        </p>
                    </div>

                    <div className="admin-an-chart-body">
                        {loading ? (
                            <div className="admin-an-skeleton-chart w-100"></div>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={stakeholderBarData}
                                    margin={{ top: 10, right: 20, left: -10, bottom: 15 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                                    <XAxis
                                        dataKey="role"
                                        stroke={axisStroke}
                                        tick={{ fill: axisStroke, fontSize: 12 }}
                                    />
                                    <YAxis
                                        allowDecimals={false}
                                        stroke={axisStroke}
                                        tick={{ fill: axisStroke, fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={tooltipContentStyle}
                                        itemStyle={tooltipItemStyle}
                                        formatter={(value) => [
                                            formatLocalizedNumber(value, language),
                                            t("Count")
                                        ]}
                                    />
                                    <Bar
                                        dataKey="count"
                                        name={t("Count")}
                                        radius={[6, 6, 0, 0]}
                                    >
                                        {stakeholderBarData.map((entry) => (
                                            <Cell key={entry.role} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Honest Historical Trend Notice Card */}
                <div className="admin-an-notice-card">
                    <i className="bi bi-clock-history admin-an-notice-icon"></i>
                    <div className="admin-an-notice-content">
                        <h6>{t("Historical Trend Notice")}</h6>
                        <p>
                            {t("Time-series trend tracking will become available as historical logs accumulate over time. The charts above reflect 100% live verified platform aggregates.")}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminAnalytics;