import { Router } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import { Village, Lab, LabTest, Doctor, User, Booking } from "../models/index.js";
import { guard } from "../middleware/auth.js";
import { validate, objectId, idParams } from "../middleware/validate.js";
import { listQuery, paginate } from "../lib/paginate.js";
import { createStaffUser, setUserStatus } from "../services/users.js";
import { computeB2b, parseTestList } from "../services/pricing.js";
import { audit, pick } from "../lib/audit.js";
import { badRequest, forbidden, notFound } from "../lib/errors.js";
import { nameSchema, emailSchema, phoneSchema } from "./auth.js";
import { scheduleSchema } from "./doctor.js";

const router = Router();
// Super admin passes every agent route; agents are additionally limited to what they onboarded.
router.use(...guard("agent", "super_admin"));

const scope = (req) => (req.user.role === "super_admin" ? {} : { onboardedBy: req.user._id });
const lat = z.coerce.number().min(-90).max(90);
const lng = z.coerce.number().min(-180).max(180);
const point = (la, ln) => ({ type: "Point", coordinates: [ln, la] });
const LAB_FIELDS = ["name", "address", "phone", "block", "location", "serviceRadiusKm", "pathologist", "licenceNo", "collectionFee", "freeCollectionAbove", "minOrderValue", "commissionPercent", "villages", "status"];
const DOCTOR_FIELDS = ["name", "degree", "registrationNo", "specialty", "specialtyHi", "clinicName", "clinicAddress", "block", "location", "fee", "schedule", "villages", "status"];

const villageIds = z.array(objectId).max(200);
// De-duplicates and checks that every tagged village exists.
async function checkVillages(ids) {
  if (ids === undefined) return undefined;
  const unique = [...new Set(ids.map(String))];
  if ((await Village.countDocuments({ _id: { $in: unique } })) !== unique.length) throw notFound("Koi chuna hua gaon nahi mila", "VILLAGE_NOT_FOUND");
  return unique;
}

// Agents add and edit; switching a lab/doctor off (or deleting it) is the super admin's call.
function onlyAdminChangesStatus(req) {
  if ("status" in (req.rawBody || {}) && req.user.role !== "super_admin") {
    throw forbidden("Lab/doctor ko band ya delete sirf admin kar sakta hai", "ADMIN_ONLY");
  }
}

async function ownLab(req, id = req.params.id) {
  const lab = await Lab.findOne({ _id: id, ...scope(req) });
  if (!lab) throw notFound("Lab nahi mila");
  return lab;
}

// ---------- villages ----------
router.post(
  "/villages",
  validate({ body: z.object({ name: nameSchema, block: z.string().trim().min(2).max(60), district: z.string().trim().max(60).default("Siwan"), lat, lng }) }),
  async (req, res) => {
    const { name, block, district } = req.body;
    const v = await Village.create({ name, block, district, location: point(req.body.lat, req.body.lng), createdBy: req.user._id });
    await audit(req, { action: "village.create", entityType: "Village", entityId: v._id, after: pick(v, ["name", "block", "district", "location"]) });
    res.status(201).json(v);
  }
);

// ---------- labs ----------
const labBody = z.object({
  name: nameSchema,
  address: z.string().trim().max(200).optional(),
  phone: phoneSchema.optional(),
  block: z.string().trim().max(60).optional(),
  lat,
  lng,
  serviceRadiusKm: z.coerce.number().min(0.5).max(50).default(5),
  pathologist: z
    .object({ name: z.string().trim().max(80).optional(), qualification: z.string().trim().max(80).optional(), registrationNo: z.string().trim().max(60).optional() })
    .optional(),
  licenceNo: z.string().trim().max(60).optional(),
  collectionFee: z.coerce.number().int().min(0).max(1000).default(49),
  freeCollectionAbove: z.coerce.number().int().min(0).max(100000).default(499),
  minOrderValue: z.coerce.number().int().min(0).max(100000).default(199),
  commissionPercent: z.coerce.number().min(0).max(90).default(30),
  villages: villageIds.optional(),
});

router.post("/labs", validate({ body: labBody }), async (req, res) => {
  const { lat: la, lng: ln, ...rest } = req.body;
  rest.villages = (await checkVillages(rest.villages)) ?? [];
  const lab = await Lab.create({ ...rest, location: point(la, ln), onboardedBy: req.user._id });
  await audit(req, { action: "lab.create", entityType: "Lab", entityId: lab._id, after: pick(lab, LAB_FIELDS) });
  res.status(201).json(lab);
});

router.get("/labs/:id", validate({ params: idParams }), async (req, res) => {
  const lab = await ownLab(req);
  const [tests, staff] = await Promise.all([
    LabTest.find({ lab: lab._id }).sort({ name: 1 }).collation({ locale: "en" }),
    User.find({ lab: lab._id, role: "lab_staff" }).select("name email phone status lastLoginAt mustChangePassword"),
  ]);
  res.json({ lab, tests, staff });
});

