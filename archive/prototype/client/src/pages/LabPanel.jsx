import { useEffect, useState } from "react";
import { api } from "../api/index.js";
import { Header, Badge, ErrorMsg, Empty } from "../components/ui.jsx";
import { rs, prettyDate, SLOTS } from "../utils.js";

const TABS = [
  { key: "requested", label: "Nayi request" },
  { key: "confirmed", label: "Sample lena hai" },
  { key: "collected", label: "Report daalni hai" },
  { key: "report_ready", label: "Ho gaya" },
];

export default function LabPanel({ session, onExit }) {
  const [list, setList] = useState([]);
  const [tab, setTab] = useState("requested");
  const [err, setErr] = useState("");

  const load = () => api.labBookings().then(setList).catch((e) => setErr(e.message));
  useEffect(() => {
    load();
    const t = setInterval(load, 8000); // nayi request apne aap dikhe
    return () => clearInterval(t);
  }, []);

  const count = (k) => list.filter((b) => b.status === k).length;
  const shown = list.filter((b) => b.status === tab);
  const replace = (b) => setList((l) => l.map((x) => (x._id === b._id ? { ...x, ...b, distanceKm: x.distanceKm } : x)));
  const earnings = list.filter((b) => b.status !== "cancelled").reduce((s, b) => s + b.total, 0);

  return (
    <div className="app panel">
      <Header title={`Lab: ${session.name}`} onExit={onExit} subtitle="Lab panel" />
      <main className="container">
        <div className="stat-row">
          <div className="stat"><span>Kul booking</span><strong>{list.length}</strong></div>
          <div className="stat"><span>Nayi request</span><strong>{count("requested")}</strong></div>
          <div className="stat"><span>Report di</span><strong>{count("report_ready")}</strong></div>
          <div className="stat"><span>Order value</span><strong>{rs(earnings)}</strong></div>
        </div>
        <div className="tabs">
          {TABS.map((t) => (
            <button key={t.key} className={`tab ${tab === t.key ? "on" : ""}`} onClick={() => setTab(t.key)}>
              {t.label} <span className="count">{count(t.key)}</span>
            </button>
          ))}
        </div>
        <ErrorMsg msg={err} />
        {shown.length === 0 && <Empty text="Is section mein abhi kuch nahi hai." />}
        <div className="grid">
          {shown.map((b) => (
            <LabCard key={b._id} b={b} onChange={replace} />
          ))}
        </div>
      </main>
    </div>
  );
}

function LabCard({ b, onChange }) {
  const [time, setTime] = useState(b.slot && SLOTS.includes(b.slot) ? b.slot : SLOTS[0]);
  const [otp, setOtp] = useState("");
  const [file, setFile] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const run = async (fn) => {
    setErr("");
    setBusy(true);
    try {
      onChange(await fn());
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card">
      <div className="row-between">
        <h3>{b.patientName}{b.age ? `, ${b.age} saal` : ""}</h3>
        <Badge status={b.status} />
      </div>
      {b.source === "doctor" && <div className="chip ref">🩺 {b.doctor?.name} ne refer kiya</div>}
      <p className="muted">
        📍 {b.village?.name}{b.distanceKm != null ? ` (${b.distanceKm} km)` : ""} · {b.address || "Pata nahi diya"}
      </p>
      <p className="muted">📞 {b.phone} · {b.code}</p>
      <p>
        🧪 {b.tests.map((t) => t.name).join(", ")}
      </p>
      <p className="muted">
        📅 {prettyDate(b.date)} · {b.collectionTime || b.slot}
      </p>
      <div className="row-between">
        <span className="muted">Patient dega</span>
        <strong>{rs(b.total)}</strong>
      </div>

      {b.status === "requested" && (
        <div className="actions">
          <label className="field-label">Collector kab jaayega?</label>
          <select value={time} onChange={(e) => setTime(e.target.value)}>
            {SLOTS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <div className="btn-row">
            <button className="primary-btn small" disabled={busy} onClick={() => run(() => api.labConfirm(b._id, time))}>
              ✓ Confirm, sample lene aayenge
            </button>
            <button className="secondary-btn small" disabled={busy} onClick={() => run(() => api.labReject(b._id))}>
              Mana karein
            </button>
          </div>
        </div>
      )}

      {b.status === "confirmed" && (
        <div className="actions">
          <label className="field-label">Patient se OTP lekar daalein</label>
          <div className="btn-row">
            <input inputMode="numeric" maxLength={4} value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="4 ank" />
            <button className="primary-btn small" disabled={busy || otp.length !== 4} onClick={() => run(() => api.labCollect(b._id, otp))}>
              Sample le liya ✓
            </button>
          </div>
        </div>
      )}

      {b.status === "collected" && (
        <div className="actions">
          <label className="field-label">Report upload karein (PDF ya photo)</label>
          <input type="file" accept="application/pdf,image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <button className="primary-btn small" disabled={busy || !file} onClick={() => run(() => api.labUploadReport(b._id, file))}>
            {busy ? "Upload ho raha hai…" : "📄 Report bhejein"}
          </button>
        </div>
      )}

      {b.status === "report_ready" && (
        <a className="secondary-btn small" href={api.reportLink(b)} target="_blank" rel="noreferrer" download={b.reportName}>
          Report dekhein ({b.reportName})
        </a>
      )}
      <ErrorMsg msg={err} />
    </div>
  );
}
