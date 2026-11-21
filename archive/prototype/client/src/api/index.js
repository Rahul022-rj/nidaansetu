import { createRealApi } from "./realApi.js";
import { createMockApi } from "./mockApi.js";

const env = import.meta.env || {};
const BASE = env.VITE_API_URL || "";
const DEMO = env.VITE_DEMO === "true" || !BASE;

const SESSION_KEY = "sehatdwaar_session";

let memSession = null; // fallback when browser storage is blocked

export function getSession() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null") || memSession;
  } catch (e) {
    return memSession;
  }
}
export function setSession(s) {
  memSession = s || null;
  try {
    if (s) sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
    else sessionStorage.removeItem(SESSION_KEY);
  } catch (e) {
    /* ignore */
  }
}

export const api = DEMO ? createMockApi(getSession) : createRealApi(BASE, getSession);
