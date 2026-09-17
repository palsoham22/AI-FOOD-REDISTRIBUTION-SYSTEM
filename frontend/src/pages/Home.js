import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { LABELS } from "../translations";
import "../styles/Home.css";

function Home() {
  const t = useTranslate();
  usePageTranslation(LABELS.HOME);

  const handleScroll = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="fb-landing min-vh-100 d-flex flex-column" id="home">
      {/* 1. Header / Navbar */}
      <Navbar />

      <main>
        {/* ==================================================================
            2. HERO SECTION
           ================================================================== */}
        <section className="fb-hero-section">
          <div className="container">
            <div className="row align-items-center g-4 g-lg-5">
              {/* Left Column: Headline, Value Prop & CTAs */}
              <div className="col-lg-6">
                <div className="fb-hero-eyebrow">
                  <span className="fb-pulse-dot" aria-hidden="true"></span>
                  <span>{t("Food redistribution, reimagined")}</span>
                </div>

                <h1 className="fb-hero-title">
                  {t("Reduce Food Waste.")} <br />
                  <span className="fb-highlight">{t("Redistribute Surplus.")}</span> <br />
                  {t("Create Impact.")}
                </h1>

                <p className="fb-hero-lead">
                  {t(
                    "FoodBridge AI connects food businesses with NGOs and recipient networks to identify surplus early, prevent avoidable food waste, and coordinate prompt, dignified redistribution through structured inventory management."
                  )}
                </p>

                <div className="fb-hero-ctas">
                  <Link to="/register" className="fb-btn-hero-primary">
                    <span>{t("Get Started")}</span>
                    <i className="bi bi-arrow-right" aria-hidden="true"></i>
                  </Link>

                  <button
                    type="button"
                    className="fb-btn-hero-secondary"
                    onClick={() => handleScroll("features")}
                  >
                    <span>{t("Explore Features")}</span>
                    <i className="bi bi-chevron-down" aria-hidden="true"></i>
                  </button>
                </div>

                <div className="fb-hero-proof">
                  <div className="fb-proof-item">
                    <i className="bi bi-check-circle-fill" aria-hidden="true"></i>
                    <span>{t("Multi-Stakeholder Coordination")}</span>
                  </div>
                  <div className="fb-proof-item">
                    <i className="bi bi-check-circle-fill" aria-hidden="true"></i>
                    <span>{t("Expiry Date Monitoring")}</span>
                  </div>
                  <div className="fb-proof-item">
                    <i className="bi bi-check-circle-fill" aria-hidden="true"></i>
                    <span>{t("Structured Food Redistribution")}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Platform Mockup */}
              <div className="col-lg-6">
                <div className="fb-hero-card">
                  <div className="fb-mock-topbar">
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-hdd-network-fill text-primary"></i>
                      <span className="fw-bold small text-dark">
                        {t("Surplus Inventory Coordination")}
                      </span>
                    </div>
                    <span className="fb-mock-badge">
                      <span className="fb-mock-badge-dot"></span>
                      {t("Platform Active")}
                    </span>
                  </div>

                  {/* Mock Item 1 */}
                  <div className="fb-mock-item">
                    <div className="fb-mock-item-left">
                      <div className="fb-mock-icon amber" aria-hidden="true">
                        <i className="bi bi-cup-straw"></i>
                      </div>
                      <div>
                        <div className="fw-bold small text-dark">
                          {t("Organic Whole Milk (50L)")}
                        </div>
                        <div className="text-secondary small">
                          {t("Dairy • 50 Units")} &bull; Metro Supermarket
                        </div>
                      </div>
                    </div>
                    <span className="fb-pill-expiry">
                      <i className="bi bi-clock-history"></i>
                      {t("Expires in 18 hrs")}
                    </span>
                  </div>

                  {/* Mock Item 2 */}
                  <div className="fb-mock-item">
                    <div className="fb-mock-item-left">
                      <div className="fb-mock-icon teal" aria-hidden="true">
                        <i className="bi bi-basket2"></i>
                      </div>
                      <div>
                        <div className="fw-bold small text-dark">
                          {t("Bakery Surplus Assortment")}
                        </div>
                        <div className="text-secondary small">
                          {t("Bakery • 30 kg")} &bull; Artisan Breads Co.
                        </div>
                      </div>
                    </div>
                    <span className="fb-pill-matched">
                      <i className="bi bi-check2-circle"></i>
                      {t("Claimed by City Kitchen")}
                    </span>
                  </div>

                  {/* Mock Item 3 */}
                  <div className="fb-mock-item">
                    <div className="fb-mock-item-left">
                      <div className="fb-mock-icon blue" aria-hidden="true">
                        <i className="bi bi-truck"></i>
                      </div>
                      <div>
                        <div className="fw-bold small text-dark">
                          {t("Fresh Produce Batch")}
                        </div>
                        <div className="text-secondary small">
                          {t("Produce • 80 kg")} &bull; Green Valley Market
                        </div>
                      </div>
                    </div>
                    <span className="fb-pill-completed">
                      <i className="bi bi-calendar-check"></i>
                      {t("Scheduled for Pickup")}
                    </span>
                  </div>

                  {/* Mock Bottom Metrics */}
                  <div className="pt-2 d-flex justify-content-between text-secondary small border-top mt-2">
                    <div className="d-flex align-items-center gap-1">
                      <i className="bi bi-heart-pulse-fill text-danger"></i>
                      <span>{t("Community Food Recovery")}</span>
                    </div>
                    <div className="d-flex align-items-center gap-1">
                      <i className="bi bi-boxes text-primary"></i>
                      <span>{t("Inventory Tracking System")}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================
            3. ABOUT SECTION
           ================================================================== */}
        <section className="fb-about-section" id="about">
          <div className="container">
            <div className="text-center fb-section-header">
              <span className="fb-section-tag teal">
                <i className="bi bi-info-circle-fill me-1"></i>
                {t("About FoodBridge AI")}
              </span>
              <h2 className="fb-section-title">
                {t("Bridging the Gap Between Surplus Food and Local Need")}
              </h2>
              <p className="fb-section-subtitle">
                {t(
                  "Connecting surplus food with communities through practical technology and organized coordination."
                )}
              </p>
            </div>

            {/* Narrative 2-Column Overview */}
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <div className="fb-narrative-card">
                  <h4>
                    <i className="bi bi-exclamation-circle text-danger me-2"></i>
                    {t("The Challenge of Food Waste")}
                  </h4>
                  <p>
                    {t(
                      "Every day, supermarkets, restaurants, and caterers generate nutritious edible surplus that risks disposal due to tight expiry windows or lack of immediate logistics."
                    )}
                  </p>
                </div>
              </div>

              <div className="col-md-6">
                <div className="fb-narrative-card">
                  <h4>
                    <i className="bi bi-lightbulb text-primary me-2"></i>
                    {t("The FoodBridge Solution")}
                  </h4>
                  <p>
                    {t(
                      "FoodBridge AI provides clear inventory tracking, expiry date monitoring, and direct donation coordination, turning surplus food into community nourishment."
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* 3 Value Pillars */}
            <div className="row g-3">
              <div className="col-lg-4 col-md-6">
                <article className="fb-pillar-card">
                  <div className="fb-pillar-icon teal" aria-hidden="true">
                    <i className="bi bi-shield-check"></i>
                  </div>
                  <h3>{t("Prevent Waste")}</h3>
                  <p>
                    {t(
                      "Shelf-life tracking and risk indicators help businesses identify surplus items before they reach expiration."
                    )}
                  </p>
                </article>
              </div>

              <div className="col-lg-4 col-md-6">
                <article className="fb-pillar-card">
                  <div className="fb-pillar-icon blue" aria-hidden="true">
                    <i className="bi bi-arrow-left-right"></i>
                  </div>
                  <h3>{t("Connect Surplus")}</h3>
                  <p>
                    {t(
                      "Direct digital connection between food businesses, registered NGOs, and local delivery partners."
                    )}
                  </p>
                </article>
              </div>

              <div className="col-lg-4 col-md-12">
                <article className="fb-pillar-card">
                  <div className="fb-pillar-icon green" aria-hidden="true">
                    <i className="bi bi-graph-up-arrow"></i>
                  </div>
                  <h3>{t("Measure Impact")}</h3>
                  <p>
                    {t(
                      "Donation records and reporting tools give donors and recipient organizations clear visibility into redistributed food."
                    )}
                  </p>
                </article>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================
            4. HOW IT WORKS SECTION
           ================================================================== */}
        <section className="fb-how-section" id="how-it-works">
          <div className="container">
            <div className="text-center fb-section-header">
              <span className="fb-section-tag">
                <i className="bi bi-diagram-3-fill me-1"></i>
                {t("Step-by-Step Process")}
              </span>
              <h2 className="fb-section-title">
                {t("How FoodBridge AI Coordinates Food Redistribution")}
              </h2>
              <p className="fb-section-subtitle">
                {t(
                  "A simple, reliable workflow that turns surplus inventory into timely meals for communities."
                )}
              </p>
            </div>

            <div className="row g-3">
              {/* Step 1 */}
              <div className="col-lg-4 col-md-6">
                <div className="fb-step-card">
                  <div className="fb-step-top">
                    <span className="fb-step-number">01</span>
                    <div className="fb-step-icon">
                      <i className="bi bi-box-seam"></i>
                    </div>
                  </div>
                  <h3>{t("Track Inventory")}</h3>
                  <p>
                    {t(
                      "Log food items with expiry dates, categories, and batch details through direct entry, barcode scanning, or CSV upload."
                    )}
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="col-lg-4 col-md-6">
                <div className="fb-step-card">
                  <div className="fb-step-top">
                    <span className="fb-step-number">02</span>
                    <div className="fb-step-icon">
                      <i className="bi bi-hourglass-split text-warning"></i>
                    </div>
                  </div>
                  <h3>{t("Monitor Expiry")}</h3>
                  <p>
                    {t(
                      "Configurable shelf-life timelines help flag perishable inventory approaching expiration dates."
                    )}
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="col-lg-4 col-md-6">
                <div className="fb-step-card">
                  <div className="fb-step-top">
                    <span className="fb-step-number">03</span>
                    <div className="fb-step-icon">
                      <i className="bi bi-tags text-primary"></i>
                    </div>
                  </div>
                  <h3>{t("Identify Surplus")}</h3>
                  <p>
                    {t(
                      "Eligible inventory is flagged as surplus and organized into donation listings with category and quantity details."
                    )}
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="col-lg-4 col-md-6">
                <div className="fb-step-card">
                  <div className="fb-step-top">
                    <span className="fb-step-number">04</span>
                    <div className="fb-step-icon">
                      <i className="bi bi-hand-thumbs-up text-success"></i>
                    </div>
                  </div>
                  <h3>{t("Coordinate Donation")}</h3>
                  <p>
                    {t(
                      "Registered NGOs review available surplus listings and submit requests matching their community needs."
                    )}
                  </p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="col-lg-4 col-md-6">
                <div className="fb-step-card">
                  <div className="fb-step-top">
                    <span className="fb-step-number">05</span>
                    <div className="fb-step-icon">
                      <i className="bi bi-calendar-check text-info"></i>
                    </div>
                  </div>
                  <h3>{t("Schedule Pickup")}</h3>
                  <p>
                    {t(
                      "Coordinate pickup timing and logistics details between donor facilities and community partners."
                    )}
                  </p>
                </div>
              </div>

              {/* Step 6 */}
              <div className="col-lg-4 col-md-6">
                <div className="fb-step-card">
                  <div className="fb-step-top">
                    <span className="fb-step-number">06</span>
                    <div className="fb-step-icon">
                      <i className="bi bi-award text-success"></i>
                    </div>
                  </div>
                  <h3>{t("Track Impact")}</h3>
                  <p>
                    {t(
                      "Log completed handoffs and maintain transparent records of rescued food and community support."
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================
            5. FEATURES SECTION (Consolidated to 9 High-Impact Capabilities)
           ================================================================== */}
        <section className="fb-features-section" id="features">
          <div className="container">
            <div className="text-center fb-section-header">
              <span className="fb-section-tag">
                <i className="bi bi-stars me-1"></i>
                {t("Platform Capabilities")}
              </span>
              <h2 className="fb-section-title">
                {t("Built for Every Stakeholder in Food Recovery")}
              </h2>
              <p className="fb-section-subtitle">
                {t(
                  "Core tools and workflows designed to make surplus food recovery practical, efficient, and accessible."
                )}
              </p>
            </div>

            <div className="row g-3">
              {/* Feature 1 */}
              <div className="col-lg-4 col-md-6">
                <div className="fb-feature-card">
                  <div className="fb-feature-icon-box blue">
                    <i className="bi bi-boxes"></i>
                  </div>
                  <h3>{t("Inventory Management")}</h3>
                  <p>
                    {t(
                      "Track stock quantities, units, categories, and storage conditions in a centralized catalog."
                    )}
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="col-lg-4 col-md-6">
                <div className="fb-feature-card">
                  <div className="fb-feature-icon-box amber">
                    <i className="bi bi-clock-history"></i>
                  </div>
                  <h3>{t("Expiry Date Monitoring")}</h3>
                  <p>
                    {t(
                      "Time-sensitive views and proactive indicators highlight perishables approaching expiry."
                    )}
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="col-lg-4 col-md-6">
                <div className="fb-feature-card">
                  <div className="fb-feature-icon-box teal">
                    <i className="bi bi-grid-3x3-gap"></i>
                  </div>
                  <h3>{t("Product Categorization")}</h3>
                  <p>
                    {t(
                      "Structured categorization across dairy, bakery, produce, prepared meals, and pantry goods."
                    )}
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="col-lg-4 col-md-6">
                <div className="fb-feature-card">
                  <div className="fb-feature-icon-box amber">
                    <i className="bi bi-exclamation-triangle"></i>
                  </div>
                  <h3>{t("Waste Risk Assessment")}</h3>
                  <p>
                    {t(
                      "Early risk flagging helps staff identify surplus items in time to prioritize donation."
                    )}
                  </p>
                </div>
              </div>

              {/* Feature 5 */}
              <div className="col-lg-4 col-md-6">
                <div className="fb-feature-card">
                  <div className="fb-feature-icon-box blue">
                    <i className="bi bi-qr-code-scan"></i>
                  </div>
                  <h3>{t("Barcode & QR Support")}</h3>
                  <p>
                    {t(
                      "Camera-based scanning enables rapid item lookup and streamlined inventory logging."
                    )}
                  </p>
                </div>
              </div>

              {/* Feature 6 */}
              <div className="col-lg-4 col-md-6">
                <div className="fb-feature-card">
                  <div className="fb-feature-icon-box teal">
                    <i className="bi bi-file-earmark-spreadsheet"></i>
                  </div>
                  <h3>{t("CSV & POS Import")}</h3>
                  <p>
                    {t(
                      "Upload product inventories in batches using standard CSV spreadsheets and POS files."
                    )}
                  </p>
                </div>
              </div>

              {/* Feature 7 */}
              <div className="col-lg-4 col-md-6">
                <div className="fb-feature-card">
                  <div className="fb-feature-icon-box green">
                    <i className="bi bi-heart-fill"></i>
                  </div>
                  <h3>{t("Food Donation Coordination")}</h3>
                  <p>
                    {t(
                      "Turn surplus stock into accessible donation listings for registered community organizations."
                    )}
                  </p>
                </div>
              </div>

              {/* Feature 8 */}
              <div className="col-lg-4 col-md-6">
                <div className="fb-feature-card">
                  <div className="fb-feature-icon-box blue">
                    <i className="bi bi-person-badge"></i>
                  </div>
                  <h3>{t("Role-Based Portals")}</h3>
                  <p>
                    {t(
                      "Dedicated dashboards for Businesses, NGOs, Delivery Drivers, Admins, and Individuals."
                    )}
                  </p>
                </div>
              </div>

              {/* Feature 9 */}
              <div className="col-lg-4 col-md-6">
                <div className="fb-feature-card">
                  <div className="fb-feature-icon-box teal">
                    <i className="bi bi-graph-up"></i>
                  </div>
                  <h3>{t("Analytics & Accessibility")}</h3>
                  <p>
                    {t(
                      "View donation history and redistribution trends with support for 6 regional languages and PWA."
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================
            6. PLATFORM ROLES SECTION
           ================================================================== */}
        <section className="fb-roles-section" id="roles">
          <div className="container">
            <div className="text-center fb-section-header">
              <span className="fb-section-tag teal">
                <i className="bi bi-people-fill me-1"></i>
                {t("Platform Roles")}
              </span>
              <h2 className="fb-section-title">
                {t("Empowering Every Role in the Food Recovery Network")}
              </h2>
              <p className="fb-section-subtitle">
                {t(
                  "Dedicated tools designed for donors, recipient organizations, delivery partners, and coordinators."
                )}
              </p>
            </div>

            <div className="row g-3">
              {/* Role 1: Business */}
              <div className="col-lg-3 col-md-6">
                <div className="fb-role-card">
                  <span className="fb-role-badge business">{t("Donor")}</span>
                  <h3>{t("Commercial Businesses")}</h3>
                  <p>
                    {t(
                      "Supermarkets, restaurants, and caterers managing inventory, tracking expiry, and donating surplus food."
                    )}
                  </p>
                  <Link to="/business-dashboard" className="fb-role-link">
                    <span>{t("Go to Business Portal")}</span>
                    <i className="bi bi-arrow-right"></i>
                  </Link>
                </div>
              </div>

              {/* Role 2: NGO */}
              <div className="col-lg-3 col-md-6">
                <div className="fb-role-card">
                  <span className="fb-role-badge ngo">{t("Recipient")}</span>
                  <h3>{t("NGOs & Food Banks")}</h3>
                  <p>
                    {t(
                      "Community kitchens and food relief organizations reviewing surplus listings, requesting items, and managing rations."
                    )}
                  </p>
                  <Link to="/ngo-dashboard" className="fb-role-link">
                    <span>{t("Go to NGO Portal")}</span>
                    <i className="bi bi-arrow-right"></i>
                  </Link>
                </div>
              </div>

              {/* Role 3: Delivery */}
              <div className="col-lg-3 col-md-6">
                <div className="fb-role-card">
                  <span className="fb-role-badge delivery">{t("Logistics")}</span>
                  <h3>{t("Delivery Partners")}</h3>
                  <p>
                    {t(
                      "Logistics volunteers and drivers managing pickup queues and recording completed distributions."
                    )}
                  </p>
                  <Link to="/delivery-dashboard" className="fb-role-link">
                    <span>{t("Go to Delivery Portal")}</span>
                    <i className="bi bi-arrow-right"></i>
                  </Link>
                </div>
              </div>

              {/* Role 4: Individual */}
              <div className="col-lg-3 col-md-6">
                <div className="fb-role-card">
                  <span className="fb-role-badge individual">{t("Community")}</span>
                  <h3>{t("Individual Donors")}</h3>
                  <p>
                    {t(
                      "Citizens and households listing surplus food and contributing directly to local hunger relief."
                    )}
                  </p>
                  <Link to="/individual" className="fb-role-link">
                    <span>{t("Go to Individual Portal")}</span>
                    <i className="bi bi-arrow-right"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================
            7. IMPACT SECTION
           ================================================================== */}
        <section className="fb-impact-section" id="impact">
          <div className="container">
            <div className="text-center fb-section-header">
              <span className="fb-section-tag teal">
                <i className="bi bi-heart-pulse-fill me-1"></i>
                {t("Why It Matters")}
              </span>
              <h2 className="fb-section-title">
                {t("Creating Environmental and Social Value Together")}
              </h2>
              <p className="fb-section-subtitle">
                {t(
                  "Every redirected meal addresses hunger while preventing avoidable organic waste in landfills."
                )}
              </p>
            </div>

            <div className="row g-3">
              <div className="col-lg-3 col-md-6">
                <div className="fb-impact-card">
                  <div className="fb-impact-icon teal">
                    <i className="bi bi-tree-fill"></i>
                  </div>
                  <h3>{t("Environmental Stewardship")}</h3>
                  <p>
                    {t(
                      "Diverting edible food from landfills helps reduce methane emissions and saves natural resources."
                    )}
                  </p>
                </div>
              </div>

              <div className="col-lg-3 col-md-6">
                <div className="fb-impact-card">
                  <div className="fb-impact-icon green">
                    <i className="bi bi-people-fill"></i>
                  </div>
                  <h3>{t("Community Food Security")}</h3>
                  <p>
                    {t(
                      "Redirecting surplus food supplies nutritious meals to local shelters, food banks, and families."
                    )}
                  </p>
                </div>
              </div>

              <div className="col-lg-3 col-md-6">
                <div className="fb-impact-card">
                  <div className="fb-impact-icon blue">
                    <i className="bi bi-award-fill"></i>
                  </div>
                  <h3>{t("Corporate Responsibility")}</h3>
                  <p>
                    {t(
                      "Helps businesses cut waste disposal overhead while advancing meaningful community engagement."
                    )}
                  </p>
                </div>
              </div>

              <div className="col-lg-3 col-md-6">
                <div className="fb-impact-card">
                  <div className="fb-impact-icon teal">
                    <i className="bi bi-shield-check"></i>
                  </div>
                  <h3>{t("Responsible Food Logistics")}</h3>
                  <p>
                    {t(
                      "Promotes structured handling, clear pickup coordination, and transparent delivery logging."
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================
            8. FINAL CALL TO ACTION
           ================================================================== */}
        <section className="fb-cta-section">
          <div className="container">
            <div className="fb-cta-box">
              <span className="fb-cta-tag">
                <i className="bi bi-lightning-charge-fill me-1"></i>
                {t("Join the Movement")}
              </span>
              <h2 className="fb-cta-title">
                {t("Turn Surplus Food Into Shared Impact.")}
              </h2>
              <p className="fb-cta-lead">
                {t(
                  "Join FoodBridge AI today. Whether you are a business looking to reduce waste, an NGO feeding communities, or an individual wanting to help."
                )}
              </p>
              <div className="fb-cta-buttons">
                <Link to="/register" className="fb-btn-cta-primary">
                  <span>{t("Create an Account")}</span>
                  <i className="bi bi-arrow-right"></i>
                </Link>
                <Link to="/login" className="fb-btn-cta-secondary">
                  <span>{t("Sign In to Your Dashboard")}</span>
                  <i className="bi bi-box-arrow-in-right"></i>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 9. Footer Component */}
      <Footer />
    </div>
  );
}

export default Home;