import { useState } from "react";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { get, patch } from "../../api/client.js";
import { useAuth } from "../../auth/AuthContext.jsx";
import { useT } from "../../i18n/I18nContext.jsx";
import { ErrorMsg, QueryState } from "../../components/ui.jsx";

export default function VillagePick() {
  const { t } = useT();
  const { user, setUser } = useAuth();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [id, setId] = useState(user.village?._id || "");
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);
  const villages = useQuery({ queryKey: ["villages"], queryFn: () => get("/villages", { limit: 500 }), staleTime: 10 * 60_000 });

  async function save() {
    setBusy(true);
    try {
      setUser((await patch("/me", { villageId: id })).user);
      nav("/home", { replace: true });
    } catch (e) {
      setErr(e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <h1 className="big-title">{t("village.title")}</h1>
      <p className="muted">{t("village.sub")}</p>
      <input className="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("village.search")} aria-label={t("village.search")} />
      <QueryState query={villages} empty={t("village.none")}>
        {(d) => {
          const list = d.data.filter((v) => v.name.toLowerCase().includes(q.toLowerCase()));
          if (!list.length) return <p className="muted">{t("village.none")}</p>;
          return (
            <div className="village-grid" role="radiogroup">
              {list.map((v) => (
                <button key={v._id} role="radio" aria-checked={id === v._id} className={`village-btn ${id === v._id ? "selected" : ""}`} onClick={() => setId(v._id)}>
                  <span className="v-name">{v.name}</span>
                  <span className="v-block">
                    {v.block}, {v.district}
                  </span>
                </button>
              ))}
            </div>
          );
        }}
      </QueryState>
      <ErrorMsg error={err} />
      <button className="primary-btn" disabled={!id || busy} onClick={save}>
        {t("common.next")}
      </button>
    </section>
  );
}
