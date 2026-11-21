import { useEffect, useState } from "react";
import { api, setSession } from "../api/index.js";
import { Back, Field, ErrorMsg } from "../components/ui.jsx";

const TITLES = {
  lab: { icon: "🧪", title: "Lab login", pick: "Apna lab chunein", hint: "Demo PIN: Shree 1111, Jeevan 2222" },
  doctor: { icon: "🩺", title: "Doctor login", pick: "Apna naam chunein", hint: "Demo PIN: Kumar 3333, Devi 4444, Singh 5555" },
  admin: { icon: "🛠️", title: "Admin / Agent login", pick: "Kaun login kar raha hai", hint: "Demo PIN: Admin 1234, Agent 0000" },
};

export default function Login({ role, onLogin, onBack }) {
  const t = TITLES[role];
  const [opts, setOpts] = useState([]);
  const [id, setId] = useState("");
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    api.loginOptions(role).then((o) => {
      setOpts(o);
      if (o[0]) setId(String(o[0].id));
    });
  }, [role]);

  async function submit(e) {
    e.preventDefault();
    const chosen = opts.find((o) => String(o.id) === id);
    const realRole = role === "admin" ? chosen?.role || "admin" : role;
    try {
      const s = await api.login(realRole, id, pin);
      setSession(s);
      onLogin(s);
    } catch (e2) {
      setErr(e2.message);
    }
  }

  return (
    <main className="container narrow">
      <Back onClick={onBack} />
      <form className="card login-card" onSubmit={submit}>
        <div className="login-icon" aria-hidden="true">{t.icon}</div>
        <h1 className="big-title">{t.title}</h1>
        <Field label={t.pick}>
          <select value={id} onChange={(e) => setId(e.target.value)}>
            {opts.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="PIN">
          <input type="password" inputMode="numeric" value={pin} onChange={(e) => { setPin(e.target.value); setErr(""); }} placeholder="••••" />
        </Field>
        <ErrorMsg msg={err} />
        <button className="primary-btn" type="submit">
          Login karein
        </button>
        {api.mode === "demo" && <p className="muted small">{t.hint}</p>}
      </form>
    </main>
  );
}
