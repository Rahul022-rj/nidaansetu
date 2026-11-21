// Distance in km between two lat/lng points (haversine formula)
export function distanceKm(a, b) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)) * 10) / 10;
}

export const randomDigits = (n) =>
  Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join("");

export function priceBooking(lab, tests) {
  const testTotal = tests.reduce((s, t) => s + Number(t.price || 0), 0);
  const collectionFee = testTotal >= lab.freeAbove ? 0 : lab.collectionFee;
  return { testTotal, collectionFee, total: testTotal + collectionFee };
}

// Lab, doctor and admin calls send x-role, x-id and x-pin headers after login.
// This is demo-level auth; replace with JWT before going live.
export function requireRole(roles, findById) {
  return async (req, res, next) => {
    try {
      const role = req.header("x-role");
      const id = req.header("x-id");
      const pin = req.header("x-pin");
      if (!roles.includes(role)) return res.status(401).json({ error: "Login karein" });
      const user = await findById(role, id);
      if (!user || user.pin !== pin) return res.status(401).json({ error: "Galat PIN" });
      req.user = { role, id, name: user.name };
      next();
    } catch (e) {
      next(e);
    }
  };
}
