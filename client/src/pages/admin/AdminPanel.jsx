import { useState } from "react";
import { Icon } from "../../components/Icons.jsx";
import { Link } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { get, post, patch, del, errorMessage, fieldErrors } from "../../api/client.js";
import { useAuth } from "../../auth/AuthContext.jsx";
import { Header, Badge, ErrorMsg, Field, Pager, QueryState, Stat, Tabs, TempPassword } from "../../components/ui.jsx";
import { rs, prettyDate, prettyDateTime, roleLabel } from "../../utils.js";

const TABS = [
  { key: "dash", label: "Dashboard", icon: "chart" },
  { key: "finance", label: "Hisaab & commission", icon: "rupee" },
  { key: "users", label: "Users", icon: "users" },
  { key: "labs", label: "Labs", icon: "flask" },
  { key: "doctors", label: "Doctors", icon: "steth" },
  { key: "villages", label: "Gaon", icon: "map" },
  { key: "bookings", label: "Bookings", icon: "file" },
  { key: "appts", label: "Appointments", icon: "calendar" },
  { key: "settle", label: "Settlements", icon: "wallet" },
  { key: "audit", label: "Audit log", icon: "log" },
];

export default function AdminPanel() {
  const { user } = useAuth();
  const [tab, setTab] = useState("dash");
  return (
    <div className="app panel">
      <Header title={user.name} subtitle="Super admin">
        <Link className="chip-btn" to="/agent">
          <Icon name="plus" size={18} />
          <span className="hide-sm">Lab/doctor jodein</span>
        </Link>
      </Header>
      <main className="container">
        <Tabs wrap tabs={TABS} value={tab} onChange={setTab} />
        {tab === "dash" && <Dashboard />}
        {tab === "finance" && <Finance />}
        {tab === "users" && <Users />}
        {tab === "labs" && <Labs />}
        {tab === "doctors" && <Doctors />}
        {tab === "villages" && <Villages />}
        {tab === "bookings" && <Bookings />}
        {tab === "appts" && <Appointments />}
        {tab === "settle" && <Settlements />}
        {tab === "audit" && <Audit />}
      </main>
    </div>
  );
}

// Paginated list with a filter object; resets to page 1 when filters change.
function useList(key, url, filters) {
  const [page, setPage] = useState(1);
  const clean = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== "" && v !== undefined));
  const sig = JSON.stringify(clean);
  const [lastSig, setLastSig] = useState(sig);
  if (sig !== lastSig) {
    setLastSig(sig);
    setPage(1);
  }
  const q = useQuery({ queryKey: [key, page, clean], queryFn: () => get(url, { page, limit: 20, ...clean }), placeholderData: (prev) => prev });
  return { q, page, setPage };
}

function Filters({ children }) {
  return <div className="filters">{children}</div>;
}

