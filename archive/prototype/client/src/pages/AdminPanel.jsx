import { useEffect, useState } from "react";
import { api } from "../api/index.js";
import { Header, Badge, Field, ErrorMsg, Empty } from "../components/ui.jsx";
import { rs, prettyDate } from "../utils.js";

const TABS = [
  { key: "bookings", label: "Saari booking" },
  { key: "labs", label: "Labs" },
  { key: "doctors", label: "Doctors" },
  { key: "addLab", label: "+ Lab jodein" },
  { key: "addDoctor", label: "+ Doctor jodein" },
  { key: "addVillage", label: "+ Gaon jodein" },
];

const DEFAULT_TESTS = `CBC = 400
Sugar Fasting = 50
Sugar PP = 50
HbA1c = 550
Thyroid (T3, T4, TSH) = 600
Lipid Profile = 650
LFT (Liver) = 800
KFT (Kidney) = 600
Urine Routine = 100
Widal (Typhoid) = 120
Malaria = 100`;

export default function AdminPanel({ session, onExit }) {
  const [tab, setTab] = useState("bookings");
  const [stats, setStats] = useState(null);
  const [villages, setVillages] = useState([]);
  const refresh = () => {
    api.adminStats().then(setStats).catch(() => {});
    api.getVillages().then(setVillages).catch(() => {});
  };
  useEffect(refresh, []);

  return (
    <div className="app panel">
      <Header title={session.name} onExit={onExit} subtitle={session.role === "agent" ? "Agent panel" : "Admin panel"} />
      <main className="container">
        {stats && (
          <div className="stat-row">
            <div className="stat"><span>Gaon</span><strong>{stats.villages}</strong></div>
            <div className="stat"><span>Labs</span><strong>{stats.labs}</strong></div>
            <div className="stat"><span>Doctors</span><strong>{stats.doctors}</strong></div>
            <div className="stat"><span>Lab booking</span><strong>{stats.bookings}</strong></div>
            <div className="stat"><span>Doctor number</span><strong>{stats.appointments}</strong></div>
            {session.role === "admin" && <div className="stat"><span>Order value</span><strong>{rs(stats.gmv)}</strong></div>}
          </div>
        )}
        <div className="tabs wrap">
          {TABS.map((t) => (
            <button key={t.key} className={`tab ${tab === t.key ? "on" : ""}`} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>
        {tab === "bookings" && <AllBookings />}
        {tab === "labs" && <LabsList />}
        {tab === "doctors" && <DoctorsList />}
        {tab === "addLab" && <AddLab villages={villages} onDone={() => { refresh(); setTab("labs"); }} />}
        {tab === "addDoctor" && <AddDoctor villages={villages} onDone={() => { refresh(); setTab("doctors"); }} />}
        {tab === "addVillage" && <AddVillage onDone={() => { refresh(); setTab("bookings"); }} />}
      </main>
    </div>
  );
}

function AllBookings() {
  const [list, setList] = useState(null);
  useEffect(() => {
    api.adminBookings().then(setList).catch(() => setList([]));
  }, []);
  if (!list) return <p className="muted">Load ho raha hai…</p>;
  if (!list.length) return <Empty text="Abhi koi booking nahi. Mareez wale hisse se ek booking karke dekhiye." />;
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Mareez</th>
            <th>Gaon</th>
            <th>Lab</th>
            <th>Test</th>
            <th>Din</th>
            <th>Kul</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {list.map((b) => (
            <tr key={b._id}>
              <td>{b.code}{b.source === "doctor" ? " 🩺" : ""}</td>
              <td>{b.patientName}<div className="muted small">{b.phone}</div></td>
              <td>{b.village?.name}</td>
              <td>{b.lab?.name}</td>
              <td>{b.tests.map((t) => t.name).join(", ")}</td>
              <td>{prettyDate(b.date)}</td>
              <td>{rs(b.total)}</td>
              <td><Badge status={b.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LabsList() {
  const [list, setList] = useState([]);
  const load = () => api.adminLabs().then(setList);
  useEffect(() => {
    load();
  }, []);
  return (
    <div className="grid">
      {list.map((l) => (
        <div key={l._id} className={`card ${l.active ? "" : "out"}`}>
          <div className="row-between">
            <h3>{l.name}</h3>
            <span className={`badge ${l.active ? "badge-green" : "badge-red"}`}>{l.active ? "Chalu" : "Band"}</span>
          </div>
          <p className="muted">{[l.address, l.phone && `📞 ${l.phone}`].filter(Boolean).join(" · ") || "Pata nahi diya"}</p>
          <p className="muted">{l.radiusKm} km tak sample · ₹{l.freeAbove}+ pe free, warna ₹{l.collectionFee}</p>
          <p className="muted small">{l.tests.length} test · {l.pathologist || "Pathologist ka naam nahi"}</p>
          <button className="secondary-btn small" onClick={() => api.adminToggleLab(l._id).then(load)}>
            {l.active ? "Band karein" : "Chalu karein"}
          </button>
        </div>
      ))}
    </div>
  );
}

function DoctorsList() {
  const [list, setList] = useState([]);
  useEffect(() => {
    api.adminDoctors().then(setList);
  }, []);
  return (
    <div className="grid">
      {list.map((d) => (
        <div key={d._id} className="card">
          <h3>{d.name}</h3>
          <p className="muted">{d.specialty} · {d.degree}</p>
          <p className="muted">🏥 {d.clinic}</p>
          <p className="muted">{(d.days || []).join(", ")} · {d.timing} · {rs(d.fee)}</p>
        </div>
      ))}
    </div>
  );
}

function useForm(initial) {
  const [f, setF] = useState(initial);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return [f, setF, set];
}

function VillageSelect({ villages, value, onChange, label }) {
  return (
    <Field label={label} hint="Location isi gaon/bazaar ki li jaayegi (doori naapne ke liye)">
      <select value={value} onChange={onChange}>
        <option value="">-- chunein --</option>
        {villages.map((v) => (
          <option key={v._id} value={v._id}>
            {v.name} ({v.block})
          </option>
        ))}
      </select>
    </Field>
  );
}

function AddLab({ villages, onDone }) {
  const [f, , set] = useForm({
    name: "",
    address: "",
    phone: "",
    pathologist: "",
    villageId: "",
    radiusKm: "5",
    collectionFee: "49",
    freeAbove: "499",
    pin: "",
    tests: DEFAULT_TESTS,
  });
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  async function submit() {
    setErr("");
    const v = villages.find((x) => x._id === f.villageId);
    if (!f.name || !v || !f.pin) return setErr("Lab ka naam, location aur PIN zaroori hai");
    const tests = f.tests
      .split("\n")
      .map((line) => line.split("="))
      .filter((p) => p.length === 2 && p[0].trim() && Number(p[1]))
      .map(([n, p]) => ({ name: n.trim(), price: Number(p) }));
    if (!tests.length) return setErr("Kam se kam ek test 'Naam = Rate' format mein likhein");
    try {
      await api.adminAddLab({
        name: f.name,
        address: f.address,
        phone: f.phone,
        pathologist: f.pathologist,
        block: v.block,
        lat: v.lat,
        lng: v.lng,
        radiusKm: Number(f.radiusKm),
        collectionFee: Number(f.collectionFee),
        freeAbove: Number(f.freeAbove),
        pin: f.pin,
        tests,
      });
      setOk("Lab jud gaya ✓");
      setTimeout(onDone, 600);
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className="card form-card">
      <h2>Naya lab jodein</h2>
      <div className="two">
        <Field label="Lab ka naam"><input value={f.name} onChange={set("name")} placeholder="Maa Durga Pathology" /></Field>
        <Field label="Phone"><input value={f.phone} onChange={set("phone")} placeholder="98XXXXXXXX" /></Field>
      </div>
      <Field label="Pata"><input value={f.address} onChange={set("address")} placeholder="Main Bazaar, Maharajganj" /></Field>
      <div className="two">
        <VillageSelect villages={villages} value={f.villageId} onChange={set("villageId")} label="Lab kahan hai" />
        <Field label="Pathologist (report sign karne wale)"><input value={f.pathologist} onChange={set("pathologist")} placeholder="Dr. ___ (MD Pathology)" /></Field>
      </div>
      <div className="three">
        <Field label="Kitne km tak sample"><input inputMode="numeric" value={f.radiusKm} onChange={set("radiusKm")} /></Field>
        <Field label="Collection fee ₹"><input inputMode="numeric" value={f.collectionFee} onChange={set("collectionFee")} /></Field>
        <Field label="Iske upar free ₹"><input inputMode="numeric" value={f.freeAbove} onChange={set("freeAbove")} /></Field>
      </div>
      <Field label="Test aur rate (har line: Naam = Rate)">
        <textarea rows={8} value={f.tests} onChange={set("tests")} />
      </Field>
      <Field label="Lab login PIN" hint="Lab wale isi PIN se apna panel kholenge">
        <input value={f.pin} onChange={set("pin")} placeholder="4 ank" />
      </Field>
      <ErrorMsg msg={err} />
      {ok && <div className="ok">{ok}</div>}
      <button className="primary-btn" onClick={submit}>Lab jodein</button>
    </div>
  );
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function AddDoctor({ villages, onDone }) {
  const [f, setF, set] = useForm({
    name: "",
    degree: "MBBS",
    specialty: "General Physician",
    specialtyHi: "Aam bimari ke doctor",
    clinic: "",
    villageId: "",
    phone: "",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    timing: "10:00 AM - 2:00 PM",
    fee: "300",
    pin: "",
  });
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const toggleDay = (d) => setF({ ...f, days: f.days.includes(d) ? f.days.filter((x) => x !== d) : [...f.days, d] });

  async function submit() {
    setErr("");
    const v = villages.find((x) => x._id === f.villageId);
    if (!f.name || !v || !f.pin || !f.days.length) return setErr("Naam, location, din aur PIN zaroori hai");
    try {
      await api.adminAddDoctor({
        name: f.name,
        degree: f.degree,
        specialty: f.specialty,
        specialtyHi: f.specialtyHi,
        clinic: f.clinic,
        block: v.block,
        lat: v.lat,
        lng: v.lng,
        phone: f.phone,
        days: DAYS.filter((d) => f.days.includes(d)),
        timing: f.timing,
        fee: Number(f.fee),
        pin: f.pin,
      });
      setOk("Doctor jud gaye ✓");
      setTimeout(onDone, 600);
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className="card form-card">
      <h2>Naya doctor jodein</h2>
      <div className="two">
        <Field label="Doctor ka naam"><input value={f.name} onChange={set("name")} placeholder="Dr. ____" /></Field>
        <Field label="Degree"><input value={f.degree} onChange={set("degree")} /></Field>
      </div>
      <div className="two">
        <Field label="Specialty (English)"><input value={f.specialty} onChange={set("specialty")} /></Field>
        <Field label="Specialty (gaon ki bhasha mein)"><input value={f.specialtyHi} onChange={set("specialtyHi")} /></Field>
      </div>
      <div className="two">
        <Field label="Clinic ka naam"><input value={f.clinic} onChange={set("clinic")} placeholder="____ Clinic" /></Field>
        <VillageSelect villages={villages} value={f.villageId} onChange={set("villageId")} label="Clinic kahan hai" />
      </div>
      <div className="field">
        <span className="field-label">Kis din baithte hain</span>
        <div className="pill-row">
          {DAYS.map((d) => (
            <button key={d} type="button" className={`pill ${f.days.includes(d) ? "on" : ""}`} onClick={() => toggleDay(d)}>
              {d}
            </button>
          ))}
        </div>
      </div>
      <div className="three">
        <Field label="Samay"><input value={f.timing} onChange={set("timing")} /></Field>
        <Field label="Fees ₹"><input inputMode="numeric" value={f.fee} onChange={set("fee")} /></Field>
        <Field label="Phone"><input value={f.phone} onChange={set("phone")} /></Field>
      </div>
      <Field label="Doctor login PIN"><input value={f.pin} onChange={set("pin")} placeholder="4 ank" /></Field>
      <ErrorMsg msg={err} />
      {ok && <div className="ok">{ok}</div>}
      <button className="primary-btn" onClick={submit}>Doctor jodein</button>
    </div>
  );
}

function AddVillage({ onDone }) {
  const [f, , set] = useForm({ name: "", block: "Maharajganj", lat: "", lng: "" });
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  async function submit() {
    setErr("");
    if (!f.name || !f.lat || !f.lng) return setErr("Naam, latitude aur longitude zaroori hai");
    try {
      await api.adminAddVillage({ name: f.name, block: f.block, lat: Number(f.lat), lng: Number(f.lng) });
      setOk("Gaon jud gaya ✓");
      setTimeout(onDone, 600);
    } catch (e) {
      setErr(e.message);
    }
  }
  return (
    <div className="card form-card">
      <h2>Naya gaon jodein</h2>
      <div className="two">
        <Field label="Gaon ka naam"><input value={f.name} onChange={set("name")} /></Field>
        <Field label="Block"><input value={f.block} onChange={set("block")} /></Field>
      </div>
      <div className="two">
        <Field label="Latitude" hint="Google Maps pe gaon pe long-press karke milega"><input value={f.lat} onChange={set("lat")} placeholder="26.12" /></Field>
        <Field label="Longitude"><input value={f.lng} onChange={set("lng")} placeholder="84.49" /></Field>
      </div>
      <ErrorMsg msg={err} />
      {ok && <div className="ok">{ok}</div>}
      <button className="primary-btn" onClick={submit}>Gaon jodein</button>
    </div>
  );
}
