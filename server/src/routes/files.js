import { Router } from "express";
import { env } from "../config/env.js";
import { notFound } from "../lib/errors.js";

// Only used by STORAGE_DRIVER=local. S3 and Cloudinary serve their own signed URLs.
// The HMAC signature in the URL is the authorisation: it is only minted by GET /bookings/:id/report
// after the ownership check, and it expires (SIGNED_URL_TTL_SEC, default 10 minutes).
const router = Router();

router.get("/:key", async (req, res) => {
  if (env.STORAGE_DRIVER !== "local") throw notFound();
  const { verifySignature, readFile } = await import("../lib/storage/local.js");
  const key = req.params.key;
  const { exp, sig, name, mime } = req.query;
  if (!verifySignature(key, exp, sig)) throw notFound("Link purana ho gaya. Report dobara kholein.", "LINK_EXPIRED");
  let buf;
  try {
    buf = await readFile(key);
  } catch {
    throw notFound("Report nahi mili");
  }
  const safeMime = ["application/pdf", "image/png", "image/jpeg"].includes(mime) ? mime : "application/octet-stream";
  res.set({
    "Content-Type": safeMime,
    "Content-Disposition": `inline; filename="${String(name || "report").replace(/[^\w.\- ]/g, "_")}"`,
    "Cache-Control": "private, no-store",
    "Cross-Origin-Resource-Policy": "cross-origin",
  });
  res.send(buf);
});

export default router;
