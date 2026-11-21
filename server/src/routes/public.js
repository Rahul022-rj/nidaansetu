import { Router } from "express";
import { z } from "zod";
import { Village, Lab, LabTest, Doctor } from "../models/index.js";
import { validate, objectId, idParams } from "../middleware/validate.js";
import { listQuery, paginate } from "../lib/paginate.js";
import { labsCovering, doctorsNear } from "../services/geo.js";
import { availability } from "../services/appointments.js";
import { notFound } from "../lib/errors.js";

const router = Router();

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

router.get(
  "/villages",
  validate({ query: listQuery.extend({ q: z.string().trim().max(60).optional(), block: z.string().trim().max(60).optional(), limit: z.coerce.number().int().min(1).max(500).default(200) }) }),
  async (req, res) => {
    const { q, block } = req.q;
    const filter = {};
    if (q) filter.name = new RegExp(`^${escapeRe(q)}`, "i");
    if (block) filter.block = block;
    res.json(await paginate(Village, filter, req.q, { allowedSort: ["name", "block", "createdAt"], defaultSort: { name: 1 }, select: "-createdBy" }));
  }
);

router.get("/labs", validate({ query: listQuery.extend({ villageId: objectId }) }), async (req, res) => {
  const village = await Village.findById(req.q.villageId);
  if (!village) throw notFound("Gaon nahi mila", "VILLAGE_NOT_FOUND");
  const result = await labsCovering(village, req.q);
  // Finance fields are internal.
  result.data = result.data.map(({ commissionPercent: _c, onboardedBy: _o, licenceNo: _l, ...l }) => l);
  res.json(result);
});

// Patient-facing price list: listing price only. Walk-in and B2B prices are internal.
router.get("/labs/:id/tests", validate({ params: idParams, query: z.object({ q: z.string().trim().max(60).optional() }) }), async (req, res) => {
  const lab = await Lab.findOne({ _id: req.params.id, status: "active" }).select(
    "name address phone collectionFee freeCollectionAbove minOrderValue serviceRadiusKm pathologist"
  );
  if (!lab) throw notFound("Lab nahi mila", "LAB_NOT_FOUND");
  const filter = { lab: lab._id, active: true };
  if (req.q.q) filter.name = new RegExp(escapeRe(req.q.q), "i");
  const tests = await LabTest.find(filter)
    .select("name category sampleType fastingRequired listingPrice reportTimeHours")
    .sort({ name: 1 })
    .collation({ locale: "en" });
  res.json({ lab, data: tests });
});

router.get(
  "/doctors",
  validate({ query: listQuery.extend({ villageId: objectId.optional(), specialty: z.string().trim().max(60).optional() }) }),
  async (req, res) => {
    const { villageId, specialty } = req.q;
    if (villageId) {
      const village = await Village.findById(villageId);
      if (!village) throw notFound("Gaon nahi mila", "VILLAGE_NOT_FOUND");
      return res.json(await doctorsNear(village, req.q));
    }
    const filter = { status: "active" };
    if (specialty) filter.specialty = specialty;
    res.json(await paginate(Doctor, filter, req.q, { allowedSort: ["name", "fee"], defaultSort: { name: 1 }, select: "-user -onboardedBy" }));
  }
);

router.get("/specialties", async (_req, res) => {
  const rows = await Doctor.aggregate([
    { $match: { status: "active" } },
    { $group: { _id: "$specialty", specialtyHi: { $first: "$specialtyHi" }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  res.json({ data: rows.filter((r) => r._id).map((r) => ({ specialty: r._id, specialtyHi: r.specialtyHi, count: r.count })) });
});

router.get(
  "/doctors/:id/availability",
  validate({ params: idParams, query: z.object({ from: z.string().max(10).optional(), to: z.string().max(10).optional() }) }),
  async (req, res) => {
    const doctor = await Doctor.findOne({ _id: req.params.id, status: "active" }).select("-user -onboardedBy");
    if (!doctor) throw notFound("Doctor nahi mile", "DOCTOR_NOT_FOUND");
    res.json({ doctor, data: await availability(doctor, req.q.from, req.q.to) });
  }
);

export default router;
