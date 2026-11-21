import fs from "fs/promises";
import path from "path";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { connectDb } from "../src/db.js";
import { createApp } from "../src/app.js";
import { seedDev } from "../src/scripts/seed.js";
import { todayIso, addDaysIso, weekdayOf } from "../src/lib/dates.js";
import { DEV_PASSWORD } from "../src/scripts/seed-data.js";
import { Village, LabTest } from "../src/models/index.js";

export const PASSWORD = DEV_PASSWORD;
export const API = "/api/v1";

let mongod;
export async function startTestApp() {
  mongod = await MongoMemoryServer.create();
  await connectDb(mongod.getUri("nidaansetu-test"));
  return createApp();
}

export async function stopTestApp() {
  await mongoose.disconnect();
  await mongod?.stop();
  await fs.rm(path.resolve(process.env.STORAGE_LOCAL_DIR), { recursive: true, force: true });
}

export const seed = () => seedDev({ password: PASSWORD });

export const bearer = (token) => ({ Authorization: `Bearer ${token}` });

export async function login(app, identifier, password = PASSWORD) {
  const r = await request(app).post(`${API}/auth/login`).send({ identifier, password });
  if (r.status !== 200) throw new Error(`login ${identifier} failed: ${r.status} ${JSON.stringify(r.body)}`);
  return { token: r.body.accessToken, user: r.body.user, cookie: r.headers["set-cookie"] };
}

// Small authenticated client: api(token).get(path) etc.
export function as(app, token) {
  const h = bearer(token);
  return {
    get: (p) => request(app).get(API + p).set(h),
    post: (p, body) => request(app).post(API + p).set(h).send(body),
    patch: (p, body) => request(app).patch(API + p).set(h).send(body),
    del: (p) => request(app).delete(API + p).set(h),
    upload: (p, field, buf, filename, contentType) => request(app).post(API + p).set(h).attach(field, buf, { filename, contentType }),
  };
}

// Next date (today..+6) whose weekday is in `days`
export function nextDateOn(days) {
  for (let i = 0; i < 7; i++) {
    const d = addDaysIso(todayIso(), i);
    if (days.includes(weekdayOf(d))) return d;
  }
  throw new Error("no date");
}
export const tomorrow = () => addDaysIso(todayIso(), 1);

export const village = (name) => Village.findOne({ name });
export async function testIds(lab, names) {
  const tests = await LabTest.find({ lab: lab._id, name: { $in: names } });
  if (tests.length !== names.length) throw new Error(`missing tests ${names}`);
  return tests.map((t) => String(t._id));
}

export const PDF = Buffer.from("%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n");
