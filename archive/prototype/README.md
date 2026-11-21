# SehatDwaar – Jaanch aapke dwaar

Gaon ke log khoon ki jaanch ghar se karwa sakein aur doctor ka number ghar baithe laga sakein, bazaar jaane ki zaroorat na pade.

**Stack:** MongoDB · Express · React (Vite) · Node.js (MERN)

## Chaar panel

| Panel | Kaun use karega | Kya kar sakta hai |
|---|---|---|
| Mareez (patient) | Gaon wale | Gaon chunein → paas ke lab (km ke saath) → test chunein → booking → OTP. Paas ke doctor, kab baithte hain, fees → number lagayein. Mobile number se booking aur report dekhein |
| Lab | Partner lab | Nayi request dekhein → confirm (collector kab aayega) → patient se OTP lekar "sample le liya" → report (PDF/photo) upload |
| Doctor | Doctor | Aaj ke mareez token ke saath → "dekh liya" → app se hi lab test likh ke lab ko refer |
| Admin / Agent | Tum aur field agent | Lab, doctor, gaon jodein (test aur rate ke saath) · saari booking · labs chalu/band |

## Booking ka flow

```
Patient booking  →  Lab confirm  →  Collector ghar aata hai, patient OTP batata hai  →  Lab report upload  →  Patient report dekhta hai
   (requested)      (confirmed)                     (collected)                          (report_ready)
```

Doctor refer kare toh booking seedha lab ke paas "Doctor ne refer kiya" tag ke saath jaati hai.

## Chalane ke do tareeke

### Sabse aasaan backup: `demo-offline.html`

Is file ko Chrome mein double-click karke kholo. Poora app demo mode mein chalega, bina internet, bina `npm install`.

### A) Sirf demo (bina server, bina MongoDB) – expo ke liye sabse safe

```bash
cd client
npm install
echo "VITE_DEMO=true" > .env
npm run dev
```

Browser mein http://localhost:5173 kholo. Data browser mein save hota hai. Home page pe "Demo reset karein" se saaf ho jaata hai.

### B) Poora MERN (asli database ke saath)

**1. MongoDB chahiye.** Do mein se ek:
- Mac pe: `brew tap mongodb/brew && brew install mongodb-community && brew services start mongodb-community`
- Ya free cloud: MongoDB Atlas (M0 free cluster) bana ke connection string lo

**2. Server:**

```bash
cd server
npm install
cp .env.example .env        # Atlas use kar rahe ho toh MONGO_URI badlo
npm run seed                # demo gaon, 2 lab, 3 doctor daal deta hai
npm run dev                 # API: http://localhost:5000
```

**3. Client (naya terminal):**

```bash
cd client
npm install
cp .env.example .env        # VITE_API_URL=http://localhost:5000, VITE_DEMO=false
npm run dev                 # http://localhost:5173
```

## Demo logins (seed data)

| Role | Kaun | PIN |
|---|---|---|
| Admin | Ujjwal (Admin) | 1234 |
| Agent | Field Agent | 0000 |
| Lab | Shree Pathology Lab (Demo) | 1111 |
| Lab | Jeevan Diagnostic Centre (Demo) | 2222 |
| Doctor | Dr. A. Kumar / Dr. S. Devi / Dr. R. Singh | 3333 / 4444 / 5555 |

Saare lab, doctor aur gaon ke naam demo hain. Shree lab ki rate list Siwan ke ek asli lab ki rate list pe based hai.

## Folder structure

```
server/
  src/index.js       Express app, MongoDB connect
  src/models.js      Village, Lab, Doctor, Booking, Appointment
  src/routes.js      Patient, lab, doctor, admin APIs
  src/utils.js       Doori (haversine), price, PIN check
  src/seed.js        Demo data
client/
  src/App.jsx        Home + role chunna
  src/pages/         PatientApp, LabPanel, DoctorPanel, AdminPanel, Login
  src/api/           realApi (server), mockApi (demo mode), seedData
```

## API (short)

| Method | Path | Kaam |
|---|---|---|
| GET | /api/villages | Saare gaon |
| GET | /api/labs?villageId= | Paas ke lab, doori ke saath |
| GET | /api/doctors?villageId= | Paas ke doctor |
| POST | /api/bookings | Test booking (price server lab ki list se lagata hai) |
| GET | /api/bookings?phone= | Meri booking |
| POST | /api/appointments | Doctor ka number (token) |
| POST | /api/login | Lab / doctor / admin login |
| GET | /api/lab/bookings | Lab ki booking (OTP lab ko nahi dikhta) |
| PATCH | /api/lab/bookings/:id/confirm, /collect, /reject | Status badlna |
| POST | /api/lab/bookings/:id/report | Report upload (multer) |
| GET | /api/doctor/appointments | Doctor ke mareez |
| POST | /api/doctor/refer | Lab test refer |
| GET/POST | /api/admin/... | Stats, labs, doctors, gaon |

## Live hone se pehle kya badalna hai

- PIN login ki jagah JWT + OTP login
- PIN hash (bcrypt), rate limiting
- Report private storage (S3) pe, signed link ke saath
- WhatsApp Cloud API se booking aur report ka message
- Razorpay payment
