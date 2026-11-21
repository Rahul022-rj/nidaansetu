import { useState } from "react";
import { Icon } from "../../components/Icons.jsx";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { get, patch, upload, errorMessage } from "../../api/client.js";
import { useAuth } from "../../auth/AuthContext.jsx";
import { Header, Badge, ErrorMsg, Field, Pager, QueryState, Stat, Tabs } from "../../components/ui.jsx";
import { rs, prettyDate, prettyDateTime, LAB_SLOTS } from "../../utils.js";

const FLOW = [
  { key: "requested", label: "Nayi request", icon: "inbox" },
  { key: "confirmed", label: "Sample lena hai", icon: "truck" },
  { key: "collected", label: "Report daalni hai", icon: "upload" },
  { key: "report_ready", label: "Ho gaya", icon: "checkCircle" },
];

export default function LabPanel() {
  const { user } = useAuth();
  const [tab, setTab] = useState("requested");
  // Counts come with every bookings response; a tiny query keeps them fresh on every tab
  const counts = useQuery({ queryKey: ["labCounts"], queryFn: () => get("/lab/bookings", { limit: 1 }), refetchInterval: 15_000 });
  const c = counts.data?.counts || {};
  const tabs = [...FLOW.map((f) => ({ ...f, count: c[f.key] || 0 })), { key: "tests", label: "Rate list", icon: "list" }, { key: "money", label: "Hisaab", icon: "wallet" }];

  return (
    <div className="app panel">
      <Header title={`Lab: ${user.lab?.name || ""}`} subtitle="Lab panel" />
      <main className="container">
        <Tabs tabs={tabs} value={tab} onChange={setTab} />
        {FLOW.some((f) => f.key === tab) && <BookingList status={tab} />}
        {tab === "tests" && <RateList />}
        {tab === "money" && <Settlements />}
      </main>
    </div>
  );
}

function BookingList({ status }) {
  const [page, setPage] = useState(1);
  const q = useQuery({
    queryKey: ["labBookings", status, page],
    queryFn: () => get("/lab/bookings", { status, page, limit: 20, sort: status === "report_ready" ? "-createdAt" : "date" }),
    refetchInterval: 15_000, // new requests appear on their own
  });
  return (
    <QueryState query={q} empty="Is section mein abhi kuch nahi hai.">
      {(d) => (
        <>
          <div className="grid">
            {d.data.map((b) => (
              <LabCard key={b._id} b={b} />
            ))}
          </div>
          <Pager meta={d.meta} onPage={setPage} />
        </>
      )}
    </QueryState>
  );
}

