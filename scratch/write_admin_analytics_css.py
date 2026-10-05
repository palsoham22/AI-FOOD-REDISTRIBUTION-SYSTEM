import os

css_content = '''/* ==========================================================================
   FoodBridge AI - Admin Analytics Styling
   Design tokens, dark theme, responsive sidebar offsets, accessible contrast
   ========================================================================== */

:root {
    --admin-sidebar-w: 260px;
    --admin-sidebar-collapsed-w: 80px;
    --admin-primary: #2563EB;
    --admin-primary-dark: #1D4ED8;
    --admin-bg: #F8FAFC;
    --admin-card-bg: #FFFFFF;
    --admin-text-main: #0F172A;
    --admin-text-muted: #64748B;
    --admin-border: #E2E8F0;
    --admin-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
    --admin-shadow-hover: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04);
}

/* Page wrapper & responsive sidebar offsets */
.admin-analytics-page {
    margin-left: var(--admin-sidebar-w);
    padding: 24px 32px 48px;
    min-height: 100vh;
    background-color: var(--admin-bg);
    transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

body.admin-sidebar-collapsed .admin-analytics-page {
    margin-left: var(--admin-sidebar-collapsed-w);
}

@media (max-width: 992px) {
    .admin-analytics-page {
        margin-left: 0 !important;
        padding: 84px 16px 36px;
    }
}

/* Hero Banner */
.admin-an-hero-banner {
    background: linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #2563EB 100%);
    color: #FFFFFF;
    border-radius: 20px;
    padding: 30px 36px;
    margin: 20px 0 28px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
    box-shadow: 0 12px 30px -10px rgba(15, 23, 42, 0.3);
    position: relative;
    overflow: hidden;
}

.admin-an-hero-banner::after {
    content: "";
    position: absolute;
    right: -50px;
    top: -50px;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.12) 0%, transparent 70%);
    pointer-events: none;
}

.admin-an-hero-content {
    max-width: 760px;
    position: relative;
    z-index: 1;
}

.admin-an-hero-badge {
    display: inline-flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    color: #38BDF8;
    padding: 5px 14px;
    border-radius: 9999px;
    font-size: 13px;
    font-weight: 700;
    margin-bottom: 10px;
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.admin-an-hero-title {
    font-size: 32px;
    font-weight: 800;
    color: #FFFFFF !important;
    margin-bottom: 6px;
    line-height: 1.25;
}

.admin-an-hero-subtitle {
    color: rgba(248, 250, 252, 0.88);
    font-size: 15px;
    margin-bottom: 12px;
    line-height: 1.5;
}

.admin-an-hero-disclaimer {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    padding: 6px 14px;
    font-size: 12.5px;
    color: #E2E8F0;
}

.admin-an-hero-actions {
    position: relative;
    z-index: 1;
}

.admin-an-refresh-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.12);
    color: #FFFFFF;
    border: 1px solid rgba(255, 255, 255, 0.25);
    padding: 10px 18px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
}

.admin-an-refresh-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.22);
    transform: translateY(-1px);
}

.admin-an-refresh-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* Section Header */
.admin-an-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 28px 0 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--admin-border);
}

.admin-an-section-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--admin-text-main);
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
}

/* KPI Summary Grids */
.admin-an-kpi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
    gap: 18px;
    margin-bottom: 24px;
}

.admin-an-kpi-card {
    background: var(--admin-card-bg);
    border-radius: 16px;
    padding: 20px 22px;
    border: 1px solid var(--admin-border);
    box-shadow: var(--admin-shadow);
    display: flex;
    align-items: center;
    gap: 16px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.admin-an-kpi-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--admin-shadow-hover);
}

.admin-an-kpi-icon {
    width: 50px;
    height: 50px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    flex-shrink: 0;
}

.admin-an-kpi-icon.blue {
    background: rgba(37, 99, 235, 0.12);
    color: #2563EB;
}

.admin-an-kpi-icon.teal {
    background: rgba(15, 118, 110, 0.12);
    color: #0F766E;
}

.admin-an-kpi-icon.purple {
    background: rgba(124, 58, 237, 0.12);
    color: #7C3AED;
}

.admin-an-kpi-icon.emerald {
    background: rgba(22, 163, 74, 0.12);
    color: #16A34A;
}

.admin-an-kpi-icon.amber {
    background: rgba(245, 158, 11, 0.12);
    color: #D97706;
}

.admin-an-kpi-icon.sky {
    background: rgba(2, 132, 199, 0.12);
    color: #0284C7;
}

.admin-an-kpi-info {
    flex-grow: 1;
    overflow: hidden;
}

.admin-an-kpi-title {
    font-size: 12.5px;
    font-weight: 600;
    color: var(--admin-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.03em;
    margin-bottom: 4px;
}

.admin-an-kpi-value {
    font-size: 24px;
    font-weight: 800;
    color: var(--admin-text-main);
    line-height: 1.2;
}

/* Charts Grid */
.admin-an-charts-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(460px, 1fr));
    gap: 24px;
    margin-bottom: 24px;
}

@media (max-width: 576px) {
    .admin-an-charts-row {
        grid-template-columns: 1fr;
    }
}

.admin-an-chart-card {
    background: var(--admin-card-bg);
    border-radius: 18px;
    padding: 24px 26px;
    border: 1px solid var(--admin-border);
    box-shadow: var(--admin-shadow);
    display: flex;
    flex-direction: column;
}

.admin-an-chart-header {
    margin-bottom: 18px;
}

.admin-an-chart-title {
    font-size: 17px;
    font-weight: 700;
    color: var(--admin-text-main);
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.admin-an-chart-desc {
    font-size: 13px;
    color: var(--admin-text-muted);
    margin-bottom: 0;
}

.admin-an-chart-body {
    flex-grow: 1;
    min-height: 320px;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Chart Empty State */
.admin-an-chart-empty {
    text-align: center;
    padding: 36px 20px;
    color: var(--admin-text-muted);
}

.admin-an-chart-empty i {
    font-size: 32px;
    margin-bottom: 10px;
    display: inline-block;
}

/* Notice Card */
.admin-an-notice-card {
    background: var(--admin-card-bg);
    border-radius: 16px;
    border: 1px dashed var(--admin-border);
    padding: 20px 24px;
    display: flex;
    align-items: flex-start;
    gap: 16px;
    margin-top: 16px;
}

.admin-an-notice-icon {
    font-size: 22px;
    color: var(--admin-primary);
    flex-shrink: 0;
    margin-top: 2px;
}

.admin-an-notice-content h6 {
    font-size: 14px;
    font-weight: 700;
    color: var(--admin-text-main);
    margin-bottom: 4px;
}

.admin-an-notice-content p {
    font-size: 13px;
    color: var(--admin-text-muted);
    margin-bottom: 0;
    line-height: 1.5;
}

/* Error Card */
.admin-an-error-card {
    background: #FEF2F2;
    border: 1px solid #FCA5A5;
    color: #991B1B;
    border-radius: 14px;
    padding: 18px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    gap: 16px;
    flex-wrap: wrap;
}

.admin-an-retry-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 8px;
    background: #DC2626;
    color: #FFFFFF;
    font-size: 13px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: background-color 0.15s ease;
}

.admin-an-retry-btn:hover {
    background: #B91C1C;
}

/* Shimmer Skeletons */
.admin-an-skeleton-kpi {
    height: 94px;
    border-radius: 16px;
    background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
    background-size: 200% 100%;
    animation: anShimmer 1.5s infinite;
}

.admin-an-skeleton-chart {
    height: 380px;
    border-radius: 18px;
    background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
    background-size: 200% 100%;
    animation: anShimmer 1.5s infinite;
}

@keyframes anShimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
}

/* ==========================================================================
   Dark Mode Support: [data-theme="dark"]
   ========================================================================== */
[data-theme="dark"] {
    --admin-bg: #0F172A;
    --admin-card-bg: #1E293B;
    --admin-text-main: #F8FAFC;
    --admin-text-muted: #94A3B8;
    --admin-border: #334155;
    --admin-primary: #60A5FA;
    --admin-primary-dark: #3B82F6;
    --admin-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
    --admin-shadow-hover: 0 10px 15px -3px rgba(0, 0, 0, 0.4);
}

[data-theme="dark"] .admin-an-hero-banner {
    background: linear-gradient(135deg, #0B1120 0%, #1E293B 60%, #1E3A8A 100%);
    box-shadow: 0 12px 30px -10px rgba(0, 0, 0, 0.5);
}

[data-theme="dark"] .admin-an-error-card {
    background: #450A0A;
    border-color: #7F1D1D;
    color: #FCA5A5;
}

[data-theme="dark"] .admin-an-skeleton-kpi,
[data-theme="dark"] .admin-an-skeleton-chart {
    background: linear-gradient(90deg, #1E293B 25%, #334155 50%, #1E293B 75%);
    background-size: 200% 100%;
}

[data-theme="dark"] .admin-an-notice-card {
    background: #1E293B;
    border-color: #334155;
}
'''

filepath = 'frontend/src/styles/AdminAnalytics.css'
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(css_content.strip() + '\n')
    f.flush()
    os.fsync(f.fileno())

print('Successfully created AdminAnalytics.css')