// ---------- dashboard ----------
function BarChart({ data, valueKey, label, format = (v) => v }) {
  const max = Math.max(1, ...data.map((d) => d[valueKey]));
  if (!data.some((d) => d[valueKey] > 0))
    return (
      <figure className="chart">
        <figcaption className="field-label">{label}</figcaption>
        <p className="chart-empty">Is samay mein abhi koi booking nahi.</p>
      </figure>
    );
  const w = 18;
  const h = 140;
  return (
    <figure className="chart">
      <figcaption className="field-label">{label}</figcaption>
      <div className="chart-scroll">
        <svg width={data.length * (w + 4)} height={h + 30} role="img" aria-label={label}>
          {data.map((d, i) => {
            const bh = Math.round((d[valueKey] / max) * h);
            return (
              <g key={d.date} transform={`translate(${i * (w + 4)},0)`}>
                <title>{`${prettyDate(d.date)}: ${format(d[valueKey])}`}</title>
                <rect y={h - bh} width={w} height={Math.max(bh, d[valueKey] ? 2 : 0)} rx="3" className="bar" />
                {i % 5 === 0 && (
                  <text y={h + 16} x={w / 2} textAnchor="middle" className="axis">
                    {Number(d.date.slice(8))}/{Number(d.date.slice(5, 7))}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </figure>
  );
}

// Pending vs done at a glance, for lab tests and doctor tokens.
function Progress({ title, icon, groups }) {
  const total = groups.reduce((n, g) => n + g.n, 0);
  return (
    <div className="card work-card">
      <h3 className="meta strong">
        <Icon name={icon} size={20} /> {title} <span className="muted small">({total})</span>
      </h3>
      <div className="stack-bar" aria-hidden="true">
        {groups.map((g) => (g.n ? <span key={g.label} className={`seg seg-${g.tone}`} style={{ flex: g.n }} /> : null))}
      </div>
      <div className="work-legend">
        {groups.map((g) => (
          <div key={g.label}>
            <span className={`dot-${g.tone}`} />
            <span>{g.label}</span>
            <strong>{g.n}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function WorkStatus({ s }) {
  const b = s.byStatus || {};
  const a = s.apptByStatus || {};
  return (
    <div className="two">
      <Progress
        title="Lab jaanch"
        icon="flask"
        groups={[
          { label: "Nayi request (pending)", n: b.requested || 0, tone: "amber" },
          { label: "Sample lena baaki", n: b.confirmed || 0, tone: "violet" },
          { label: "Report baaki", n: b.collected || 0, tone: "teal" },
          { label: "Poora (report di)", n: b.report_ready || 0, tone: "green" },
          { label: "Cancel", n: b.cancelled || 0, tone: "rose" },
        ]}
      />
      <Progress
        title="Doctor ke number"
        icon="steth"
        groups={[
          { label: "Aana baaki (pending)", n: a.booked || 0, tone: "amber" },
          { label: "Dekh liya (poora)", n: a.seen || 0, tone: "green" },
          { label: "Nahi aaye", n: a.no_show || 0, tone: "violet" },
          { label: "Cancel", n: a.cancelled || 0, tone: "rose" },
        ]}
      />
    </div>
  );
}

function Dashboard() {
  const [days, setDays] = useState(30);
  const q = useQuery({ queryKey: ["stats", days], queryFn: () => get("/admin/stats", { days }), refetchInterval: 60_000 });
  return (
    <>
      <div className="pill-row">
        {[7, 30, 90].map((d) => (
          <button key={d} className={`pill ${days === d ? "on" : ""}`} onClick={() => setDays(d)}>
            {d} din
          </button>
        ))}
      </div>
      <QueryState query={q}>
        {(s) => (
          <>
            <div className="stat-row">
              <Stat icon="file" label="Bookings" value={s.bookings} />
              <Stat icon="rupee" tone="green" label="GMV" value={rs(s.gmv)} />
              <Stat icon="chart" tone="violet" label="Platform margin" value={rs(s.platformMargin)} />
              <Stat icon="wallet" tone="amber" label="Lab payout" value={rs(s.labPayout)} />
              <Stat icon="users" tone="rose" label="Repeat rate" value={`${s.repeatRate}%`} />
              <Stat icon="steth" label="Doctor tokens" value={s.counts.appointments} />
            </div>
            <div className="stat-row">
              <Stat icon="user" label="Patients" value={s.counts.patients} />
              <Stat icon="briefcase" tone="amber" label="Agents" value={s.counts.agents} />
              <Stat icon="flask" label="Labs (chalu)" value={s.counts.labs} />
              <Stat icon="steth" tone="violet" label="Doctors (chalu)" value={s.counts.doctors} />
              <Stat icon="map" tone="green" label="Gaon" value={s.counts.villages} />
              <Stat icon="wallet" tone="rose" label="Settlement baaki" value={s.counts.pendingSettlements} />
            </div>
            <WorkStatus s={s} />
            <div className="card">
              <BarChart data={s.bookingsPerDay} valueKey="bookings" label="Bookings per day" />
              <BarChart data={s.bookingsPerDay} valueKey="gmv" label="GMV per day (₹)" format={rs} />
            </div>
            <div className="two">
              <div className="card">
                <h3>Top gaon</h3>
                {s.topVillages.length === 0 ? (
                  <p className="muted">Abhi data nahi.</p>
                ) : (
                  <table className="table">
                    <tbody>
                      {s.topVillages.map((v) => (
                        <tr key={v._id}>
                          <td>{v.name}</td>
                          <td>{v.bookings} booking</td>
                          <td>{rs(v.gmv)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        )}
      </QueryState>
    </>
  );
}

// ---------- finance: commission and settlement per lab ----------
const monthStart = () => {
  const d = new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
  return `${d.slice(0, 8)}01`;
};
const todayIst = () => new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
const MODE_LABEL = { cash: "Cash (lab ne liya)", upi: "UPI (site pe)", online: "Online (site pe)" };

// "+₹110 hum denge" / "₹340 lab dega" — the sign alone is too easy to misread.
function Net({ value, big }) {
  if (!value) return <span className="muted">Barabar ₹0</span>;
  return (
    <span className={`net ${value > 0 ? "net-pay" : "net-get"} ${big ? "big" : ""}`}>
      {rs(Math.abs(value))}
      <small>{value > 0 ? "hum lab ko denge" : "lab humein dega"}</small>
    </span>
  );
}

function downloadCsv(name, rows) {
  const csv = rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: name });
  a.click();
  URL.revokeObjectURL(url);
}

function Finance() {
  const [range, setRange] = useState({ from: monthStart(), to: todayIst() });
  const [open, setOpen] = useState(null);
  const [onlyActive, setOnlyActive] = useState(true);
  const q = useQuery({ queryKey: ["finance", range], queryFn: () => get("/admin/finance", range), placeholderData: (p) => p });
  const presets = [
    ["Is mahine", { from: monthStart(), to: todayIst() }],
    ["Pichhle 7 din", { from: new Date(Date.now() - 6 * 864e5 + 5.5 * 36e5).toISOString().slice(0, 10), to: todayIst() }],
    ["Pichhle 30 din", { from: new Date(Date.now() - 29 * 864e5 + 5.5 * 36e5).toISOString().slice(0, 10), to: todayIst() }],
    ["Is saal", { from: `${todayIst().slice(0, 4)}-01-01`, to: todayIst() }],
  ];

  return (
    <>
      <div className="card toolbar">
        <div className="pill-row">
          {presets.map(([label, r]) => (
            <button key={label} className={`pill ${range.from === r.from && range.to === r.to ? "on" : ""}`} onClick={() => setRange(r)}>
              {label}
            </button>
          ))}
        </div>
        <div className="filters">
          <label className="small">
            Se <input type="date" value={range.from} max={range.to} onChange={(e) => e.target.value && setRange({ ...range, from: e.target.value })} />
          </label>
          <label className="small">
            Tak <input type="date" value={range.to} min={range.from} onChange={(e) => e.target.value && setRange({ ...range, to: e.target.value })} />
          </label>
        </div>
      </div>
      <QueryState query={q}>
        {(d) => {
          const t = d.totals;
          const rows = d.data.filter((r) => !onlyActive || r.bookings > 0);
          return (
            <>
              <div className="stat-row">
                <Stat icon="file" label="Sample liye (bookings)" value={t.bookings} />
                <Stat icon="rupee" tone="green" label="Kul kamai (GMV)" value={rs(t.gross)} />
                <Stat icon="chart" tone="violet" label="Hamara commission" value={rs(t.commission)} />
                <Stat icon="wallet" tone="amber" label="Labs ki kamai" value={rs(t.labEarning)} />
                <Stat icon="briefcase" tone="rose" label="Cash labs ke paas" value={rs(t.cashCollected)} />
                <Stat icon="globe" label="Site pe aaya (online)" value={rs(t.onlineCollected)} />
              </div>

              <div className="flow-grid">
                <div className="card flow flow-get">
                  <span className="flow-label">Labs se lena hai</span>
                  <strong>{rs(t.labOwesUs)}</strong>
                  <p className="muted small">Lab ne mareez se cash liya, usme se hamara commission.</p>
                </div>
                <div className="card flow flow-pay">
                  <span className="flow-label">Labs ko dena hai</span>
                  <strong>{rs(t.weOweLab)}</strong>
                  <p className="muted small">Mareez ne site pe pay kiya, usme se lab ka hissa.</p>
                </div>
                <div className="card flow flow-net">
                  <span className="flow-label">Net settlement (abhi baaki)</span>
                  <Net value={t.pendingNet} big />
                  <p className="muted small">Dono ka hisaab milakar. Paid settlement wali bookings hata kar.</p>
                </div>
              </div>

              <div className="card">
                <div className="row-between">
                  <h3>Har lab ka hisaab</h3>
                  <div className="btn-row">
                    <label className="small check">
                      <input type="checkbox" checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)} /> Sirf jinki booking hai
                    </label>
                    <button
                      className="secondary-btn small"
                      onClick={() =>
                        downloadCsv(`hisaab_${d.range.from}_${d.range.to}.csv`, [
                          ["Lab", "Commission %", "Bookings", "GMV", "Hamara commission", "Lab ki kamai", "Cash (lab ke paas)", "Online (site pe)", "Lab se lena", "Lab ko dena", "Net (+ hum denge / - lab dega)", "Net baaki"],
                          ...d.data.map((r) => [r.lab.name, r.lab.commissionPercent, r.bookings, r.gross, r.commission, r.labEarning, r.cashCollected, r.onlineCollected, r.labOwesUs, r.weOweLab, r.net, r.pendingNet]),
                        ])
                      }
                    >
                      ⬇ Excel (CSV)
                    </button>
                  </div>
                </div>
                {rows.length === 0 ? (
                  <p className="muted">Is samay mein kisi lab ka sample nahi liya gaya.</p>
                ) : (
                  <div className="table-wrap">
                    <table className="table finance-table">
                      <thead>
                        <tr>
                          <th>Lab</th>
                          <th className="num">Bookings</th>
                          <th className="num">GMV</th>
                          <th className="num">Commission</th>
                          <th className="num">Lab ki kamai</th>
                          <th className="num">Cash lab ke paas</th>
                          <th className="num">Online site pe</th>
                          <th className="num">Lab se lena</th>
                          <th className="num">Lab ko dena</th>
                          <th className="num">Net baaki</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((r) => (
                          <FinanceRow key={r.lab._id} r={r} range={d.range} open={open === r.lab._id} onToggle={() => setOpen(open === r.lab._id ? null : r.lab._id)} />
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <th>Kul</th>
                          <th className="num">{t.bookings}</th>
                          <th className="num">{rs(t.gross)}</th>
                          <th className="num">{rs(t.commission)}</th>
                          <th className="num">{rs(t.labEarning)}</th>
                          <th className="num">{rs(t.cashCollected)}</th>
                          <th className="num">{rs(t.onlineCollected)}</th>
                          <th className="num">{rs(t.labOwesUs)}</th>
                          <th className="num">{rs(t.weOweLab)}</th>
                          <th className="num">
                            <Net value={t.pendingNet} />
                          </th>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
                <p className="muted small">
                  Sirf woh bookings ginti mein hain jinka sample is samay mein liya gaya (collected / report di). Settlement "Settlements" tab se paid mark karein.
                </p>
              </div>
            </>
          );
        }}
      </QueryState>
    </>
  );
}

function FinanceRow({ r, range, open, onToggle }) {
  const q = useQuery({ queryKey: ["financeLab", r.lab._id, range], queryFn: () => get(`/admin/finance/labs/${r.lab._id}`, range), enabled: open });
  return (
    <>
      <tr className={`clickable ${open ? "open" : ""}`} onClick={onToggle}>
        <td>
          <button type="button" className="link-btn" aria-expanded={open}>
            {open ? "▾" : "▸"} {r.lab.name}
          </button>
          <div className="muted small">{r.lab.commissionPercent}% commission</div>
        </td>
        <td className="num">{r.bookings}</td>
        <td className="num">{rs(r.gross)}</td>
        <td className="num strong">{rs(r.commission)}</td>
        <td className="num">{rs(r.labEarning)}</td>
        <td className="num">
          {rs(r.cashCollected)}
          {r.cashBookings > 0 && <div className="muted small">{r.cashBookings} booking</div>}
        </td>
        <td className="num">{rs(r.onlineCollected)}</td>
        <td className="num">{rs(r.labOwesUs)}</td>
        <td className="num">{rs(r.weOweLab)}</td>
        <td className="num">
          <Net value={r.pendingNet} />
        </td>
      </tr>
      {open && (
        <tr className="detail-row">
          <td colSpan={10}>
            <QueryState query={q} empty="Koi booking nahi.">
              {(d) => (
                <table className="table inner">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Mareez</th>
                      <th>Sample liya</th>
                      <th>Payment</th>
                      <th className="num">Total</th>
                      <th className="num">Lab ka</th>
                      <th className="num">Commission</th>
                      <th>Settlement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.data.map((b) => (
                      <tr key={b._id}>
                        <td>
                          <code>{b.code}</code>
                        </td>
                        <td>{b.patientName}</td>
                        <td className="small">{prettyDateTime(b.collectedAt)}</td>
                        <td>
                          <span className={`mode mode-${b.mode}`}>{MODE_LABEL[b.mode] || b.mode}</span>
                        </td>
                        <td className="num">{rs(b.total)}</td>
                        <td className="num">{rs(b.labPayout)}</td>
                        <td className="num">{rs(b.commission)}</td>
                        <td className="small">{b.settlement ? (b.settlement.status === "paid" ? `Paid · ${b.settlement.reference}` : "Hisaab bana, payment baaki") : "Abhi hisaab nahi bana"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </QueryState>
          </td>
        </tr>
      )}
    </>
  );
}

// ---------- users ----------
function Users() {
  const qc = useQueryClient();
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const { q, setPage } = useList("adminUsers", "/admin/users", { role, status, q: search });
  const [err, setErr] = useState("");
  const [temp, setTemp] = useState(null);
  const refresh = () => qc.invalidateQueries({ queryKey: ["adminUsers"] });

  async function toggle(u) {
    setErr("");
    try {
      await patch(`/admin/users/${u._id}/status`, { status: u.status === "active" ? "disabled" : "active" });
      refresh();
    } catch (e) {
      setErr(errorMessage(e));
    }
  }
  async function reset(u) {
    if (!window.confirm(`${u.name} ka password reset karein? Unhe naya temporary password dena hoga.`)) return;
    try {
      const r = await post(`/admin/users/${u._id}/reset-password`, {});
      setTemp({ email: r.user.email || r.user.phone, password: r.tempPassword });
      refresh();
    } catch (e) {
      setErr(errorMessage(e));
    }
  }

  return (
    <>
      <CreateAgent onCreated={(t) => (setTemp(t), refresh())} />
      <TempPassword email={temp?.email} password={temp?.password} />
      <Filters>
        <select value={role} onChange={(e) => setRole(e.target.value)} aria-label="Role">
          <option value="">Sabhi role</option>
          {Object.entries(roleLabel).map(([k, l]) => (
            <option key={k} value={k}>
              {l}
            </option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
          <option value="">Sabhi status</option>
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
        </select>
        <input placeholder="Naam / email / phone" value={search} onChange={(e) => setSearch(e.target.value)} />
      </Filters>
      <ErrorMsg msg={err} />
      <QueryState query={q} empty="Koi user nahi mila.">
        {(d) => (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Naam</th>
                    <th>Role</th>
                    <th>Login</th>
                    <th>Linked</th>
                    <th>Aakhri login</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {d.data.map((u) => (
                    <tr key={u._id}>
                      <td>
                        {u.name}
                        {u.mustChangePassword && <div className="chip">Temp password</div>}
                      </td>
                      <td>{roleLabel[u.role]}</td>
                      <td>{u.email || u.phone}</td>
                      <td>{u.lab?.name || u.doctor?.name || "—"}</td>
                      <td>{prettyDateTime(u.lastLoginAt) || "—"}</td>
                      <td>
                        <Badge status={u.status} label={u.status} />
                      </td>
                      <td>
                        {u.role !== "super_admin" && (
                          <div className="btn-row">
                            <button className="secondary-btn small" onClick={() => toggle(u)}>
                              {u.status === "active" ? "Disable" : "Enable"}
                            </button>
                            <button className="link-btn" onClick={() => reset(u)}>
                              Reset password
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pager meta={d.meta} onPage={setPage} />
          </>
        )}
      </QueryState>
    </>
  );
}

function CreateAgent({ onCreated }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: "", email: "", phone: "" });
  const [errs, setErrs] = useState({});
  const [err, setErr] = useState("");
  async function submit(e) {
    e.preventDefault();
    setErr("");
    try {
      const r = await post("/admin/users", { name: f.name, email: f.email, phone: f.phone || undefined, role: "agent" });
      onCreated({ email: r.user.email, password: r.tempPassword });
      setF({ name: "", email: "", phone: "" });
      setErrs({});
      setOpen(false);
    } catch (e2) {
      setErrs(fieldErrors(e2));
      setErr(errorMessage(e2));
    }
  }
  if (!open)
    return (
      <button className="primary-btn small" onClick={() => setOpen(true)}>
        + Naya field agent
      </button>
    );
  return (
    <form className="card form-card" onSubmit={submit} noValidate>
      <h2>Naya field agent</h2>
      <div className="three">
        <Field label="Naam" error={errs.name}>
          <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        </Field>
        <Field label="Email (login ID)" error={errs.email}>
          <input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        </Field>
        <Field label="Phone" error={errs.phone}>
          <input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
        </Field>
      </div>
      <ErrorMsg msg={err} />
      <div className="btn-row">
        <button className="primary-btn small">Agent banayein</button>
        <button type="button" className="secondary-btn small" onClick={() => setOpen(false)}>
          Rehne dein
        </button>
      </div>
    </form>
  );
}

// ---------- catalog ----------
function Labs() {
  const qc = useQueryClient();
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const { q, setPage } = useList("adminLabs", "/admin/labs", { status, q: search });
  const [err, setErr] = useState("");
  async function remove(l) {
    if (!window.confirm(`"${l.name}" ko hamesha ke liye delete karein? Iske test aur staff login bhi hat jaayenge.`)) return;
    setErr("");
    try {
      await del(`/admin/labs/${l._id}`);
      qc.invalidateQueries({ queryKey: ["adminLabs"] });
    } catch (e) {
      setErr(errorMessage(e));
    }
  }
  async function toggle(l) {
    try {
      await patch(`/agent/labs/${l._id}`, { status: l.status === "active" ? "disabled" : "active" });
      qc.invalidateQueries({ queryKey: ["adminLabs"] });
    } catch (e) {
      setErr(errorMessage(e));
    }
  }
  return (
    <>
      <Filters>
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
          <option value="">Sabhi</option>
          <option value="active">Chalu</option>
          <option value="disabled">Band</option>
        </select>
        <input placeholder="Lab ka naam" value={search} onChange={(e) => setSearch(e.target.value)} />
      </Filters>
      <ErrorMsg msg={err} />
      <QueryState query={q} empty="Koi lab nahi.">
        {(d) => (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Lab</th>
                    <th>Radius</th>
                    <th>Fees</th>
                    <th>Commission</th>
                    <th>Agent</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {d.data.map((l) => (
                    <tr key={l._id}>
                      <td>
                        {l.name}
                        <div className="muted small">{l.address}</div>
                      </td>
                      <td>{l.serviceRadiusKm} km</td>
                      <td className="small">
                        {rs(l.collectionFee)} · free ≥{rs(l.freeCollectionAbove)} · min {rs(l.minOrderValue)}
                      </td>
                      <td>{l.commissionPercent}%</td>
                      <td>{l.onboardedBy?.name}</td>
                      <td>
                        <Badge status={l.status} label={l.status} />
                      </td>
                      <td>
                        <div className="btn-row">
                          <button className="secondary-btn small" onClick={() => toggle(l)}>
                            {l.status === "active" ? "Band" : "Chalu"}
                          </button>
                          <button className="secondary-btn small danger" onClick={() => remove(l)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pager meta={d.meta} onPage={setPage} />
          </>
        )}
      </QueryState>
    </>
  );
}

function Doctors() {
  const qc = useQueryClient();
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const { q, setPage } = useList("adminDoctors", "/admin/doctors", { status, q: search });
  const [err, setErr] = useState("");
  async function remove(d) {
    if (!window.confirm(`"${d.name}" ko hamesha ke liye delete karein? Unka login bhi hat jaayega.`)) return;
    setErr("");
    try {
      await del(`/admin/doctors/${d._id}`);
      qc.invalidateQueries({ queryKey: ["adminDoctors"] });
    } catch (e) {
      setErr(errorMessage(e));
    }
  }
  async function toggle(d) {
    try {
      await patch(`/agent/doctors/${d._id}`, { status: d.status === "active" ? "disabled" : "active" });
      qc.invalidateQueries({ queryKey: ["adminDoctors"] });
    } catch (e) {
      setErr(errorMessage(e));
    }
  }
  return (
    <>
      <Filters>
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
          <option value="">Sabhi</option>
          <option value="active">Chalu</option>
          <option value="disabled">Band</option>
        </select>
        <input placeholder="Doctor ka naam" value={search} onChange={(e) => setSearch(e.target.value)} />
      </Filters>
      <ErrorMsg msg={err} />
      <QueryState query={q} empty="Koi doctor nahi.">
        {(d) => (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Specialty</th>
                    <th>Din</th>
                    <th>Fees</th>
                    <th>Login</th>
                    <th>Agent</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {d.data.map((x) => (
                    <tr key={x._id}>
                      <td>
                        {x.name}
                        <div className="muted small">{x.clinicName}</div>
                      </td>
                      <td>{x.specialty}</td>
                      <td className="small">{x.schedule.map((s) => s.day).join(", ")}</td>
                      <td>{rs(x.fee)}</td>
                      <td className="small">{x.user?.email}</td>
                      <td>{x.onboardedBy?.name}</td>
                      <td>
                        <Badge status={x.status} label={x.status} />
                      </td>
                      <td>
                        <div className="btn-row">
                          <button className="secondary-btn small" onClick={() => toggle(x)}>
                            {x.status === "active" ? "Band" : "Chalu"}
                          </button>
                          <button className="secondary-btn small danger" onClick={() => remove(x)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pager meta={d.meta} onPage={setPage} />
          </>
        )}
      </QueryState>
    </>
  );
}

function Villages() {
  const [search, setSearch] = useState("");
  const { q, setPage } = useList("adminVillages", "/admin/villages", { q: search });
  return (
    <>
      <Filters>
        <input placeholder="Gaon ka naam" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Link className="secondary-btn small" to="/agent">
          + Gaon jodein
        </Link>
      </Filters>
      <QueryState query={q} empty="Koi gaon nahi.">
        {(d) => (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Gaon</th>
                    <th>Block</th>
                    <th>District</th>
                    <th>Lat, Lng</th>
                    <th>Joda</th>
                  </tr>
                </thead>
                <tbody>
                  {d.data.map((v) => (
                    <tr key={v._id}>
                      <td>{v.name}</td>
                      <td>{v.block}</td>
                      <td>{v.district}</td>
                      <td className="small">
                        {v.location.coordinates[1]}, {v.location.coordinates[0]}
                      </td>
                      <td className="small">{v.createdBy?.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pager meta={d.meta} onPage={setPage} />
          </>
        )}
      </QueryState>
    </>
  );
}

// ---------- bookings & appointments ----------
function Bookings() {
  const [f, setF] = useState({ status: "", source: "", code: "", from: "", to: "" });
  const { q, setPage } = useList("adminBookings", "/admin/bookings", f);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <>
      <Filters>
        <select value={f.status} onChange={set("status")} aria-label="Status">
          <option value="">Sabhi status</option>
          {["requested", "confirmed", "collected", "report_ready", "cancelled"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select value={f.source} onChange={set("source")} aria-label="Source">
          <option value="">Patient + doctor</option>
          <option value="patient">Patient</option>
          <option value="doctor">Doctor referral</option>
        </select>
        <input placeholder="Booking code" value={f.code} onChange={set("code")} />
        <label className="small">
          Se <input type="date" value={f.from} onChange={set("from")} />
        </label>
        <label className="small">
          Tak <input type="date" value={f.to} onChange={set("to")} />
        </label>
      </Filters>
      <QueryState query={q} empty="Koi booking nahi.">
        {(d) => (
          <>
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
                    <th>Lab payout</th>
                    <th>Margin</th>
                    <th>Pay</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {d.data.map((b) => (
                    <tr key={b._id}>
                      <td>
                        {b.code}
                        {b.source === "doctor" && <div className="chip ref">🩺 {b.referredBy?.name}</div>}
                      </td>
                      <td>
                        {b.patientName}
                        <div className="muted small">{b.patient?.phone}</div>
                      </td>
                      <td>{b.village?.name}</td>
                      <td>{b.lab?.name}</td>
                      <td className="small">{b.items.map((i) => i.name).join(", ")}</td>
                      <td>{prettyDate(b.date)}</td>
                      <td>{rs(b.total)}</td>
                      <td>{rs(b.labPayout)}</td>
                      <td>{rs(b.platformMargin)}</td>
                      <td className="small">
                        {b.payment?.mode} / {b.payment?.status}
                      </td>
                      <td>
                        <Badge status={b.status} label={b.status} />
                        {b.otpLocked && <div className="chip no">OTP lock</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pager meta={d.meta} onPage={setPage} />
          </>
        )}
      </QueryState>
    </>
  );
}

function Appointments() {
  const [f, setF] = useState({ status: "", date: "" });
  const { q, setPage } = useList("adminAppts", "/admin/appointments", f);
  return (
    <>
      <Filters>
        <select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })} aria-label="Status">
          <option value="">Sabhi status</option>
          {["booked", "seen", "no_show", "cancelled"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} aria-label="Date" />
      </Filters>
      <QueryState query={q} empty="Koi appointment nahi.">
        {(d) => (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Din</th>
                    <th>Token</th>
                    <th>Doctor</th>
                    <th>Mareez</th>
                    <th>Gaon</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {d.data.map((a) => (
                    <tr key={a._id}>
                      <td>{a.code}</td>
                      <td>{prettyDate(a.date)}</td>
                      <td>#{a.token}</td>
                      <td>{a.doctor?.name}</td>
                      <td>
                        {a.patientName}
                        <div className="muted small">{a.patient?.phone}</div>
                      </td>
                      <td>{a.village?.name}</td>
                      <td>
                        <Badge status={a.status} label={a.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pager meta={d.meta} onPage={setPage} />
          </>
        )}
      </QueryState>
    </>
  );
}

// ---------- settlements ----------
function Settlements() {
  const qc = useQueryClient();
  const [status, setStatus] = useState("");
  const { q, setPage } = useList("adminSettlements", "/admin/settlements", { status });
  const [weekOf, setWeekOf] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const refresh = () => qc.invalidateQueries({ queryKey: ["adminSettlements"] });

  async function generate() {
    setErr("");
    setMsg("");
    try {
      const r = await post("/admin/settlements/generate", weekOf ? { weekOf } : {});
      setMsg(`${r.data.length} lab ka hisaab bana (${prettyDate(r.weekStart.slice(0, 10))} wala hafta)`);
      refresh();
    } catch (e) {
      setErr(errorMessage(e));
    }
  }
  async function markPaid(s) {
    const who = s.netPayable >= 0 ? "Humne lab ko diya" : "Lab ne humein diya";
    const reference = window.prompt(`${s.lab?.name}: ${who} ${rs(Math.abs(s.netPayable))}. Payment reference / UTR likhein:`);
    if (!reference) return;
    try {
      await patch(`/admin/settlements/${s._id}/paid`, { reference });
      refresh();
    } catch (e) {
      setErr(errorMessage(e));
    }
  }

  return (
    <>
      <div className="card">
        <p className="muted">Har Monday 6 baje pichhle hafte ka hisaab apne aap banta hai. Yahan se dobara ya kisi purane hafte ka bana sakte hain.</p>
        <Filters>
          <label className="small">
            Hafta (koi bhi din) <input type="date" value={weekOf} onChange={(e) => setWeekOf(e.target.value)} />
          </label>
          <button className="primary-btn small" onClick={generate}>
            Hisaab banayein
          </button>
        </Filters>
        <ErrorMsg msg={err} />
        {msg && <div className="ok">{msg}</div>}
      </div>
      <Filters>
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
          <option value="">Sabhi</option>
          <option value="pending">Baaki</option>
          <option value="paid">Paid</option>
        </select>
      </Filters>
      <QueryState query={q} empty="Abhi koi settlement nahi.">
        {(d) => (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Lab</th>
                    <th>Hafta</th>
                    <th>Gross</th>
                    <th>Lab ki kamai</th>
                    <th>Cash lab ke paas</th>
                    <th>Net</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {d.data.map((s) => (
                    <tr key={s._id}>
                      <td>{s.lab?.name}</td>
                      <td className="small">{prettyDate(s.weekStart.slice(0, 10))}</td>
                      <td>{rs(s.gross)}</td>
                      <td>{rs(s.labPayout)}</td>
                      <td>{rs(s.cashWithLab)}</td>
                      <td>
                        <Net value={s.netPayable} />
                      </td>
                      <td>
                        <Badge status={s.status} label={s.status} />
                        {s.reference && <div className="small muted">{s.reference}</div>}
                      </td>
                      <td>
                        {s.status === "pending" && (
                          <button className="primary-btn small" onClick={() => markPaid(s)}>
                            Paid mark karein
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pager meta={d.meta} onPage={setPage} />
          </>
        )}
      </QueryState>
    </>
  );
}

// ---------- audit ----------
function Audit() {
  const [f, setF] = useState({ action: "", entityType: "" });
  const { q, setPage } = useList("adminAudit", "/admin/audit", f);
  return (
    <>
      <Filters>
        <input placeholder="Action (jaise user. ya booking.)" value={f.action} onChange={(e) => setF({ ...f, action: e.target.value })} />
        <select value={f.entityType} onChange={(e) => setF({ ...f, entityType: e.target.value })} aria-label="Entity">
          <option value="">Sabhi</option>
          {["User", "Lab", "LabTest", "Doctor", "Village", "Booking", "Appointment", "Settlement", "FamilyMember"].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </Filters>
      <QueryState query={q} empty="Kuch nahi mila.">
        {(d) => (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Kab</th>
                    <th>Kisne</th>
                    <th>Kya</th>
                    <th>Entity</th>
                    <th>Pehle → Baad</th>
                    <th>IP</th>
                  </tr>
                </thead>
                <tbody>
                  {d.data.map((a) => (
                    <tr key={a._id}>
                      <td className="small">{prettyDateTime(a.at)}</td>
                      <td>
                        {a.actor?.name || "system"}
                        <div className="muted small">{roleLabel[a.actorRole] || a.actorRole}</div>
                      </td>
                      <td>
                        <code>{a.action}</code>
                      </td>
                      <td className="small">
                        {a.entityType}
                        <div className="muted">{a.entityId?.slice(-6)}</div>
                      </td>
                      <td className="small audit-diff">
                        {a.before && <pre>{JSON.stringify(a.before)}</pre>}
                        {a.after && <pre>{JSON.stringify(a.after)}</pre>}
                      </td>
                      <td className="small">{a.ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pager meta={d.meta} onPage={setPage} />
          </>
        )}
      </QueryState>
    </>
  );
}
