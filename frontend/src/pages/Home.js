import Navbar from "../components/Navbar";
import { useTranslate } from "../hooks/useTranslate";
import { usePageTranslation } from "../hooks/usePageTranslation";
import { LABELS } from "../translations";

function Home() {
  const t = useTranslate();
  usePageTranslation(LABELS.HOME);

  return (
    <div className="foodbridge-home min-vh-100 d-flex flex-column">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Poppins:wght@600;700;800&display=swap');

        /* =========================
           GLOBAL
        ========================= */

        .foodbridge-home {
          --fb-ink: #123025;
          --fb-green: #16834b;
          --fb-deep: #075b36;
          --fb-soft: #e8f6ed;
          --fb-pastel: #dff3e7;
          --fb-line: rgba(18, 77, 46, .12);

          color: var(--fb-ink);

          background:
            linear-gradient(
              135deg,
              #f3fbf6 0%,
              #e8f6ed 45%,
              #f2faf5 100%
            );

          font-family: Inter, sans-serif;
          overflow-x: hidden;
        }

        .foodbridge-home main {
          overflow: hidden;
        }


        /* =========================
           HERO SECTION
        ========================= */

        .foodbridge-home .fb-hero {
          position: relative;
          isolation: isolate;

          padding: clamp(3rem, 5vw, 4.5rem) 0;

          background:
            radial-gradient(
              circle at 5% 15%,
              rgba(112, 198, 139, .18),
              transparent 18rem
            ),

            radial-gradient(
              circle at 95% 75%,
              rgba(170, 224, 184, .28),
              transparent 20rem
            ),

            linear-gradient(
              135deg,
              #f3fbf6 0%,
              #e8f6ed 50%,
              #f2faf5 100%
            );
        }


        /* Decorative shapes */

        .foodbridge-home .fb-hero::before {
          content: "";

          position: absolute;

          width: 13rem;
          height: 7rem;

          right: -3rem;
          bottom: -2rem;

          border-radius: 50%;

          background: rgba(73, 178, 108, .12);

          transform: rotate(-25deg);

          z-index: -1;
        }


        .foodbridge-home .fb-hero::after {
          content: "";

          position: absolute;

          width: 6rem;
          height: 6rem;

          left: 3%;
          bottom: 8%;

          border-radius: 50%;

          background: rgba(247, 214, 105, .13);

          z-index: -1;
        }


        .foodbridge-home .fb-hero .container {
          width: min(100% - 3rem, 1250px);
        }


        /* =========================
           HERO CONTENT
        ========================= */

        .foodbridge-home .fb-hero-content {

          display: grid;

          grid-template-columns:
            minmax(0, 1fr)
            220px;

          align-items: center;

          gap: clamp(2rem, 5vw, 5rem);

          text-align: left;
        }


        /* =========================
           HERO LEFT
        ========================= */

        .foodbridge-home .fb-hero-main {
          max-width: 850px;
        }


        .foodbridge-home .fb-eyebrow {

          display: inline-flex;

          align-items: center;

          gap: .5rem;

          padding: .45rem .8rem;

          border: 1px solid rgba(22, 131, 75, .16);

          border-radius: 999px;

          color: var(--fb-deep);

          background: rgba(255, 255, 255, .68);

          box-shadow:
            0 .4rem 1rem rgba(22, 95, 56, .04);

          font-size: .74rem;

          font-weight: 700;

          letter-spacing: .06em;

          text-transform: uppercase;
        }


        .foodbridge-home .fb-pulse {

          width: .5rem;
          height: .5rem;

          border-radius: 50%;

          background: #2eb96b;

          box-shadow:
            0 0 0 .22rem rgba(46, 185, 107, .14);

          animation: fb-pulse 2.4s infinite;
        }


        /* =========================
           HERO TITLE
        ========================= */

        .foodbridge-home .fb-title {

          max-width: 900px;

          margin: .85rem 0 .65rem;

          color: var(--fb-ink);

          font-family: Poppins, sans-serif;

          font-size:
            clamp(2.35rem, 4.6vw, 4.25rem);

          font-weight: 800;

          letter-spacing: -.055em;

          line-height: 1.06;
        }


        .foodbridge-home .fb-lead {

          max-width: 620px;

          margin: 0;

          color: #527264;

          font-size:
            clamp(.98rem, 1.4vw, 1.12rem);

          line-height: 1.6;
        }


        .foodbridge-home .fb-proof {

          margin: 1rem 0 0;

          color: #678075;

          font-size: .82rem;

          font-weight: 600;
        }


        .foodbridge-home .fb-proof strong {

          color: var(--fb-deep);
        }


        /* =========================
           REGISTER / LOGIN
        ========================= */

        .foodbridge-home .fb-actions {

          display: flex;

          flex-direction: column;

          gap: .8rem;

          align-items: stretch;

          padding: 0;

          background: transparent;

          border: none;

          box-shadow: none;
        }


        .foodbridge-home .fb-actions::before {

          display: none;
        }


        .foodbridge-home .fb-actions .btn {

          width: 180px;

          padding: .75rem 1.2rem;

          border-radius: .7rem;

          font-size: .95rem;

          font-weight: 700;

          transition:
            transform .2s ease,
            box-shadow .2s ease,
            background .2s ease;
        }


        /* Register */

        .foodbridge-home .fb-actions .btn-success {

          border-color: var(--fb-green);

          background: var(--fb-green);

          box-shadow:
            0 .5rem 1rem rgba(16, 113, 61, .16);
        }


        /* Login */

        .foodbridge-home .fb-actions .btn-outline-success {

          color: var(--fb-deep);

          border-color: #9bcfb0;

          background: rgba(255, 255, 255, .65);
        }


        /* Button hover */

        .foodbridge-home .fb-actions .btn:hover {

          transform: translateY(-2px);

          box-shadow:
            0 .75rem 1.5rem rgba(16, 113, 61, .18);
        }


        .foodbridge-home .fb-actions .btn-outline-success:hover {

          color: #fff;

          background: var(--fb-deep);

          border-color: var(--fb-deep);
        }


        /* =========================
           FEATURES SECTION
        ========================= */

        .foodbridge-home .fb-features {

          padding:
            clamp(3rem, 4vw, 4rem) 0;

          background:
            linear-gradient(
              180deg,
              #e8f6ed 0%,
              #f0f9f3 50%,
              #e6f5eb 100%
            );
        }


        .foodbridge-home .fb-features .container {

          width: min(100% - 3rem, 1250px);
        }


        .foodbridge-home .fb-features .mb-5 {

          margin-bottom: 1.75rem !important;
        }


        /* Section small heading */

        .foodbridge-home .fb-section-kicker {

          color: var(--fb-green);

          font-size: .72rem;

          font-weight: 800;

          letter-spacing: .1em;

          text-transform: uppercase;
        }


        /* Section title */

        .foodbridge-home .fb-section-title {

          max-width: 720px;

          margin: .45rem auto 0;

          color: var(--fb-ink);

          font-family: Poppins, sans-serif;

          font-size:
            clamp(1.65rem, 3vw, 2.35rem);

          font-weight: 700;

          letter-spacing: -.04em;

          line-height: 1.15;
        }


        /* =========================
           FEATURE CARDS
        ========================= */

        .foodbridge-home .fb-card {

          height: 100%;

          padding: 1.4rem;

          border:
            1px solid rgba(23, 83, 51, .12);

          border-radius: 1rem;

          /* Slight transparent effect */

          background:
            rgba(255, 255, 255, .48);

          box-shadow:
            0 .6rem 1.6rem rgba(15, 75, 42, .045);

          transition:
            transform .25s ease,
            box-shadow .25s ease,
            border-color .25s ease;
        }


        .foodbridge-home .fb-card:hover {

          transform: translateY(-5px);

          border-color:
            rgba(22, 131, 75, .25);

          box-shadow:
            0 1rem 2rem rgba(15, 75, 42, .09);
        }


        /* Feature icon */

        .foodbridge-home .fb-icon {

          display: grid;

          place-items: center;

          width: 2.7rem;
          height: 2.7rem;

          margin-bottom: .8rem;

          border-radius: .85rem;

          color: var(--fb-deep);

          background:
            linear-gradient(
              135deg,
              #dff3e5,
              #eef8f0
            );

          font-size: 1.15rem;
        }


        .foodbridge-home .fb-card h3 {

          margin-bottom: .4rem;

          color: var(--fb-ink);

          font-family: Poppins, sans-serif;

          font-size: 1rem;

          font-weight: 700;
        }


        .foodbridge-home .fb-card p {

          margin: 0;

          color: #6b8176;

          font-size: .86rem;

          line-height: 1.55;
        }


        /* =========================
           FOOTER
        ========================= */

        .foodbridge-home .fb-footer {

          margin-top: auto;

          padding: .8rem 0;

          border-top:
            1px solid var(--fb-line);

          color: #71877c;

          background:
            #e4f3e9;

          font-size: .78rem;
        }


        .foodbridge-home .fb-footer-name {

          color: var(--fb-deep);

          font-weight: 800;
        }


        /* =========================
           ANIMATION
        ========================= */

        @keyframes fb-pulse {

          50% {

            box-shadow:
              0 0 0 .4rem rgba(46, 185, 107, .05);
          }
        }


        /* =========================
           TABLET / MOBILE
        ========================= */

        @media (max-width: 767.98px) {

          .foodbridge-home .fb-hero {

            padding:
              2.5rem 0 2.75rem;
          }


          .foodbridge-home .fb-hero-content {

            grid-template-columns: 1fr;

            gap: 1.75rem;

            text-align: center;
          }


          .foodbridge-home .fb-hero-main {

            max-width: 100%;
          }


          .foodbridge-home .fb-title {

            margin-left: auto;

            margin-right: auto;

            font-size:
              clamp(2.25rem, 9vw, 3.3rem);
          }


          .foodbridge-home .fb-lead {

            margin-left: auto;

            margin-right: auto;
          }


          .foodbridge-home .fb-proof {

            margin-left: auto;

            margin-right: auto;
          }


          .foodbridge-home .fb-actions {

            width: min(100%, 320px);

            margin: 0 auto;

            align-items: center;
          }


          .foodbridge-home .fb-actions .btn {

            width: 180px;
          }
        }


        @media (max-width: 575.98px) {

          .foodbridge-home .fb-hero .container,
          .foodbridge-home .fb-features .container {

            width:
              min(100% - 2rem, 1250px);
          }


          .foodbridge-home .fb-title {

            font-size: 2.15rem;

            letter-spacing: -.045em;
          }


          .foodbridge-home .fb-actions {

            padding: 0;
          }


          .foodbridge-home .fb-card {

            padding: 1.25rem;
          }
        }


        /* =========================
           REDUCED MOTION
        ========================= */

        @media (prefers-reduced-motion: reduce) {

          .foodbridge-home *,
          .foodbridge-home *::before,
          .foodbridge-home *::after {

            animation-duration:
              .01ms !important;

            transition-duration:
              .01ms !important;
          }
        }

      `}</style>


      <Navbar />


      <main>

        {/* =========================
            HERO
        ========================= */}

        <section className="fb-hero">

          <div className="container position-relative">

            <div className="fb-hero-content">

              {/* LEFT SIDE */}

              <div className="fb-hero-main">

                <div className="fb-eyebrow">

                  <span className="fb-pulse"></span>

                  {t("Food redistribution, reimagined")}

                </div>


                <h1 className="fb-title">

                  {t(
                    "AI-Powered Food Redistribution System"
                  )}

                </h1>


                <p className="fb-lead">

                  {t(
                    "Reduce Food Waste. Feed Communities."
                  )}

                </p>


                <p className="fb-proof">

                  <strong>
    {t("One shared mission:")}
</strong>{" "}

{t("turn surplus into support for every community.")}

                </p>

              </div>


              {/* RIGHT SIDE */}

              <div className="fb-actions">

                <a
                  href="/register"
                  className="btn btn-success"
                >
                  {t("Register")}
                </a>


                <a
                  href="/login"
                  className="btn btn-outline-success"
                >
                  {t("Login")}
                </a>

              </div>

            </div>

          </div>

        </section>


        {/* =========================
            FEATURES
        ========================= */}

        <section className="fb-features">

          <div className="container">

            <div className="text-center mb-5">

              <div className="fb-section-kicker">
    {t("Better food systems")}
</div>


              <h2 className="fb-section-title">
    {t("Connecting surplus food with the people who need it most.")}
</h2>

            </div>


            <div className="row g-4">


              {/* CARD 1 */}

              <div className="col-md-4">

                <article className="fb-card">

                  <div
                    className="fb-icon"
                    aria-hidden="true"
                  >
                    &#9851;
                  </div>


                  <h3>
    {t("Reduce waste")}
</h3>

<p>
    {t("Make every good meal count by giving surplus food a meaningful next destination.")}
</p>

                </article>

              </div>


              {/* CARD 2 */}

              <div className="col-md-4">

                <article className="fb-card">

                  <div
                    className="fb-icon"
                    aria-hidden="true"
                  >
                    &#8765;
                  </div>


                  <h3>
    {t("Smart matching")}
</h3>

<p>
    {t("Use intelligent coordination to connect donors, volunteers, and recipient communities.")}
</p>

                </article>

              </div>


              {/* CARD 3 */}

              <div className="col-md-4">

                <article className="fb-card">

                  <div
                    className="fb-icon"
                    aria-hidden="true"
                  >
                    &#9829;
                  </div>


                  <h3>
    {t("Strengthen communities")}
</h3>

<p>
    {t("Create a reliable, dignified path from available food to local impact.")}
</p>

                </article>

              </div>


            </div>

          </div>

        </section>

      </main>


      {/* =========================
          FOOTER
      ========================= */}

      <footer className="fb-footer">

        <div className="container d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">

          <span>

            <span className="fb-footer-name">
              FoodBridge AI
            </span>

            {" "}

            &mdash; {t("better food, shared further.")}

          </span>


          <span>
    {t("Reducing waste. Feeding communities.")}
</span>

        </div>

      </footer>

    </div>
  );
}

export default Home;