router.patch(
  "/labs/:id",
  validate({
    params: idParams,
    body: labBody
      .omit({ lat: true, lng: true })
      .partial()
      .extend({ lat: lat.optional(), lng: lng.optional(), status: z.enum(["active", "disabled"]).optional() }),
  }),
  async (req, res) => {
    const lab = await ownLab(req);
    onlyAdminChangesStatus(req);
    const sent = Object.keys(req.rawBody || {});
    const body = Object.fromEntries(Object.entries(req.body).filter(([k]) => sent.includes(k)));
    const before = pick(lab, LAB_FIELDS);
    const { lat: la, lng: ln, ...rest } = body;
    if (rest.villages !== undefined) rest.villages = await checkVillages(rest.villages);
    Object.assign(lab, rest);
    if (la !== undefined && ln !== undefined) lab.location = point(la, ln);
    await lab.save();
    if (rest.commissionPercent !== undefined && rest.commissionPercent !== before.commissionPercent) {
      const tests = await LabTest.find({ lab: lab._id, b2bOverridden: false });
      await Promise.all(tests.map((t) => LabTest.updateOne({ _id: t._id }, { b2bPrice: computeB2b(t.walkInPrice, lab.commissionPercent) })));
    }
    await audit(req, { action: "lab.update", entityType: "Lab", entityId: lab._id, before, after: pick(lab, LAB_FIELDS) });
    res.json(lab);
  }
);

// Bulk import: { text: "CBC = 400\nTSH = 200" } or CSV lines, or { tests: [{ name, walkInPrice, ... }] }.
// Existing tests (same name, any case) are updated; new ones created.
router.post(
  "/labs/:id/tests",
  validate({
    params: idParams,
    body: z.object({
      text: z.string().max(50_000).optional(),
      tests: z
        .array(
          z.object({
            name: z.string().trim().min(1).max(120),
            walkInPrice: z.coerce.number().int().min(1).max(100000),
            listingPrice: z.coerce.number().int().min(1).max(100000).optional(),
            b2bPrice: z.coerce.number().int().min(0).max(100000).optional(),
            category: z.string().trim().max(60).optional(),
            sampleType: z.string().trim().max(30).optional(),
            fastingRequired: z.boolean().optional(),
            reportTimeHours: z.coerce.number().int().min(1).max(720).optional(),
            isOutsourced: z.boolean().optional(),
          })
        )
        .max(500)
        .optional(),
    }),
  }),
  async (req, res) => {
    const lab = await ownLab(req);
    let rows = req.body.tests || [];
    let errors = [];
    if (req.body.text) ({ rows, errors } = parseTestList(req.body.text));
    if (!rows.length) throw badRequest("Koi sahi test nahi mila. Har line 'Naam = Rate' likhein.", "NO_TESTS", errors);

    let created = 0;
    let updated = 0;
    for (const r of rows) {
      const b2bOverridden = r.b2bPrice !== undefined;
      const values = {
        ...r,
        listingPrice: r.listingPrice ?? r.walkInPrice,
        b2bPrice: b2bOverridden ? r.b2bPrice : computeB2b(r.walkInPrice, lab.commissionPercent),
        b2bOverridden,
      };
      if (values.listingPrice < values.b2bPrice) {
        errors.push({ text: r.name, message: "Patient rate B2B rate se kam hai" });
        continue;
      }
      const existing = await LabTest.findOne({ lab: lab._id, name: r.name }).collation({ locale: "en", strength: 2 });
      if (existing) {
        Object.assign(existing, values, { active: true });
        await existing.save();
        updated++;
      } else {
        await LabTest.create({ ...values, lab: lab._id });
        created++;
      }
    }
    await audit(req, { action: "labtest.import", entityType: "Lab", entityId: lab._id, after: { created, updated, failed: errors.length } });
    res.status(201).json({ created, updated, errors });
  }
);

router.post(
  "/labs/:id/staff",
  validate({ params: idParams, body: z.object({ name: nameSchema, email: emailSchema, phone: phoneSchema.optional() }) }),
  async (req, res) => {
    const lab = await ownLab(req);
    const { user, tempPassword } = await createStaffUser(req, { ...req.body, role: "lab_staff", lab: lab._id });
    // The temporary password is returned exactly once so the agent can hand it over in person.
    res.status(201).json({ user, tempPassword });
  }
);

// ---------- doctors ----------
const doctorBody = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional(),
  degree: z.string().trim().max(80).optional(),
  registrationNo: z.string().trim().max(60).optional(),
  specialty: z.string().trim().min(2).max(60),
  specialtyHi: z.string().trim().max(80).optional(),
  clinicName: z.string().trim().max(120).optional(),
  clinicAddress: z.string().trim().max(200).optional(),
  block: z.string().trim().max(60).optional(),
  lat,
  lng,
  fee: z.coerce.number().int().min(0).max(10000).default(0),
  schedule: scheduleSchema.default([]),
  villages: villageIds.optional(),
});

