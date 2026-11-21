import { STATUS, STEPS } from "../utils.js";

export function Header({ title, onExit, subtitle }) {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="logo" aria-hidden="true">🏠</span>
        <div>
          <div className="brand-name">SehatDwaar</div>
          <div className="brand-tag">{subtitle || "Jaanch aapke dwaar"}</div>
        </div>
      </div>
      <div className="topbar-right">
        {title && <span className="role-chip">{title}</span>}
        {onExit && (
          <button className="link-btn" onClick={onExit}>
            ← Bahar
          </button>
        )}
      </div>
    </header>
  );
}

export function Back({ onClick, label = "Peeche" }) {
  return (
    <button className="back" onClick={onClick}>
      ← {label}
    </button>
  );
}

export function Field({ label, hint, children }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

export function Badge({ status }) {
  const s = STATUS[status] || { hi: status, color: "gray" };
  return <span className={`badge badge-${s.color}`}>{s.hi}</span>;
}

export function Steps({ status }) {
  if (status === "cancelled") return <Badge status="cancelled" />;
  const idx = STEPS.indexOf(status);
  return (
    <ol className="steps">
      {STEPS.map((s, i) => (
        <li key={s} className={i <= idx ? "done" : ""}>
          <span className="dot">{i <= idx ? "✓" : i + 1}</span>
          <span>{STATUS[s].hi}</span>
        </li>
      ))}
    </ol>
  );
}

export function ErrorMsg({ msg }) {
  if (!msg) return null;
  return (
    <div className="error" role="alert">
      {msg}
    </div>
  );
}

export function Empty({ icon = "📭", text }) {
  return (
    <div className="empty">
      <div className="empty-icon" aria-hidden="true">{icon}</div>
      <div>{text}</div>
    </div>
  );
}
