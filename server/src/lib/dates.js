import { env } from "../config/env.js";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Today's calendar date in India (YYYY-MM-DD), independent of the server's own timezone.
export function todayIso(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: env.TZ_NAME }).format(now);
}

export function addDaysIso(iso, n) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// "2026-11-23" -> "Mon"
export function weekdayOf(iso) {
  return DAY_NAMES[new Date(`${iso}T00:00:00Z`).getUTCDay()];
}

export function isValidIso(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const d = new Date(`${iso}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === iso;
}

// IST is a fixed +05:30 offset (no DST), so week boundaries can be computed exactly.
const IST_OFFSET_MS = 330 * 60 * 1000;

// Start of the IST Monday week containing `now`, as a UTC Date.
export function istWeekStart(now = new Date()) {
  const ist = new Date(now.getTime() + IST_OFFSET_MS);
  const dow = (ist.getUTCDay() + 6) % 7; // Mon=0
  const mondayIst = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate() - dow);
  return new Date(mondayIst - IST_OFFSET_MS);
}

// The previous full Monday-to-Monday week (IST): [start, end)
export function lastWeekRange(now = new Date()) {
  const end = istWeekStart(now);
  const start = new Date(end.getTime() - 7 * 24 * 3600 * 1000);
  return { start, end };
}