router.post("/doctors", validate({ body: doctorBody }), async (req, res) => {
  const { email, phone, lat: la, lng: ln, ...profile } = req.body;
  if (await User.exists({ email })) throw badRequest("Yeh email pehle se registered hai", "DUPLICATE");
  profile.villages = (await checkVillages(profile.villages)) ?? [];
  const doctor = await Doctor.create({ ...profile, location: point(la, ln), onboardedBy: req.user._id });
  let created;
  try {
    created = await createStaffUser(req, { name: profile.name, email, phone, role: "doctor", doctor: doctor._id });
  } catch (e) {
    await Doctor.deleteOne({ _id: doctor._id }); // don't leave a profile without a login
    throw e;
  }
  doctor.user = created.user._id;
  await doctor.save();
  await audit(req, { action: "doctor.create", entityType: "Doctor", entityId: doctor._id, after: pick(doctor, DOCTOR_FIELDS) });
  res.status(201).json({ doctor, user: created.user, tempPassword: created.tempPassword });
});

router.patch(
  "/doctors/:id",
  validate({
    params: idParams,
    body: doctorBody
      .omit({ email: true, phone: true, lat: true, lng: true })
      .partial()
      .extend({ lat: lat.optional(), lng: lng.optional(), status: z.enum(["active", "disabled"]).optional() }),
  }),
  async (req, res) => {
    const doctor = await Doctor.findOne({ _id: req.params.id, ...scope(req) });
    if (!doctor) throw notFound("Doctor nahi mile");
    onlyAdminChangesStatus(req);
    const sent = Object.keys(req.rawBody || {});
    const body = Object.fromEntries(Object.entries(req.body).filter(([k]) => sent.includes(k)));
    const before = pick(doctor, DOCTOR_FIELDS);
    const { lat: la, lng: ln, ...rest } = body;
    if (rest.villages !== undefined) rest.villages = await checkVillages(rest.villages);
    Object.assign(doctor, rest);
    if (la !== undefined && ln !== undefined) doctor.location = point(la, ln);
    await doctor.save();
    if (rest.status && doctor.user) {
      const u = await User.findById(doctor.user);
      if (u && u.status !== rest.status) await setUserStatus(req, u, rest.status);
    }
    await audit(req, { action: "doctor.update", entityType: "Doctor", entityId: doctor._id, before, after: pick(doctor, DOCTOR_FIELDS) });
    res.json(doctor);
  }
);

router.get(
  "/my-onboarded",
  validate({ query: listQuery.extend({ type: z.enum(["lab", "doctor"]).default("lab"), status: z.enum(["active", "disabled"]).optional() }) }),
  async (req, res) => {
    const filter = { ...scope(req) };
    if (req.q.status) filter.status = req.q.status;
    if (req.q.type === "doctor") {
      const r = await paginate(Doctor, filter, req.q, { allowedSort: ["createdAt", "name"], populate: { path: "user", select: "email status lastLoginAt mustChangePassword" } });
      return res.json(r);
    }
    const r = await paginate(Lab, filter, req.q, { allowedSort: ["createdAt", "name"] });
    const ids = r.data.map((l) => l._id);
    const [tests, staff] = await Promise.all([
      LabTest.aggregate([{ $match: { lab: { $in: ids }, active: true } }, { $group: { _id: "$lab", n: { $sum: 1 } } }]),
      User.aggregate([{ $match: { lab: { $in: ids }, role: "lab_staff" } }, { $group: { _id: "$lab", n: { $sum: 1 } } }]),
    ]);
    const t = Object.fromEntries(tests.map((x) => [String(x._id), x.n]));
    const s = Object.fromEntries(staff.map((x) => [String(x._id), x.n]));
    res.json({ ...r, data: r.data.map((l) => ({ ...l.toJSON(), testCount: t[l._id] || 0, staffCount: s[l._id] || 0 })) });
  }
);

// Bookings of the labs this agent onboarded. No finance fields for agents.
router.get(
  "/bookings",
  validate({ query: listQuery.extend({ labId: objectId.optional(), status: z.enum(["requested", "confirmed", "collected", "report_ready", "cancelled"]).optional() }) }),
  async (req, res) => {
    const labIds = (await Lab.find(scope(req)).select("_id")).map((l) => l._id);
    const filter = { lab: { $in: labIds } };
    if (req.q.labId) filter.lab = labIds.some((id) => String(id) === req.q.labId) ? new mongoose.Types.ObjectId(req.q.labId) : null;
    if (req.q.status) filter.status = req.q.status;
    const r = await paginate(Booking, filter, req.q, {
      allowedSort: ["createdAt", "date"],
      populate: [{ path: "lab", select: "name" }, { path: "village", select: "name" }],
      select: "code patientName lab village items.name date slot status source total createdAt",
    });
    res.json(r);
  }
);

export default router;
