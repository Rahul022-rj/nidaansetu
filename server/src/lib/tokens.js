import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { RefreshToken } from "../models/index.js";
import { randomToken, sha256 } from "./crypto.js";
import { unauthorized } from "./errors.js";

export const REFRESH_COOKIE = "ns_refresh";

export function signAccessToken(user) {
  return jwt.sign({ sub: String(user._id), role: user.role, tv: user.tokenVersion }, env.JWT_ACCESS_SECRET, {
    expiresIn: `${env.ACCESS_TOKEN_TTL_MIN}m`,
    issuer: "nidaansetu",
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, { issuer: "nidaansetu" });
}

// Refresh tokens are opaque random strings; only their SHA-256 is stored.
export async function issueRefreshToken(user, req, family = randomToken(12)) {
  const raw = randomToken(48);
  await RefreshToken.create({
    user: user._id,
    tokenHash: sha256(raw),
    family,
    expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 86400 * 1000),
    ip: req.ip,
    userAgent: req.get("user-agent")?.slice(0, 200),
  });
  return { raw, family };
}

// Rotate: the presented token is revoked and a new one issued in the same family.
// Presenting an already-revoked token means it was stolen, so the whole family is revoked.
export async function rotateRefreshToken(raw) {
  if (!raw) throw unauthorized("Session khatam ho gaya, dobara login karein", "NO_REFRESH");
  const doc = await RefreshToken.findOne({ tokenHash: sha256(raw) });
  if (!doc || doc.expiresAt < new Date()) throw unauthorized("Session khatam ho gaya, dobara login karein", "BAD_REFRESH");
  if (doc.revokedAt) {
    await RefreshToken.updateMany({ family: doc.family, revokedAt: null }, { revokedAt: new Date() });
    throw unauthorized("Session khatam ho gaya, dobara login karein", "REFRESH_REUSED");
  }
  // Atomic claim so two parallel refreshes can't both succeed with the same token
  const claimed = await RefreshToken.findOneAndUpdate(
    { _id: doc._id, revokedAt: null },
    { revokedAt: new Date() },
    { returnDocument: "after" }
  );
  if (!claimed) throw unauthorized("Session khatam ho gaya, dobara login karein", "REFRESH_REUSED");
  return doc;
}

export const revokeAllForUser = (userId) =>
  RefreshToken.updateMany({ user: userId, revokedAt: null }, { revokedAt: new Date() });

export async function revokeRefreshToken(raw) {
  if (!raw) return;
  await RefreshToken.updateOne({ tokenHash: sha256(raw), revokedAt: null }, { revokedAt: new Date() });
}

export function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProd || env.COOKIE_SAMESITE === "none",
    sameSite: env.COOKIE_SAMESITE,
    path: "/api/v1/auth",
    maxAge: env.REFRESH_TOKEN_TTL_DAYS * 86400 * 1000,
  };
}
