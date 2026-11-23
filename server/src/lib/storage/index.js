import { env } from "../../config/env.js";

// Storage drivers share one interface:
//   put({ key, buffer, mime }) -> void
//   signedUrl({ key, name, mime, ttlSec }) -> string (expires; never a permanent public URL)
// Pick one with STORAGE_DRIVER=local|s3|cloudinary. "local" is for development and tests only.
let driver;

export async function getStorage() {
  if (driver) return driver;
  if (env.STORAGE_DRIVER === "s3") driver = (await import("./s3.js")).default;
  else if (env.STORAGE_DRIVER === "cloudinary") driver = (await import("./cloudinary.js")).default;
  else {
    if (env.isProd) console.warn("STORAGE_DRIVER=local in production: reports are on the API server's disk");
    driver = (await import("./local.js")).default;
  }
  return driver;
}
