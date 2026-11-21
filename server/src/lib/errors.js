// Every API error is returned as { error: { code, message } }.
// Messages are simple Hinglish (Roman script) because patients and lab staff read them directly.
export class AppError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const badRequest = (message, code = "BAD_REQUEST", details) => new AppError(400, code, message, details);
export const unauthorized = (message = "Kripya login karein", code = "UNAUTHORIZED") => new AppError(401, code, message);
export const forbidden = (message = "Aapko yeh karne ki anumati nahi hai", code = "FORBIDDEN") =>
  new AppError(403, code, message);
// Used for "someone else's record" too, so existence is never revealed.
export const notFound = (message = "Nahi mila", code = "NOT_FOUND") => new AppError(404, code, message);
export const conflict = (message, code = "CONFLICT") => new AppError(409, code, message);
