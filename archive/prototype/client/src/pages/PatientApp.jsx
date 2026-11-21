import { useEffect, useMemo, useState } from "react";
import { api } from "../api/index.js";
import { Header, Back, Field, Badge, Steps, ErrorMsg, Empty } from "../components/ui.jsx";
import { rs, nextDays, dayHi, prettyDate, SLOTS } from "../utils.js";

const PREF = "sehatdwaar_patient";
const readPref = () => {
  try {
    return JSON.parse(localStorage.getItem(PREF) || "{}");
  } catch (e) {
    return {};
  }
};
const writePref = (p) => {
  try {
    localStorage.setItem(PREF, JSON.stringify(p));
  } catch (e) {
    /* ignore */
  }
};

export default function PatientApp({ onExit }) {
  const [pref, setPref] = useState(readPref);
  const [villages, setVillages] = useState([]);
  const [view, setView] = useState(pref.villageId ? "home" : "village");
  const [lab, setLab] = useState(null);
  const [cart, setCart] = useState([]);
  const [doctor, setDoctor] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    api.getVillages().then(setVillages).catch(() => setVillages([]));
  }, []);

  const village = villages.find((v) => v._id === pref.villageId);
  const updatePref = (p) => {
    const next = { ...pref, ...p };
    setPref(next);
    writePref(next);
  };

  let body;
  if (!villages.length) {
    body = <p className="muted">Load ho raha hai…</p>;
  } else if (view === "village" || !village) {
    body = (
      <VillagePick
        villages={villages}
        current={pref.villageId}
        onPick={(id) => {
          updatePref({ villageId: id });
          setView("home");
        }}
      />
    );
  } else if (view === "home") {
    body = <PatientHome village={village} go={setView} />;
  } else if (view === "labs") {
    body = (
      <LabList
        village={village}
        onBack={() => setView("home")}
        onPick={(l) => {
          setLab(l);
          setCart([]);
          setView("tests");
        }}
      />
    );
  } else if (view === "tests") {
    body = <TestPick lab={lab} cart={cart} setCart={setCart} onBack={() => setView("labs")} onNext={() => setView("details")} />;
  } else if (view === "details") {
    body = (
      <BookingForm
        lab={lab}
        cart={cart}
        village={village}
        pref={pref}
        onBack={() => setView("tests")}
        onDone={(b, form) => {
          updatePref({ name: form.patientName, phone: form.phone });
          setResult(b);
          setView("booked");
        }}
      />
    );
  } else if (view === "booked") {
    body = <Booked booking={result} onHome={() => setView("home")} onMine={() => setView("mine")} />;
  } else if (view === "doctors") {
    body = (
      <DoctorList
        village={village}
        onBack={() => setView("home")}
        onPick={(d) => {
          setDoctor(d);
          setView("docBook");
        }}
      />
    );
  } else if (view === "docBook") {
    body = (
      <DoctorBook
        doctor={doctor}
        village={village}
        pref={pref}
        onBack={() => setView("doctors")}
        onDone={(a, form) => {
          updatePref({ name: form.patientName, phone: form.phone });
          setResult(a);
          setView("docBooked");
        }}
      />
    );
  } else if (view === "docBooked") {
    body = <DocBooked appt={result} onHome={() => setView("home")} onMine={() => setView("mine")} />;
  } else if (view === "mine") {
    body = <MyBookings phone={pref.phone} onBack={() => setView("home")} onPhone={(phone) => updatePref({ phone })} />;
  }

  return (
    <div className="app patient">
      <Header title="Mareez" onExit={onExit} />
      <main className="container narrow">{body}</main>
    </div>
  );
}

function VillagePick({ villages, current, onPick }) {
  const [id, setId] = useState(current || "");
  return (
    <section>
      <h1 className="big-title">Aapka gaon kaunsa hai?</h1>
      <p className="muted">Hum aapke gaon ke paas ke lab aur doctor dikhayenge.</p>
      <div className="village-grid">
        {villages.map((v) => (
          <button key={v._id} className={`village-btn ${id === v._id ? "selected" : ""}`} onClick={() => setId(v._id)}>
            <span className="v-name">{v.name}</span>
            <span className="v-block">{v.block}</span>
          </button>
        ))}
      </div>
      <button className="primary-btn" disabled={!id} onClick={() => onPick(id)}>
        Aage badhein →
      </button>
    </section>
  );
}

