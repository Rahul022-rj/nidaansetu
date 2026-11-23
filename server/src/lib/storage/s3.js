import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../../config/env.js";

// The bucket must block public access. Credentials come from the standard AWS env vars or an IAM role.
if (!env.S3_BUCKET || !env.S3_REGION) throw new Error("S3_BUCKET and S3_REGION are required for STORAGE_DRIVER=s3");

const client = new S3Client({
  region: env.S3_REGION,
  ...(env.S3_ENDPOINT ? { endpoint: env.S3_ENDPOINT, forcePathStyle: true } : {}),
});

export default {
  async put({ key, buffer, mime }) {
    await client.send(
      new PutObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: mime,
        ServerSideEncryption: "AES256",
      })
    );
  },
  async signedUrl({ key, name, ttlSec = env.SIGNED_URL_TTL_SEC }) {
    const cmd = new GetObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
      ResponseContentDisposition: `inline; filename="${String(name || "report").replace(/"/g, "")}"`,
    });
    return getSignedUrl(client, cmd, { expiresIn: ttlSec });
  },
};
