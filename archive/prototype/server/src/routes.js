import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { Village, Lab, Doctor, Booking, Appointment } from "./models.js";
import { distanceKm, randomDigits, priceBooking, requireRole } from "./utils.js";

const router = express.Router();

// ---------- helpers ----------
const seed = JSON.parse(fs.readFileSync(new URL("./seedData.json", import.meta.url)));
const ADMINS = seed.admins; // admin + agent logins (demo)

async function findUser(role, id) {
  if (role === "lab") return Lab.findById(id);
  if (role === "doctor") return Doctor.findById(id);
  if (role === "admin" || role === "agent") return ADMINS.find((a) => a.id === id && a.role === role);
  return null;
}

const asLab = requireRole(["lab"], findUser);
const asDoctor = requireRole(["doctor"], findUser);
const asAdmin = requireRole(["admin", "agent"], findUser);

const noPin = (doc) => {
  const o = doc.toObject ? doc.toObject() : { ...doc };
  delete o.pin;
  return o;
};

const BOOKING_POPULATE = [
  { path: "lab", select: "name phone address" },
  { path: "village", select: "name block" },
  { path: "doctor", select: "name" },
];

const APPT_POPULATE = [
  { path: "doctor", select: "name clinic timing fee specialty specialtyHi" },
  { path: "village", select: "name" },
];

// Lab must never see the patient's OTP, otherwise collection can be faked
const forLab = (doc) => {
  const o = doc.toObject ? doc.toObject() : { ...doc };
  delete o.otp;
  return o;
};

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

async function makeBooking({ patientName, phone, age, villageId, address, labId, tests, date, slot, source, doctorId }) {
  if (!patientName || !phone || !villageId || !labId || !tests?.length) {
    const e = new Error("Naam, mobile, gaon, lab aur kam se kam ek test zaroori hai");
    e.status = 400;
    throw e;
  }
  const lab = await Lab.findById(labId);
  if (!lab || !lab.active) {
    const e = new Error("Lab nahi mila");
    e.status = 404;
    throw e;
  }
  // Price comes from the lab's own list, never from the client
  const chosen = tests
    .map((t) => lab.tests.find((lt) => lt.name === t.name))
    .filter(Boolean)
    .map((t) => ({ name: t.name, price: t.price }));
  if (!chosen.length) {
    const e = new Error("Test is lab mein uplabdh nahi hai");
    e.status = 400;
    throw e;
  }
  const price = priceBooking(lab, chosen);
  const booking = await Booking.create({
    code: "SD" + randomDigits(5),
    patientName,
    phone,
    age,
    village: villageId,
    address,
    lab: lab._id,
    tests: chosen,
    ...price,
    date,
    slot,
    otp: randomDigits(4),
    source: source || "patient",
    doctor: doctorId,
    history: [{ status: "requested", note: source === "doctor" ? "Doctor ne test likha" : "Patient ne book kiya" }],
  });
  return Booking.findById(booking._id).populate(BOOKING_POPULATE);
}

// ---------- public (patient) ----------
router.get("/villages", wrap(async (req, res) => {
  res.json(await Village.find().sort({ name: 1 }));
}));

router.get("/labs", wrap(async (req, res) => {
  const village = req.query.villageId ? await Village.findById(req.query.villageId) : null;
  const labs = await Lab.find({ active: true });
  const out = labs
    .map((l) => {
      const o = noPin(l);
      if (village) {
        o.distanceKm = distanceKm(village, l);
        o.inRange = o.distanceKm <= l.radiusKm;
      }
      return o;
    })
    .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
  res.json(out);
}));

router.get("/doctors", wrap(async (req, res) => {
  const village = req.query.villageId ? await Village.findById(req.query.villageId) : null;
  const docs = await Doctor.find({ active: true });
  const out = docs
    .map((d) => {
      const o = noPin(d);
      if (village) o.distanceKm = distanceKm(village, d);
      return o;
    })
    .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
  res.json(out);
}));

router.post("/bookings", wrap(async (req, res) => {
  res.status(201).json(await makeBooking({ ...req.body, source: "patient", doctorId: undefined }));
}));

