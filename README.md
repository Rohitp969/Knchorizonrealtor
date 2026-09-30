# KNC Horizon Realtor

Dubai real estate website. Do hisse hain:

- **`frontend/`**: website aur admin panel (React + Vite). Vercel par chalta hai.
- **`backend/`**: API aur database ka kaam (Node + Express + PostgreSQL). Render par chalta hai.

Saari photos aur logo Cloudinary par hain (`knc-horizon/` folder). Project me koi image file nahi hai.

## Folder structure

```
KNC-Horizon-Realtor/
├── README.md                  yeh file
├── docs/
│   ├── IMAGE_SOURCES.md       har photo kahan se aayi, uska licence
│   └── DATABASE.md            database: tables, server ki dekhbhaal, backup
│
├── frontend/
│   ├── index.html             Google tag, favicon, default title
│   ├── middleware.js          har page ka title aur share image HTML me likhta hai (WhatsApp, Facebook ke liye).
│   │                          Yeh file APNE AAP banti hai, isse haath se mat badalna.
│   ├── scripts/               build-middleware.mjs: middleware.js banata hai (npm run build isse pehle chalata hai)
│   ├── vercel.json            Vercel ke rules (sitemap, favicon)
│   ├── public/                robots.txt, Google verification file
│   └── src/
│       ├── App.tsx            saare routes (kaunsa URL kaunsa page kholta hai)
│       ├── main.tsx           app yahan se shuru hota hai
│       ├── index.css          colours, fonts, saari styling
│       ├── pages/             website ke pages, section ke hisaab se (neeche table)
│       ├── components/        jo cheezein kai pages par lagti hain
│       ├── lib/               data, API, SEO, settings
│       ├── middleware/        share-preview.ts: middleware ka asli code (yahan badlav karein)
│       └── hooks/             toast (chhota message) ka hook
│
└── backend/
    ├── src/
    │   ├── index.ts           server yahan se shuru hota hai
    │   ├── app.ts             Express app
    │   ├── routes/            API ke raste
    │   └── lib/               database, login, email, Cloudinary, SEO
    ├── scripts/               ek baar chalane wale tools
    └── backups/               database ke backup (sirf is computer par, git me nahi)
```

## Kaunsa page kis file me hai

Saare pages `frontend/src/pages/` me hain. Har page ki apni file hai.

| Website ka page | URL | File |
|---|---|---|
| Home | `/` | `home/HomePage.tsx` |
| About | `/about` | `about/AboutPage.tsx` |
| Our Approach | `/about/approach` | `about/AboutApproachPage.tsx` |
| India Office | `/about/india-office` | `about/IndiaOfficePage.tsx` |
| All Properties | `/properties` | `properties/PropertiesLivePage.tsx` |
| Sale, Rent, Residential, Commercial, Investment | `/properties/sale` waghera | `properties/PropertiesFilterPage.tsx` |
| Ek property | `/properties/<naam>` | `properties/PropertyDetailPage.tsx` |
| Off-Plan Projects | `/off-plan` | `projects/ProjectsPage.tsx` |
| New Launches, Apartments, Villas & Townhouses | `/off-plan/new-launches` waghera | `projects/ProjectsFilterPage.tsx` |
| Ek project | `/projects/<naam>` | `projects/ProjectDetailPage.tsx` |
| Developers | `/developers`, `/off-plan/developers` | `developers/DevelopersPage.tsx` |
| Ek developer | `/developers/<naam>` | `developers/DeveloperDetailPage.tsx` |
| Communities | `/communities`, `/areas` | `communities/CommunitiesPage.tsx` |
| Ek community | `/communities/<naam>` | `communities/CommunityDetailPage.tsx` |
| Services | `/services` | `services/ServicesPage.tsx` |
| Design & Build | `/design-build` | `services/DesignBuildPage.tsx` |
| Interiors & Furniture | `/interiors` | `services/InteriorsPage.tsx` |
| Blog | `/blog` | `blog/BlogPage.tsx` |
| Ek blog post | `/blog/<naam>` | `blog/BlogPostPage.tsx` |
| Market Insights | `/market-insights` | `market-insights/MarketInsightsPage.tsx` |
| Gallery | `/gallery` | `gallery/GalleryPage.tsx` |
| Contact | `/contact` | `contact/ContactPage.tsx` |
| Privacy Policy | `/privacy-policy` | `legal/PrivacyPage.tsx` |
| Terms & Conditions | `/terms-and-conditions` | `legal/TermsPage.tsx` |
| Page nahi mila (404) | koi bhi galat URL | `not-found/NotFoundPage.tsx` |
| Admin panel | `/admin` | `admin/` folder |

