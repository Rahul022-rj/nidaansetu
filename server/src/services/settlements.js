import { Booking, Settlement } from "../models/index.js";
import { lastWeekRange } from "../lib/dates.js";
import { audit } from "../lib/audit.js";

// For each lab: bookings that reached "collected" in [start, end) and aren't in another settlement.
//   gross       = sum of booking totals (what patients paid)
//   labPayout   = sum of b2b prices (what the lab earns)
//   cashWithLab = cash the collector kept from patients (payment.mode = cash)
//   netPayable  = labPayout - cashWithLab   (negative => lab owes the platform)
// Re-running for the same week refreshes a pending settlement and never touches a paid one.
export async function generateSettlements({ start, end } = lastWeekRange(), req = null) {
  const rows = await Booking.aggregate([
    {
      $match: {
        collectedAt: { $gte: start, $lt: end },
        status: { $in: ["collected", "report_ready"] },
      },
    },
    {
      $group: {
        _id: "$lab",
        bookings: { $push: { id: "$_id", settlement: "$settlement" } },
        gross: { $sum: "$total" },
        labPayout: { $sum: "$labPayout" },
        cashWithLab: { $sum: { $cond: [{ $eq: ["$payment.mode", "cash"] }, "$total", 0] } },
      },
    },
  ]);

  const out = [];
  for (const r of rows) {
    const existing = await Settlement.findOne({ lab: r._id, weekStart: start });
    if (existing?.status === "paid") {
      out.push(existing);
      continue;
    }
    // Skip bookings already claimed by a different settlement.
    const own = r.bookings.filter((b) => !b.settlement || (existing && String(b.settlement) === String(existing._id)));
    if (!own.length) continue;
    const ids = own.map((b) => b.id);
    const sums = await Booking.aggregate([
      { $match: { _id: { $in: ids } } },
      {
        $group: {
          _id: null,
          gross: { $sum: "$total" },
          labPayout: { $sum: "$labPayout" },
          cashWithLab: { $sum: { $cond: [{ $eq: ["$payment.mode", "cash"] }, "$total", 0] } },
        },
      },
    ]);
    const s = sums[0];
    const doc = await Settlement.findOneAndUpdate(
      { lab: r._id, weekStart: start },
      {
        $set: {
          weekEnd: end,
          bookings: ids,
          gross: s.gross,
          labPayout: s.labPayout,
          cashWithLab: s.cashWithLab,
          netPayable: s.labPayout - s.cashWithLab,
        },
        $setOnInsert: { status: "pending" },
      },
      { upsert: true, returnDocument: "after" }
    );
    await Booking.updateMany({ _id: { $in: ids } }, { settlement: doc._id });
    out.push(doc);
  }
  await audit(req, {
    action: "settlement.generate",
    entityType: "Settlement",
    after: { weekStart: start, weekEnd: end, count: out.length },
  });
  return out;
}