router.get("/bookings", wrap(async (req, res) => {
  if (!req.query.phone) return res.status(400).json({ error: "Mobile number daalein" });
  res.json(await Booking.find({ phone: req.query.phone }).sort({ createdAt: -1 }).populate(BOOKING_POPULATE));
}));

router.post("/appointments", wrap(async (req, res) => {
  const { patientName, phone, age, villageId, doctorId, date } = req.body;
  if (!patientName || !phone || !doctorId || !date) {
    return res.status(400).json({ error: "Naam, mobile, doctor aur din zaroori hai" });
  }
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) return res.status(404).json({ error: "Doctor nahi mila" });
  const already = await Appointment.countDocuments({ doctor: doctorId, date, status: { $ne: "cancelled" } });
  const appt = await Appointment.create({
    code: "DR" + randomDigits(5),
    patientName,
    phone,
    age,
    village: villageId,
    doctor: doctorId,
    date,
    token: already + 1,
  });
  res.status(201).json(await Appointment.findById(appt._id).populate(APPT_POPULATE));
}));

router.get("/appointments", wrap(async (req, res) => {
  if (!req.query.phone) return res.status(400).json({ error: "Mobile number daalein" });
  res.json(await Appointment.find({ phone: req.query.phone }).sort({ createdAt: -1 }).populate(APPT_POPULATE));
}));

// ---------- login ----------
router.get("/login-options", wrap(async (req, res) => {
  const { role } = req.query;
  if (role === "lab") return res.json((await Lab.find({ active: true })).map((l) => ({ id: l._id, name: l.name })));
  if (role === "doctor") return res.json((await Doctor.find({ active: true })).map((d) => ({ id: d._id, name: d.name })));
  if (role === "admin") return res.json(ADMINS.map((a) => ({ id: a.id, name: a.name, role: a.role })));
  res.json([]);
}));

router.post("/login", wrap(async (req, res) => {
  const { role, id, pin } = req.body;
  const user = await findUser(role, id);
  if (!user || user.pin !== pin) return res.status(401).json({ error: "Galat PIN" });
  res.json({ role, id, name: user.name, pin });
}));

// ---------- lab panel ----------
router.get("/lab/bookings", asLab, wrap(async (req, res) => {
  const lab = await Lab.findById(req.user.id);
  const list = await Booking.find({ lab: req.user.id })
    .sort({ createdAt: -1 })
    .populate([
      { path: "lab", select: "name phone address" },
      { path: "village", select: "name block lat lng" },
      { path: "doctor", select: "name" },
    ]);
  res.json(
    list.map((b) => {
      const o = forLab(b);
      if (o.village?.lat != null) o.distanceKm = distanceKm(o.village, lab);
      return o;
    })
  );
}));

async function labOwnBooking(req) {
  const b = await Booking.findOne({ _id: req.params.id, lab: req.user.id });
  if (!b) {
    const e = new Error("Booking nahi mili");
    e.status = 404;
    throw e;
  }
  return b;
}

router.patch("/lab/bookings/:id/confirm", asLab, wrap(async (req, res) => {
  const b = await labOwnBooking(req);
  b.status = "confirmed";
  b.collectionTime = req.body.collectionTime || b.slot;
  b.history.push({ status: "confirmed", note: `Collector ${b.collectionTime} aayega` });
  await b.save();
  res.json(forLab(await b.populate(BOOKING_POPULATE)));
}));

router.patch("/lab/bookings/:id/reject", asLab, wrap(async (req, res) => {
  const b = await labOwnBooking(req);
  b.status = "cancelled";
  b.history.push({ status: "cancelled", note: req.body.reason || "Lab ne mana kiya" });
  await b.save();
  res.json(forLab(await b.populate(BOOKING_POPULATE)));
}));

router.patch("/lab/bookings/:id/collect", asLab, wrap(async (req, res) => {
  const b = await labOwnBooking(req);
  if (String(req.body.otp) !== b.otp) return res.status(400).json({ error: "OTP galat hai" });
  b.status = "collected";
  b.history.push({ status: "collected", note: "Sample le liya gaya" });
  await b.save();
  res.json(forLab(await b.populate(BOOKING_POPULATE)));
}));

