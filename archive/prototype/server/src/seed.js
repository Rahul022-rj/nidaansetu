import "dotenv/config";
import fs from "fs";
import mongoose from "mongoose";
import { Village, Lab, Doctor, Booking, Appointment } from "./models.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sehatdwaar";
const data = JSON.parse(fs.readFileSync(new URL("./seedData.json", import.meta.url)));
const strip = ({ key, ...rest }) => rest;

await mongoose.connect(MONGO_URI);
await Promise.all([
  Village.deleteMany({}),
  Lab.deleteMany({}),
  Doctor.deleteMany({}),
  Booking.deleteMany({}),
  Appointment.deleteMany({}),
]);

await Village.insertMany(data.villages.map(strip));
await Lab.insertMany(data.labs.map(strip));
await Doctor.insertMany(data.doctors.map(strip));

console.log(
  `Seed done: ${data.villages.length} gaon, ${data.labs.length} labs, ${data.doctors.length} doctors`
);
console.log("Logins -> Admin PIN 1234, Agent PIN 0000, Shree Lab 1111, Jeevan Lab 2222, Doctors 3333/4444/5555");
await mongoose.disconnect();
