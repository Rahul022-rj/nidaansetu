import { User } from "../models/index.js";
import { verifyAccessToken } from "../lib/tokens.js";
import { forbidden, unauthorized } from "../lib/errors.js";

// Loads the user on every request so a disabled account or changed password
// takes effect immediately, not when the access token happens to expire.
export async function authenticate(req, _res, next) {
  const header = req.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return next(unauthorized());
  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    return next(unauthorized("Session khatam ho gaya, dobara login karein", "TOKEN_EXPIRED"));
  }
  const user = await User.findById(payload.sub);
  if (!user || user.status !== "active" || user.tokenVersion !== payload.tv) {
    return next(unauthorized("Session khatam ho gaya, dobara login karein", "TOKEN_REVOKED"));
  }
  req.user = user;
  next();
}

// Accounts created with a temporary password can only change it until they do.
export function requirePasswordChanged(req, _res, next) {
  if (req.user?.mustChangePassword) {
    return next(forbidden("Pehle naya password banayein", "PASSWORD_CHANGE_REQUIRED"));
  }
  next();
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(unauthorized());
    if (!roles.includes(req.user.role)) return next(forbidden());
    next();
  };
}

// Convenience: authenticated, password already changed, and one of the roles.
export const guard = (...roles) => [authenticate, requirePasswordChanged, requireRole(...roles)];
