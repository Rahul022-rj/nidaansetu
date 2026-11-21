import crypto from "crypto";
import bcrypt from "bcrypt";
import { env } from "../config/env.js";

export const hashPassword = (plain) => bcrypt.hash(plain, env.BCRYPT_COST);
export const verifyPassword = (plain, hash) => bcrypt.compare(plain, hash);

export const sha256 = (s) => crypto.createHash("sha256").update(String(s)).digest("hex");
export const randomToken = (bytes = 32) => crypto.randomBytes(bytes).toString("base64url");

export function randomDigits(n) {
  let out = "";
  for (let i = 0; i < n; i++) out += crypto.randomInt(0, 10);
  return out;
}

// Easy to read out over the phone: 5 letters, "@", 4 numbers, e.g. "Kmrtp@4827".
// No 0/O/1/l/I look-alikes. Always has letters and numbers, so it passes the password rules.
export function tempPassword() {
  const upper = "ABCDEFGHJKMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  let out = upper[crypto.randomInt(0, upper.length)];
  for (let i = 0; i < 4; i++) out += lower[crypto.randomInt(0, lower.length)];
  out += "@";
  for (let i = 0; i < 4; i++) out += crypto.randomInt(2, 10);
  return out;
}

// Collection OTP. It is never stored: it is derived from the booking code with a server secret,
// so the patient can be shown it again while the DB only holds a verification hash.
export function deriveOtp(bookingCode) {
  const mac = crypto.createHmac("sha256", env.OTP_SECRET).update(`otp:${bookingCode}`).digest();
  return String(mac.readUInt32BE(0) % 10000).padStart(4, "0");
}
export const hashOtp = (bookingCode, otp) =>
  crypto.createHmac("sha256", env.OTP_SECRET).update(`verify:${bookingCode}:${otp}`).digest("hex");

export function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

export function hmac(data) {
  return crypto.createHmac("sha256", env.FILE_URL_SECRET).update(data).digest("base64url");
}
