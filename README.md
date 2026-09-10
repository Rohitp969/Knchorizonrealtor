# KNC Horizon Realtor — kya badla (README)

## ✅ Maine ye kaam kar diye hain

1. **Contact page ab alag page hai.** Pehle "Contact us" button homepage par hi scroll kar deta tha. Ab har jagah se (navbar, footer, mobile menu) `/contact` par le jaata hai — ek dedicated page.

2. **Blog ko "Explore" ke andar daal diya.** Top navbar mein "Blog" alag se nahi hai ab — woh "Explore" dropdown ke andar mil jaayega (India Office bhi wahin hai).

3. **Duplicate page hata diya.** Website mein "Journal" aur "Blog" — dono ek jaisa page tha (sirf naam alag). Aapki pasand ke hisaab se **Journal hata diya, sirf Blog rakha hai.**

4. **India Office page rakha hai** — jaisa aapne bataya.

5. **Login / Register / Admin panel rakha hai** — jaisa aapne bataya, isse aap khud property, blog posts, aur enquiries manage kar sakte ho login karke.

6. **Poora phone number / WhatsApp / email ek jagah se control hota hai ab.**
   Pehle `+971 58 514 1770` jaisa fake demo number 10+ jagah par hardcoded tha. Ab sirf ek file update karni hai:

   👉 `frontend/src/lib/contact-info.ts`

   Isme apna **real phone number, WhatsApp number, email, aur address** daal dena — pura website automatically update ho jaayega (navbar, footer, contact page, WhatsApp bubble, sab jagah).

7. **Purana dead/commented code hata diya** (home.tsx mein ek purana draft version comment ke roop mein pada tha, use hi nahi ho raha tha — hata diya, code clean hai ab).

## ⚠️ Ye cheezein abhi bhi "demo/sample" hain — real banani hongi

Aapne kaha "sab kuch real hona chahiye" — is baat ko seedha rakhte hue, ye batana zaroori hai ki kya-kya abhi fake/demo hai:

- **`frontend/src/lib/contact-info.ts`** — phone/WhatsApp/email/address abhi placeholder hai (`+00 000...`). **Apna asli number/email/address yahan daalo.**

- **Property listings & blog posts** — `backend/src/lib/seed.ts` mein jo properties (Azure House, Meridian Residence, etc.) aur blog posts hain, woh sab **sample/demo data** hai, kisi real property ka nahi. Do options hain:
  - Admin panel se (Login → Admin) khud real listings daal do, ya
  - Mujhe apni real property details (naam, location, price, photos, details) bhejo, main directly daal dunga.

- **Website ki images** — abhi jo villa/interior/marina wali photos lagi hain, woh **AI-generated demo images** hain (asli photo nahi hai kisi real building ki). Ye clearly ek issue hai jo aapne point out kiya. Iske liye mujhe ek cheez chahiye aapse:
  - Agar aapke paas apni properties/office ki **real photos** hain, unhe bhej do — main unhe seedha website mein laga dunga sahi jagah par.
  - Agar nahi hai, toh main real (non-AI) stock photography dhundh ke suggest kar sakta hoon, jo aap download karke `frontend/public/images/` folder mein daal sakte ho (maine filenames wahi rakhe hain jo code use karta hai, toh sirf file replace karni hogi).

- **Company ka naam** — abhi "KNC Horizon Realtor" hai. Agar ye hi real naam hai toh kuch nahi karna. Agar alag naam hai, batao — main sab jagah se update kar dunga.

## Website kaise chalayein (local par test karne ke liye)

```
cd frontend
npm install
npm run dev
```

Backend (agar chalana ho — properties/blog/contact-form save karne ke liye):

```
cd backend
npm install
npm run dev
```

Backend ko MongoDB connection aur `.env` chahiye hoga (`ADMIN_EMAIL`, `ADMIN_PASSWORD`, `MONGODB_URI` waghera).
