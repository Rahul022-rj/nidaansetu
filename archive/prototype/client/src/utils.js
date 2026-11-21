export const rs = (n) => "₹" + Math.round(Number(n) || 0).toLocaleString("en-IN");

export const STATUS = {
  requested: { hi: "Request bheja gaya", en: "Requested", color: "amber" },
  confirmed: { hi: "Lab ne confirm kiya", en: "Confirmed", color: "blue" },
  collected: { hi: "Sample le liya", en: "Sample collected", color: "violet" },
  report_ready: { hi: "Report taiyaar", en: "Report ready", color: "green" },
  cancelled: { hi: "Cancel ho gaya", en: "Cancelled", color: "red" },
  booked: { hi: "Number laga", en: "Booked", color: "blue" },
  seen: { hi: "Doctor ne dekh liya", en: "Seen", color: "green" },
};

export const STEPS = ["requested", "confirmed", "collected", "report_ready"];

const DAY_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_HI = ["Ravivar", "Somvar", "Mangalvar", "Budhvar", "Guruvar", "Shukravar", "Shanivar"];
export const dayHi = (en) => DAY_HI[DAY_EN.indexOf(en)] || en;

export function isoDate(d) {
  const z = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}

// Next n days, each with label, iso date and weekday short name
export function nextDays(n = 7) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    out.push({
      iso: isoDate(d),
      day: DAY_EN[d.getDay()],
      label: i === 0 ? "Aaj" : i === 1 ? "Kal" : `${DAY_HI[d.getDay()]} ${d.getDate()}`,
    });
  }
  return out;
}

export function prettyDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d} ${months[m - 1]} ${y}`;
}

export const SLOTS = ["Subah 6–8 baje", "Subah 8–10 baje", "Din 10–12 baje"];
