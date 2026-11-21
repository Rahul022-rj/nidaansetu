import multer from "multer";
import { AppError } from "../lib/errors.js";
import { env } from "../config/env.js";

export function notFoundHandler(_req, res) {
  res.status(404).json({ error: { code: "NOT_FOUND", message: "Yeh raasta nahi mila" } });
}

export function errorHandler(err, req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: { code: err.code, message: err.message, details: err.details } });
  }
  if (err instanceof multer.MulterError) {
    const message = err.code === "LIMIT_FILE_SIZE" ? "File 5 MB se badi hai" : "File upload nahi hui";
    return res.status(400).json({ error: { code: "UPLOAD_ERROR", message } });
  }
  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({ error: { code: "BAD_JSON", message: "Galat request" } });
  }
  if (err?.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0];
    const message =
      field === "email" ? "Yeh email pehle se registered hai" : field === "phone" ? "Yeh mobile number pehle se registered hai" : "Yeh pehle se maujood hai";
    return res.status(409).json({ error: { code: "DUPLICATE", message } });
  }
  if (err?.name === "ValidationError" || err?.name === "CastError") {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: err.message } });
  }
  console.error(err);
  res.status(500).json({
    error: { code: "SERVER_ERROR", message: "Kuch galat hua, dobara koshish karein", ...(env.isProd ? {} : { debug: err?.message }) },
  });
}
