import { Link, Navigate, Outlet, useLocation, useNavigate } from "react-router";
import { useAuth, HOME_FOR } from "./AuthContext.jsx";
import { Header, Loading } from "../components/ui.jsx";
import { roleLabel } from "../utils.js";

// Route guard: login required, forced password change first, then role check.
// The server enforces all of this too; this only decides what to render.
export function RequireRole({ roles }) {
  const { user, ready } = useAuth();
  const loc = useLocation();
  if (!ready) return <Loading full />;
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(loc.pathname)}`} replace />;
  if (user.mustChangePassword) return <Navigate to="/change-password" replace />;
  if (!roles.includes(user.role)) return <Navigate to={HOME_FOR[user.role] || "/"} replace />;
  return <Outlet />;
}

// For login/signup pages: a logged-in user goes to their home.
export function GuestOnly() {
  const { user, ready } = useAuth();
  if (!ready) return <Loading full />;
  if (user) return <Navigate to={user.mustChangePassword ? "/change-password" : HOME_FOR[user.role]} replace />;
  return <Outlet />;
}

// For login/sign-up pages. If someone is already logged in (e.g. as a patient) and opens the agent
// login, say so plainly and offer to switch, instead of silently bouncing them to their old dashboard.
export function LoginGate() {
  const { user, ready, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  if (!ready) return <Loading full />;
  if (!user) return <Outlet />;
  const home = user.mustChangePassword ? "/change-password" : HOME_FOR[user.role];
  return (
    <div className="app auth-page">
      <Header />
      <main className="container narrow" style={{ paddingTop: 24 }}>
        <div className="card switch-card">
          <h1 className="big-title">Aap pehle se logged in hain</h1>
          <p>
            Abhi <strong>{user.name}</strong> ({roleLabel[user.role]}) ka account khula hai.
          </p>
          <Link className="primary-btn" to={home}>
            {user.name} ke dashboard pe jaayein
          </Link>
          <button
            className="secondary-btn"
            onClick={async () => {
              await logout();
              nav(loc.pathname, { replace: true });
            }}
          >
            Logout karke doosre account se login karein
          </button>
        </div>
      </main>
    </div>
  );
}
