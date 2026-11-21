import mongoose from "mongoose";
import { User, Village, Lab, LabTest, Doctor } from "../models/index.js";
import { hashPassword } from "../lib/crypto.js";
import { computeB2b, parseTestList } from "../services/pricing.js";
import * as D from "./seed-data.js";

const point = (lat, lng) => ({ type: "Point", coordinates: [lng, lat] });

// Wipes the database and loads development data. Callers must refuse to run this in production.
export async function seedDev({ password = D.DEV_PASSWORD, mustChangePassword = false } = {}) {
  await mongoose.connection.db.dropDatabase();
  await Promise.all(Object.values(mongoose.models).map((m) => m.syncIndexes()));
  const passwordHash = await hashPassword(password);

  const admin = await User.create({ name: "Dev Super Admin", email: "admin@nidaansetu.test", role: "super_admin", passwordHash });
  const agent = await User.create({ ...D.agent, role: "agent", passwordHash, createdBy: admin._id, mustChangePassword });

  const villages = await Village.insertMany(D.villages.map(({ lat, lng, ...v }) => ({ ...v, location: point(lat, lng), createdBy: agent._id })));
  const villageByName = Object.fromEntries(villages.map((v) => [v.name, v]));

  const tag = (names = []) => names.map((n) => villageByName[n]._id);

  const labs = {};
  for (const { key, tests, staff, lat, lng, villages: served, ...l } of D.labs) {
    const lab = await Lab.create({ ...l, villages: tag(served), location: point(lat, lng), onboardedBy: agent._id });
    const { rows } = parseTestList(tests);
    await LabTest.insertMany(
      rows.map((r) => ({
        ...r,
        lab: lab._id,
        listingPrice: r.walkInPrice,
        b2bPrice: computeB2b(r.walkInPrice, lab.commissionPercent),
        fastingRequired: D.FASTING.has(r.name),
        sampleType: r.name.startsWith("Urine") ? "urine" : "blood",
      }))
    );
    await User.create({ ...staff, role: "lab_staff", lab: lab._id, passwordHash, createdBy: agent._id, mustChangePassword });
    labs[key] = lab;
  }

  const doctors = [];
  for (const { email, lat, lng, village, ...d } of D.doctors) {
    const doctor = await Doctor.create({ ...d, villages: tag([village]), location: point(lat, lng), onboardedBy: agent._id });
    const user = await User.create({ name: d.name, email, role: "doctor", doctor: doctor._id, passwordHash, createdBy: agent._id, mustChangePassword });
    doctor.user = user._id;
    await doctor.save();
    doctors.push(doctor);
  }

  const patients = [];
  for (const p of D.patients) {
    patients.push(await User.create({ name: p.name, phone: p.phone, role: "patient", village: villageByName[p.village]._id, passwordHash }));
  }

  return { admin, agent, villages, labs, doctors, patients };
}
