import mongoose from "mongoose";

export const { Schema } = mongoose;
export const ObjectId = Schema.Types.ObjectId;

export const ROLES = ["super_admin", "agent", "lab_staff", "doctor", "patient"];
export const STATUSES = ["active", "disabled"];
export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// GeoJSON point: coordinates are [lng, lat]
export const pointSchema = new Schema(
  {
    type: { type: String, enum: ["Point"], default: "Point", required: true },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: (c) => c.length === 2 && c[0] >= -180 && c[0] <= 180 && c[1] >= -90 && c[1] <= 90,
        message: "Invalid [lng, lat]",
      },
    },
  },
  { _id: false }
);

// Never leak secrets: strip hashes from every JSON response.
export function hideFields(...fields) {
  return {
    virtuals: false,
    versionKey: false,
    transform(_doc, ret) {
      for (const f of fields) delete ret[f];
      return ret;
    },
  };
}
