// Talks to the Express + MongoDB server.
export function createRealApi(BASE, getSession) {
  async function call(path, { method = "GET", body, form } = {}) {
    const s = getSession();
    const headers = {};
    if (s) Object.assign(headers, { "x-role": s.role, "x-id": s.id, "x-pin": s.pin });
    if (body) headers["Content-Type"] = "application/json";
    const res = await fetch(`${BASE}/api${path}`, {
      method,
      headers,
      body: form || (body ? JSON.stringify(body) : undefined),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Kuch galat hua, dobara koshish karein");
    return data;
  }
  const q = (o) => "?" + new URLSearchParams(o).toString();

  return {
    mode: "server",
    getVillages: () => call("/villages"),
    getLabs: (villageId) => call("/labs" + q({ villageId })),
    getDoctors: (villageId) => call("/doctors" + q({ villageId })),
    createBooking: (data) => call("/bookings", { method: "POST", body: data }),
    myBookings: (phone) => call("/bookings" + q({ phone })),
    createAppointment: (data) => call("/appointments", { method: "POST", body: data }),
    myAppointments: (phone) => call("/appointments" + q({ phone })),
    loginOptions: (role) => call("/login-options" + q({ role })),
    login: (role, id, pin) => call("/login", { method: "POST", body: { role, id, pin } }),

    labBookings: () => call("/lab/bookings"),
    labConfirm: (id, collectionTime) => call(`/lab/bookings/${id}/confirm`, { method: "PATCH", body: { collectionTime } }),
    labReject: (id) => call(`/lab/bookings/${id}/reject`, { method: "PATCH", body: {} }),
    labCollect: (id, otp) => call(`/lab/bookings/${id}/collect`, { method: "PATCH", body: { otp } }),
    labUploadReport: (id, file) => {
      const form = new FormData();
      form.append("report", file);
      return call(`/lab/bookings/${id}/report`, { method: "POST", form });
    },

    doctorAppointments: () => call("/doctor/appointments"),
    doctorSeen: (id) => call(`/doctor/appointments/${id}/seen`, { method: "PATCH", body: {} }),
    doctorRefer: (data) => call("/doctor/refer", { method: "POST", body: data }),

    adminStats: () => call("/admin/stats"),
    adminBookings: () => call("/admin/bookings"),
    adminLabs: () => call("/admin/labs"),
    adminDoctors: () => call("/admin/doctors"),
    adminAddLab: (data) => call("/admin/labs", { method: "POST", body: data }),
    adminAddDoctor: (data) => call("/admin/doctors", { method: "POST", body: data }),
    adminAddVillage: (data) => call("/admin/villages", { method: "POST", body: data }),
    adminToggleLab: (id) => call(`/admin/labs/${id}/toggle`, { method: "PATCH", body: {} }),

    reportLink: (b) => (b.reportUrl ? BASE + b.reportUrl : null),
    resetDemo: () => {},
  };
}
