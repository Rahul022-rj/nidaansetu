import fs from "fs/promises";
import path from "path";
import { env } from "../../config/env.js";
import { hmac, safeEqual } from "../crypto.js";

// Files live outside any static folder. They are only reachable through /api/v1/files/:key
// with an HMAC signature that expires.
const root = path.resolve(env.STORAGE_LOCAL_DIR);

function fileFor(key) {
  if (!/^[a-zA-Z0-9/_.-]+$/.test(key) || key.includes("..")) throw new Error("bad key");
  return path.join(root, key);
}

export function verifySignature(key, exp, sig) {
  if (!exp || !sig || Number(exp) < Math.floor(Date.now() / 1000)) return false;
  return safeEqual(hmac(`${key}:${exp}`), sig);
}

export async function readFile(key) {
  return fs.readFile(fileFor(key));
}

export default {
  async put({ key, buffer }) {
    const file = fileFor(key);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, buffer);
  },
  async signedUrl({ key, name, mime, ttlSec = env.SIGNED_URL_TTL_SEC }) {
    const exp = Math.floor(Date.now() / 1000) + ttlSec;
    const qs = new URLSearchParams({ exp: String(exp), sig: hmac(`${key}:${exp}`), name: name || "report", mime: mime || "" });
    return `${env.PUBLIC_API_URL}/api/v1/files/${encodeURIComponent(key)}?${qs}`;
  },
};
