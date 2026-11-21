import { z } from "zod";
import mongoose from "mongoose";
import { badRequest } from "../lib/errors.js";

export const objectId = z.string().refine((v) => mongoose.isValidObjectId(v) && /^[a-f0-9]{24}$/i.test(v), {
  message: "Galat ID",
});

// Validates and replaces req.body / req.params, and puts the parsed query on req.q
// (Express 5 makes req.query read-only). Unknown keys are stripped by zod.
export function validate({ body, query, params }) {
  return (req, _res, next) => {
    try {
      if (params) req.params = parse(params, req.params);
      if (query) req.q = parse(query, req.query);
      if (body) {
        // Kept so PATCH handlers can tell "not sent" apart from a schema default.
        req.rawBody = req.body ?? {};
        req.body = parse(body, req.body ?? {});
      }
      next();
    } catch (e) {
      next(e);
    }
  };
}

function parse(schema, data) {
  const r = schema.safeParse(data);
  if (!r.success) {
    const first = r.error.issues[0];
    const field = first.path.join(".");
    throw badRequest(
      field ? `${field}: ${first.message}` : first.message,
      "VALIDATION_ERROR",
      r.error.issues.map((i) => ({ path: i.path.join("."), message: i.message }))
    );
  }
  return r.data;
}

export const idParams = z.object({ id: objectId });