function PatientHome({ village, go }) {
  return (
    <section>
      <div className="village-bar">
        <span>📍 {village?.name}</span>
        <button className="link-btn" onClick={() => go("village")}>
          Gaon badlein
        </button>
      </div>
      <h1 className="big-title">Namaste! Aapko kya chahiye?</h1>
      <div className="big-actions">
        <button className="big-action teal" onClick={() => go("labs")}>
          <span className="ba-icon" aria-hidden="true">🩸</span>
          <span className="ba-text">
            <strong>Khoon / Peshab ki jaanch</strong>
            <small>Ghar se sample, report WhatsApp pe</small>
          </span>
        </button>
        <button className="big-action violet" onClick={() => go("doctors")}>
          <span className="ba-icon" aria-hidden="true">🩺</span>
          <span className="ba-text">
            <strong>Doctor ka number lagayein</strong>
            <small>Kaun doctor kab baithte hain, fees kitni</small>
          </span>
        </button>
        <button className="big-action amber" onClick={() => go("mine")}>
          <span className="ba-icon" aria-hidden="true">📄</span>
          <span className="ba-text">
            <strong>Meri booking aur report</strong>
            <small>Mobile number se dekhein</small>
          </span>
        </button>
      </div>
      <p className="save-line">🚌 Bazaar jaane ka kiraya aur din dono bachaiye.</p>
    </section>
  );
}

function LabList({ village, onBack, onPick }) {
  const [labs, setLabs] = useState(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    api.getLabs(village._id).then(setLabs).catch((e) => setErr(e.message));
  }, [village]);
  return (
    <section>
      <Back onClick={onBack} />
      <h1 className="big-title">Aapke paas ke lab</h1>
      <p className="muted">📍 {village.name} se doori ke hisaab se</p>
      <ErrorMsg msg={err} />
      {!labs && !err && <p className="muted">Load ho raha hai…</p>}
      {labs && labs.length === 0 && <Empty text="Abhi koi lab nahi juda hai." />}
      {labs?.map((l) => (
        <div key={l._id} className={`card lab-card ${l.inRange ? "" : "out"}`}>
          <div className="row-between">
            <h3>{l.name}</h3>
            <span className="km">{l.distanceKm} km</span>
          </div>
          <p className="muted">{l.address}</p>
          <div className="chips">
            {l.inRange ? <span className="chip ok">✓ Ghar se sample milega</span> : <span className="chip no">Aapka gaon door hai, lab jaana hoga</span>}
            <span className="chip">{l.tests.length} test</span>
            <span className="chip">₹{l.freeAbove}+ pe collection free</span>
          </div>
          <button className="primary-btn" disabled={!l.inRange} onClick={() => onPick(l)}>
            Test chunein →
          </button>
        </div>
      ))}
    </section>
  );
}

function TestPick({ lab, cart, setCart, onBack, onNext }) {
  const [q, setQ] = useState("");
  const list = lab.tests.filter((t) => t.name.toLowerCase().includes(q.toLowerCase()));
  const has = (t) => cart.some((c) => c.name === t.name);
  const toggle = (t) => setCart(has(t) ? cart.filter((c) => c.name !== t.name) : [...cart, t]);
  const total = cart.reduce((s, t) => s + t.price, 0);
  const fee = total >= lab.freeAbove || total === 0 ? 0 : lab.collectionFee;
  return (
    <section className="with-footer">
      <Back onClick={onBack} />
      <h1 className="big-title">Kaunsa test karwana hai?</h1>
      <p className="muted">{lab.name}</p>
      <input className="search" placeholder="Test ka naam likhein (jaise sugar)" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="test-list">
        {list.map((t) => (
          <button key={t.name} className={`test-item ${has(t) ? "on" : ""}`} onClick={() => toggle(t)}>
            <span className="tick">{has(t) ? "✓" : "+"}</span>
            <span className="t-name">{t.name}</span>
            <span className="t-price">{rs(t.price)}</span>
          </button>
        ))}
      </div>
      <div className="footer-bar">
        <div>
          <div className="fb-total">{rs(total + fee)}</div>
          <div className="fb-sub">
            {cart.length} test{fee ? ` + ${rs(fee)} ghar se sample` : total ? " · sample lena free" : ""}
          </div>
        </div>
        <button className="primary-btn small" disabled={!cart.length} onClick={onNext}>
          Aage →
        </button>
      </div>
    </section>
  );
}