`pages/shared/listing-helpers.tsx` me woh cheezein hain jo listing wale pages me same hain: price likhne ka tarika, property card, loading aur error message.

### Admin panel (`frontend/src/pages/admin/`)

| File | Kaam |
|---|---|
| `AdminPage.tsx` | Admin ka main page: login check, phir sahi panel dikhata hai |
| `AdminLogin.tsx` | Sign-in page |
| `AdminSidebar.tsx` | Left side ka menu |
| `AdminDashboard.tsx` | Panel ka dhancha (sidebar + content) |
| `panels.tsx` | Overview, Enquiries, Subscribers, Media Library, Settings |
| `ResourceManager.tsx` | Properties, projects, blog waghera ki list aur form |
| `resource-config.ts` | Har form me kaunse fields hain |
| `admin-ui.tsx` | Admin ke buttons, modal, image picker |
| `seo/` | SEO console: pages, listings, articles, SEO managers |

## Components (`frontend/src/components/`)

| File | Kya hai |
|---|---|
| `site-shell.tsx` | Top bar (location, phone, Contact), navbar, footer, logo, WhatsApp button |
| `blocks.tsx` | Property card, project card, blog card, page ka header (hero), contact form, FAQ |
| `property-search.tsx` | Buy / Rent / Off-Plan wala search bar |
| `phone-input.tsx` | Country code wala phone field |
| `select-field.tsx` | Dropdown |
| `error-boundary.tsx` | Page me error aaye to saaf message |
| `ui/` | Toast aur tooltip |

## Lib (`frontend/src/lib/`)

| File | Kya hai |
|---|---|
| `contact-info.ts` | Phone, WhatsApp, email, address (jab admin Settings khaali ho) |
| `site-settings.tsx` | Admin Settings se site ka naam, phone waghera laata hai |
| `site-data.ts` | Services, areas, FAQ aur woh data jo API band hone par dikhta hai |
| `page-meta.ts` | Har static page ka title, description aur share image |
| `seo.ts`, `seo-head.ts` | Title, description, og:image banane ke rules |
| `brand.ts` | Logo aur favicon ke Cloudinary links |
| `cloudinary-image.ts` | Cloudinary se sahi size ki photo mangna |
| `api.ts` | Website ke API calls aur data ke types |
| `admin-api.ts` | Admin panel ke API calls, upload folders |
| `property-search.ts` | Search aur filter ka logic |
| `utils.ts` | Chhota helper |

## Backend

| Folder / file | Kya hai |
|---|---|
| `src/routes/content.ts` | Website ka data: properties, projects, blog, developers, communities |
| `src/routes/leads.ts` | Enquiry form aur newsletter |
| `src/routes/auth.ts` | Login |
| `src/routes/admin.ts` | Admin panel ke saare kaam, image upload |
| `src/routes/seo.ts` | SEO console, sitemap.xml |
| `src/routes/health.ts` | Server chal raha hai ya nahi |
| `src/lib/schema.sql` | Database ki tables |
| `src/lib/postgres.ts`, `repositories.ts`, `models.ts` | Database se baat karna |
| `src/lib/bootstrap.ts` | Server start par tables aur admin account pakka karta hai |
| `src/lib/cloudinary.ts`, `media.ts` | Photo upload aur Media Library |
| `src/lib/mailer.ts` | Enquiry ka email |
| `src/lib/auth.ts`, `settings.ts`, `seo.ts`, `logger.ts` | Login, settings, SEO, logs |
| `src/lib/rate-limit.ts` | Login aur forms par limit (password guessing aur spam rokne ke liye) |

