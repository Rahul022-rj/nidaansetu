import { z } from "zod";

// Shared query schema for list endpoints. Extend with .extend({...}) for filters.
export const listQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().max(40).optional(),
});

// sort="-createdAt" -> { createdAt: -1 }, only for whitelisted fields
export function sortSpec(sort, allowed, fallback = { createdAt: -1 }) {
  if (!sort) return fallback;
  const desc = sort.startsWith("-");
  const field = desc ? sort.slice(1) : sort;
  if (!allowed.includes(field)) return fallback;
  return { [field]: desc ? -1 : 1, _id: 1 };
}

export async function paginate(model, filter, { page, limit, sort }, { allowedSort = ["createdAt"], populate, select, defaultSort } = {}) {
  const q = model
    .find(filter)
    .sort(sortSpec(sort, allowedSort, defaultSort))
    .skip((page - 1) * limit)
    .limit(limit);
  if (populate) q.populate(populate);
  if (select) q.select(select);
  const [data, total] = await Promise.all([q, model.countDocuments(filter)]);
  return { data, meta: { page, limit, total, pages: Math.ceil(total / limit) } };
}

export function pageOf(items, { page, limit }) {
  const total = items.length;
  return {
    data: items.slice((page - 1) * limit, page * limit),
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}