function BookingForm({ lab, cart, village, pref, onBack, onDone }) {
  const days = nextDays(3);
  const [f, setF] = useState({
    patientName: pref.name || "",
    age: "",
    phone: pref.phone || "",
    address: "",
    date: days[1].iso,
    slot: SLOTS[0],
  });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const total = cart.reduce((s, t) => s + t.price, 0);
  const fee = total >= lab.freeAbove ? 0 : lab.collectionFee;

  async function submit() {
    if (!f.patientName.trim()) return setErr("Mareez ka naam likhein");
    if (!/^\d{10}$/.test(f.phone)) return setErr("10 ankon ka mobile number likhein");
    setErr("");
    setBusy(true);
    try {
      const b = await api.createBooking({ ...f, villageId: village._id, labId: lab._id, tests: cart.map((t) => ({ name: t.name })) });
      onDone(b, f);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <Back onClick={onBack} />
      <h1 className="big-title">Mareez ki jaankari</h1>
      <Field label="Mareez ka naam">
        <input value={f.patientName} onChange={set("patientName")} placeholder="Ram Prasad" />
      </Field>
      <div className="two">
        <Field label="Umar">
          <input inputMode="numeric" value={f.age} onChange={set("age")} placeholder="55" />
        </Field>
        <Field label="Mobile number">
          <input inputMode="numeric" maxLength={10} value={f.phone} onChange={set("phone")} placeholder="98XXXXXXXX" />
        </Field>
      </div>
      <Field label="Ghar ka pata" hint={`Gaon: ${village.name}`}>
        <input value={f.address} onChange={set("address")} placeholder="Mandir ke paas, ward 4" />
      </Field>
      <div className="field">
        <span className="field-label">Kis din?</span>
        <div className="pill-row">
          {days.map((d) => (
            <button key={d.iso} className={`pill ${f.date === d.iso ? "on" : ""}`} onClick={() => setF({ ...f, date: d.iso })}>
              {d.label}
            </button>
          ))}
        </div>
      </div>
      <div className="field">
        <span className="field-label">Kis samay?</span>
        <div className="pill-row">
          {SLOTS.map((s) => (
            <button key={s} className={`pill ${f.slot === s ? "on" : ""}`} onClick={() => setF({ ...f, slot: s })}>
              {s}
            </button>
          ))}
        </div>
        <span className="field-hint">Sugar (fasting) ke liye subah ka samay chunein, khaali pet.</span>
      </div>
      <div className="card summary">
        {cart.map((t) => (
          <div key={t.name} className="row-between">
            <span>{t.name}</span>
            <span>{rs(t.price)}</span>
          </div>
        ))}
        <div className="row-between">
          <span>Ghar se sample</span>
          <span>{fee ? rs(fee) : "Free"}</span>
        </div>
        <div className="row-between total">
          <span>Kul</span>
          <span>{rs(total + fee)}</span>
        </div>
        <p className="muted small">Paisa sample dete samay cash ya UPI se dein.</p>
      </div>
      <ErrorMsg msg={err} />
      <button className="primary-btn" disabled={busy} onClick={submit}>
        {busy ? "Bhej rahe hain…" : "Booking pakki karein ✓"}
      </button>
    </section>
  );
}

function Booked({ booking, onHome, onMine }) {
  return (
    <section className="center">
      <div className="success-icon">✓</div>
      <h1 className="big-title">Booking ho gayi!</h1>
      <p>
        Booking number: <strong>{booking.code}</strong>
      </p>
      <div className="otp-box">
        <div className="muted">Collector ko yeh OTP batayein</div>
        <div className="otp">{booking.otp}</div>
      </div>
      <p className="muted">
        {booking.lab?.name} aapki request dekh ke confirm karega. {prettyDate(booking.date)}, {booking.slot}.
      </p>
      <Steps status={booking.status} />
      <button className="primary-btn" onClick={onMine}>
        Meri booking dekhein
      </button>
      <button className="secondary-btn" onClick={onHome}>
        Ghar (Home)
      </button>
    </section>
  );
}

function DoctorList({ village, onBack, onPick }) {
  const [docs, setDocs] = useState(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    api.getDoctors(village._id).then(setDocs).catch((e) => setErr(e.message));
  }, [village]);
  return (
    <section>
      <Back onClick={onBack} />
      <h1 className="big-title">Paas ke doctor</h1>
      <ErrorMsg msg={err} />
      {!docs && !err && <p className="muted">Load ho raha hai…</p>}
      {docs?.map((d) => (
        <div key={d._id} className="card doc-card">
          <div className="row-between">
            <h3>{d.name}</h3>
            <span className="km">{d.distanceKm} km</span>
          </div>
          <p className="doc-spec">
            {d.specialtyHi} · <span className="muted">{d.degree}</span>
          </p>
          <p className="muted">🏥 {d.clinic}</p>
          <div className="doc-info">
            <div>
              <span className="muted small">Kab baithte hain</span>
              <div>{d.days.map(dayHi).join(", ")}</div>
              <div>⏰ {d.timing}</div>
            </div>
            <div className="fee">
              <span className="muted small">Fees</span>
              <div className="fee-amt">{rs(d.fee)}</div>
            </div>
          </div>
          <button className="primary-btn" onClick={() => onPick(d)}>
            Number lagayein →
          </button>
        </div>
      ))}
    </section>
  );
}

