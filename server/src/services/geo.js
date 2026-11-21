import { Lab, Doctor } from "../models/index.js";

const km = (m) => Math.round(m / 100) / 10;

// Which villages a lab/doctor shows up in:
//   - tagged with villages by the agent  -> ONLY those villages, never anywhere else
//   - no villages tagged (older entries) -> by distance from its location
const untagged = { $or: [{ villages: { $exists: false } }, { villages: { $size: 0 } }] };

// Labs that serve a village, nearest first.
export async function labsCovering(village, { page = 1, limit = 20 } = {}) {
  const [res] = await Lab.aggregate([
    { $geoNear: { near: village.location, distanceField: "distanceM", spherical: true, query: { status: "active" } } },
    {
      $match: {
        $or: [{ villages: village._id }, { ...untagged, $expr: { $lte: ["$distanceM", { $multiply: ["$serviceRadiusKm", 1000] }] } }],
      },
    },
    { $project: { villages: 0 } },
    {
      $lookup: {
        from: "labtests",
        let: { lab: "$_id" },
        pipeline: [{ $match: { $expr: { $and: [{ $eq: ["$lab", "$$lab"] }, { $eq: ["$active", true] }] } } }, { $count: "n" }],
        as: "testCount",
      },
    },
    {
      $facet: {
        data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        total: [{ $count: "n" }],
      },
    },
  ]);
  const total = res.total[0]?.n || 0;
  return {
    data: res.data.map(({ distanceM, testCount, __v: _v, ...l }) => ({ ...l, distanceKm: km(distanceM), testCount: testCount[0]?.n || 0 })),
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

// Doctors for a village, nearest first (same tagging rule; untagged doctors within maxKm).
export async function doctorsNear(village, { specialty, page = 1, limit = 20, maxKm = 40 } = {}) {
  const query = { status: "active" };
  if (specialty) query.specialty = specialty;
  const [res] = await Doctor.aggregate([
    { $geoNear: { near: village.location, distanceField: "distanceM", spherical: true, query } },
    { $match: { $or: [{ villages: village._id }, { ...untagged, distanceM: { $lte: maxKm * 1000 } }] } },
    { $project: { user: 0, onboardedBy: 0, villages: 0, __v: 0 } },
    { $facet: { data: [{ $skip: (page - 1) * limit }, { $limit: limit }], total: [{ $count: "n" }] } },
  ]);
  const total = res.total[0]?.n || 0;
  return {
    data: res.data.map(({ distanceM, ...d }) => ({ ...d, distanceKm: km(distanceM) })),
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}
