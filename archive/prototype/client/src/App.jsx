import { useState } from "react";
import { api, getSession, setSession } from "./api/index.js";
import { Header } from "./components/ui.jsx";
import PatientApp from "./pages/PatientApp.jsx";
import Login from "./pages/Login.jsx";
import LabPanel from "./pages/LabPanel.jsx";
import DoctorPanel from "./pages/DoctorPanel.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";

export default function App() {
  const [screen, setScreen] = useState(() => {
    const s = getSession();
    return s ? (s.role === "agent" ? "admin" : s.role) : "home";
  });
  const [session, setSess] = useState(getSession);

  const exit = () => {
    setSession(null);
    setSess(null);
    setScreen("home");
  };
  const loggedIn = (s) => setSess(s);

  if (screen === "patient") return <PatientApp onExit={exit} />;

  if (["lab", "doctor", "admin"].includes(screen)) {
    if (!session) {
      return (
        <div className="app">
          <Header />
          <Login role={screen} onLogin={loggedIn} onBack={exit} />
        </div>
      );
    }
    if (screen === "lab") return <LabPanel session={session} onExit={exit} />;
    if (screen === "doctor") return <DoctorPanel session={session} onExit={exit} />;
    return <AdminPanel session={session} onExit={exit} />;
  }

  return (
    <div className="app">
      <Header />
      <main className="container narrow">
        <section className="hero">
          <h1>Gaon se bazaar jaane ki zaroorat nahi.</h1>
          <p>Khoon ki jaanch ghar se, report WhatsApp pe, aur doctor ka number ghar baithe.</p>
        </section>
        <button className="big-action teal" onClick={() => setScreen("patient")}>
          <span className="ba-icon" aria-hidden="true">🙋</span>
          <span className="ba-text">
            <strong>Main mareez / parivaar hoon</strong>
            <small>Test book karein, doctor ka number lagayein</small>
          </span>
        </button>
        <div className="role-grid">
          <button className="role-btn" onClick={() => setScreen("lab")}>
            <span aria-hidden="true">🧪</span>Lab
          </button>
          <button className="role-btn" onClick={() => setScreen("doctor")}>
            <span aria-hidden="true">🩺</span>Doctor
          </button>
          <button className="role-btn" onClick={() => setScreen("admin")}>
            <span aria-hidden="true">🛠️</span>Admin / Agent
          </button>
        </div>
        {api.mode === "demo" && (
          <div className="demo-note">
            <strong>Demo mode:</strong> data isi browser mein save hota hai.{" "}
            <button
              className="link-btn"
              onClick={() => {
                api.resetDemo();
                exit();
                location.reload();
              }}
            >
              Demo reset karein (saara data saaf)
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
