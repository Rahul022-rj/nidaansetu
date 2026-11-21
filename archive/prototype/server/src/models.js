import mongoose from "mongoose";

const { Schema, model } = mongoose;

const villageSchema = new Schema(
  {
    name: { type: String, required: true },
    block: String,
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { timestamps: true }
);

const testSchema = new Schema({ name: String, price: Number }, { _id: false });

const labSchema = new Schema(
  {
    name: { type: String, required: true },
    block: String,
    address: String,
    phone: String,
    lat: Number,
    lng: Number,
    radiusKm: { type: Number, default: 5 },
    collectionFee: { type: Number, default: 49 },
    freeAbove: { type: Number, default: 499 },
    pathologist: String,
    pin: { type: String, required: true },
    tests: [testSchema],
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const doctorSchema = new Schema(
  {
    name: { type: String, required: true },
    degree: String,
    specialty: String,
    specialtyHi: String,
    clinic: String,
    block: String,
    lat: Number,
    lng: Number,
    phone: String,
    days: [String],
    timing: String,
    fee: Number,
    pin: { type: String, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const historySchema = new Schema(
  { status: String, at: { type: Date, default: Date.now }, note: String },
  { _id: false }
);

const bookingSchema = new Schema(
  {
    code: { type: String, index: true },
    patientName: String,
    phone: { type: String, index: true },
    age: Number,
    village: { type: Schema.Types.ObjectId, ref: "Village" },
    address: String,
    lab: { type: Schema.Types.ObjectId, ref: "Lab" },
    tests: [testSchema],
    testTotal: Number,
    collectionFee: Number,
    total: Number,
    date: String,
    slot: String,
    status: {
      type: String,
      enum: ["requested", "confirmed", "collected", "report_ready", "cancelled"],
      default: "requested",
    },
    otp: String,
    collectionTime: String,
    reportUrl: String,
    reportName: String,
    source: { type: String, enum: ["patient", "doctor"], default: "patient" },
    doctor: { type: Schema.Types.ObjectId, ref: "Doctor" },
    history: [historySchema],
  },
  { timestamps: true }
);

const appointmentSchema = new Schema(
  {
    code: String,
    patientName: String,
    phone: { type: String, index: true },
    age: Number,
    village: { type: Schema.Types.ObjectId, ref: "Village" },
    doctor: { type: Schema.Types.ObjectId, ref: "Doctor" },
    date: String,
    token: Number,
    status: { type: String, enum: ["booked", "seen", "cancelled"], default: "booked" },
    referredBooking: { type: Schema.Types.ObjectId, ref: "Booking" },
  },
  { timestamps: true }
);

export const Village = model("Village", villageSchema);
export const Lab = model("Lab", labSchema);
export const Doctor = model("Doctor", doctorSchema);
export const Booking = model("Booking", bookingSchema);
export const Appointment = model("Appointment", appointmentSchema);