const uploadDir = path.resolve("uploads");
fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => cb(null, `${req.params.id}-${Date.now()}${path.extname(file.originalname)}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post("/lab/bookings/:id/report", asLab, upload.single("report"), wrap(async (req, res) => {
  const b = await labOwnBooking(req);
  if (!req.file) return res.status(400).json({ error: "Report file chunein" });
  b.status = "report_ready";
  b.reportUrl = `/uploads/${req.file.filename}`;
  b.reportName = req.file.originalname;
  b.history.push({ status: "report_ready", note: "Report upload hui" });
  await b.save();
  res.json(forLab(await b.populate(BOOKING_POPULATE)));
}));

// ---------- doctor panel ----------
router.get("/doctor/appointments", asDoctor, wrap(async (req, res) => {
  res.json(
    await Appointment.find({ doctor: req.user.id })
      .sort({ date: 1, token: 1 })
      .populate(APPT_POPULATE)
      .populate({ path: "referredBooking", populate: BOOKING_POPULATE })
  );
}));

router.patch("/doctor/appointments/:id/seen", asDoctor, wrap(async (req, res) => {
  const a = await Appointment.findOneAndUpdate(
    { _id: req.params.id, doctor: req.user.id },
    { status: "seen" },
    { new: true }
  ).populate(APPT_POPULATE);
  if (!a) return res.status(404).json({ error: "Appointment nahi mila" });
  res.json(a);
}));

router.post("/doctor/refer", asDoctor, wrap(async (req, res) => {
  const { appointmentId, labId, tests } = req.body;
  const a = await Appointment.findOne({ _id: appointmentId, doctor: req.user.id });
  if (!a) return res.status(404).json({ error: "Appointment nahi mila" });
  const booking = await makeBooking({
    patientName: a.patientName,
    phone: a.phone,
    age: a.age,
    villageId: a.village,
    labId,
    tests,
    date: a.date,
    slot: "Lab tay karega",
    source: "doctor",
    doctorId: req.user.id,
  });
  a.referredBooking = booking._id;
  await a.save();
  res.status(201).json(booking);
}));

// ---------- admin / agent panel ----------
router.get("/admin/stats", asAdmin, wrap(async (req, res) => {
  const [labs, doctors, villages, bookings, appointments, reports] = await Promise.all([
    Lab.countDocuments(),
    Doctor.countDocuments(),
    Village.countDocuments(),
    Booking.countDocuments(),
    Appointment.countDocuments(),
    Booking.countDocuments({ status: "report_ready" }),
  ]);
  const agg = await Booking.aggregate([
    { $match: { status: { $ne: "cancelled" } } },
    { $group: { _id: null, gmv: { $sum: "$total" } } },
  ]);
  res.json({ labs, doctors, villages, bookings, appointments, reports, gmv: agg[0]?.gmv || 0 });
}));

router.get("/admin/bookings", asAdmin, wrap(async (req, res) => {
  res.json(await Booking.find().sort({ createdAt: -1 }).limit(200).populate(BOOKING_POPULATE));
}));

router.get("/admin/labs", asAdmin, wrap(async (req, res) => {
  res.json((await Lab.find().sort({ createdAt: -1 })).map(noPin));
}));

router.get("/admin/doctors", asAdmin, wrap(async (req, res) => {
  res.json((await Doctor.find().sort({ createdAt: -1 })).map(noPin));
}));

router.post("/admin/labs", asAdmin, wrap(async (req, res) => {
  const lab = await Lab.create(req.body);
  res.status(201).json(noPin(lab));
}));

router.post("/admin/doctors", asAdmin, wrap(async (req, res) => {
  const doc = await Doctor.create(req.body);
  res.status(201).json(noPin(doc));
}));

router.post("/admin/villages", asAdmin, wrap(async (req, res) => {
  res.status(201).json(await Village.create(req.body));
}));

router.patch("/admin/labs/:id/toggle", asAdmin, wrap(async (req, res) => {
  const lab = await Lab.findById(req.params.id);
  if (!lab) return res.status(404).json({ error: "Lab nahi mila" });
  lab.active = !lab.active;
  await lab.save();
  res.json(noPin(lab));
}));

export default router;
