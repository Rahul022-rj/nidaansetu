import { AuditLog } from "../models/index.js";

const SECRET_KEYS = new Set(["passwordHash", "otpHash", "tokenHash", "resetTokenHash", "password", "tokenVersion"]);

// Keep only the listed fields (or all non-secret fields) as a plain object.
export function pick(doc, fields) {
  if (!doc) return undefined;
  const o = doc.toObject ? doc.toObject({ depopulate: true }) : { ...doc };
  const keys = fields || Object.keys(o);
  const out = {};
  for (const k of keys) if (!SECRET_KEYS.has(k) && o[k] !== undefined) out[k] = o[k];
  return out;
}

// Audit failures must never break the request, but they must be visible.
export async function audit(req, { action, entityType, entityId, before, after }) {
  try {
    await AuditLog.create({
      actor: req?.user?._id,
      actorRole: req?.user?.role,
      action,
      entityType,
      entityId,
      before,
      after,
      ip: req?.ip,
    });
  } catch (e) {
    console.error("audit log write failed", action, e.message);
  }
}
