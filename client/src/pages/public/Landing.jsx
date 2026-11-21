import { Link } from "react-router";
import { Header } from "../../components/ui.jsx";
import { Icon } from "../../components/Icons.jsx";
import { VillageScene, TestIcon, DoctorIcon, ReportIcon } from "../../components/Illustrations.jsx";
import DemoLogins from "../../components/DemoLogins.jsx";
import { useT } from "../../i18n/I18nContext.jsx";

const STAFF = [
  { to: "/login/lab", icon: "flask", label: "Lab", sub: "Order aur report", tone: "teal" },
  { to: "/login/doctor", icon: "steth", label: "Doctor", sub: "Aaj ke mareez", tone: "violet" },
  { to: "/login/agent", icon: "briefcase", label: "Agent", sub: "Lab, doctor jodein", tone: "amber" },
  { to: "/login/admin", icon: "shield", label: "Admin", sub: "Poora hisaab", tone: "rose" },
];

export default function Landing() {
  const { t } = useT();
  return (
    <div className="app landing">
      <Header showLang />

      <section className="hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <span className="eyebrow">
              <Icon name="pin" size={16} /> Siwan, Bihar
            </span>
            <h1>{t("landing.title")}</h1>
            <p className="lead">{t("landing.sub")}</p>
            <div className="hero-cta">
              <Link className="primary-btn" to="/signup">
                {t("landing.signup")} <Icon name="arrowRight" size={20} />
              </Link>
              <Link className="secondary-btn" to="/login">
                {t("landing.login")}
              </Link>
            </div>
            <ul className="trust">
              <li>
                <Icon name="truck" size={18} /> {t("landing.t1")}
              </li>
              <li>
                <Icon name="shield" size={18} /> {t("landing.t2")}
              </li>
              <li>
                <Icon name="rupee" size={18} /> {t("landing.t3")}
              </li>
            </ul>
          </div>
          <div className="hero-art">
            <VillageScene />
          </div>
        </div>
      </section>

      <main className="container">
        <h2 className="section-head">{t("landing.howTitle")}</h2>
        <ol className="how">
          <li>
            <TestIcon />
            <div>
              <span className="how-step">1</span>
              <strong>{t("landing.f1")}</strong>
            </div>
          </li>
          <li>
            <ReportIcon />
            <div>
              <span className="how-step">2</span>
              <strong>{t("landing.f2")}</strong>
            </div>
          </li>
          <li>
            <DoctorIcon />
            <div>
              <span className="how-step">3</span>
              <strong>{t("landing.f3")}</strong>
            </div>
          </li>
        </ol>

        <h2 className="section-head">{t("landing.staffTitle")}</h2>
        <div className="staff-grid">
          {STAFF.map((s) => (
            <Link key={s.to} className={`staff-card tone-${s.tone}`} to={s.to}>
              <span className="staff-icon">
                <Icon name={s.icon} size={26} />
              </span>
              <span className="staff-text">
                <strong>{s.label}</strong>
                <small>{s.sub}</small>
              </span>
              <Icon name="arrowRight" size={18} className="staff-arrow" />
            </Link>
          ))}
        </div>
        <p className="muted small center">{t("landing.staff")}</p>
        {import.meta.env.DEV && <DemoLogins />}
      </main>
      <footer className="site-footer">NidaanSetu · Gaon aur ilaaj ke beech ka setu</footer>
    </div>
  );
}
