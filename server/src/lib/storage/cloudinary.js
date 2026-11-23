import { v2 as cloudinary } from "cloudinary";
import { env } from "../../config/env.js";

// Uses Cloudinary "authenticated" delivery so assets are never publicly reachable.
// CLOUDINARY_URL=cloudinary://<key>:<secret>@<cloud_name> is read by the SDK.
if (!env.CLOUDINARY_URL) throw new Error("CLOUDINARY_URL is required for STORAGE_DRIVER=cloudinary");
cloudinary.config({ secure: true });

export default {
  put({ key, buffer }) {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { public_id: key, resource_type: "raw", type: "authenticated", overwrite: false },
        (err) => (err ? reject(err) : resolve())
      );
      stream.end(buffer);
    });
  },
  async signedUrl({ key, ttlSec = env.SIGNED_URL_TTL_SEC }) {
    return cloudinary.utils.private_download_url(key, "", {
      resource_type: "raw",
      type: "authenticated",
      expires_at: Math.floor(Date.now() / 1000) + ttlSec,
    });
  },
};
