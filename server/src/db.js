import mongoose from "mongoose";
import { env } from "./config/env.js";

mongoose.set("strictQuery", true);

export async function connectDb(uri = env.MONGO_URI) {
  await mongoose.connect(uri, { autoIndex: true });
  // Make sure unique and 2dsphere indexes exist before serving traffic.
  await Promise.all(Object.values(mongoose.models).map((m) => m.syncIndexes()));
  return mongoose.connection;
}

export const disconnectDb = () => mongoose.disconnect();
