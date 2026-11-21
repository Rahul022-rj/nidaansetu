import cron from "node-cron";
import { env } from "../config/env.js";
import { generateSettlements } from "../services/settlements.js";

// Every Monday 06:00 IST: settle the previous Monday-to-Monday week.
export function scheduleSettlementJob() {
  return cron.schedule(
    env.SETTLEMENT_CRON,
    async () => {
      try {
        const rows = await generateSettlements();
        console.log(`[settlement] generated ${rows.length} settlement(s)`);
      } catch (e) {
        console.error("[settlement] failed:", e);
      }
    },
    { timezone: env.TZ_NAME }
  );
}