### Scripts (`backend/scripts/`)

| File | Kaam |
|---|---|
| `migrate-images-to-cloudinary.mjs` | Nayi photos Cloudinary par daalna |
| `cloudinary-images.json` | Cloudinary ki har photo ki list |
| `apply-schema.mjs` | Database ki tables banana (dobara chalane par kuch nahi bigadta) |
| `test-api.mjs` | Saare API check karna |
| `test-email.mjs` | `.env` ki mail settings se ek test email bhejna (`npm run test:email`) |

## Aam badlav kahan karein

| Kya badalna hai | Kahan |
|---|---|
| Phone, WhatsApp, email, address | Admin panel > Settings |
| Property, project, blog, developer | Admin panel |
| Page ka SEO title, description, share image | Admin panel > SEO |
| Kisi page ka text | Us page ki file (upar table) |
| Navbar ya footer | `frontend/src/components/site-shell.tsx` |
| Top bar ki teen lines (Exclusive Properties…) | `frontend/src/components/site-shell.tsx` me `TOP_BAR_PROMISES` |
| Colours, fonts | `frontend/src/index.css` |
| Logo, favicon | `frontend/src/lib/brand.ts` (file Cloudinary par `knc-horizon/logos` me) |
| Naya page ka URL | `frontend/src/App.tsx` |

## Local par chalana

```
cd frontend
npm install
npm run dev
```

```
cd backend
npm install
npm run dev
```

Backend ko `backend/.env` chahiye (`DATABASE_URL`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `CLOUDINARY_*`). Yeh file git me nahi jaati.

**Dhyan:** backend start hote hi live database se judta hai, tables check karta hai aur admin password dobara set karta hai.

## Check aur deploy

```
cd frontend
npm run typecheck
npm run build
```

- **Frontend:** GitHub par push karte hi Vercel deploy kar deta hai. Push ke baad Vercel dashboard me dekh lein ki deploy "Ready" hua, "Error" nahi.
- **Backend:** Render push par apne aap deploy nahi karta. Render dashboard me "Manual Deploy" dabana hota hai.
- **Middleware:** Vercel is project me TypeScript middleware compile nahi kar pata, isliye `middleware.js` plain JavaScript me banti hai. `src/middleware/share-preview.ts` badalne ke baad `npm run build` chalayein aur dono files commit karein.

## Enquiry ka email

Enquiry hamesha Admin panel > Leads / Inquiries me save hoti hai, email jaye ya na jaye. Email alert tabhi aata hai jab teeno cheezein hon:

1. Admin panel > Settings me "Send lead alerts to" bhara ho (abhi `hello@knchorizonrealtor.com` hai).
2. Render > Environment me yeh paanch values hon, phir Manual Deploy:

   | Naam | Value |
   |---|---|
   | `SMTP_HOST` | `smtpout.secureserver.net` |
   | `SMTP_PORT` | `465` |
   | `SMTP_USER` | `hello@knchorizonrealtor.com` |
   | `SMTP_PASS` | us mailbox ka apna password |
   | `SMTP_FROM` | `KNC Horizon Realtor <hello@knchorizonrealtor.com>` |

3. Render ka instance **paid** ho. Free instance par Render mail ke ports (25, 465, 587) band rakhta hai.

Check karne ke do tarike:

- Live par: Admin panel > Settings > **Send a test email**. Na jaye to wahi wajah bhi likhi aati hai.
- Apne computer par: `backend/.env` me `SMTP_PASS` bharein, phir `cd backend` aur `npm run test:email`.
