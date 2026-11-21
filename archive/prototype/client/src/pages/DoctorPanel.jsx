import { useEffect, useState } from "react";
import { api } from "../api/index.js";
import { Header, Badge, ErrorMsg, Empty } from "../components/ui.jsx";
import { rs, prettyDate, isoDate } from "../utils.js";

export default function DoctorPanel({ session, onExit }) {
  const [list, setList] = useState([]);
  const [err, setErr] = useState("");
  const today = isoDate(new Date());

  const load = () => api.doctorAppointments().then(setList).catch((e) => setErr(e.message));
  useEffect(() => {
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, []);

  const replace = (a) => setList((l) => l.map((x) => (x._id === a._id ? a : x)));
  const todays = list.filter((a) => a.date === today);
  const upcoming = list.filter((a) => a.date > today);
  const past = list.filter((a) => a.date < today);
  const referred = list.filter((a) => a.referredBooking).length;

  return (
    <div className="app panel">
      <Header title={session.name} onExit={onExit} subtitle="Doctor panel" />
      <main className="container">
        <div className="stat-row">
          <div className="stat"><span>Aaj ke mareez</span><strong>{todays.length}</strong></div>
          <div className="stat"><span>Aage ke</span><strong>{upcoming.length}</strong></div>
          <div className="stat"><span>Dekh liye</span><strong>{list.filter((a) => a.status === "seen").length}</strong></div>
          <div className="stat"><span>Lab ko refer</span><strong>{referred}</strong></div>
        </div>
        <ErrorMsg msg={err} />
        <Section title="Aaj" items={todays} onChange={replace} />
        <Section title="Aage ke din" items={upcoming} onChange={replace} />
        {past.length > 0 && <Section title="Pehle ke" items={past} onChange={replace} />}
        {list.length === 0 && <Empty icon="🩺" text="Abhi koi appointment nahi hai." />}
      </main>
    </div>
  );
}

function Section({ title, items, onChange }) {
  if (!items.length) return null;
  return (
    <>
      <h2 className="section-title">{title}</h2>
      <div className="grid">
        {items.map((a) => (
          <ApptCard key={a._id} a={a} onChange={onChange} />
        ))}
      </div>
    </>
  );
}

function ApptCard({ a, onChange }) {
  const [refer, setRefer] = useState(false);
  const [err, setErr] = useState("");

  async function seen() {
    try {
      onChange(await api.doctorSeen(a._id));
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className="card">
      <div className="row-between">
        <h3>
          <span className="token">#{a.token}</span> {a.patientName}
          {a.age ? `, ${a.age} saal` : ""}
        </h3>
        <Badge status={a.status} />
      </div>
      <p className="muted">
        📅 {prettyDate(a.date)} · 📍 {a.village?.name} · 📞 {a.phone}
      </p>
      {a.referredBooking ? (
        <>
          <div className="info">
            🧪 Lab test likha: {a.referredBooking.tests.map((t) => t.name).join(", ")} → {a.referredBooking.lab?.name}
            <div>
              <Badge status={a.referredBooking.status} />
            </div>
          </div>
          {a.status !== "seen" && (
            <button className="primary-btn small" onClick={seen}>
              ✓ Dekh liya
            </button>
          )}
        </>
      ) : refer ? (
        <ReferForm
          a={a}
          onCancel={() => setRefer(false)}
          onDone={(booking) => {
            setRefer(false);
            onChange({ ...a, referredBooking: booking });
          }}
        />
      ) : (
        <div className="btn-row">
          {a.status !== "seen" && (
            <button className="primary-btn small" onClick={seen}>
              ✓ Dekh liya
            </button>
          )}
          <button className="secondary-btn small" onClick={() => setRefer(true)}>
            🧪 Lab test likhein
          </button>
        </div>
      )}
      <ErrorMsg msg={err} />
    </div>
  );
}

function ReferForm({ a, onCancel, onDone }) {
  const [labs, setLabs] = useState([]);
  const [labId, setLabId] = useState("");
  const [picked, setPicked] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    api.getLabs(a.village?._id).then((l) => {
      const ok = l.filter((x) => x.inRange !== false);
      setLabs(ok.length ? ok : l);
      if ((ok.length ? ok : l)[0]) setLabId((ok.length ? ok : l)[0]._id);
    });
  }, [a]);

  const lab = labs.find((l) => l._id === labId);
  const toggle = (name) => setPicked((p) => (p.includes(name) ? p.filter((x) => x !== name) : [...p, name]));
  const total = lab ? lab.tests.filter((t) => picked.includes(t.name)).reduce((s, t) => s + t.price, 0) : 0;

  async function submit() {
    if (!picked.length) return setErr("Kam se kam ek test chunein");
    try {
      const b = await api.doctorRefer({ appointmentId: a._id, labId, tests: picked.map((name) => ({ name })) });
      onDone(b);
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className="actions">
      <label className="field-label">Kaunse lab mein?</label>
      <select
        value={labId}
        onChange={(e) => {
          setLabId(e.target.value);
          setPicked([]);
        }}
      >
        {labs.map((l) => (
          <option key={l._id} value={l._id}>
            {l.name} {l.distanceKm != null ? `(${l.distanceKm} km)` : ""}
          </option>
        ))}
      </select>
      <label className="field-label">Kaunse test?</label>
      <div className="mini-tests">
        {lab?.tests.map((t) => (
          <label key={t.name} className={`mini-test ${picked.includes(t.name) ? "on" : ""}`}>
            <input type="checkbox" checked={picked.includes(t.name)} onChange={() => toggle(t.name)} />
            {t.name} <span className="muted">{rs(t.price)}</span>
          </label>
        ))}
      </div>
      <div className="row-between">
        <span className="muted">Patient ko ghar se sample milega</span>
        <strong>{rs(total)}</strong>
      </div>
      <ErrorMsg msg={err} />
      <div className="btn-row">
        <button className="primary-btn small" onClick={submit}>
          Lab ko bhejein →
        </button>
        <button className="secondary-btn small" onClick={onCancel}>
          Rehne dein
        </button>
      </div>
    </div>
  );
}
