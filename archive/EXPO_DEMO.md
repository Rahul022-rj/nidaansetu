# SehatDwaar – Expo demo script (5–7 minute)

## 1. Problem (30 second)

- Siwan district mein 19 block aur 1,528 gaon hain. Khoon ki jaanch ke liye gaon wala khaali pet bus pakad ke bazaar jaata hai aur aadha din kharab karta hai.
- Bade labs (Apollo, Redcliffe) Siwan shehar tak hain, gaon tak nahi.
- Kaunsa doctor kab baithta hai, fees kitni hai, yeh kahin likha nahi hota.

## 2. Solution (30 second)

"SehatDwaar gaon ke logon ko unke paas ke lab aur doctor se jodta hai. Test ghar se, report WhatsApp pe, aur doctor ka number ghar baithe."

## 3. Live demo (4 minute) – isi order mein dikhao

Shuru karne se pehle Home page pe **"Demo reset karein"** daba do.

1. **Mareez:** "Main mareez hoon" → gaon *Rampur* → "Khoon / Peshab ki jaanch".
   - Dikhao: lab doori (km) ke hisaab se, "Ghar se sample milega".
   - CBC + Sugar Fasting + HbA1c chuno → total aur "sample lena free" dikhao (₹499 se upar).
   - Naam, mobile daalo → **booking + OTP** dikhao.
2. **Doctor ka number:** Home → "Doctor ka number lagayein" → Dr. A. Kumar → kab baithte hain, fees → number lagao → **token number**.
3. **Lab panel:** Bahar → Lab → Shree (PIN 1111).
   - Nayi request → collector ka samay chuno → Confirm.
   - "Sample lena hai" → pehle galat OTP (0000) daal ke dikhao ki reject hota hai, phir sahi OTP.
   - "Report daalni hai" → koi PDF/photo upload.
4. **Doctor panel:** Bahar → Doctor → Kumar (PIN 3333) → "Lab test likhein" → Thyroid + Lipid → lab ko bhejo.
5. **Admin panel:** Bahar → Admin (PIN 1234) → saari booking, order value. "+ Lab jodein" se naya lab jod ke dikhao, aur batao ki field agent yahi karega.
6. **Wapas mareez:** "Meri booking aur report" → mobile number → **report download** aur doctor ka likha test.

## 4. Business model (45 second)

- Lab humein apne walk-in rate pe ~30% kam deta hai, patient ko lab ka hi rate milta hai, ghar baithe.
- ₹650 ke order pe humein ~₹142 bachte hain (collector, agent, payment fee ke baad).
- Lab ko naye patient, free software aur har Monday payment milta hai.
- Aage: family plan ₹199/saal, non-partner labs se software fee, doctor token booking.

## 5. Tech (30 second)

- MERN: React (Vite) + Express + MongoDB, 4 role-based panels.
- Doori: gaon aur lab ki location se haversine formula.
- Security: price server lab ki list se lagata hai (client se nahi), OTP lab ko nahi dikhta, report sirf OTP-verified sample ke baad.
- Demo mode: bina internet ke bhi chalta hai (mock API, same interface).

## Judges ke sawal (taiyaari)

| Sawal | Jawab |
|---|---|
| Lab aapko bypass kar dega toh? | Payment platform pe aata hai, collector ko incentive sirf app ke OTP-verified order pe, 12 mahine ka customer attribution, aur har block mein 2 lab |
| Gaon wala app kaise chalayega? | Hindi, bade button, gaon ka agent bhi book kar sakta hai. Agla step WhatsApp bot |
| Report galat aayi toh? | Sirf woh lab jude jahan MD Pathology sign karta hai, agent visit pe check karta hai |
| Paisa kaise kamaoge? | Lab ka B2B rate vs patient rate ka margin, ~₹140 per ₹650 order |
| Asli data hai? | Siwan ke ek lab ki asli rate list li hai, aur ground pe 2 log labs se baat kar rahe hain |
| Competitors? | Apollo, Redcliffe, Healthians Siwan shehar mein hain. Hum block aur gaon level pe hain, jahan woh nahi pahunchte |