function DoctorBook({ doctor, village, pref, onBack, onDone }) {
  const days = useMemo(() => nextDays(7).filter((d) => doctor.days.includes(d.day)), [doctor]);
  const [f, setF] = useState({ patientName: pref.name || "", age: "", phone: pref.phone || "", date: days[0]?.iso || "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit() {
    if (!f.patientName.trim()) return setErr("Mareez ka naam likhein");
    if (!/^\d{10}$/.test(f.phone)) return setErr("10 ankon ka mobile number likhein");
    if (!f.date) return setErr("Din chunein");
    setErr("");
    setBusy(true);
    try {
      const a = await api.createAppointment({ ...f, villageId: village._id, doctorId: doctor._id });
      onDone(a, f);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <Back onClick={onBack} />
      <h1 className="big-title">{doctor.name}</h1>
      <p className="muted">
        {doctor.specialtyHi} · {doctor.timing} · Fees {rs(doctor.fee)}
      </p>
      <Field label="Mareez ka naam">
        <input value={f.patientName} onChange={set("patientName")} placeholder="Sita Devi" />
      </Field>
      <div className="two">
        <Field label="Umar">
          <input inputMode="numeric" value={f.age} onChange={set("age")} placeholder="40" />
        </Field>
        <Field label="Mobile number">
          <input inputMode="numeric" maxLength={10} value={f.phone} onChange={set("phone")} placeholder="98XXXXXXXX" />
        </Field>
      </div>
      <div className="field">
        <span className="field-label">Kis din aayenge?</span>
        <div className="pill-row">
          {days.map((d) => (
            <button key={d.iso} className={`pill ${f.date === d.iso ? "on" : ""}`} onClick={() => setF({ ...f, date: d.iso })}>
              {d.label}
            </button>
          ))}
        </div>
        <span className="field-hint">Sirf woh din dikh rahe hain jab doctor baithte hain.</span>
      </div>
      <ErrorMsg msg={err} />
      <button className="primary-btn" disabled={busy} onClick={submit}>
        {busy ? "Number laga rahe hain…" : "Number pakka karein ✓"}
      </button>
      <p className="muted small">Fees clinic pe doctor ko dein.</p>
    </section>
  );
}

function DocBooked({ appt, onHome, onMine }) {
  return (
    <section className="center">
      <div className="success-icon">✓</div>
      <h1 className="big-title">Number lag gaya!</h1>
      <div className="otp-box">
        <div className="muted">Aapka number</div>
        <div className="otp">{appt.token}</div>
      </div>
      <p>
        {appt.doctor?.name} · {prettyDate(appt.date)} · {appt.doctor?.timing}
      </p>
      <p className="muted">Clinic: {appt.doctor?.clinic}</p>
      <button className="primary-btn" onClick={onMine}>
        Meri booking dekhein
      </button>
      <button className="secondary-btn" onClick={onHome}>
        Ghar (Home)
      </button>
    </section>
  );
}

function MyBookings({ phone: initial, onBack, onPhone }) {
  const [phone, setPhone] = useState(initial || "");
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  async function load(p = phone) {
    if (!/^\d{10}$/.test(p)) return setErr("10 ankon ka mobile number likhein");
    setErr("");
    try {
      const [b, a] = await Promise.all([api.myBookings(p), api.myAppointments(p)]);
      setData({ b, a });
      onPhone(p);
    } catch (e) {
      setErr(e.message);
    }
  }
  useEffect(() => {
    if (initial) load(initial);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section>
      <Back onClick={onBack} />
      <h1 className="big-title">Meri booking aur report</h1>
      <div className="search-row">
        <input inputMode="numeric" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Mobile number" />
        <button className="primary-btn small" onClick={() => load()}>
          Dekhein
        </button>
      </div>
      <ErrorMsg msg={err} />
      {data && data.b.length === 0 && data.a.length === 0 && <Empty text="Is number pe koi booking nahi mili." />}
      {data?.b.map((b) => (
        <div key={b._id} className="card">
          <div className="row-between">
            <h3>🩸 {b.tests.map((t) => t.name).join(", ")}</h3>
          </div>
          <p className="muted">
            {b.code} · {b.lab?.name} · {prettyDate(b.date)}
            {b.source === "doctor" && b.doctor ? ` · ${b.doctor.name} ne likha` : ""}
          </p>
          <Steps status={b.status} />
          {b.status === "confirmed" && <p className="info">🚴 Collector {b.collectionTime} aayega. OTP: <strong>{b.otp}</strong></p>}
          {b.status === "requested" && <p className="info">OTP: <strong>{b.otp}</strong> (collector ko batana hai)</p>}
          <div className="row-between wrap">
            <strong>{rs(b.total)}</strong>
            {b.status === "report_ready" && <ReportButton b={b} />}
          </div>
        </div>
      ))}
      {data?.a.map((a) => (
        <div key={a._id} className="card">
          <div className="row-between">
            <h3>🩺 {a.doctor?.name}</h3>
            <Badge status={a.status} />
          </div>
          <p className="muted">
            {prettyDate(a.date)} · {a.doctor?.timing} · Number <strong>{a.token}</strong>
          </p>
          {a.referredBooking && <p className="info">Doctor ne test likha: {a.referredBooking.tests.map((t) => t.name).join(", ")}</p>}
        </div>
      ))}
    </section>
  );
}

function ReportButton({ b }) {
  const [open, setOpen] = useState(false);
  const url = api.reportLink(b);
  const isImage = /^data:image\//.test(url || "") || /\.(png|jpe?g|webp)$/i.test(url || "");
  if (!isImage) {
    return (
      <a className="primary-btn small" href={url} target="_blank" rel="noreferrer">
        📄 Report kholein
      </a>
    );
  }
  return (
    <>
      <button className="primary-btn small" onClick={() => setOpen(!open)}>
        📄 {open ? "Report band karein" : "Report dekhein"}
      </button>
      {open && <img className="report-img" src={url} alt={`Report: ${b.reportName}`} />}
    </>
  );
}