function LabCard({ b }) {
  const qc = useQueryClient();
  const [time, setTime] = useState(LAB_SLOTS.find((s) => b.slot?.startsWith(s.slice(0, 8))) || LAB_SLOTS[0]);
  const [otp, setOtp] = useState("");
  const [payMode, setPayMode] = useState(b.payment?.mode === "upi" ? "upi" : "cash");
  const [file, setFile] = useState(null);
  const [reason, setReason] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const run = async (fn) => {
    setErr("");
    setBusy(true);
    try {
      await fn();
      qc.invalidateQueries({ queryKey: ["labBookings"] });
      qc.invalidateQueries({ queryKey: ["labCounts"] });
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  async function viewReport() {
    try {
      const r = await get(`/bookings/${b._id}/report`);
      window.open(r.url, "_blank", "noopener");
    } catch (e) {
      setErr(errorMessage(e));
    }
  }

  return (
    <div className="card" data-testid="lab-card">
      <div className="row-between">
        <h3>
          {b.patientName}
          {b.patientAge ? `, ${b.patientAge} saal` : ""}
        </h3>
        <Badge status={b.status} />
      </div>
      {b.source === "doctor" && <div className="chip ref"><Icon name="steth" size={15} /> {b.referredBy?.name} ne refer kiya</div>}
      <p className="meta">
        <Icon name="pin" size={17} /> {b.village?.name} · {b.address}
      </p>
      <p className="meta">
        <Icon name="phone" size={17} />
        <a href={`tel:${b.patient?.phone}`} className="link-btn">
          {b.patient?.phone}
        </a>
        <span className="code-chip">{b.code}</span>
      </p>
      <p className="meta strong">
        <Icon name="flask" size={17} /> {b.items.map((i) => i.name).join(", ")}
      </p>
      <p className="meta">
        <Icon name="calendar" size={17} /> {prettyDate(b.date)} · {b.collectionTime || b.slot}
      </p>
      <div className="row-between">
        <span className="muted">
          Patient dega ({b.payment?.mode === "upi" ? "UPI" : "Cash"})
        </span>
        <strong>{rs(b.total)}</strong>
      </div>
      <div className="row-between">
        <span className="muted small">Lab ka hissa</span>
        <span className="small">{rs(b.labPayout)}</span>
      </div>

      {b.status === "requested" && (
        <div className="actions">
          <Field label="Collector kab jaayega?">
            <select value={time} onChange={(e) => setTime(e.target.value)}>
              {LAB_SLOTS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          {rejecting ? (
            <>
              <Field label="Mana karne ka kaaran">
                <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Collector nahi hai, test nahi hota…" />
              </Field>
              <div className="btn-row">
                <button className="secondary-btn small danger" disabled={busy} onClick={() => run(() => patch(`/lab/bookings/${b._id}/reject`, { reason: reason || undefined }))}>
                  Haan, mana karein
                </button>
                <button className="link-btn" onClick={() => setRejecting(false)}>
                  Rehne dein
                </button>
              </div>
            </>
          ) : (
            <div className="btn-row">
              <button className="primary-btn small" disabled={busy} onClick={() => run(() => patch(`/lab/bookings/${b._id}/confirm`, { collectionTime: time }))}>
                ✓ Confirm, sample lene aayenge
              </button>
              <button className="secondary-btn small" disabled={busy} onClick={() => setRejecting(true)}>
                Mana karein
              </button>
            </div>
          )}
        </div>
      )}

      {b.status === "confirmed" && (
        <div className="actions">
          {b.otpLocked ? (
            <p className="error">OTP 5 baar galat hua, booking lock hai. NidaanSetu team ko call karein.</p>
          ) : (
            <>
              <Field label="Patient se OTP lekar daalein">
                <input inputMode="numeric" maxLength={4} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} placeholder="4 ank" aria-label="OTP" />
              </Field>
              <div className="pill-row" role="radiogroup" aria-label="Payment">
                {[
                  ["cash", "Cash liya"],
                  ["upi", "UPI se mila"],
                ].map(([k, l]) => (
                  <button key={k} role="radio" aria-checked={payMode === k} className={`pill ${payMode === k ? "on" : ""}`} onClick={() => setPayMode(k)}>
                    {l}
                  </button>
                ))}
              </div>
              <button className="primary-btn small" disabled={busy || otp.length !== 4} onClick={() => run(() => patch(`/lab/bookings/${b._id}/collect`, { otp, paymentMode: payMode }))}>
                Sample le liya ✓
              </button>
            </>
          )}
        </div>
      )}

      {b.status === "collected" && (
        <div className="actions">
          <Field label="Report upload karein (PDF, JPG ya PNG, 5 MB tak)">
            <input type="file" accept="application/pdf,image/png,image/jpeg" onChange={(e) => setFile(e.target.files?.[0] || null)} aria-label="Report file" />
          </Field>
          {file && file.size > 5 * 1024 * 1024 && <p className="error">File 5 MB se badi hai</p>}
          <button className="primary-btn small" disabled={busy || !file || file.size > 5 * 1024 * 1024} onClick={() => run(() => upload(`/lab/bookings/${b._id}/report`, "report", file))}>
            {busy ? "Upload ho raha hai…" : "📄 Report bhejein"}
          </button>
        </div>
      )}

      {b.status === "report_ready" && (
        <button className="secondary-btn small" onClick={viewReport}>
          Report dekhein ({b.report?.name})
        </button>
      )}
      <ErrorMsg msg={err} />
    </div>
  );
}

function RateList() {
  const q = useQuery({ queryKey: ["labTests"], queryFn: () => get("/lab/tests") });
  const [search, setSearch] = useState("");
  return (
    <QueryState query={q} empty="Abhi koi test nahi juda. Agent se rate list judwayein.">
      {(d) => (
        <>
          <p className="muted">
            Walk-in rate aapka counter rate hai. Patient rate app pe dikhta hai. Lab ka hissa = walk-in rate − {d.lab.commissionPercent}%.
          </p>
          <input className="search" placeholder="Test dhoondein" value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Test</th>
                  <th>Walk-in rate</th>
                  <th>Patient rate</th>
                  <th>Lab ka hissa</th>
                  <th>Chalu?</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {d.data
                  .filter((x) => x.name.toLowerCase().includes(search.toLowerCase()))
                  .map((x) => (
                    <TestRow key={x._id} test={x} />
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </QueryState>
  );
}

function TestRow({ test }) {
  const qc = useQueryClient();
  const [walkIn, setWalkIn] = useState(String(test.walkInPrice));
  const [listing, setListing] = useState(String(test.listingPrice));
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);
  const dirty = Number(walkIn) !== test.walkInPrice || Number(listing) !== test.listingPrice;

  async function save(body) {
    setErr("");
    try {
      await patch(`/lab/tests/${test._id}`, body);
      qc.invalidateQueries({ queryKey: ["labTests"] });
      setOk(true);
      setTimeout(() => setOk(false), 1500);
    } catch (e) {
      setErr(errorMessage(e));
    }
  }

  return (
    <tr className={test.active ? "" : "row-off"}>
      <td>
        {test.name}
        {err && <div className="field-error">{err}</div>}
      </td>
      <td>
        <input className="price-input" inputMode="numeric" value={walkIn} onChange={(e) => setWalkIn(e.target.value.replace(/\D/g, ""))} aria-label={`${test.name} walk-in rate`} />
      </td>
      <td>
        <input className="price-input" inputMode="numeric" value={listing} onChange={(e) => setListing(e.target.value.replace(/\D/g, ""))} aria-label={`${test.name} patient rate`} />
      </td>
      <td>{rs(test.b2bPrice)}</td>
      <td>
        <button className={`pill ${test.active ? "on" : ""}`} onClick={() => save({ active: !test.active })} aria-pressed={test.active}>
          {test.active ? "Haan" : "Band"}
        </button>
      </td>
      <td>
        {dirty && (
          <button
            className="primary-btn small"
            onClick={() =>
              save({
                ...(Number(walkIn) !== test.walkInPrice ? { walkInPrice: Number(walkIn) } : {}),
                ...(Number(listing) !== test.listingPrice ? { listingPrice: Number(listing) } : {}),
              })
            }
          >
            Save
          </button>
        )}
        {ok && <span className="ok-inline">✓</span>}
      </td>
    </tr>
  );
}

function Settlements() {
  const [page, setPage] = useState(1);
  const q = useQuery({ queryKey: ["labSettlements", page], queryFn: () => get("/lab/settlements", { page }) });
  return (
    <>
      <p className="muted">Har Monday subah pichhle hafte ka hisaab banta hai. Net = lab ka hissa − collector ke paas cash.</p>
      <QueryState query={q} empty="Abhi koi hisaab nahi bana.">
        {(d) => (
          <>
            {d.data.map((s) => (
              <div key={s._id} className="card">
                <div className="row-between">
                  <h3>
                    {prettyDate(s.weekStart.slice(0, 10))} – {prettyDate(new Date(new Date(s.weekEnd).getTime() - 86400000).toISOString().slice(0, 10))}
                  </h3>
                  <Badge status={s.status} label={s.status === "paid" ? "Paid" : "Baaki"} />
                </div>
                <div className="stat-row">
                  <Stat label="Kul order" value={rs(s.gross)} />
                  <Stat label="Lab ka hissa" value={rs(s.labPayout)} />
                  <Stat label="Collector ke paas cash" value={rs(s.cashWithLab)} />
                  <Stat label={s.netPayable >= 0 ? "Aapko milega" : "Aapko dena hai"} value={rs(Math.abs(s.netPayable))} />
                </div>
                {s.status === "paid" && (
                  <p className="muted small">
                    Paid {prettyDateTime(s.paidAt)} · Ref {s.reference}
                  </p>
                )}
              </div>
            ))}
            <Pager meta={d.meta} onPage={setPage} />
          </>
        )}
      </QueryState>
    </>
  );
}
