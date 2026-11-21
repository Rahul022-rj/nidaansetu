// Demo mode: the same API as the server, but data lives in the browser (localStorage).
// Useful for an expo demo when there is no internet or MongoDB.
import seed from "./seedData.json";

const KEY = "sehatdwaar_demo_db_v1";

const rand = (n) => Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join("");
const uid = (p) => `${p}_${Date.now().toString(36)}${rand(3)}`;
const wait = (v) => new Promise((r) => setTimeout(() => r(structuredClone(v)), 150));
const fail = (msg) => Promise.reject(new Error(msg));

function distanceKm(a, b) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)) * 10) / 10;
}

function freshDb() {
  const now = new Date().toISOString();
  return {
    villages: seed.villages.map(({ key, ...v }) => ({ _id: "v_" + key, ...v, createdAt: now })),
    labs: seed.labs.map(({ key, ...l }) => ({ _id: "l_" + key, active: true, ...l, createdAt: now })),
    doctors: seed.doctors.map(({ key, ...d }) => ({ _id: "d_" + key, active: true, ...d, createdAt: now })),
    bookings: [],
    appointments: [],
  };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    /* ignore */
  }
  const db = freshDb();
  save(db);
  return db;
}
function save(db) {
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch (e) {
    /* storage full or blocked: keep working in memory */
  }
}

let db = load();
const commit = () => save(db);

const noPin = ({ pin, ...rest }) => rest;
const byId = (list, id) => list.find((x) => x._id === id);

function popBooking(b) {
  const lab = byId(db.labs, b.lab);
  const v = byId(db.villages, b.village);
  const d = b.doctor ? byId(db.doctors, b.doctor) : null;
  return {
    ...b,
    lab: lab ? { _id: lab._id, name: lab.name, phone: lab.phone, address: lab.address } : null,
    village: v ? { _id: v._id, name: v.name, block: v.block, lat: v.lat, lng: v.lng } : null,
    doctor: d ? { _id: d._id, name: d.name } : null,
  };
}
function popAppt(a) {
  const d = byId(db.doctors, a.doctor);
  const v = byId(db.villages, a.village);
  const rb = a.referredBooking ? byId(db.bookings, a.referredBooking) : null;
  return {
    ...a,
    doctor: d
      ? { _id: d._id, name: d.name, clinic: d.clinic, timing: d.timing, fee: d.fee, specialty: d.specialty, specialtyHi: d.specialtyHi }
      : null,
    village: v ? { _id: v._id, name: v.name } : null,
    referredBooking: rb ? popBooking(rb) : null,
  };
}

function makeBooking({ patientName, phone, age, villageId, address, labId, tests, date, slot, source, doctorId }) {
  if (!patientName || !phone || !villageId || !labId || !tests?.length)
    throw new Error("Naam, mobile, gaon, lab aur kam se kam ek test zaroori hai");
  const lab = byId(db.labs, labId);
  if (!lab || !lab.active) throw new Error("Lab nahi mila");
  const chosen = tests
    .map((t) => lab.tests.find((lt) => lt.name === t.name))
    .filter(Boolean)
    .map((t) => ({ name: t.name, price: t.price }));
  if (!chosen.length) throw new Error("Test is lab mein uplabdh nahi hai");
  const testTotal = chosen.reduce((s, t) => s + t.price, 0);
  const collectionFee = testTotal >= lab.freeAbove ? 0 : lab.collectionFee;
  const now = new Date().toISOString();
  const b = {
    _id: uid("b"),
    code: "SD" + rand(5),
    patientName,
    phone,
    age: Number(age) || undefined,
    village: villageId,
    address,
    lab: labId,
    tests: chosen,
    testTotal,
    collectionFee,
    total: testTotal + collectionFee,
    date,
    slot,
    status: "requested",
    otp: rand(4),
    source: source || "patient",
    doctor: doctorId || null,
    history: [{ status: "requested", at: now, note: source === "doctor" ? "Doctor ne test likha" : "Patient ne book kiya" }],
    createdAt: now,
  };
  db.bookings.unshift(b);
  commit();
  return b;
}

const forLab = (b) => {
  const { otp, ...rest } = popBooking(b);
  return rest;
};

