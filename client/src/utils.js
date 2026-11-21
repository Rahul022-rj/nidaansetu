export const rs = (n) => "₹" + Math.round(Number(n) || 0).toLocaleString("en-IN");

export const STEPS = ["requested", "confirmed", "collected", "report_ready"];
export const STATUS_COLOR = {
  requested: "amber",
  confirmed: "blue",
  collected: "violet",
  report_ready: "green",
  cancelled: "red",
  booked: "blue",
  seen: "green",
  no_show: "gray",
  pending: "amber",
  paid: "green",
  active: "green",
  disabled: "red",
};

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_JS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Calendar date in India, so "today" matches the server regardless of device timezone.
export function todayIso() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
}
export function addDays(iso, n) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
export const weekday = (iso) => DAY_JS[new Date(`${iso}T00:00:00Z`).getUTCDay()];

// Label like "Aaj", "Kal", "Budhvar 26"
export function dayLabel(iso, t) {
  const today = todayIso();
  if (iso === today) return t("date.today");
  if (iso === addDays(today, 1)) return t("date.tomorrow");
  return `${t(`day.${weekday(iso)}`)} ${Number(iso.slice(8))}`;
}

export function prettyDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d} ${months[m - 1]} ${y}`;
}

export const prettyDateTime = (v) =>
  v ? new Date(v).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "";

export const SLOT_KEYS = ["slot.1", "slot.2", "slot.3"];
export const LAB_SLOTS = ["Subah 6–8 baje", "Subah 8–10 baje", "Din 10–12 baje", "Dopahar 12–2 baje", "Shaam 4–6 baje"];

// "10:00" -> "10 AM"
export function time12(hhmm) {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  const suf = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return m ? `${h12}:${String(m).padStart(2, "0")} ${suf}` : `${h12} ${suf}`;
}

export const roleLabel = { super_admin: "Super admin", agent: "Field agent", lab_staff: "Lab staff", doctor: "Doctor", patient: "Patient" };
