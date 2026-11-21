import { Link } from "react-router";
import { Icon } from "../../components/Icons.jsx";
import { useAuth } from "../../auth/AuthContext.jsx";
import { useT } from "../../i18n/I18nContext.jsx";
import { VillageScene, TestIcon, DoctorIcon, ReportIcon } from "../../components/Illustrations.jsx";

export default function PatientHome() {
  const { user } = useAuth();
  const { t } = useT();
  return (
    <section>
      <div className="village-bar">
        <span className="meta strong"><Icon name="pin" size={18} /> {user.village?.name}</span>
        <Link className="link-btn" to="/village">
          {t("village.change")}
        </Link>
      </div>
      <h1 className="big-title greet-title">{t("home.hello", { name: user.name.split(" ")[0] })}</h1>
      <div className="greet-card">
        <VillageScene label="" />
      </div>
      <div className="big-actions">
        <Link className="big-action teal" to="/jaanch">
          <span className="ba-icon"><TestIcon /></span>
          <span className="ba-text">
            <strong>{t("home.tests")}</strong>
            <small>{t("home.testsSub")}</small>
          </span>
        </Link>
        <Link className="big-action violet" to="/doctors">
          <span className="ba-icon"><DoctorIcon /></span>
          <span className="ba-text">
            <strong>{t("home.doctor")}</strong>
            <small>{t("home.doctorSub")}</small>
          </span>
        </Link>
        <Link className="big-action amber" to="/meri-booking">
          <span className="ba-icon"><ReportIcon /></span>
          <span className="ba-text">
            <strong>{t("home.mine")}</strong>
            <small>{t("home.mineSub")}</small>
          </span>
        </Link>
      </div>
      <p className="save-line">{t("home.save").replace(/^\S+\s/, "")}</p>
    </section>
  );
}