export function createMockApi(getSession) {
  const me = (roles) => {
    const s = getSession();
    if (!s || !roles.includes(s.role)) throw new Error("Pehle login karein");
    return s;
  };
  const guard = (fn) => (...args) => {
    try {
      return wait(fn(...args));
    } catch (e) {
      return fail(e.message);
    }
  };
  const labOwn = (id) => {
    const s = me(["lab"]);
    const b = db.bookings.find((x) => x._id === id && x.lab === s.id);
    if (!b) throw new Error("Booking nahi mili");
    return b;
  };
  const push = (b, status, note) => b.history.push({ status, at: new Date().toISOString(), note });

  return {
    mode: "demo",
    getVillages: guard(() => [...db.villages].sort((a, b) => a.name.localeCompare(b.name))),
    getLabs: guard((villageId) => {
      const v = byId(db.villages, villageId);
      return db.labs
        .filter((l) => l.active)
        .map((l) => {
          const o = noPin(l);
          if (v) {
            o.distanceKm = distanceKm(v, l);
            o.inRange = o.distanceKm <= l.radiusKm;
          }
          return o;
        })
        .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
    }),
    getDoctors: guard((villageId) => {
      const v = byId(db.villages, villageId);
      return db.doctors
        .filter((d) => d.active)
        .map((d) => ({ ...noPin(d), ...(v ? { distanceKm: distanceKm(v, d) } : {}) }))
        .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
    }),
    createBooking: guard((data) => popBooking(makeBooking({ ...data, source: "patient", doctorId: null }))),
    myBookings: guard((phone) => db.bookings.filter((b) => b.phone === phone).map(popBooking)),
    createAppointment: guard(({ patientName, phone, age, villageId, doctorId, date }) => {
      if (!patientName || !phone || !doctorId || !date) throw new Error("Naam, mobile, doctor aur din zaroori hai");
      const token = db.appointments.filter((a) => a.doctor === doctorId && a.date === date && a.status !== "cancelled").length + 1;
      const a = {
        _id: uid("a"),
        code: "DR" + rand(5),
        patientName,
        phone,
        age: Number(age) || undefined,
        village: villageId,
        doctor: doctorId,
        date,
        token,
        status: "booked",
        referredBooking: null,
        createdAt: new Date().toISOString(),
      };
      db.appointments.unshift(a);
      commit();
      return popAppt(a);
    }),
    myAppointments: guard((phone) => db.appointments.filter((a) => a.phone === phone).map(popAppt)),

    loginOptions: guard((role) => {
      if (role === "lab") return db.labs.filter((l) => l.active).map((l) => ({ id: l._id, name: l.name }));
      if (role === "doctor") return db.doctors.filter((d) => d.active).map((d) => ({ id: d._id, name: d.name }));
      if (role === "admin") return seed.admins.map((a) => ({ id: a.id, name: a.name, role: a.role }));
      return [];
    }),
    login: guard((role, id, pin) => {
      let user = null;
      if (role === "lab") user = byId(db.labs, id);
      else if (role === "doctor") user = byId(db.doctors, id);
      else user = seed.admins.find((a) => a.id === id && a.role === role);
      if (!user || user.pin !== pin) throw new Error("Galat PIN");
      return { role, id, name: user.name, pin };
    }),

    labBookings: guard(() => {
      const s = me(["lab"]);
      const lab = byId(db.labs, s.id);
      return db.bookings
        .filter((b) => b.lab === s.id)
        .map(forLab)
        .map((b) => ({ ...b, distanceKm: b.village ? distanceKm(b.village, lab) : undefined }));
    }),
    labConfirm: guard((id, collectionTime) => {
      const b = labOwn(id);
      b.status = "confirmed";
      b.collectionTime = collectionTime || b.slot;
      push(b, "confirmed", `Collector ${b.collectionTime} aayega`);
      commit();
      return forLab(b);
    }),
    labReject: guard((id) => {
      const b = labOwn(id);
      b.status = "cancelled";
      push(b, "cancelled", "Lab ne mana kiya");
      commit();
      return forLab(b);
    }),
    labCollect: guard((id, otp) => {
      const b = labOwn(id);
      if (String(otp) !== b.otp) throw new Error("OTP galat hai");
      b.status = "collected";
      push(b, "collected", "Sample le liya gaya");
      commit();
      return forLab(b);
    }),
    labUploadReport: (id, file) =>
      new Promise((resolve, reject) => {
        try {
          const b = labOwn(id);
          if (!file) throw new Error("Report file chunein");
          if (file.size > 1.5 * 1024 * 1024) throw new Error("Demo mein 1.5 MB tak ki file chunein");
          const reader = new FileReader();
          reader.onload = () => {
            b.status = "report_ready";
            b.reportUrl = reader.result;
            b.reportName = file.name;
            push(b, "report_ready", "Report upload hui");
            commit();
            resolve(structuredClone(forLab(b)));
          };
          reader.onerror = () => reject(new Error("File padh nahi paye"));
          reader.readAsDataURL(file);
        } catch (e) {
          reject(e);
        }
      }),

    doctorAppointments: guard(() => {
      const s = me(["doctor"]);
      return db.appointments
        .filter((a) => a.doctor === s.id)
        .sort((a, b) => (a.date === b.date ? a.token - b.token : a.date.localeCompare(b.date)))
        .map(popAppt);
    }),
    doctorSeen: guard((id) => {
      const s = me(["doctor"]);
      const a = db.appointments.find((x) => x._id === id && x.doctor === s.id);
      if (!a) throw new Error("Appointment nahi mila");
      a.status = "seen";
      commit();
      return popAppt(a);
    }),
    doctorRefer: guard(({ appointmentId, labId, tests }) => {
      const s = me(["doctor"]);
      const a = db.appointments.find((x) => x._id === appointmentId && x.doctor === s.id);
      if (!a) throw new Error("Appointment nahi mila");
      const b = makeBooking({
        patientName: a.patientName,
        phone: a.phone,
        age: a.age,
        villageId: a.village,
        labId,
        tests,
        date: a.date,
        slot: "Lab tay karega",
        source: "doctor",
        doctorId: s.id,
      });
      a.referredBooking = b._id;
      commit();
      return popBooking(b);
    }),

    adminStats: guard(() => {
      me(["admin", "agent"]);
      const live = db.bookings.filter((b) => b.status !== "cancelled");
      return {
        labs: db.labs.length,
        doctors: db.doctors.length,
        villages: db.villages.length,
        bookings: db.bookings.length,
        appointments: db.appointments.length,
        reports: db.bookings.filter((b) => b.status === "report_ready").length,
        gmv: live.reduce((s, b) => s + b.total, 0),
      };
    }),
    adminBookings: guard(() => {
      me(["admin", "agent"]);
      return db.bookings.map(popBooking);
    }),
    adminLabs: guard(() => {
      me(["admin", "agent"]);
      return db.labs.map(noPin);
    }),
    adminDoctors: guard(() => {
      me(["admin", "agent"]);
      return db.doctors.map(noPin);
    }),
    adminAddLab: guard((data) => {
      me(["admin", "agent"]);
      if (!data.name || !data.pin) throw new Error("Lab ka naam aur PIN zaroori hai");
      const lab = { _id: uid("l"), active: true, collectionFee: 49, freeAbove: 499, radiusKm: 5, tests: [], ...data, createdAt: new Date().toISOString() };
      db.labs.unshift(lab);
      commit();
      return noPin(lab);
    }),
    adminAddDoctor: guard((data) => {
      me(["admin", "agent"]);
      if (!data.name || !data.pin) throw new Error("Doctor ka naam aur PIN zaroori hai");
      const d = { _id: uid("d"), active: true, ...data, createdAt: new Date().toISOString() };
      db.doctors.unshift(d);
      commit();
      return noPin(d);
    }),
    adminAddVillage: guard((data) => {
      me(["admin", "agent"]);
      if (!data.name || data.lat == null || data.lng == null) throw new Error("Gaon ka naam aur location zaroori hai");
      const v = { _id: uid("v"), ...data, createdAt: new Date().toISOString() };
      db.villages.push(v);
      commit();
      return v;
    }),
    adminToggleLab: guard((id) => {
      me(["admin", "agent"]);
      const l = byId(db.labs, id);
      if (!l) throw new Error("Lab nahi mila");
      l.active = !l.active;
      commit();
      return noPin(l);
    }),

    reportLink: (b) => b.reportUrl || null,
    resetDemo: () => {
      db = freshDb();
      commit();
    },
  };
}
