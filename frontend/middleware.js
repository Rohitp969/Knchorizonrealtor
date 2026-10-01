/*
 * GENERATED FILE. Do not edit it: edit src/middleware/share-preview.ts and run
 * "npm run build" (or "node scripts/build-middleware.mjs"), then commit both files.
 *
 * Vercel Routing Middleware: writes each page's title, description and share image into the
 * HTML, for WhatsApp, Facebook and the other readers that do not run the app.
 */
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/@vercel/functions/middleware.js
var require_middleware = __commonJS({
  "node_modules/@vercel/functions/middleware.js"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc2(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var middleware_exports = {};
    __export(middleware_exports, {
      next: () => next2,
      rewrite: () => rewrite
    });
    module.exports = __toCommonJS(middleware_exports);
    function handleMiddlewareField(init, headers) {
      if (init?.request?.headers) {
        if (!(init.request.headers instanceof Headers)) {
          throw new Error("request.headers must be an instance of Headers");
        }
        const keys = [];
        for (const [key, value] of init.request.headers) {
          headers.set("x-middleware-request-" + key, value);
          keys.push(key);
        }
        headers.set("x-middleware-override-headers", keys.join(","));
      }
    }
    function rewrite(destination, init) {
      const headers = new Headers(init?.headers ?? {});
      headers.set("x-middleware-rewrite", String(destination));
      handleMiddlewareField(init, headers);
      return new Response(null, {
        ...init,
        headers
      });
    }
    function next2(init) {
      const headers = new Headers(init?.headers ?? {});
      headers.set("x-middleware-next", "1");
      handleMiddlewareField(init, headers);
      return new Response(null, {
        ...init,
        headers
      });
    }
  }
});

// src/middleware/share-preview.ts
var import_middleware = __toESM(require_middleware(), 1);

// src/lib/page-meta.ts
var PAGE_META = {
  "/": [
    "Dubai Property Advisory",
    "KNC Horizon Realtor connects clients with exceptional Dubai property, investment, design, and interiors services."
  ],
  "/properties": [
    "Properties",
    "Explore selected homes and investment opportunities across Dubai with KNC Horizon Realtor."
  ],
  "/projects": [
    "Projects",
    "Explore considered off-plan and new development opportunities across Dubai."
  ],
  "/blog": [
    "Blog",
    "Real-estate guidance, neighbourhood notes, and property perspective from KNC Horizon Realtor."
  ],
  "/gallery": [
    "Portfolio",
    "Explore the KNC Horizon visual archive of Dubai homes, interiors, and communities."
  ],
  "/areas": [
    "Dubai Areas",
    "Find the Dubai neighbourhood that fits the way you want to live."
  ],
  "/communities": [
    "Dubai Communities",
    "Explore premier Dubai neighbourhoods, waterfront communities, and master developments."
  ],
  "/about": [
    "About",
    "Meet KNC Horizon Realtor, an independent Dubai property advisory built around context, candour, and care."
  ],
  "/about/approach": [
    "Our Approach",
    "Learn about KNC Horizon Realtor\u2019s disciplined advisory framework, due diligence, and client care."
  ],
  "/about/india-office": [
    "India Office \xB7 DLF Phase 1 Gurugram",
    "Connecting Indian HNIs and NRI investors to prime Dubai real estate through our Gurugram advisory desk."
  ],
  "/market-insights": [
    "Dubai Market Insights",
    "Essential market fundamentals, freehold regulations, rental yields, and investment intelligence."
  ],
  "/properties/sale": [
    "Properties for Sale",
    "Curated freehold homes, luxury villas, and prime penthouses for sale across Dubai."
  ],
  "/properties/rent": [
    "Properties for Rent",
    "Exceptional luxury residences and prime commercial properties available for lease in Dubai."
  ],
  "/properties/residential": [
    "Residential Properties",
    "Explore residential real estate opportunities in Dubai."
  ],
  "/properties/commercial": [
    "Commercial Properties",
    "Explore commercial real estate opportunities in Dubai."
  ],
  "/properties/investment": [
    "Investment Opportunities",
    "Explore investment real estate opportunities in Dubai."
  ],
  "/developers": [
    "Dubai Developers",
    "Explore established developers shaping residential, investment and mixed-use communities across Dubai."
  ],
  "/off-plan": [
    "Off-Plan Developments",
    "Explore premier off-plan developments and payment plans from Dubai\u2019s top master developers."
  ],
  "/off-plan/new-launches": [
    "New Launches",
    "The newest property launches from leading Dubai developers including Emaar, Sobha, and Meraas."
  ],
  "/off-plan/apartments": [
    "Off-Plan Apartments",
    "Prime waterfront and skyline off-plan apartments across Dubai\u2019s highest-performing corridors."
  ],
  "/off-plan/villas-townhouses": [
    "Off-Plan Villas & Townhouses",
    "Master-planned off-plan villas and family townhouses in Dubai\u2019s premier gated communities."
  ],
  "/off-plan/developers": [
    "Top Dubai Developers",
    "Explore verified developments by Emaar, Sobha, Omniyat, Nakheel, Meraas, and Ellington."
  ],
  "/services": [
    "Services",
    "Property advisory, design, interiors, and relocation support from KNC Horizon Realtor in Dubai."
  ],
  "/design-build": [
    "Design & Build",
    "KNC Horizon Design & Build brings together concept, build coordination, and considered delivery for Dubai homes."
  ],
  "/interiors": [
    "Interiors & Furniture",
    "Interior design, bespoke furniture, and styling for Dubai homes from KNC Horizon Realtor."
  ],
  "/contact": [
    "Contact",
    "Start a conversation with KNC Horizon Realtor about your next Dubai property move."
  ],
  /*
   * ========================================================
   * TERMS & CONDITIONS
   * ========================================================
   */
  "/terms": [
    "Terms & Conditions",
    "General terms and conditions for using the KNC Horizon Realtor website."
  ],
  "/terms-and-conditions": [
    "Terms & Conditions",
    "General terms and conditions for using the KNC Horizon Realtor website."
  ],
  /*
   * ========================================================
   * PRIVACY POLICY
   * ========================================================
   */
  "/privacy": [
    "Privacy Policy",
    "Privacy information explaining how KNC Horizon Realtor may collect, use and protect website enquiry information."
  ],
  "/privacy-policy": [
    "Privacy Policy",
    "Privacy information explaining how KNC Horizon Realtor may collect, use and protect website enquiry information."
  ]
};
var PAGE_IMAGES = {
  "/": ["https://res.cloudinary.com/complaintreview/image/upload/v1790577272/knc-horizon/hero/hero-dubai-sunset.jpg", "The Dubai skyline at sunset"],
  "/properties": ["https://res.cloudinary.com/complaintreview/image/upload/v1790577268/knc-horizon/hero/downtown-safa-park.jpg", "Downtown Dubai and Business Bay seen across the water from Safa Park"],
  "/properties/sale": ["https://res.cloudinary.com/complaintreview/image/upload/v1790577267/knc-horizon/hero/burj-khalifa-aerial.jpg", "The Burj Khalifa above the Downtown Dubai skyline in daylight"],
  "/properties/rent": ["https://res.cloudinary.com/complaintreview/image/upload/v1790577273/knc-horizon/hero/jbr-residences-street.jpg", "Jumeirah Beach Residence towers beside Dubai Marina residential high-rises"],
  "/properties/residential": ["https://res.cloudinary.com/complaintreview/image/upload/v1790577275/knc-horizon/hero/the-greens-residential.jpg", "Low-rise apartments, a palm-lined avenue and residential towers in The Greens, Dubai"],
  "/properties/commercial": ["https://res.cloudinary.com/complaintreview/image/upload/v1790577268/knc-horizon/hero/difc-green-towers.jpg", "Office towers on Sheikh Zayed Road near the Dubai World Trade Centre"],
  "/properties/investment": ["https://res.cloudinary.com/complaintreview/image/upload/v1790577268/knc-horizon/hero/business-bay-skyline-day.jpg", "Business Bay towers beside the water with the Burj Khalifa rising behind"],
  "/off-plan": ["https://res.cloudinary.com/complaintreview/image/upload/v1790577271/knc-horizon/hero/dubai-new-towers-aerial.jpg", "Aerial view of new towers rising around Business Bay, Dubai"],
  "/projects": ["https://res.cloudinary.com/complaintreview/image/upload/v1790577271/knc-horizon/hero/dubai-new-towers-aerial.jpg", "Aerial view of new towers rising around Business Bay, Dubai"],
  "/off-plan/new-launches": ["https://res.cloudinary.com/complaintreview/image/upload/v1790577271/knc-horizon/hero/dubai-waterfront-tower-construction.jpg", "Residential tower under construction beside finished glass towers on a Dubai waterfront"],
  "/off-plan/apartments": ["https://res.cloudinary.com/complaintreview/image/upload/v1790577269/knc-horizon/hero/dubai-apartment-towers-sunset.jpg", "Modern residential apartment towers over a Dubai neighbourhood at sunset"],
  "/off-plan/villas-townhouses": ["https://res.cloudinary.com/complaintreview/image/upload/v1790577268/knc-horizon/hero/daria-island-seafront-villa.jpg", "Aerial view of a seafront villa garden and pool in Dubai"],
  "/off-plan/developers": ["https://res.cloudinary.com/complaintreview/image/upload/v1790577269/knc-horizon/hero/downtown-skyline-cranes.jpg", "Downtown Dubai skyline over Burj Lake with tower cranes on new residential towers"],
  "/developers": ["https://res.cloudinary.com/complaintreview/image/upload/v1790577269/knc-horizon/hero/downtown-skyline-cranes.jpg", "Downtown Dubai skyline over Burj Lake with tower cranes on new residential towers"],
  "/communities": ["https://res.cloudinary.com/complaintreview/image/upload/v1790577274/knc-horizon/hero/marina-resort-greens.jpg", "The Dubai Marina yacht club and the Palm Jumeirah shoreline, with the Burj Al Arab in the distance"],
  "/areas": ["https://res.cloudinary.com/complaintreview/image/upload/v1790577274/knc-horizon/hero/marina-resort-greens.jpg", "The Dubai Marina yacht club and the Palm Jumeirah shoreline, with the Burj Al Arab in the distance"],
  "/about": ["https://res.cloudinary.com/complaintreview/image/upload/v1790577270/knc-horizon/hero/dubai-skyline-creek-sunset.jpg", "The Dubai skyline silhouetted at sunset across Dubai Creek"],
  "/about/approach": ["https://res.cloudinary.com/complaintreview/image/upload/v1790577267/knc-horizon/hero/al-fahidi-wind-towers.jpg", "Traditional houses with wind towers around a courtyard in Al Bastakiya, old Dubai"],
  "/about/india-office": ["https://res.cloudinary.com/complaintreview/image/upload/v1790577272/knc-horizon/hero/gurugram-skyline.jpg", "Gurugram skyline of residential and office high-rises"],
  "/market-insights": ["https://res.cloudinary.com/complaintreview/image/upload/v1790577274/knc-horizon/hero/sheikh-zayed-road-aerial.jpg", "Aerial view of Sheikh Zayed Road interchanges and high-rise towers in Dubai"],
  "/services": ["https://res.cloudinary.com/complaintreview/image/upload/v1790577271/knc-horizon/hero/dubai-skyline-golf-course.jpg", "Dubai skyline with the Burj Khalifa seen across water and green lawns"],
  "/design-build": ["https://res.cloudinary.com/complaintreview/image/upload/v1790577270/knc-horizon/hero/dubai-hills-construction.jpg", "Residential blocks under construction with tower cranes in Dubai Hills"],
  "/interiors": ["https://res.cloudinary.com/complaintreview/image/upload/v1790577269/knc-horizon/hero/dubai-apartment-living-room.jpg", "Furnished Dubai apartment living room with cream sofa and green armchairs"],
  "/blog": ["https://res.cloudinary.com/complaintreview/image/upload/v1790577269/knc-horizon/hero/dubai-creek-dusk.jpg", "Dubai Creek at dusk with the Deira waterfront and abras"],
  "/gallery": ["https://res.cloudinary.com/complaintreview/image/upload/v1790577274/knc-horizon/hero/madinat-jumeirah-canal.jpg", "A canal at Souk Madinat Jumeirah with the Burj Al Arab beyond the palms"],
  "/contact": ["https://res.cloudinary.com/complaintreview/image/upload/v1790577273/knc-horizon/hero/jlt-towers-sheikh-zayed-road.jpg", "Jumeirah Lake Towers office towers beside Sheikh Zayed Road"],
  "/terms": ["https://res.cloudinary.com/complaintreview/image/upload/v1790577272/knc-horizon/hero/fountain-pen-writing.jpg", "A fountain pen writing in ink on lined paper"],
  "/terms-and-conditions": ["https://res.cloudinary.com/complaintreview/image/upload/v1790577272/knc-horizon/hero/fountain-pen-writing.jpg", "A fountain pen writing in ink on lined paper"],
  "/privacy": ["https://res.cloudinary.com/complaintreview/image/upload/v1790577275/knc-horizon/hero/signing-documents.jpg", "A hand signing a paper document with a pen"],
  "/privacy-policy": ["https://res.cloudinary.com/complaintreview/image/upload/v1790577275/knc-horizon/hero/signing-documents.jpg", "A hand signing a paper document with a pen"]
};

// src/lib/seo-head.ts
var SITE_URL = "https://www.knchorizonrealtor.com";
var DEFAULT_OG_IMAGE = "https://res.cloudinary.com/complaintreview/image/upload/v1790577261/knc-horizon/communities/hero-dubai-skyline.jpg";
var PATH_ALIASES = {
  "/projects": "/off-plan",
  "/journal": "/blog",
  "/areas": "/communities",
  "/terms": "/terms-and-conditions",
  "/privacy": "/privacy-policy",
  "/properties/live": "/properties"
};
function canonicalPath(path) {
  const clean = (path.split(/[?#]/)[0] || "/").replace(/\/+$/, "") || "/";
  if (PATH_ALIASES[clean]) return PATH_ALIASES[clean];
  if (clean.startsWith("/journal/")) return clean.replace("/journal/", "/blog/");
  return clean;
}
var absoluteUrl = (value, siteUrl) => /^https?:\/\//i.test(value) ? value : `${siteUrl}${value.startsWith("/") ? "" : "/"}${value}`;
var filled = (value) => value && value.trim() ? value.trim() : void 0;
function resolveHead(input, ctx) {
  const seo = input.seo ?? {};
  const title = filled(seo.seoTitle) ?? (input.title ? `${input.title} | ${ctx.siteName}` : ctx.siteName);
  const description = filled(seo.metaDescription) ?? filled(input.description) ?? ctx.fallbackDescription;
  const path = canonicalPath(input.path);
  const canonical = filled(seo.canonicalUrl) ?? `${ctx.siteUrl}${path}`;
  const defaultImage = filled(ctx.defaultOgImage) ?? DEFAULT_OG_IMAGE;
  const image = filled(seo.ogImage) ?? filled(input.image) ?? defaultImage;
  const imageAlt = filled(seo.imageAlt) ?? filled(input.imageAlt) ?? (image === defaultImage ? filled(ctx.defaultOgImageAlt) : void 0) ?? "";
  return {
    title,
    description,
    canonical,
    robots: input.noindex || seo.noindex ? "noindex, follow" : "index, follow",
    ogTitle: filled(seo.ogTitle) ?? title,
    ogDescription: filled(seo.ogDescription) ?? description,
    ogImage: absoluteUrl(image, ctx.siteUrl),
    ogImageAlt: imageAlt,
    ogType: input.type ?? "website",
    jsonLd: input.jsonLd ?? []
  };
}
var propertyDescription = (title, location) => `${title} in ${location}. View details and request property information from KNC Horizon Realtor.`;
var projectDescription = (title, location) => `${title} in ${location}. Explore the project and request its brief from KNC Horizon Realtor.`;

// src/lib/site-data.ts
var areas = [
  { id: "downtown-dubai", name: "Downtown Dubai", descriptor: "The city at its centre", image: "https://res.cloudinary.com/complaintreview/image/upload/v1790577260/knc-horizon/communities/dubai-fountain-downtown.jpg", detail: "Iconic views, cultural energy, and a walkable rhythm for people who want to be close to everything." },
  { id: "dubai-marina", name: "Dubai Marina", descriptor: "The city by water", image: "https://res.cloudinary.com/complaintreview/image/upload/v1790577260/knc-horizon/communities/dubai-marina-canal-day.jpg", detail: "A vertical neighbourhood of considered residences, restaurants, and open horizons." },
  { id: "palm-jumeirah", name: "Palm Jumeirah", descriptor: "Island life, redefined", image: "https://res.cloudinary.com/complaintreview/image/upload/v1790577261/knc-horizon/communities/palm-jumeirah-aerial.jpg", detail: "Waterfront villas, private beaches, and a slower rhythm at the edge of the city." },
  { id: "business-bay", name: "Business Bay", descriptor: "A vertical pulse", image: "https://res.cloudinary.com/complaintreview/image/upload/v1790577261/knc-horizon/communities/hero-dubai-skyline.jpg", detail: "A central address where ambitious towers, water, and the city\u2019s working rhythm meet." },
  { id: "jumeirah", name: "Jumeirah", descriptor: "An established ease", image: "https://res.cloudinary.com/complaintreview/image/upload/v1790577261/knc-horizon/communities/jumeirah-coast-burj-al-arab.jpg", detail: "Leafy streets, beach access, and a more residential pace in one of Dubai\u2019s enduring communities." },
  { id: "arabian-ranches", name: "Arabian Ranches", descriptor: "Space to settle", image: "https://res.cloudinary.com/complaintreview/image/upload/v1790577260/knc-horizon/communities/dubai-villa-community-aerial.jpg", detail: "Landscaped streets, generous homes, and a grounded sense of community away from the rush." }
];
var defaultRemoteProperties = [
  {
    id: "bluewaters-residences-rent",
    slug: "bluewaters-residences-rent",
    title: "Apartments for Rent at Bluewaters Residences",
    location: "Bluewaters Residences, Bluewaters Island",
    community: "Bluewaters",
    type: "Apartment",
    listingType: "rent",
    status: "For rent",
    price: 277e3,
    priceFrom: true,
    currency: "AED",
    bedrooms: 1,
    bedroomsMax: 4,
    bathrooms: 0,
    size: 0,
    description: "Furnished one to four-bedroom apartments for rent at Bluewaters Residences, the mid-rise towers on Bluewaters Island beside Ain Dubai, leased by Dubai Residential. Its lowest listed unit when checked was a one-bedroom of 808 sq ft at AED 277,000 a year; homes range from 807 to 2,337 sq ft.",
    images: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790859301/knc-horizon/properties/residential/rental-marina-towers-from-above.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790859298/knc-horizon/properties/residential/rental-living-room-beige-sofa.jpg"
    ],
    coverImageAlt: "Dubai Marina's residential towers seen from above, with the sea and Palm Jumeirah beyond",
    coverImageRepresentative: true,
    coverImageCredit: "Kate Trysh / Pexels",
    amenities: [
      "24-hour concierge and security",
      "One or two parking spaces",
      "Floor-to-ceiling windows",
      "Furnished units"
    ],
    developer: "Dubai Residential",
    sourceUrl: "https://dubairesidential.ae/en/our-communities/bluewaters",
    sourceName: "dubairesidential.ae",
    verifiedOn: "2026-10-01",
    featured: true,
    published: true,
    galleryImages: [
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790859298/knc-horizon/properties/residential/rental-living-room-beige-sofa.jpg",
        alt: "Living room with a beige sofa, a glass coffee table and towers outside the window",
        representative: true,
        credit: "AJ Ahamad / Pexels"
      }
    ]
  },
  {
    id: "garden-view-villas-rent",
    slug: "garden-view-villas-rent",
    title: "Townhouses and Villas for Rent at Garden View Villas",
    location: "Garden View Villas",
    community: "Garden View Villas",
    type: "Villa",
    listingType: "rent",
    status: "For rent",
    price: 2e5,
    priceFrom: true,
    currency: "AED",
    bedrooms: 3,
    bedroomsMax: 4,
    bathrooms: 0,
    size: 0,
    description: "Three-bedroom townhouses and three to four-bedroom villas for rent at Garden View Villas, a hillside community leased by Dubai Residential; some villas have private pools. Rent starts at AED 200,000 a year; homes range from 2,427 to 4,330 sq ft.",
    images: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790844468/knc-horizon/properties/residential/dubai-villa-street-palms.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790844468/knc-horizon/properties/residential/dubai-mediterranean-style-villa.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790590829/knc-horizon/properties/dubai-townhouse-garden-swing-lawn.jpg"
    ],
    coverImageAlt: "Palm-lined street of Mediterranean-style villas in an upscale Dubai neighbourhood",
    coverImageRepresentative: true,
    coverImageCredit: "Haroon Zafar / Pexels",
    amenities: ["Swimming pool", "Sports facilities", "Dog park", "Community centre", "Maid's room"],
    developer: "Dubai Residential",
    sourceUrl: "https://dubairesidential.ae/en/our-communities/garden-view-villas",
    sourceName: "dubairesidential.ae",
    verifiedOn: "2026-10-01",
    featured: true,
    published: true,
    galleryImages: [
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790844468/knc-horizon/properties/residential/dubai-mediterranean-style-villa.jpg",
        alt: "Mediterranean-style villa with terracotta details under a clear sky in Dubai",
        representative: true,
        credit: "aboodi vesakaran / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790590829/knc-horizon/properties/dubai-townhouse-garden-swing-lawn.jpg",
        alt: "Private townhouse garden with a wooden swing on the lawn, a palm and bougainvillea by the gate",
        representative: true,
        credit: "AJ Ahamad / Pexels"
      }
    ]
  },
  {
    id: "damac-islands-5-bedroom-villa",
    slug: "damac-islands-5-bedroom-villa",
    title: "5-Bedroom Villa at DAMAC Islands",
    location: "DAMAC Islands, Dubailand",
    community: "Dubailand",
    type: "Villa",
    listingType: "sale",
    status: "Off-plan",
    price: 393e4,
    priceFrom: true,
    currency: "AED",
    bedrooms: 5,
    bathrooms: 0,
    size: 0,
    description: "A five-bedroom home in DAMAC Islands, the lagoon community in Dubailand. DAMAC's own listing shows five-bedroom villas from AED 3,930,000.",
    images: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790589063/knc-horizon/properties/dubai-villa-lap-pool-deck.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790589063/knc-horizon/properties/dubai-villa-pool-terrace-lounge.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790589848/knc-horizon/properties/dubai-villa-master-bedroom-suite.jpg"
    ],
    coverImageAlt: "Modern two-storey Dubai villa with a long lap pool, timber deck and palm trees",
    coverImageRepresentative: true,
    coverImageCredit: "Abid Ali / Pexels",
    projectSlug: "damac-islands",
    developer: "DAMAC",
    sourceUrl: "https://www.damacproperties.com/en/communities/damac-islands-community/",
    sourceName: "damacproperties.com",
    verifiedOn: "2026-10-01",
    featured: true,
    published: true,
    galleryImages: [
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790589063/knc-horizon/properties/dubai-villa-pool-terrace-lounge.jpg",
        alt: "Villa pool seen from the garden, with a hanging chair, covered terrace lounge and mature trees",
        representative: true,
        credit: "Abid Ali / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790589848/knc-horizon/properties/dubai-villa-master-bedroom-suite.jpg",
        alt: "Master bedroom with floor-to-ceiling curtained glazing, floating shelves and a green throw on the bed",
        representative: true,
        credit: "S3T Koncepts / Pexels"
      }
    ],
    amenities: []
  },
  {
    id: "bayview-by-address-resorts-emaar-beachfront",
    slug: "bayview-by-address-resorts-emaar-beachfront",
    title: "Bayview by Address Resorts at Emaar Beachfront",
    location: "Emaar Beachfront, Dubai Harbour",
    community: "Dubai Harbour",
    type: "Apartment",
    listingType: "sale",
    status: "Off-plan",
    price: 3594888,
    priceFrom: true,
    currency: "AED",
    bedrooms: 1,
    bedroomsMax: 4,
    bathrooms: 0,
    size: 0,
    description: "One to four-bedroom apartments in Bayview by Address Resorts, a tower at Emaar Beachfront. It carries the lowest 'from' price Emaar currently publishes for the island: AED 3,594,888.",
    images: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790577286/knc-horizon/properties/dubai-marina-dusk.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790581635/knc-horizon/properties/dubai-marina-canal-window-view.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790590510/knc-horizon/properties/dubai-marina-apartment-bathroom-vanity.jpg"
    ],
    coverImageAlt: "Dubai Marina towers and the marina canal at dusk",
    coverImageRepresentative: true,
    coverImageCredit: "Maaroo24 / Wikimedia Commons",
    projectSlug: "emaar-beachfront",
    developer: "Emaar",
    sourceUrl: "https://www.emaar.com/en/our-communities/emaar-beachfront",
    sourceName: "emaar.com",
    verifiedOn: "2026-10-01",
    featured: true,
    published: true,
    galleryImages: [
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790581635/knc-horizon/properties/dubai-marina-canal-window-view.jpg",
        alt: "The Dubai Marina canal, a bridge and yachts at golden hour, seen through a high-floor window",
        representative: true,
        credit: "AJ Ahamad / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790590510/knc-horizon/properties/dubai-marina-apartment-bathroom-vanity.jpg",
        alt: "Bathroom vanity with a granite counter, rolled towels and an orchid",
        representative: true,
        credit: "AJ Ahamad / Pexels"
      }
    ],
    amenities: []
  },
  {
    id: "silva-dubai-creek-harbour",
    slug: "silva-dubai-creek-harbour",
    title: "Silva at Dubai Creek Harbour",
    location: "Dubai Creek Harbour",
    community: "Dubai Creek Harbour",
    type: "Apartment",
    listingType: "sale",
    status: "For sale",
    price: 1790888,
    priceFrom: true,
    currency: "AED",
    bedrooms: 1,
    bedroomsMax: 3,
    bathrooms: 0,
    size: 0,
    description: "One to three-bedroom apartments in Silva, an Emaar building at Dubai Creek Harbour. It carries the lowest 'from' price Emaar currently publishes for the district: AED 1,790,888.",
    images: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790590507/knc-horizon/properties/dubai-creek-harbour-marina-from-above.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790590508/knc-horizon/properties/dubai-creek-sunset-skyline.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790590507/knc-horizon/properties/dubai-apartment-living-room-sofa.jpg"
    ],
    coverImageAlt: "Dubai Creek Harbour marina and its pontoons seen from a high floor",
    coverImageRepresentative: true,
    coverImageCredit: "AJ Ahamad / Pexels",
    projectSlug: "dubai-creek-harbour",
    developer: "Emaar",
    sourceUrl: "https://www.emaar.com/en/our-communities/dubai-creek-harbour",
    sourceName: "emaar.com",
    verifiedOn: "2026-10-01",
    featured: true,
    published: true,
    galleryImages: [
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790590508/knc-horizon/properties/dubai-creek-sunset-skyline.jpg",
        alt: "Sunset over Dubai Creek with the Burj Khalifa and Downtown skyline in silhouette",
        representative: true,
        credit: "AJ Ahamad / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790590507/knc-horizon/properties/dubai-apartment-living-room-sofa.jpg",
        alt: "Living room with a grey sofa and wooden coffee table between full-height windows",
        representative: true,
        credit: "AJ Ahamad / Pexels"
      }
    ],
    amenities: []
  },
  {
    id: "binghatti-skyrise-1-bedroom",
    slug: "binghatti-skyrise-1-bedroom",
    title: "1-Bedroom Apartment at Binghatti Skyrise",
    location: "Binghatti Skyrise, Business Bay",
    community: "Business Bay",
    type: "Apartment",
    listingType: "sale",
    status: "Off-plan",
    price: 2544999,
    priceFrom: true,
    currency: "AED",
    bedrooms: 1,
    bathrooms: 0,
    size: 831,
    description: "The one-bedroom apartment Binghatti currently lists as available at Binghatti Skyrise in Business Bay: 831 sq ft, starting at AED 2,544,999. The tower's delivery is set for Q4 2026.",
    images: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790590501/knc-horizon/properties/business-bay-apartment-canal-view-lounge.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790590501/knc-horizon/properties/business-bay-apartment-dining-room.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790590503/knc-horizon/properties/business-bay-residence-pool-deck.jpg"
    ],
    coverImageAlt: "Two armchairs at floor-to-ceiling windows looking over the Business Bay canal and towers",
    coverImageRepresentative: true,
    coverImageCredit: "KAILAS PRASAD / Pexels",
    projectSlug: "binghatti-skyrise",
    developer: "Binghatti",
    sourceUrl: "https://www.binghatti.com/en/projects/binghatti-skyrise",
    sourceName: "binghatti.com",
    verifiedOn: "2026-10-01",
    featured: true,
    published: true,
    galleryImages: [
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790590501/knc-horizon/properties/business-bay-apartment-dining-room.jpg",
        alt: "Dining table under pendant lights with the lounge and terrace beyond, canal view through the glazing",
        representative: true,
        credit: "KAILAS PRASAD / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790590503/knc-horizon/properties/business-bay-residence-pool-deck.jpg",
        alt: "Residents pool deck with timber loungers and Business Bay towers behind",
        representative: true,
        credit: "Waqas ilyas / Pexels"
      }
    ],
    amenities: []
  },
  {
    id: "dubai-wharf-rent",
    slug: "dubai-wharf-rent",
    title: "Apartments for Rent at Dubai Wharf",
    location: "Dubai Wharf, Al Jaddaf Waterfront",
    community: "Al Jaddaf",
    type: "Apartment",
    listingType: "rent",
    status: "For rent",
    price: 49200,
    priceFrom: true,
    currency: "AED",
    bedrooms: 0,
    bedroomsMax: 3,
    bathrooms: 0,
    size: 0,
    description: "Studio to three-bedroom apartments for rent at Dubai Wharf on the Al Jaddaf Waterfront, leased by Dubai Residential. Rent starts at AED 49,200 a year; homes range from 533 to 4,001 sq ft, some overlooking the creek.",
    images: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790577281/knc-horizon/projects/jaddaf-waterfront.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790844465/knc-horizon/projects/avenue-al-jaddaf/avenue-al-jaddaf-creek-towers-boats.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790844465/knc-horizon/projects/avenue-al-jaddaf/avenue-al-jaddaf-creek-sunset.jpg"
    ],
    coverImageAlt: "Jaddaf Waterfront promenade and Dubai Creek seen from a waterfront building in Al Jaddaf, Dubai",
    coverImageRepresentative: true,
    coverImageCredit: "Riyas Mohammed / Unsplash",
    amenities: ["Gym", "Swimming pool", "Skate park", "Kids' play areas", "Fitted with white goods"],
    developer: "Dubai Residential",
    sourceUrl: "https://dubairesidential.ae/en/our-communities/dubai-wharf",
    sourceName: "dubairesidential.ae",
    verifiedOn: "2026-10-01",
    featured: false,
    published: true,
    galleryImages: [
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790844465/knc-horizon/projects/avenue-al-jaddaf/avenue-al-jaddaf-creek-towers-boats.jpg",
        alt: "Modern towers above traditional boats on Dubai Creek",
        representative: true,
        credit: "Walid Ahmad / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790844465/knc-horizon/projects/avenue-al-jaddaf/avenue-al-jaddaf-creek-sunset.jpg",
        alt: "Dubai Creek at sunset with boats and the city skyline",
        representative: true,
        credit: "Walid Ahmad / Pexels"
      }
    ]
  },
  {
    id: "remraam-rent",
    slug: "remraam-rent",
    title: "Apartments for Rent at Remraam",
    location: "Al Ramth Cluster, Remraam",
    community: "Remraam",
    type: "Apartment",
    listingType: "rent",
    status: "For rent",
    price: 36e3,
    priceFrom: true,
    currency: "AED",
    bedrooms: 0,
    bedroomsMax: 3,
    bathrooms: 0,
    size: 0,
    description: "Studios and one to three-bedroom apartments for rent in the 18 buildings Dubai Residential owns and operates in the Al Ramth cluster of Remraam. Rent starts at AED 36,000 a year; homes range from 388 to 2,582 sq ft.",
    images: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790859298/knc-horizon/properties/residential/rental-palm-lined-park-path.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790859297/knc-horizon/properties/residential/rental-mosaic-pool-terrace.jpg"
    ],
    coverImageAlt: "Palm-lined walking path with a blue track through a landscaped park between apartment towers in Dubai",
    coverImageRepresentative: true,
    coverImageCredit: "Lajos Krist\xF3f K\xE1ntor / Pexels",
    amenities: [
      "Swimming pool",
      "Gym",
      "Basketball, tennis and volleyball courts",
      "Supermarket",
      "Nursery",
      "Kids' play areas",
      "BBQ areas"
    ],
    developer: "Dubai Residential",
    sourceUrl: "https://dubairesidential.ae/en/our-communities/remraam",
    sourceName: "dubairesidential.ae",
    verifiedOn: "2026-10-01",
    featured: false,
    published: true,
    galleryImages: [
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790859297/knc-horizon/properties/residential/rental-mosaic-pool-terrace.jpg",
        alt: "Mosaic-tiled pool and whirlpool on a residents' pool terrace in Dubai",
        representative: true,
        credit: "Kate Trysh / Pexels"
      }
    ]
  },
  {
    id: "al-khail-gate-rent",
    slug: "al-khail-gate-rent",
    title: "Apartments for Rent at Al Khail Gate",
    location: "Al Khail Gate",
    community: "Al Khail Gate",
    type: "Apartment",
    listingType: "rent",
    status: "For rent",
    price: 23100,
    priceFrom: true,
    currency: "AED",
    bedrooms: 0,
    bedroomsMax: 3,
    bathrooms: 0,
    size: 0,
    description: "Studios and one to three-bedroom apartments for rent at Al Khail Gate, a self-contained community leased by Dubai Residential, with two retail centres, a mosque and sports courts. Rent starts at AED 23,100 a year.",
    images: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790859301/knc-horizon/properties/residential/rental-geometric-apartment-facade.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790859301/knc-horizon/properties/residential/rental-towers-and-low-rise-district.jpg"
    ],
    coverImageAlt: "Apartment facade with angular white balconies and terracotta accents in Dubai",
    coverImageRepresentative: true,
    coverImageCredit: "SANDRA GOPAN / Pexels",
    amenities: [
      "Community centre",
      "Gym",
      "Basketball, football and tennis courts",
      "Play area",
      "Mosque",
      "Two retail centres"
    ],
    developer: "Dubai Residential",
    sourceUrl: "https://dubairesidential.ae/en/our-communities/al-khail-gate",
    sourceName: "dubairesidential.ae",
    verifiedOn: "2026-10-01",
    featured: false,
    published: true,
    galleryImages: [
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790859301/knc-horizon/properties/residential/rental-towers-and-low-rise-district.jpg",
        alt: "Two glass towers above a wide low-rise residential district in Dubai, seen from a high floor",
        representative: true,
        credit: "Kate Trysh / Pexels"
      }
    ]
  },
  {
    id: "nad-al-sheba-villas-rent",
    slug: "nad-al-sheba-villas-rent",
    title: "Villas for Rent at Nad Al Sheba Villas",
    location: "Nad Al Sheba Villas, Nad Al Sheba",
    community: "Nad Al Sheba",
    type: "Villa",
    listingType: "rent",
    status: "For rent",
    price: 265e3,
    priceFrom: true,
    currency: "AED",
    bedrooms: 4,
    bedroomsMax: 5,
    bathrooms: 0,
    size: 0,
    description: "Four and five-bedroom villas for rent at Nad Al Sheba Villas, a gated community in Mediterranean and Moroccan styles leased by Dubai Residential. Rent starts at AED 265,000 a year; villas range from 3,731 to 4,587 sq ft with private back gardens.",
    images: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790844470/knc-horizon/properties/residential/dubai-mediterranean-homes-row.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790859299/knc-horizon/properties/residential/rental-mediterranean-villas-red-roofs.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790577286/knc-horizon/properties/dubai-mediterranean-villas.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790844470/knc-horizon/properties/residential/dubai-villa-garden-planting.jpg"
    ],
    coverImageAlt: "A row of Mediterranean-style homes under a clear blue sky in Dubai",
    coverImageRepresentative: true,
    coverImageCredit: "Yosef Futsum / Pexels",
    amenities: ["Jogging track", "Gym", "Kids' play areas", "Private back gardens", "Maid's room"],
    developer: "Dubai Residential",
    sourceUrl: "https://dubairesidential.ae/en/our-communities/nad-al-sheba",
    sourceName: "dubairesidential.ae",
    verifiedOn: "2026-10-01",
    featured: false,
    published: true,
    galleryImages: [
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790859299/knc-horizon/properties/residential/rental-mediterranean-villas-red-roofs.jpg",
        alt: "Mediterranean-style villas with red tile roofs among palm trees in Dubai",
        representative: true,
        credit: "Ayrat / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790577286/knc-horizon/properties/dubai-mediterranean-villas.jpg",
        alt: "Mediterranean-style villas with terracotta roofs behind date palms and lawns in Dubai",
        representative: true,
        credit: "Ayrat / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790844470/knc-horizon/properties/residential/dubai-villa-garden-planting.jpg",
        alt: "Tropical planting against a textured wall in a Dubai villa garden",
        representative: true,
        credit: "aboodi vesakaran / Pexels"
      }
    ]
  },
  {
    id: "binghatti-circle-office",
    slug: "binghatti-circle-office",
    title: "Office at Binghatti Circle",
    location: "Binghatti Circle, Jumeirah Village Circle",
    community: "Jumeirah Village Circle",
    type: "Office",
    listingType: "sale",
    status: "Off-plan",
    price: 2685600,
    priceFrom: true,
    currency: "AED",
    bedrooms: 0,
    bathrooms: 0,
    size: 1074,
    description: "The office unit Binghatti currently lists as available at Binghatti Circle in Jumeirah Village Circle: 1,074 sq ft, starting at AED 2,685,600. The tower's completion date is Q2 2027.",
    images: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790577288/knc-horizon/properties/jvc-circle-aerial.jpg"
    ],
    coverImageAlt: "Aerial view at dusk of a landscaped circle and apartment blocks in Jumeirah Village Circle",
    coverImageRepresentative: true,
    coverImageCredit: "Alim / Unsplash",
    projectSlug: "binghatti-circle-jvc",
    developer: "Binghatti",
    sourceUrl: "https://www.binghatti.com/en/projects/binghatti-circle",
    sourceName: "binghatti.com",
    verifiedOn: "2026-10-01",
    featured: false,
    published: true,
    galleryImages: [],
    amenities: []
  },
  {
    id: "city-walk-residences-rent",
    slug: "city-walk-residences-rent",
    title: "Apartments for Rent at City Walk Residences",
    location: "City Walk Residences, City Walk",
    community: "City Walk",
    type: "Apartment",
    listingType: "rent",
    status: "For rent",
    price: 157500,
    priceFrom: true,
    currency: "AED",
    bedrooms: 1,
    bedroomsMax: 4,
    bathrooms: 0,
    size: 0,
    description: "One to four-bedroom apartments for rent in the low-rise buildings of City Walk, leased by Dubai Residential. Rent starts at AED 157,500 a year; homes range from 984 to 4,483 sq ft, with a residents' courtyard, gym and pool.",
    images: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790859298/knc-horizon/properties/residential/rental-rooftop-terrace-apartment-block.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790577284/knc-horizon/properties/downtown-night-aerial.jpg"
    ],
    coverImageAlt: "Rooftop terrace with table-tennis tables beside a mid-rise apartment block in Dubai",
    coverImageRepresentative: true,
    coverImageCredit: "AJ Ahamad / Pexels",
    amenities: ["Gym", "Swimming pool", "Play area", "24/7 concierge", "Dedicated parking"],
    developer: "Dubai Residential",
    sourceUrl: "https://dubairesidential.ae/en/our-communities/citywalk",
    sourceName: "dubairesidential.ae",
    verifiedOn: "2026-10-01",
    featured: false,
    published: true,
    galleryImages: [
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790577284/knc-horizon/properties/downtown-night-aerial.jpg",
        alt: "Downtown Dubai and Sheikh Zayed Road lit up at night, seen from above",
        representative: true,
        credit: "bulletrain743 (via Pixabay) / Wikimedia Commons"
      }
    ]
  },
  {
    id: "wasl-port-views-1-bedroom-rent",
    slug: "wasl-port-views-1-bedroom-rent",
    title: "1-Bedroom Apartment for Rent at wasl port views",
    location: "wasl port views (Building 4), Al Mina",
    community: "Al Mina",
    type: "Apartment",
    listingType: "rent",
    status: "For rent",
    price: 75e3,
    currency: "AED",
    bedrooms: 1,
    bathrooms: 0,
    size: 897,
    description: "A one-bedroom apartment of 897 sq ft in Building 4 of wasl port views, Al Mina, listed for rent by wasl at AED 75,000 a year (unit 407 when checked). wasl leases the building directly.",
    images: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790859300/knc-horizon/properties/residential/rental-harbour-yachts-and-skyline.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790859299/knc-horizon/properties/residential/rental-creek-waterfront-buildings.jpg"
    ],
    coverImageAlt: "Yachts moored in a harbour with the Dubai skyline in the morning haze",
    coverImageRepresentative: true,
    coverImageCredit: "Rockwell branding agency / Pexels",
    developer: "wasl properties",
    sourceUrl: "https://www.wasl.ae/en/search/residential",
    sourceName: "wasl.ae",
    verifiedOn: "2026-10-01",
    featured: false,
    published: true,
    galleryImages: [
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790859299/knc-horizon/properties/residential/rental-creek-waterfront-buildings.jpg",
        alt: "Waterfront buildings and a minaret on Dubai Creek, with a boat moored at the quay",
        representative: true,
        credit: "Kate Trysh / Pexels"
      }
    ],
    amenities: []
  },
  {
    id: "wasl-village-1-bedroom-rent",
    slug: "wasl-village-1-bedroom-rent",
    title: "1-Bedroom Apartment for Rent at wasl village",
    location: "wasl village (Building 15), Al Qusais",
    community: "Al Qusais",
    type: "Apartment",
    listingType: "rent",
    status: "For rent",
    price: 49e3,
    currency: "AED",
    bedrooms: 1,
    bathrooms: 0,
    size: 764,
    description: "A one-bedroom apartment of 764 sq ft in Building 15 of wasl village, Al Qusais, listed for rent by wasl at AED 49,000 a year (unit 401 when checked).",
    images: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790844466/knc-horizon/projects/avenue-al-jaddaf/avenue-al-jaddaf-apartment-bedroom.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790844464/knc-horizon/projects/avenue-al-jaddaf/avenue-al-jaddaf-creek-heritage-skyline.jpg"
    ],
    coverImageAlt: "Bright minimalist bedroom with white cabinets in a Dubai apartment",
    coverImageRepresentative: true,
    coverImageCredit: "AJ Ahamad / Pexels",
    developer: "wasl properties",
    sourceUrl: "https://www.wasl.ae/en/search/residential",
    sourceName: "wasl.ae",
    verifiedOn: "2026-10-01",
    featured: false,
    published: true,
    galleryImages: [
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790844464/knc-horizon/projects/avenue-al-jaddaf/avenue-al-jaddaf-creek-heritage-skyline.jpg",
        alt: "Traditional building beside Dubai Creek with the modern skyline behind",
        representative: true,
        credit: "Azamat Hatypov / Pexels"
      }
    ],
    amenities: []
  },
  {
    id: "wasl-green-park-3-bedroom-rent",
    slug: "wasl-green-park-3-bedroom-rent",
    title: "3-Bedroom Apartment for Rent at wasl green park",
    location: "wasl green park, Ras Al Khor",
    community: "Ras Al Khor",
    type: "Apartment",
    listingType: "rent",
    status: "For rent",
    price: 103e3,
    currency: "AED",
    bedrooms: 3,
    bathrooms: 0,
    size: 1489,
    description: "A three-bedroom apartment of 1,489 sq ft at wasl green park, Ras Al Khor, listed for rent by wasl at AED 103,000 a year (unit 312 when checked).",
    images: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790577287/knc-horizon/properties/dubai-villa-community-lake.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790577287/knc-horizon/properties/dubai-villas-pools-aerial.jpg"
    ],
    coverImageAlt: "Aerial view of villas among palms and lush trees beside a lake in a Dubai villa community",
    coverImageRepresentative: true,
    coverImageCredit: "Eslam Tawakol / Unsplash",
    developer: "wasl properties",
    sourceUrl: "https://www.wasl.ae/en/search/residential",
    sourceName: "wasl.ae",
    verifiedOn: "2026-10-01",
    featured: false,
    published: true,
    galleryImages: [
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790577287/knc-horizon/properties/dubai-villas-pools-aerial.jpg",
        alt: "Aerial view of villas with private pools and leafy gardens around a cul-de-sac in Dubai",
        representative: true,
        credit: "The Lazy Artist Gallery / Pexels"
      }
    ],
    amenities: []
  },
  {
    id: "al-diyafah-residences-3-bedroom-villa-rent",
    slug: "al-diyafah-residences-3-bedroom-villa-rent",
    title: "3-Bedroom Villa for Rent at Al Diyafah Residences",
    location: "Al Diyafah Residences, Al Badaa",
    community: "Al Badaa",
    type: "Villa",
    listingType: "rent",
    status: "For rent",
    price: 16e4,
    currency: "AED",
    bedrooms: 3,
    bathrooms: 0,
    size: 2664,
    description: "A three-bedroom villa of 2,664 sq ft in wasl's Al Diyafah residential development in Al Badaa, listed for rent by wasl at AED 160,000 a year (unit V038 when checked).",
    images: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790577284/knc-horizon/properties/dubai-contemporary-villa.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790590829/knc-horizon/properties/dubai-townhouse-patio-seating.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790590829/knc-horizon/properties/dubai-townhouse-sofa-by-garden-doors.jpg"
    ],
    coverImageAlt: "Contemporary villa with a landscaped front garden on a quiet residential street in Dubai",
    coverImageRepresentative: true,
    coverImageCredit: "AJ Ahamad / Pexels",
    developer: "wasl properties",
    sourceUrl: "https://www.wasl.ae/en/search/residential",
    sourceName: "wasl.ae",
    verifiedOn: "2026-10-01",
    featured: false,
    published: true,
    galleryImages: [
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790590829/knc-horizon/properties/dubai-townhouse-patio-seating.jpg",
        alt: "Sunlit patio seating with a striped cushion in front of a garden screen",
        representative: true,
        credit: "AJ Ahamad / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790590829/knc-horizon/properties/dubai-townhouse-sofa-by-garden-doors.jpg",
        alt: "Townhouse living room sofa beside sliding doors onto the garden",
        representative: true,
        credit: "AJ Ahamad / Pexels"
      }
    ],
    amenities: []
  },
  {
    id: "jewel-of-the-creek-office-581-rent",
    slug: "jewel-of-the-creek-office-581-rent",
    title: "Office for Rent at Jewel of the Creek (581 sq ft)",
    location: "Jewel of the Creek office building, Port Saeed",
    community: "Port Saeed",
    type: "Office",
    listingType: "rent",
    status: "For rent",
    price: 98770,
    currency: "AED",
    bedrooms: 0,
    bathrooms: 0,
    size: 581,
    description: "An office of 581 sq ft in the Jewel of the Creek office building at Port Saeed, beside Dubai Creek, listed for rent by wasl at AED 98,770 a year (unit OF403 when checked).",
    images: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790859299/knc-horizon/properties/residential/rental-creekside-offices-and-ferries.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790592004/knc-horizon/properties/dubai-office-lounge-glass-partition.jpg"
    ],
    coverImageAlt: "Creekside buildings and ferries on Dubai Creek on a clear day",
    coverImageRepresentative: true,
    coverImageCredit: "Magda Ehlers / Pexels",
    developer: "wasl properties",
    sourceUrl: "https://www.wasl.ae/en/search/commercial",
    sourceName: "wasl.ae",
    verifiedOn: "2026-10-01",
    featured: false,
    published: true,
    galleryImages: [
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790592004/knc-horizon/properties/dubai-office-lounge-glass-partition.jpg",
        alt: "Office lounge with white armchairs and a sofa beside a fluted-glass partitioned meeting room",
        representative: true,
        credit: "Muhammad Haris / Pexels"
      }
    ],
    amenities: []
  },
  {
    id: "jewel-of-the-creek-office-1647-rent",
    slug: "jewel-of-the-creek-office-1647-rent",
    title: "Office for Rent at Jewel of the Creek (1,647 sq ft)",
    location: "Jewel of the Creek office building, Port Saeed",
    community: "Port Saeed",
    type: "Office",
    listingType: "rent",
    status: "For rent",
    price: 247050,
    currency: "AED",
    bedrooms: 0,
    bathrooms: 0,
    size: 1647,
    description: "An office of 1,647 sq ft in the Jewel of the Creek office building at Port Saeed, beside Dubai Creek, listed for rent by wasl at AED 247,050 a year (unit OF502 when checked).",
    images: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790859299/knc-horizon/properties/residential/rental-creek-abras-and-quay.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790589060/knc-horizon/properties/dubai-office-coffee-bar-reception.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790589060/knc-horizon/properties/dubai-office-breakout-world-map.jpg"
    ],
    coverImageAlt: "Abra boats crossing Dubai Creek in front of the buildings on the quay",
    coverImageRepresentative: true,
    coverImageCredit: "Magda Ehlers / Pexels",
    developer: "wasl properties",
    sourceUrl: "https://www.wasl.ae/en/search/commercial",
    sourceName: "wasl.ae",
    verifiedOn: "2026-10-01",
    featured: false,
    published: true,
    galleryImages: [
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790589060/knc-horizon/properties/dubai-office-coffee-bar-reception.jpg",
        alt: "Fitted office floor in Dubai with a round coffee bar, glass meeting pods and full-height windows",
        representative: true,
        credit: "Coralt Zou / Unsplash"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790589060/knc-horizon/properties/dubai-office-breakout-world-map.jpg",
        alt: "Office breakout area with a bar counter, high stools and a world-map feature wall",
        representative: true,
        credit: "Coralt Zou / Unsplash"
      }
    ],
    amenities: []
  },
  {
    id: "eaton-square-offices",
    slug: "eaton-square-offices",
    title: "Full-Floor Offices at Eaton Square",
    location: "Eaton Square, Mohammed Bin Rashid City",
    community: "Mohammed Bin Rashid City",
    type: "Office",
    listingType: "sale",
    status: "Off-plan",
    price: 0,
    currency: "AED",
    bedrooms: 0,
    bathrooms: 0,
    size: 0,
    description: "Grade A full-floor offices, sold shell and core, at Eaton Square in Mohammed Bin Rashid City: Ellington Properties' first commercial development, with lagoon views, EV-ready parking and destination-controlled lifts. Ellington does not publish a price.",
    images: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790859300/knc-horizon/properties/residential/rental-glass-corridor-modern-building.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790577284/knc-horizon/properties/dubai-coworking-office.jpg"
    ],
    coverImageAlt: "Glass-walled corridor with white steel bracing in a modern building in Dubai",
    coverImageRepresentative: true,
    coverImageCredit: "Lajos Krist\xF3f K\xE1ntor / Pexels",
    amenities: ["Fitness studio", "Co-working space", "Executive meeting space", "Daycare", "Outdoor seating", "Private pantry"],
    developer: "Ellington",
    sourceUrl: "https://www.ellingtonproperties.ae/en/commercial/property-for-sale/eaton-square-mohammed-bin-rashid-city",
    sourceName: "ellingtonproperties.ae",
    verifiedOn: "2026-10-01",
    featured: false,
    published: true,
    galleryImages: [
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790577284/knc-horizon/properties/dubai-coworking-office.jpg",
        alt: "Shared work desk and meeting table under pendant lights in a fitted Dubai office",
        representative: true,
        credit: "Coralt Zou / Unsplash"
      }
    ]
  },
  {
    id: "aspirz-offices",
    slug: "aspirz-offices",
    title: "Offices at Aspirz by Danube",
    location: "Aspirz, Dubai Sports City",
    community: "Dubai Sports City",
    type: "Office",
    listingType: "sale",
    status: "Off-plan",
    price: 85e4,
    priceFrom: true,
    currency: "AED",
    bedrooms: 0,
    bathrooms: 0,
    size: 0,
    description: "Office units in Aspirz, Danube Properties' tower in Dubai Sports City that combines hotel apartments with office floors, each with its own entrance. Danube quotes standard office units from AED 850,000; handover is estimated for Q4 2028.",
    images: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790859301/knc-horizon/properties/residential/rental-faceted-balconies-and-palms.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790577283/knc-horizon/properties/address-sky-view-night.jpg"
    ],
    coverImageAlt: "Faceted white balconies of an apartment building above palm fronds in Dubai",
    coverImageRepresentative: true,
    coverImageCredit: "SANDRA GOPAN / Pexels",
    amenities: ["Separate entrance for offices", "30+ lifestyle amenities", "1% monthly payment plan (Danube)"],
    developer: "Danube",
    sourceUrl: "https://danubeproperties.com/portfolio/aspirz/",
    sourceName: "danubeproperties.com",
    verifiedOn: "2026-10-01",
    featured: false,
    published: true,
    galleryImages: [
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790577283/knc-horizon/properties/address-sky-view-night.jpg",
        alt: "Address Sky View tower in Downtown Dubai lit up at night",
        representative: true,
        credit: "Vishnu Kalanad / Unsplash"
      }
    ]
  },
  {
    id: "damac-bay-by-cavalli-4-bedroom-penthouse",
    slug: "damac-bay-by-cavalli-4-bedroom-penthouse",
    title: "4-Bedroom Penthouse at DAMAC Bay by Cavalli",
    location: "DAMAC Bay by Cavalli, Dubai Harbour",
    community: "Dubai Harbour",
    type: "Penthouse",
    listingType: "sale",
    status: "Off-plan",
    price: 66843e3,
    priceFrom: true,
    currency: "AED",
    bedrooms: 4,
    bathrooms: 0,
    size: 0,
    description: "A four-bedroom penthouse in DAMAC Bay by Cavalli, the seafront tower at Dubai Harbour. DAMAC lists four-bedroom penthouses of up to 10,036 sq ft from AED 66,843,000.",
    images: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790585306/knc-horizon/properties/dubai-penthouse-living-room.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790585306/knc-horizon/properties/dubai-penthouse-dining-room.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790585306/knc-horizon/properties/dubai-penthouse-master-bedroom.jpg"
    ],
    coverImageAlt: "Penthouse living room with a grey sofa, armchairs and patterned rug on white marble floors",
    coverImageRepresentative: true,
    coverImageCredit: "Real Estate 4k / Pexels",
    projectSlug: "bay-by-cavalli",
    developer: "DAMAC",
    sourceUrl: "https://www.damacproperties.com/en/projects/damac-bay-by-cavalli/",
    sourceName: "damacproperties.com",
    verifiedOn: "2026-10-01",
    featured: false,
    published: true,
    galleryImages: [
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790585306/knc-horizon/properties/dubai-penthouse-dining-room.jpg",
        alt: "Penthouse dining room with a ten-seat walnut table under pendant lights, opening onto the living area",
        representative: true,
        credit: "Real Estate 4k / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790585306/knc-horizon/properties/dubai-penthouse-master-bedroom.jpg",
        alt: "Penthouse master bedroom with a king bed, a writing desk and a corridor to the dressing area",
        representative: true,
        credit: "Real Estate 4k / Pexels"
      }
    ],
    amenities: []
  },
  {
    id: "damac-riverside-5-bedroom-villa",
    slug: "damac-riverside-5-bedroom-villa",
    title: "5-Bedroom Villa at DAMAC Riverside",
    location: "DAMAC Riverside, Dubai Investment Park",
    community: "Dubai Investment Park",
    type: "Villa",
    listingType: "sale",
    status: "Off-plan",
    price: 4337e3,
    priceFrom: true,
    currency: "AED",
    bedrooms: 5,
    bathrooms: 0,
    size: 0,
    description: "A five-bedroom home in DAMAC Riverside, the waterfront community in Dubai Investment Park. DAMAC's own listing shows five-bedroom villas from AED 4,337,000.",
    images: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790844469/knc-horizon/properties/residential/dubai-lakeside-villa-suburb-aerial.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790589062/knc-horizon/properties/dubai-townhouse-living-room-arched-doors.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790589062/knc-horizon/properties/dubai-townhouse-dining-room.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790589848/knc-horizon/properties/dubai-villa-bedroom-media-wall.jpg"
    ],
    coverImageAlt: "Modern homes around a lake in a Dubai suburb, aerial view",
    coverImageRepresentative: true,
    coverImageCredit: "Abid Ali / Pexels",
    projectSlug: "damac-riverside",
    developer: "DAMAC",
    sourceUrl: "https://www.damacproperties.com/en/communities/damac-riverside/",
    sourceName: "damacproperties.com",
    verifiedOn: "2026-10-01",
    featured: false,
    published: true,
    galleryImages: [
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790589062/knc-horizon/properties/dubai-townhouse-living-room-arched-doors.jpg",
        alt: "Townhouse living room with a plush sofa and green armchairs behind arched black-framed glass doors",
        representative: true,
        credit: "Usman Mehmood / Unsplash"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790589062/knc-horizon/properties/dubai-townhouse-dining-room.jpg",
        alt: "Dining room with a round table and green chairs, framed by arched glass doors, in a Dubai townhouse",
        representative: true,
        credit: "Usman Mehmood / Unsplash"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790589848/knc-horizon/properties/dubai-villa-bedroom-media-wall.jpg",
        alt: "The same bedroom from the bed, with a media wall, open shelving and a doorway to the dressing room",
        representative: true,
        credit: "S3T Koncepts / Pexels"
      }
    ],
    amenities: []
  },
  {
    id: "damac-riverside-views-apartments",
    slug: "damac-riverside-views-apartments",
    title: "Apartments at DAMAC Riverside Views",
    location: "DAMAC Riverside Views, Dubai Investment Park",
    community: "Dubai Investment Park",
    type: "Apartment",
    listingType: "sale",
    status: "Off-plan",
    price: 1354e3,
    priceFrom: true,
    currency: "AED",
    bedrooms: 1,
    bedroomsMax: 2,
    bathrooms: 0,
    size: 0,
    description: "One and two-bedroom apartments at DAMAC Riverside Views, the apartment buildings of DAMAC Riverside in Dubai Investment Park. DAMAC's own listing shows them from AED 1,354,000.",
    images: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790590506/knc-horizon/properties/dubai-apartment-balcony-midrise-view.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853413/knc-horizon/properties/residential/interiors-kitchen-with-dining-table.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853413/knc-horizon/properties/residential/interiors-twin-bedroom.jpg"
    ],
    coverImageAlt: "Apartment balcony with two chairs, the bedroom behind sliding doors and mid-rise blocks beyond",
    coverImageRepresentative: true,
    coverImageCredit: "AJ Ahamad / Pexels",
    projectSlug: "damac-riverside",
    developer: "DAMAC",
    sourceUrl: "https://www.damacproperties.com/en/communities/damac-riverside/",
    sourceName: "damacproperties.com",
    verifiedOn: "2026-10-01",
    featured: false,
    published: true,
    galleryImages: [
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853413/knc-horizon/properties/residential/interiors-kitchen-with-dining-table.jpg",
        alt: "Fitted kitchen with a wooden dining table and grey chairs beside a window",
        representative: true,
        credit: "AJ Ahamad / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853413/knc-horizon/properties/residential/interiors-twin-bedroom.jpg",
        alt: "Twin bedroom with upholstered headboards in soft neutral colours",
        representative: true,
        credit: "AJ Ahamad / Pexels"
      }
    ],
    amenities: []
  },
  {
    id: "sera-2-rashid-yachts-marina",
    slug: "sera-2-rashid-yachts-marina",
    title: "Sera 2 at Rashid Yachts & Marina",
    location: "Rashid Yachts & Marina, Dubai",
    community: "Rashid Yachts & Marina",
    type: "Apartment",
    listingType: "sale",
    status: "For sale",
    price: 2112888,
    priceFrom: true,
    currency: "AED",
    bedrooms: 1,
    bedroomsMax: 3,
    bathrooms: 0,
    size: 0,
    description: "One to three-bedroom apartments in Sera 2, one of Emaar's buildings at Rashid Yachts & Marina. Emaar lists the building from AED 2,112,888.",
    images: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790844467/knc-horizon/properties/residential/dubai-marina-dusk-yachts.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790590508/knc-horizon/properties/dubai-apartment-open-plan-living.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790590506/knc-horizon/properties/dubai-apartment-kitchen-bar-table.jpg"
    ],
    coverImageAlt: "Dubai Marina at dusk with towers and moored yachts",
    coverImageRepresentative: true,
    coverImageCredit: "Sandhu Jassi / Pexels",
    projectSlug: "rashid-yachts-marina",
    developer: "Emaar",
    sourceUrl: "https://www.emaar.com/en/our-communities/rashid-yachts-marina",
    sourceName: "emaar.com",
    verifiedOn: "2026-10-01",
    featured: false,
    published: true,
    galleryImages: [
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790590508/knc-horizon/properties/dubai-apartment-open-plan-living.jpg",
        alt: "Bright open-plan living and dining room with a white sofa and marble-look floor",
        representative: true,
        credit: "Real Estate 4k / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790590506/knc-horizon/properties/dubai-apartment-kitchen-bar-table.jpg",
        alt: "Open kitchen with a bar table and stools beside the living area",
        representative: true,
        credit: "AJ Ahamad / Pexels"
      }
    ],
    amenities: []
  },
  {
    id: "binghatti-skyblade-studio",
    slug: "binghatti-skyblade-studio",
    title: "Studio at Binghatti Skyblade",
    location: "Binghatti Skyblade, Downtown Dubai",
    community: "Downtown Dubai",
    type: "Apartment",
    listingType: "sale",
    status: "Off-plan",
    price: 1764999,
    priceFrom: true,
    currency: "AED",
    bedrooms: 0,
    bathrooms: 0,
    size: 386,
    description: "The studio Binghatti currently lists as available at Binghatti Skyblade in Downtown Dubai: 386 sq ft, starting at AED 1,764,999. The tower's completion date is Q4 2027.",
    images: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790592004/knc-horizon/properties/downtown-dubai-balcony-table-burj-khalifa.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790590509/knc-horizon/properties/dubai-studio-apartment-sofa-bed.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790590504/knc-horizon/properties/downtown-dubai-apartment-sofa-corner.jpg"
    ],
    coverImageAlt: "Apartment balcony with a chair and table facing the Burj Khalifa and the Downtown Dubai skyline",
    coverImageRepresentative: true,
    coverImageCredit: "Mary Rose Relente / Pexels",
    projectSlug: "binghatti-skyblade",
    developer: "Binghatti",
    sourceUrl: "https://www.binghatti.com/en/projects/binghatti-skyblade",
    sourceName: "binghatti.com",
    verifiedOn: "2026-10-01",
    featured: false,
    published: true,
    galleryImages: [
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790590509/knc-horizon/properties/dubai-studio-apartment-sofa-bed.jpg",
        alt: "Furnished studio apartment with a sofa bed made up, two artworks and the balcony door",
        representative: true,
        credit: "AJ Ahamad / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790590504/knc-horizon/properties/downtown-dubai-apartment-sofa-corner.jpg",
        alt: "Sofa corner with a vase of eucalyptus on a gold side table",
        representative: true,
        credit: "AJ Ahamad / Pexels"
      }
    ],
    amenities: []
  },
  {
    id: "binghatti-skyblade-3-bedroom",
    slug: "binghatti-skyblade-3-bedroom",
    title: "3-Bedroom Apartment at Binghatti Skyblade",
    location: "Binghatti Skyblade, Downtown Dubai",
    community: "Downtown Dubai",
    type: "Apartment",
    listingType: "sale",
    status: "Off-plan",
    price: 13394999,
    priceFrom: true,
    currency: "AED",
    bedrooms: 3,
    bathrooms: 0,
    size: 2196,
    description: "The three-bedroom apartment Binghatti currently lists as available at Binghatti Skyblade in Downtown Dubai: 2,196 sq ft, starting at AED 13,394,999. The tower's completion date is Q4 2027.",
    images: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790590505/knc-horizon/properties/downtown-dubai-balcony-burj-khalifa.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790590503/knc-horizon/properties/downtown-dubai-apartment-dining-table.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790590504/knc-horizon/properties/downtown-dubai-apartment-twin-bedroom.jpg"
    ],
    coverImageAlt: "Glass-fronted balcony corner looking up at the Burj Khalifa and Downtown towers",
    coverImageRepresentative: true,
    coverImageCredit: "AJ Ahamad / Pexels",
    projectSlug: "binghatti-skyblade",
    developer: "Binghatti",
    sourceUrl: "https://www.binghatti.com/en/projects/binghatti-skyblade",
    sourceName: "binghatti.com",
    verifiedOn: "2026-10-01",
    featured: false,
    published: true,
    galleryImages: [
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790590503/knc-horizon/properties/downtown-dubai-apartment-dining-table.jpg",
        alt: "Dining table set for four in a Downtown Dubai apartment, with the kitchen behind",
        representative: true,
        credit: "AJ Ahamad / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790590504/knc-horizon/properties/downtown-dubai-apartment-twin-bedroom.jpg",
        alt: "Second bedroom with twin beds and scalloped headboards under arched wall panelling",
        representative: true,
        credit: "AJ Ahamad / Pexels"
      }
    ],
    amenities: []
  },
  {
    id: "bayz-101-studio",
    slug: "bayz-101-studio",
    title: "Studio at Bayz 101 by Danube",
    location: "Bayz 101, Business Bay",
    community: "Business Bay",
    type: "Apartment",
    listingType: "sale",
    status: "Off-plan",
    price: 12e5,
    priceFrom: true,
    currency: "AED",
    bedrooms: 0,
    bathrooms: 0,
    size: 0,
    description: "A fully furnished studio in Bayz 101, Danube's 101-level tower in Business Bay. Danube says studios start at around AED 1.2 million; completion is estimated for June 2028.",
    images: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790844467/knc-horizon/properties/residential/downtown-business-bay-night-water.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790590511/knc-horizon/properties/dubai-studio-balcony-breakfast.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790577288/knc-horizon/properties/dubai-water-canal-night.jpg"
    ],
    coverImageAlt: "Downtown Dubai and Business Bay towers lit at night, reflected in the water",
    coverImageRepresentative: true,
    coverImageCredit: "Rohit George / Pexels",
    projectSlug: "bayz-101",
    developer: "Danube",
    sourceUrl: "https://danubeproperties.com/portfolio/bayz101/",
    sourceName: "danubeproperties.com",
    verifiedOn: "2026-10-01",
    featured: false,
    published: true,
    galleryImages: [
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790590511/knc-horizon/properties/dubai-studio-balcony-breakfast.jpg",
        alt: "Breakfast for two on a small balcony table with a lantern, at night",
        representative: true,
        credit: "AJ Ahamad / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790577288/knc-horizon/properties/dubai-water-canal-night.jpg",
        alt: "Dubai Water Canal at night, lit promenades on both banks and towers along the skyline",
        representative: true,
        credit: "Pranav Madhu / Unsplash"
      }
    ],
    amenities: []
  },
  {
    id: "albero-dubai-creek-harbour",
    slug: "albero-dubai-creek-harbour",
    title: "Albero at Dubai Creek Harbour",
    location: "Dubai Creek Harbour",
    community: "Dubai Creek Harbour",
    type: "Apartment",
    listingType: "sale",
    status: "For sale",
    price: 1813888,
    priceFrom: true,
    currency: "AED",
    bedrooms: 1,
    bedroomsMax: 3,
    bathrooms: 0,
    size: 0,
    description: "One to three-bedroom apartments in Albero, an Emaar building at Dubai Creek Harbour. Emaar lists the building from AED 1,813,888.",
    images: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790577285/knc-horizon/properties/dubai-creek-harbour-towers.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790590503/knc-horizon/properties/downtown-dubai-apartment-living-dining.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853414/knc-horizon/properties/residential/interiors-entrance-hallway.jpg"
    ],
    coverImageAlt: "Residential towers at Dubai Creek Harbour in late-afternoon sun, with palm trees below",
    coverImageRepresentative: true,
    coverImageCredit: "Aadil Sabeer / Unsplash",
    projectSlug: "dubai-creek-harbour",
    developer: "Emaar",
    sourceUrl: "https://www.emaar.com/en/our-communities/dubai-creek-harbour",
    sourceName: "emaar.com",
    verifiedOn: "2026-10-01",
    featured: false,
    published: true,
    galleryImages: [
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790590503/knc-horizon/properties/downtown-dubai-apartment-living-dining.jpg",
        alt: "Living and dining area with a curved sofa, round table and sculptural pendant light",
        representative: true,
        credit: "AJ Ahamad / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853414/knc-horizon/properties/residential/interiors-entrance-hallway.jpg",
        alt: "Entrance hall with a console table, a lamp and framed prints",
        representative: true,
        credit: "Real Estate 4k / Pexels"
      }
    ],
    amenities: []
  },
  {
    id: "bayz-101-1-bedroom",
    slug: "bayz-101-1-bedroom",
    title: "1-Bedroom Apartment at Bayz 101 by Danube",
    location: "Bayz 101, Business Bay",
    community: "Business Bay",
    type: "Apartment",
    listingType: "sale",
    status: "Off-plan",
    price: 205e4,
    priceFrom: true,
    currency: "AED",
    bedrooms: 1,
    bathrooms: 0,
    size: 0,
    description: "A fully furnished one-bedroom apartment in Bayz 101, Danube's 101-level tower in Business Bay. Danube quotes one-bedroom apartments from AED 2.05 million; completion is estimated for June 2028.",
    images: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790590502/knc-horizon/properties/business-bay-residence-kitchen-island.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790590501/knc-horizon/properties/business-bay-residence-bathroom-view.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790577284/knc-horizon/properties/business-bay-towers-aerial.jpg"
    ],
    coverImageAlt: "Kitchen with oak joinery and a black stone island, opening onto a terrace above Business Bay",
    coverImageRepresentative: true,
    coverImageCredit: "Waqas ilyas / Pexels",
    projectSlug: "bayz-101",
    developer: "Danube",
    sourceUrl: "https://danubeproperties.com/portfolio/bayz101/",
    sourceName: "danubeproperties.com",
    verifiedOn: "2026-10-01",
    featured: false,
    published: true,
    galleryImages: [
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790590501/knc-horizon/properties/business-bay-residence-bathroom-view.jpg",
        alt: "Freestanding bath beside floor-to-ceiling glass looking over the Business Bay towers",
        representative: true,
        credit: "Waqas ilyas / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790577284/knc-horizon/properties/business-bay-towers-aerial.jpg",
        alt: "Cluster of Business Bay residential high-rises on a clear day, seen from high above",
        representative: true,
        credit: "Nelemson Guevarra / Unsplash"
      }
    ],
    amenities: []
  },
  {
    id: "diamondz-studio",
    slug: "diamondz-studio",
    title: "Studio at Diamondz by Danube",
    location: "Diamondz, Jumeirah Lake Towers",
    community: "Jumeirah Lake Towers",
    type: "Apartment",
    listingType: "sale",
    status: "Off-plan",
    price: 11e5,
    priceFrom: true,
    currency: "AED",
    bedrooms: 0,
    bathrooms: 0,
    size: 0,
    description: "A fully furnished studio in Diamondz, Danube's tower in Jumeirah Lake Towers. Danube says studios start at around AED 1.1 million; completion is estimated for November 2027.",
    images: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790577288/knc-horizon/properties/jlt-lake-towers.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853412/knc-horizon/properties/residential/interiors-living-room-rocking-chair.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853414/knc-horizon/properties/residential/interiors-home-office-desk.jpg"
    ],
    coverImageAlt: "Jumeirah Lake Towers high-rises around a JLT lake, seen from the lakeside walk",
    coverImageRepresentative: true,
    coverImageCredit: "Yourusernamewillbepublic2 / Wikimedia Commons",
    projectSlug: "diamondz",
    developer: "Danube",
    sourceUrl: "https://danubeproperties.com/portfolio/diamondz/",
    sourceName: "danubeproperties.com",
    verifiedOn: "2026-10-01",
    featured: false,
    published: true,
    galleryImages: [
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853412/knc-horizon/properties/residential/interiors-living-room-rocking-chair.jpg",
        alt: "Living room with a rocking chair, a TV unit and a dark green wall",
        representative: true,
        credit: "AJ Ahamad / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853414/knc-horizon/properties/residential/interiors-home-office-desk.jpg",
        alt: "Home office corner with a wooden desk, a laptop and a pink chair",
        representative: true,
        credit: "AJ Ahamad / Pexels"
      }
    ],
    amenities: []
  },
  {
    id: "diamondz-1-bedroom",
    slug: "diamondz-1-bedroom",
    title: "1-Bedroom Apartment at Diamondz by Danube",
    location: "Diamondz, Jumeirah Lake Towers",
    community: "Jumeirah Lake Towers",
    type: "Apartment",
    listingType: "sale",
    status: "Off-plan",
    price: 175e4,
    priceFrom: true,
    currency: "AED",
    bedrooms: 1,
    bathrooms: 0,
    size: 0,
    description: "A fully furnished one-bedroom apartment in Diamondz, Danube's tower in Jumeirah Lake Towers. Danube quotes one-bedroom apartments from AED 1.75 million; completion is estimated for November 2027.",
    images: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853412/knc-horizon/properties/residential/interiors-living-room-sofa-and-rug.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853414/knc-horizon/properties/residential/interiors-bedroom-with-pendant-lights.jpg"
    ],
    coverImageAlt: "Bright living room with a pale sofa, a textured rug and sheer curtains",
    coverImageRepresentative: true,
    coverImageCredit: "Atul Mohan / Pexels",
    projectSlug: "diamondz",
    developer: "Danube",
    sourceUrl: "https://danubeproperties.com/portfolio/diamondz/",
    sourceName: "danubeproperties.com",
    verifiedOn: "2026-10-01",
    featured: false,
    published: true,
    galleryImages: [
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853414/knc-horizon/properties/residential/interiors-bedroom-with-pendant-lights.jpg",
        alt: "Bedroom with a double bed, colourful cushions and pendant lights",
        representative: true,
        credit: "Kadir Av\u015Far / Pexels"
      }
    ],
    amenities: []
  },
  {
    id: "baystar-by-vida-rashid-yachts-marina",
    slug: "baystar-by-vida-rashid-yachts-marina",
    title: "Baystar by Vida at Rashid Yachts & Marina",
    location: "Rashid Yachts & Marina, Dubai",
    community: "Rashid Yachts & Marina",
    type: "Apartment",
    listingType: "sale",
    status: "For sale",
    price: 2175888,
    priceFrom: true,
    currency: "AED",
    bedrooms: 1,
    bedroomsMax: 4,
    bathrooms: 0,
    size: 0,
    description: "One to four-bedroom apartments in Baystar by Vida, an Emaar building at Rashid Yachts & Marina. Emaar lists the building from AED 2,175,888.",
    images: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790844468/knc-horizon/properties/residential/dubai-marina-towers-clear-sky.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790590509/knc-horizon/properties/dubai-marina-apartment-bedroom.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790590510/knc-horizon/properties/dubai-marina-apartment-sofa-olive-tree.jpg"
    ],
    coverImageAlt: "Dubai Marina towers under a clear blue sky",
    coverImageRepresentative: true,
    coverImageCredit: "David Kuvaev / Pexels",
    projectSlug: "rashid-yachts-marina",
    developer: "Emaar",
    sourceUrl: "https://www.emaar.com/en/our-communities/rashid-yachts-marina",
    sourceName: "emaar.com",
    verifiedOn: "2026-10-01",
    featured: false,
    published: true,
    galleryImages: [
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790590509/knc-horizon/properties/dubai-marina-apartment-bedroom.jpg",
        alt: "Bedroom of a furnished Dubai Marina apartment, with an upholstered headboard and rust cushions",
        representative: true,
        credit: "AJ Ahamad / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790590510/knc-horizon/properties/dubai-marina-apartment-sofa-olive-tree.jpg",
        alt: "Sofa corner with an olive tree beside the kitchenette of a furnished Dubai Marina apartment",
        representative: true,
        credit: "AJ Ahamad / Pexels"
      }
    ],
    amenities: []
  },
  {
    id: "damac-bay-by-cavalli-1-bedroom",
    slug: "damac-bay-by-cavalli-1-bedroom",
    title: "1-Bedroom Apartment at DAMAC Bay by Cavalli",
    location: "DAMAC Bay by Cavalli, Dubai Harbour",
    community: "Dubai Harbour",
    type: "Apartment",
    listingType: "sale",
    status: "Off-plan",
    price: 3939e3,
    priceFrom: true,
    currency: "AED",
    bedrooms: 1,
    bathrooms: 0,
    size: 0,
    description: "A one-bedroom apartment in DAMAC Bay by Cavalli, the seafront tower at Dubai Harbour. DAMAC lists one-bedroom apartments of up to 1,304 sq ft from AED 3,939,000.",
    images: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790581630/knc-horizon/properties/dubai-marina-night-view-high-floor.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790589848/knc-horizon/properties/dubai-villa-ensuite-bathroom.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853415/knc-horizon/properties/residential/interiors-balcony-table-with-view.jpg"
    ],
    coverImageAlt: "Dubai Marina at night from a high-floor residence, towers lit above the marina and moored yachts",
    coverImageRepresentative: true,
    coverImageCredit: "AJ Ahamad / Pexels",
    projectSlug: "bay-by-cavalli",
    developer: "DAMAC",
    sourceUrl: "https://www.damacproperties.com/en/projects/damac-bay-by-cavalli/",
    sourceName: "damacproperties.com",
    verifiedOn: "2026-10-01",
    featured: false,
    published: true,
    galleryImages: [
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790589848/knc-horizon/properties/dubai-villa-ensuite-bathroom.jpg",
        alt: "En-suite bathroom with arched backlit mirrors, stone walls and a glass shower door",
        representative: true,
        credit: "S3T Koncepts / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853415/knc-horizon/properties/residential/interiors-balcony-table-with-view.jpg",
        alt: "Small round table with two mugs and a succulent by a window, apartment buildings beyond",
        representative: true,
        credit: "AJ Ahamad / Pexels"
      }
    ],
    amenities: []
  }
];
var defaultProjects = [
  {
    id: "dubai-creek-harbour",
    slug: "dubai-creek-harbour",
    title: "Dubai Creek Harbour",
    developer: "Emaar",
    location: "Dubai Creek Harbour",
    category: "Apartments",
    status: "New launches",
    unitTypes: "1 to 4-bedroom apartments and penthouses",
    startingPrice: 1790888,
    handover: "",
    description: "Emaar's waterfront district on Dubai Creek, beside the Ras Al Khor Wildlife Sanctuary, with apartments and penthouses around the Creek Marina, promenades and parks, and views of the Downtown skyline.",
    image: "https://res.cloudinary.com/complaintreview/image/upload/v1790853392/knc-horizon/projects/dubai-creek-harbour/dubai-creek-harbour-towers-above-mangroves.jpg",
    coverImageAlt: "High-rise residential towers rising behind a belt of mangroves in Dubai, with birds in flight",
    coverImageRepresentative: true,
    coverImageCredit: "Subbu Rayan / Pexels",
    gallery: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853392/knc-horizon/projects/dubai-creek-harbour/dubai-creek-harbour-waterfront-towers-at-sunset.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853392/knc-horizon/projects/dubai-creek-harbour/dubai-creek-harbour-creek-harbour-sign-at-sunset.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853392/knc-horizon/projects/dubai-creek-harbour/dubai-creek-harbour-skyline-across-the-water.jpg"
    ],
    amenities: [
      "Dubai Creek Marina",
      "Waterfront promenades",
      "500,000 sqm of parks and open spaces",
      "Retail and dining",
      "Schools and healthcare"
    ],
    highlights: [
      "5 minutes from Ras Al Khor Wildlife Sanctuary",
      "10 minutes from Dubai International Airport",
      "15 minutes from Burj Khalifa and Downtown Dubai"
    ],
    sourceUrl: "https://www.emaar.com/en/our-communities/dubai-creek-harbour",
    sourceName: "emaar.com",
    verifiedOn: "2026-10-01",
    featured: true,
    newLaunch: true,
    galleryImages: [
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853392/knc-horizon/projects/dubai-creek-harbour/dubai-creek-harbour-waterfront-towers-at-sunset.jpg",
        alt: "Waterfront residential towers and curved balconies above calm water at sunset in Dubai",
        representative: true,
        credit: "Abid Ali / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853392/knc-horizon/projects/dubai-creek-harbour/dubai-creek-harbour-creek-harbour-sign-at-sunset.jpg",
        alt: "The Dubai Creek Harbour sign and palm trees silhouetted at sunset, with the city skyline on the horizon",
        credit: "Yassen Kounchev / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853392/knc-horizon/projects/dubai-creek-harbour/dubai-creek-harbour-skyline-across-the-water.jpg",
        alt: "Dubai skyline with the Burj Khalifa seen across choppy open water in hazy evening light",
        representative: true,
        credit: "Abid Ali / Pexels"
      }
    ]
  },
  {
    id: "bay-by-cavalli",
    slug: "bay-by-cavalli",
    title: "DAMAC Bay by Cavalli",
    developer: "DAMAC",
    location: "Dubai Harbour",
    category: "Apartments",
    status: "Off-plan",
    unitTypes: "1 to 3-bedroom apartments and 3 to 5-bedroom duplexes",
    startingPrice: 3939e3,
    handover: "",
    description: "A 42-storey seafront tower by DAMAC at Dubai Harbour with interiors by Roberto Cavalli, offering one to three-bedroom apartments and three to five-bedroom duplexes with sea views.",
    image: "https://res.cloudinary.com/complaintreview/image/upload/v1790844455/knc-horizon/projects/bay-by-cavalli/bay-by-cavalli-marina-aerial.jpg",
    coverImageAlt: "Aerial view of the Dubai Marina waterfront, its towers and the yacht harbour, beside Dubai Harbour (representative image)",
    coverImageRepresentative: true,
    coverImageCredit: "Nelemson G / Pexels",
    gallery: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790844454/knc-horizon/projects/bay-by-cavalli/bay-by-cavalli-marina-night.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790844455/knc-horizon/projects/bay-by-cavalli/bay-by-cavalli-marina-towers-day.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790844455/knc-horizon/projects/bay-by-cavalli/bay-by-cavalli-rooftop-pool.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790844456/knc-horizon/projects/bay-by-cavalli/bay-by-cavalli-night-view-window.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790844456/knc-horizon/projects/bay-by-cavalli/bay-by-cavalli-pool-terrace.jpg"
    ],
    amenities: ["Infinity pool", "Sky garden", "Floating workstations", "Private beach", "Opera pavilion"],
    highlights: [
      "42 storeys, interiors branded by Cavalli",
      "Payment plan 60/40, terms apply (DAMAC)",
      "5 minutes from Dubai Marina Mall, 6 from Bluewaters"
    ],
    sourceUrl: "https://www.damacproperties.com/en/projects/damac-bay-by-cavalli/",
    sourceName: "damacproperties.com",
    verifiedOn: "2026-10-01",
    featured: true,
    offPlan: true,
    galleryImages: [
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790844454/knc-horizon/projects/bay-by-cavalli/bay-by-cavalli-marina-night.jpg",
        alt: "Yachts moored in Dubai Marina at night beneath lit residential towers",
        representative: true,
        credit: "Adeel Rana / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790844455/knc-horizon/projects/bay-by-cavalli/bay-by-cavalli-marina-towers-day.jpg",
        alt: "Dubai Marina skyline with waterfront towers and yachts on a clear day",
        representative: true,
        credit: "Denys Gromov / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790844455/knc-horizon/projects/bay-by-cavalli/bay-by-cavalli-rooftop-pool.jpg",
        alt: "Rooftop pool looking out over the Dubai Marina skyline",
        representative: true,
        credit: "Vika Glitter / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790844456/knc-horizon/projects/bay-by-cavalli/bay-by-cavalli-night-view-window.jpg",
        alt: "Dubai Marina's night skyline seen through a floor-to-ceiling window",
        representative: true,
        credit: "AJ Ahamad / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790844456/knc-horizon/projects/bay-by-cavalli/bay-by-cavalli-pool-terrace.jpg",
        alt: "Rooftop pool with white minimalist architecture against the Dubai skyline",
        representative: true,
        credit: "Asi Si / Pexels"
      }
    ]
  },
  {
    id: "the-oasis-by-emaar",
    slug: "the-oasis-by-emaar",
    title: "The Oasis by Emaar",
    developer: "Emaar",
    location: "Dubailand",
    category: "Villas",
    status: "New launches",
    unitTypes: "4 to 7-bedroom villas and mansions",
    startingPrice: 0,
    handover: "",
    description: "A 100 million sq ft villa community by Emaar with about 2,600 villas and mansions set among waterways and landscaped parks, with a quarter of the land kept as open space and amenities.",
    image: "https://res.cloudinary.com/complaintreview/image/upload/v1790577282/knc-horizon/projects/jumeirah-islands-lakeside-villas.jpg",
    coverImageAlt: "Aerial view of lakeside villas with pools and gardens in Jumeirah Islands, Dubai (representative image)",
    coverImageRepresentative: true,
    coverImageCredit: "Eslam Tawakol / Unsplash",
    gallery: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790844450/knc-horizon/projects/the-oasis-by-emaar/the-oasis-villa-community-aerial.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790844450/knc-horizon/projects/the-oasis-by-emaar/the-oasis-community-greenery-aerial.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790844450/knc-horizon/projects/the-oasis-by-emaar/the-oasis-villas-skyline-aerial.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790844450/knc-horizon/projects/the-oasis-by-emaar/the-oasis-villa-pool-garden.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790844452/knc-horizon/projects/the-oasis-by-emaar/the-oasis-villa-living-room.jpg"
    ],
    amenities: ["Landscaped parks", "Jogging tracks", "Community mosques", "Waterways", "Four golf courses nearby"],
    highlights: [
      "100 million sq ft of land and 2,600 villas (Emaar)",
      "25% of the land is open space and amenities",
      "18 minutes to Al Maktoum International Airport, 20 to Dubai Hills Estate"
    ],
    sourceUrl: "https://www.emaar.com/en/our-communities/the-oasis",
    sourceName: "emaar.com",
    verifiedOn: "2026-10-01",
    featured: true,
    newLaunch: true,
    galleryImages: [
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790844450/knc-horizon/projects/the-oasis-by-emaar/the-oasis-villa-community-aerial.jpg",
        alt: "Modern villas with gardens and pools in a Dubai residential community, seen from above",
        representative: true,
        credit: "Subbu Rayan / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790844450/knc-horizon/projects/the-oasis-by-emaar/the-oasis-community-greenery-aerial.jpg",
        alt: "A low-rise villa community surrounded by greenery in Dubai, aerial view",
        representative: true,
        credit: "Subbu Rayan / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790844450/knc-horizon/projects/the-oasis-by-emaar/the-oasis-villas-skyline-aerial.jpg",
        alt: "Luxury villas in the foreground and the Dubai skyline behind them on a clear day",
        representative: true,
        credit: "Abid Ali / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790844450/knc-horizon/projects/the-oasis-by-emaar/the-oasis-villa-pool-garden.jpg",
        alt: "Private pool with tropical planting at a modern villa in Dubai",
        representative: true,
        credit: "Rana Matloob Hussain / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790844452/knc-horizon/projects/the-oasis-by-emaar/the-oasis-villa-living-room.jpg",
        alt: "Living room with a long sofa, soft lighting and modern decor in a Dubai home",
        representative: true,
        credit: "AJ Ahamad / Pexels"
      }
    ]
  },
  {
    id: "binghatti-skyblade",
    slug: "binghatti-skyblade",
    title: "Binghatti Skyblade",
    developer: "Binghatti",
    location: "Downtown Dubai",
    category: "Apartments",
    status: "Off-plan",
    unitTypes: "Studio, 1, 2 and 3-bedroom apartments",
    startingPrice: 1674999,
    handover: "Q4 2027",
    description: "A tower by Binghatti on Burj Khalifa Boulevard in Downtown Dubai with 619 apartments and two retail units, looking towards the Burj Khalifa and the Dubai Water Canal.",
    image: "https://res.cloudinary.com/complaintreview/image/upload/v1790853402/knc-horizon/projects/binghatti-skyblade/binghatti-skyblade-aerial-burj-khalifa-and-old-town-at-dusk.jpg",
    coverImageAlt: "Aerial view at dusk of the Burj Khalifa above the surrounding towers and the low-rise Old Town district in Dubai",
    coverImageRepresentative: true,
    coverImageCredit: "Lloyd Alozie / Pexels",
    gallery: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853402/knc-horizon/projects/binghatti-skyblade/binghatti-skyblade-palm-lined-boulevard.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853403/knc-horizon/projects/binghatti-skyblade/binghatti-skyblade-opera-and-lake.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853403/knc-horizon/projects/binghatti-skyblade/binghatti-skyblade-burj-park-lakeside-promenade.jpg"
    ],
    amenities: ["Rooftop infinity pool", "Skyline gym", "Garden floor in the sky"],
    highlights: [
      "619 residential units and 2 retail units (Binghatti)",
      "Payment plan with 30% on completion (Binghatti)"
    ],
    sourceUrl: "https://www.binghatti.com/en/projects/binghatti-skyblade",
    sourceName: "binghatti.com",
    verifiedOn: "2026-10-01",
    featured: false,
    offPlan: true,
    galleryImages: [
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853402/knc-horizon/projects/binghatti-skyblade/binghatti-skyblade-palm-lined-boulevard.jpg",
        alt: "Wide boulevard with a grass median, palm trees and apartment towers in Dubai",
        representative: true,
        credit: "Lajos Krist\xF3f K\xE1ntor / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853403/knc-horizon/projects/binghatti-skyblade/binghatti-skyblade-opera-and-lake.jpg",
        alt: "Dubai Opera and the residential towers around it beside a turquoise lake",
        representative: true,
        credit: "Vika Glitter / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853403/knc-horizon/projects/binghatti-skyblade/binghatti-skyblade-burj-park-lakeside-promenade.jpg",
        alt: "Lakeside promenade at Burj Park with residential towers in Downtown Dubai",
        representative: true,
        credit: "Adrian Campillos / Pexels"
      }
    ]
  },
  {
    id: "rashid-yachts-marina",
    slug: "rashid-yachts-marina",
    title: "Rashid Yachts & Marina",
    developer: "Emaar",
    location: "Rashid Yachts & Marina",
    category: "Apartments",
    status: "New launches",
    unitTypes: "1 to 3-bedroom apartments",
    startingPrice: 2112888,
    handover: "",
    description: "A waterfront community by Emaar on the Arabian Gulf, built around a yacht marina with 400 wet berths, a promenade of shops and restaurants and the Queen Elizabeth 2, with one to three-bedroom apartments in low and mid-rise buildings.",
    image: "https://res.cloudinary.com/complaintreview/image/upload/v1790853391/knc-horizon/projects/rashid-yachts-marina/rashid-yachts-marina-marina-with-waterfront-apartments.jpg",
    coverImageAlt: "Yachts moored in a marina beside waterfront apartments on Palm Jumeirah, Dubai",
    coverImageRepresentative: true,
    coverImageCredit: "Nelemson G / Pexels",
    gallery: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853391/knc-horizon/projects/rashid-yachts-marina/rashid-yachts-marina-qe2-liner-at-the-quay.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853391/knc-horizon/projects/rashid-yachts-marina/rashid-yachts-marina-yachts-in-dubai-marina.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853391/knc-horizon/projects/rashid-yachts-marina/rashid-yachts-marina-boats-at-palm-jumeirah-marina.jpg"
    ],
    amenities: [
      "Yacht marina with 400 wet berths",
      "Berths for yachts up to 100 m",
      "Floating yacht club",
      "Six interconnected district parks",
      "Promenade with retail and dining"
    ],
    highlights: [
      "Less than 10 minutes from Sheikh Zayed Road",
      "15 minutes from Dubai International Airport",
      "20 minutes from Downtown Dubai"
    ],
    sourceUrl: "https://www.emaar.com/en/our-communities/rashid-yachts-marina",
    sourceName: "emaar.com",
    verifiedOn: "2026-10-01",
    featured: false,
    newLaunch: true,
    galleryImages: [
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853391/knc-horizon/projects/rashid-yachts-marina/rashid-yachts-marina-qe2-liner-at-the-quay.jpg",
        alt: "The bow of the Queen Elizabeth 2 liner moored at a quay in Dubai, with the ship's name on the hull",
        representative: true,
        credit: "Miguel Cuenca / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853391/knc-horizon/projects/rashid-yachts-marina/rashid-yachts-marina-yachts-in-dubai-marina.jpg",
        alt: "Motor yachts moored along the promenade in Dubai Marina with towers behind",
        representative: true,
        credit: "Kate Trysh / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853391/knc-horizon/projects/rashid-yachts-marina/rashid-yachts-marina-boats-at-palm-jumeirah-marina.jpg",
        alt: "Boats on the pontoons of a marina at Palm Jumeirah, Dubai, with villas along the far shore",
        representative: true,
        credit: "Nelemson G / Pexels"
      }
    ]
  },
  {
    id: "city-walk-crestlane",
    slug: "city-walk-crestlane",
    title: "City Walk Crestlane",
    developer: "Meraas",
    location: "City Walk",
    category: "Apartments",
    status: "New launch",
    unitTypes: "1 to 4-bedroom apartments and duplexes",
    startingPrice: 27e5,
    handover: "",
    description: "A collection of one to four-bedroom apartments and duplexes by Meraas at City Walk, laid out around water features and greenery a few minutes from Downtown Dubai.",
    image: "https://res.cloudinary.com/complaintreview/image/upload/v1790853410/knc-horizon/projects/city-walk-crestlane/city-walk-crestlane-city-walk-ring-at-night.jpg",
    coverImageAlt: "Illuminated ring carrying the City Walk name above a street of low-rise buildings at night, Dubai",
    coverImageRepresentative: true,
    coverImageCredit: "Denys Gromov / Pexels",
    gallery: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853410/knc-horizon/projects/city-walk-crestlane/city-walk-crestlane-arena-and-skyline.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853411/knc-horizon/projects/city-walk-crestlane/city-walk-crestlane-lattice-canopies-over-street.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853411/knc-horizon/projects/city-walk-crestlane/city-walk-crestlane-palm-lined-pedestrian-walk.jpg"
    ],
    amenities: [
      "Water features",
      "Swimming pools",
      "Sport courts",
      "Kids' play areas",
      "Outdoor fitness stations",
      "Events lawns",
      "Yoga and exercise lawns",
      "Jogging tracks"
    ],
    highlights: [
      "3 minutes from Sheikh Zayed Road",
      "7 minutes from Dubai Mall and from Jumeirah Beach",
      "15 minutes from Dubai International Airport"
    ],
    sourceUrl: "https://www.meraas.com/en/project/city-walk-crestlane",
    sourceName: "meraas.com",
    verifiedOn: "2026-10-01",
    featured: false,
    newLaunch: true,
    offPlan: true,
    galleryImages: [
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853410/knc-horizon/projects/city-walk-crestlane/city-walk-crestlane-arena-and-skyline.jpg",
        alt: "Car park and low-rise blocks beside a faceted arena building, with the Burj Khalifa and the Dubai skyline behind",
        representative: true,
        credit: "By laurent / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853411/knc-horizon/projects/city-walk-crestlane/city-walk-crestlane-lattice-canopies-over-street.jpg",
        alt: "Lattice canopies above a pedestrian shopping street with a twin-tower building behind, Dubai",
        representative: true,
        credit: "Rasul Yarichev / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853411/knc-horizon/projects/city-walk-crestlane/city-walk-crestlane-palm-lined-pedestrian-walk.jpg",
        alt: "Palm-lined pedestrian walkway with a ring sculpture and water feature beside apartment buildings in Dubai",
        representative: true,
        credit: "Lajos Krist\xF3f K\xE1ntor / Pexels"
      }
    ]
  },
  {
    id: "the-edit-at-d3",
    slug: "the-edit-at-d3",
    title: "The Edit at d3",
    developer: "Meraas",
    location: "Dubai Design District",
    category: "Apartments",
    status: "New launch",
    unitTypes: "1 to 4-bedroom residences and penthouses",
    startingPrice: 2e6,
    handover: "",
    description: "Three waterfront towers by Meraas in Dubai Design District with one to four-bedroom residences and penthouses, sky gardens and a wellness club.",
    image: "https://res.cloudinary.com/complaintreview/image/upload/v1790853411/knc-horizon/projects/the-edit-at-d3/the-edit-at-d3-waterfront-promenade-and-skyline-at-sunset.jpg",
    coverImageAlt: "Waterfront promenade railing and open water at sunset, with the Burj Khalifa skyline on the horizon, Dubai",
    coverImageRepresentative: true,
    coverImageCredit: "Walid Ahmad / Pexels",
    gallery: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853411/knc-horizon/projects/the-edit-at-d3/the-edit-at-d3-white-architecture-and-skyline.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853412/knc-horizon/projects/the-edit-at-d3/the-edit-at-d3-skyline-across-water-at-dusk.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853413/knc-horizon/projects/the-edit-at-d3/the-edit-at-d3-creek-sunset-with-skyline.jpg"
    ],
    amenities: ["Gym", "Cinema room", "Kids' club", "Events lounge", "Co-working space", "Yoga studio", "Sky garden", "Padel court"],
    highlights: ["6-minute drive to Dubai Mall", "7-minute drive to Downtown Dubai", "12-minute drive to DIFC"],
    sourceUrl: "https://www.meraas.com/en/the-edit-at-d3",
    sourceName: "meraas.com",
    verifiedOn: "2026-10-01",
    featured: false,
    newLaunch: true,
    offPlan: true,
    galleryImages: [
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853411/knc-horizon/projects/the-edit-at-d3/the-edit-at-d3-white-architecture-and-skyline.jpg",
        alt: "White minimalist building volumes with the Dubai skyline and the Burj Khalifa in the distance",
        representative: true,
        credit: "Ayrat / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853412/knc-horizon/projects/the-edit-at-d3/the-edit-at-d3-skyline-across-water-at-dusk.jpg",
        alt: "Dubai skyline with the Burj Khalifa across still water under a pink dusk sky",
        representative: true,
        credit: "Asifgraphy / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853413/knc-horizon/projects/the-edit-at-d3/the-edit-at-d3-creek-sunset-with-skyline.jpg",
        alt: "Sunset over the water with the Burj Khalifa skyline and a large angular building on the far shore, Dubai",
        representative: true,
        credit: "Laurence Elbana / Pexels"
      }
    ]
  },
  {
    id: "damac-riverside",
    slug: "damac-riverside",
    title: "DAMAC Riverside",
    developer: "DAMAC",
    location: "Dubai Investment Park",
    category: "Townhouses & Apartments",
    status: "Off-plan",
    unitTypes: "4 and 5-bedroom townhouses; 1 and 2-bedroom apartments at Riverside Views",
    startingPrice: 1354e3,
    handover: "",
    description: "A 10 million sq ft waterfront master community by DAMAC in Dubai Investment Park, planned around wellness and nature, with 1,902 villas and townhouses and 4,490 apartments.",
    image: "https://res.cloudinary.com/complaintreview/image/upload/v1790853396/knc-horizon/projects/damac-riverside/damac-riverside-villa-community-with-lake.jpg",
    coverImageAlt: "Elevated view over a villa community with gardens and a lake in Dubai, with office buildings beyond",
    coverImageRepresentative: true,
    coverImageCredit: "Subbu Rayan / Pexels",
    gallery: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853397/knc-horizon/projects/damac-riverside/damac-riverside-aerial-townhouse-rows.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853396/knc-horizon/projects/damac-riverside/damac-riverside-park-lake-and-sports-courts.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853397/knc-horizon/projects/damac-riverside/damac-riverside-community-pools-and-lawns.jpg"
    ],
    amenities: [
      "Malibu Cove",
      "Essential oils lake",
      "Floating sports",
      "Calisthenics stations",
      "Island restaurant",
      "Adventure land",
      "Floating stage"
    ],
    highlights: [
      "10 million sq ft (DAMAC)",
      "The price shown is DAMAC's 'from' price for the Riverside Views apartments"
    ],
    sourceUrl: "https://www.damacproperties.com/en/communities/damac-riverside/",
    sourceName: "damacproperties.com",
    verifiedOn: "2026-10-01",
    featured: false,
    offPlan: true,
    galleryImages: [
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853397/knc-horizon/projects/damac-riverside/damac-riverside-aerial-townhouse-rows.jpg",
        alt: "Top-down aerial view of rows of townhouses with pink and sand-coloured roofs along a central road in Dubai",
        representative: true,
        credit: "Lloyd Alozie / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853396/knc-horizon/projects/damac-riverside/damac-riverside-park-lake-and-sports-courts.jpg",
        alt: "Aerial view of a lake ringed by a running track, palm trees and sports courts in a Dubai park",
        representative: true,
        credit: "The Lazy Artist Gallery / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853397/knc-horizon/projects/damac-riverside/damac-riverside-community-pools-and-lawns.jpg",
        alt: "Aerial view of lawns, swimming pools and a football pitch between low-rise residential buildings in Dubai",
        representative: true,
        credit: "The Lazy Artist Gallery / Pexels"
      }
    ]
  },
  {
    id: "binghatti-skyrise",
    slug: "binghatti-skyrise",
    title: "Binghatti Skyrise",
    developer: "Binghatti",
    location: "Business Bay",
    category: "Apartments",
    status: "Off-plan",
    unitTypes: "Studio, 1, 2 and 3-bedroom apartments",
    startingPrice: 105e4,
    handover: "Q4 2026",
    description: "Three 48-storey towers by Binghatti in Business Bay with diamond-shaped crowns, offering studios and one to three-bedroom apartments close to Downtown Dubai and the Dubai Canal.",
    image: "https://res.cloudinary.com/complaintreview/image/upload/v1790853400/knc-horizon/projects/binghatti-skyrise/binghatti-skyrise-canal-towers-at-sunset.jpg",
    coverImageAlt: "Towers along the Dubai waterfront with the Burj Khalifa behind, seen from beneath a road bridge at sunset",
    coverImageRepresentative: true,
    coverImageCredit: "Leon Macapagal / Pexels",
    gallery: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853401/knc-horizon/projects/binghatti-skyrise/binghatti-skyrise-towers-silhouetted-over-the-water.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853401/knc-horizon/projects/binghatti-skyrise/binghatti-skyrise-tolerance-bridge-footpath.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853401/knc-horizon/projects/binghatti-skyrise/binghatti-skyrise-canal-bridge-and-skyline-at-night.jpg"
    ],
    highlights: [
      "Three towers, 48 residential floors each (Binghatti)",
      "Payment plan: 20% on booking, 50% during construction, 30% on completion (Binghatti)"
    ],
    sourceUrl: "https://www.binghatti.com/en/projects/binghatti-skyrise",
    sourceName: "binghatti.com",
    verifiedOn: "2026-10-01",
    featured: false,
    offPlan: true,
    galleryImages: [
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853401/knc-horizon/projects/binghatti-skyrise/binghatti-skyrise-towers-silhouetted-over-the-water.jpg",
        alt: "High-rise towers silhouetted against the setting sun and reflected in the water in Dubai",
        representative: true,
        credit: "Maria Charizani / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853401/knc-horizon/projects/binghatti-skyrise/binghatti-skyrise-tolerance-bridge-footpath.jpg",
        alt: "Curving footbridge with a white arch over the water in Dubai, the Tolerance Bridge, on a bright day",
        representative: true,
        credit: "Nomad Ashwin / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853401/knc-horizon/projects/binghatti-skyrise/binghatti-skyrise-canal-bridge-and-skyline-at-night.jpg",
        alt: "The illuminated arch of the Tolerance Bridge over the water at night, with the Burj Khalifa skyline behind, Dubai",
        representative: true,
        credit: "Denys Gromov / Pexels"
      }
    ]
  },
  {
    id: "emaar-beachfront",
    slug: "emaar-beachfront",
    title: "Emaar Beachfront",
    developer: "Emaar",
    location: "Dubai Harbour",
    category: "Apartments",
    status: "Off-plan",
    unitTypes: "1 to 4-bedroom apartments",
    startingPrice: 3594888,
    handover: "",
    description: "A gated island community by Emaar at Dubai Harbour, between Dubai Marina and Palm Jumeirah, with 27 residential towers, 1.5 km of beach and a 13,000 sqm retail mall.",
    image: "https://res.cloudinary.com/complaintreview/image/upload/v1790853393/knc-horizon/projects/emaar-beachfront/emaar-beachfront-aerial-marinas-towers-and-palm.jpg",
    coverImageAlt: "Aerial view of marinas and a cluster of beachfront towers on the Dubai coast, with Palm Jumeirah behind",
    coverImageRepresentative: true,
    coverImageCredit: "Nelemson G / Pexels",
    gallery: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853394/knc-horizon/projects/emaar-beachfront/emaar-beachfront-aerial-beach-island-and-bay.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853394/knc-horizon/projects/emaar-beachfront/emaar-beachfront-pool-and-sand-with-skyline.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853394/knc-horizon/projects/emaar-beachfront/emaar-beachfront-marina-skyline-and-beach-from-sea.jpg"
    ],
    amenities: [
      "1.5 km beachfront",
      "13,000 sqm retail mall",
      "Sea-view apartments",
      "Easy access to Sheikh Zayed Road"
    ],
    highlights: [
      "27 residential towers and about 10,000 homes (Emaar)",
      "1 minute from Dubai Marina",
      "15 minutes from Downtown Dubai"
    ],
    sourceUrl: "https://www.emaar.com/en/our-communities/emaar-beachfront",
    sourceName: "emaar.com",
    verifiedOn: "2026-10-01",
    featured: false,
    newLaunch: true,
    offPlan: true,
    galleryImages: [
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853394/knc-horizon/projects/emaar-beachfront/emaar-beachfront-aerial-beach-island-and-bay.jpg",
        alt: "Aerial view of a beachfront tower district beside a sheltered bay with yachts, and Palm Jumeirah beyond, Dubai",
        representative: true,
        credit: "Nelemson G / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853394/knc-horizon/projects/emaar-beachfront/emaar-beachfront-pool-and-sand-with-skyline.jpg",
        alt: "White sand, a lagoon-style pool and palm trees with the Dubai skyline across the water",
        representative: true,
        credit: "EnsearchofYou / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853394/knc-horizon/projects/emaar-beachfront/emaar-beachfront-marina-skyline-and-beach-from-sea.jpg",
        alt: "Dubai Marina towers and a sandy beach seen from the sea, with jet skis on the water",
        representative: true,
        credit: "Denys Gromov / Pexels"
      }
    ]
  },
  {
    id: "damac-islands",
    slug: "damac-islands",
    title: "DAMAC Islands",
    developer: "DAMAC",
    location: "Dubailand",
    category: "Villas & Townhouses",
    status: "Off-plan",
    unitTypes: "4 and 5-bedroom townhouses, 6 and 7-bedroom villas",
    startingPrice: 275e4,
    handover: "",
    description: "A 30 million sq ft master community by DAMAC in Dubailand with 5,915 villas and townhouses, themed on six tropical island destinations and laid out around lagoons, a jungle river and an aqua park.",
    image: "https://res.cloudinary.com/complaintreview/image/upload/v1790853394/knc-horizon/projects/damac-islands/damac-islands-lake-with-villas-and-skyline.jpg",
    coverImageAlt: "Lake with a fountain, white villas and trees on the shore, and Dubai's towers behind",
    coverImageRepresentative: true,
    coverImageCredit: "Alexander Shabanov / Pexels",
    gallery: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853395/knc-horizon/projects/damac-islands/damac-islands-aerial-villa-clusters-on-waterways.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853395/knc-horizon/projects/damac-islands/damac-islands-turquoise-lagoon-with-palms.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853395/knc-horizon/projects/damac-islands/damac-islands-waterfront-villas-on-palm-jumeirah.jpg"
    ],
    amenities: ["Central hub fountain", "Water platforms", "Lagoon waterfalls", "Jungle river", "Aqua park", "Paddling lagoons"],
    highlights: [
      "30 million sq ft, 5,915 villas and townhouses (DAMAC)",
      "The developer marks its starting price with an asterisk: conditions apply"
    ],
    sourceUrl: "https://www.damacproperties.com/en/communities/damac-islands-community/",
    sourceName: "damacproperties.com",
    verifiedOn: "2026-10-01",
    featured: false,
    offPlan: true,
    galleryImages: [
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853395/knc-horizon/projects/damac-islands/damac-islands-aerial-villa-clusters-on-waterways.jpg",
        alt: "Aerial view at sunrise of villa clusters set around winding waterways in Dubai, with the city skyline beyond",
        representative: true,
        credit: "Lloyd Alozie / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853395/knc-horizon/projects/damac-islands/damac-islands-turquoise-lagoon-with-palms.jpg",
        alt: "Clear turquoise lagoon edged with sand and palm trees at Dubai Media City, with an office tower behind",
        representative: true,
        credit: "Tan Tri @Bangladesh CTG / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853395/knc-horizon/projects/damac-islands/damac-islands-waterfront-villas-on-palm-jumeirah.jpg",
        alt: "Waterfront villas with a sandy shore along calm water on Palm Jumeirah, Dubai",
        representative: true,
        credit: "Nelemson G / Pexels"
      }
    ]
  },
  {
    id: "sobha-hartland-2",
    slug: "sobha-hartland-2",
    title: "Sobha Hartland II",
    developer: "Sobha Realty",
    location: "Mohammed Bin Rashid City",
    category: "Apartments & Villas",
    unitTypes: "1 to 4-bedroom apartments; 5 and 6-bedroom villas at Sobha Estates",
    startingPrice: 0,
    handover: "",
    description: "An 8 million sq ft gated community by Sobha Realty in Mohammed Bin Rashid City with more than 12,000 homes and 39% open space: apartment towers in the Riverside Crescent, Skyscape and Skyvue clusters, and the Sobha Estates villas.",
    image: "https://res.cloudinary.com/complaintreview/image/upload/v1790853397/knc-horizon/projects/sobha-hartland-2/sobha-hartland-2-downtown-skyline-across-water-at-twilight.jpg",
    coverImageAlt: "Dubai skyline with the Burj Khalifa at twilight, seen across calm water",
    coverImageRepresentative: true,
    coverImageCredit: "Kirandeep Singh Walia / Pexels",
    gallery: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853398/knc-horizon/projects/sobha-hartland-2/sobha-hartland-2-flamingos-taking-flight.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853399/knc-horizon/projects/sobha-hartland-2/sobha-hartland-2-flamingos-at-ras-al-khor.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853398/knc-horizon/projects/sobha-hartland-2/sobha-hartland-2-low-sun-behind-skyline.jpg"
    ],
    amenities: [
      "40-seat indoor cinema",
      "Sensory and zen gardens",
      "Fitness and aerobic zones",
      "Gardening zone",
      "Restaurants and caf\xE9s",
      "BBQ area"
    ],
    highlights: [
      "8 million sq ft, 12,000+ homes, 39% open space (Sobha)",
      "Clusters: Riverside Crescent, Skyscape, Skyvue and Sobha Estates"
    ],
    sourceUrl: "https://www.sobharealty.com/sobha-communities/sobha-hartland-2",
    sourceName: "sobharealty.com",
    verifiedOn: "2026-10-01",
    featured: false,
    galleryImages: [
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853398/knc-horizon/projects/sobha-hartland-2/sobha-hartland-2-flamingos-taking-flight.jpg",
        alt: "A flock of flamingos taking off from the water beside green trees in Dubai",
        representative: true,
        credit: "Denys Gromov / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853399/knc-horizon/projects/sobha-hartland-2/sobha-hartland-2-flamingos-at-ras-al-khor.jpg",
        alt: "Pink flamingos feeding at a pond in Ras Al Khor Wildlife Sanctuary, Dubai",
        representative: true,
        credit: "Denys Gromov / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853398/knc-horizon/projects/sobha-hartland-2/sobha-hartland-2-low-sun-behind-skyline.jpg",
        alt: "Low sun behind the Dubai skyline and the Burj Khalifa, reflected in open water under heavy clouds",
        representative: true,
        credit: "Ahmad Malulein / Pexels"
      }
    ]
  },
  {
    id: "sobha-seahaven",
    slug: "sobha-seahaven",
    title: "Sobha SeaHaven",
    developer: "Sobha Realty",
    location: "Dubai Harbour",
    category: "Apartments",
    unitTypes: "1 to 4-bedroom apartments; 5 and 6-bedroom penthouses",
    startingPrice: 0,
    handover: "",
    description: "Three crescent-shaped towers of 45 to 65 levels by Sobha Realty at Dubai Harbour, with more than 750 homes looking over the Arabian Gulf, Ain Dubai and Palm Jumeirah.",
    image: "https://res.cloudinary.com/complaintreview/image/upload/v1790853399/knc-horizon/projects/sobha-seahaven/sobha-seahaven-marina-towers-from-the-sea.jpg",
    coverImageAlt: "Dubai Marina's cluster of towers seen from the sea in daylight, with boats near the shore",
    coverImageRepresentative: true,
    coverImageCredit: "Kirandeep Singh Walia / Pexels",
    gallery: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853400/knc-horizon/projects/sobha-seahaven/sobha-seahaven-coastal-skyline-and-observation-wheel-from-sea.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853400/knc-horizon/projects/sobha-seahaven/sobha-seahaven-ain-dubai-from-the-beach-at-sunset.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853400/knc-horizon/projects/sobha-seahaven/sobha-seahaven-seafront-towers-with-yachts.jpg"
    ],
    amenities: [
      "Infinity and family pools",
      "Gyms and yoga studio",
      "Indoor and outdoor cinemas",
      "Club lounges",
      "Viewing deck",
      "Children's play areas"
    ],
    highlights: [
      "Three towers, 45 to 65 levels, 750+ homes (Sobha)",
      "Direct access to the waterfront promenade"
    ],
    sourceUrl: "https://www.sobharealty.com/sobha-communities/sobha-seahaven",
    sourceName: "sobharealty.com",
    verifiedOn: "2026-10-01",
    featured: false,
    galleryImages: [
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853400/knc-horizon/projects/sobha-seahaven/sobha-seahaven-coastal-skyline-and-observation-wheel-from-sea.jpg",
        alt: "Dubai's coastal towers and a giant observation wheel seen across open sea under a clear sky",
        representative: true,
        credit: "Siarhei Nester / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853400/knc-horizon/projects/sobha-seahaven/sobha-seahaven-ain-dubai-from-the-beach-at-sunset.jpg",
        alt: "The Ain Dubai observation wheel seen from a sandy beach at sunset, Dubai",
        representative: true,
        credit: "Kirandeep Singh Walia / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853400/knc-horizon/projects/sobha-seahaven/sobha-seahaven-seafront-towers-with-yachts.jpg",
        alt: "Seafront towers and a beach in the Dubai Marina area with yachts anchored offshore",
        representative: true,
        credit: "Subbu Rayan / Pexels"
      }
    ]
  },
  {
    id: "como-residences",
    slug: "como-residences",
    title: "Como Residences",
    developer: "Nakheel",
    location: "Palm Jumeirah",
    category: "Apartments",
    status: "New launch",
    unitTypes: "76 residences over 76 storeys",
    startingPrice: 0,
    handover: "",
    description: "A residential tower by Nakheel on Palm Jumeirah, more than 300 metres tall, with 76 residences over 76 storeys, each with wrap-around balconies and 180\xB0 to 360\xB0 views of Dubai and the Arabian Sea.",
    image: "https://res.cloudinary.com/complaintreview/image/upload/v1790853403/knc-horizon/projects/como-residences/como-residences-palm-jumeirah-beach-and-shoreline.jpg",
    coverImageAlt: "Sandy beach with palm trees and shoreline apartment buildings on Palm Jumeirah, Dubai",
    coverImageRepresentative: true,
    coverImageCredit: "Nelemson G / Pexels",
    gallery: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853403/knc-horizon/projects/como-residences/como-residences-palm-jumeirah-bay-and-beach.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853404/knc-horizon/projects/como-residences/como-residences-beach-promenade-and-skyline.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853404/knc-horizon/projects/como-residences/como-residences-skyline-from-palm-beach.jpg"
    ],
    amenities: [
      "Beach pool",
      "Swimming pools",
      "Wellness centre",
      "Gym",
      "Sports courts",
      "Business centre",
      "Caf\xE9 lounge",
      "Kids' play area"
    ],
    highlights: [
      "2 minutes from Al Ittihad Park and Golden Mile Galleria",
      "3 minutes from the Palm Monorail",
      "4 minutes from Palm West Beach"
    ],
    sourceUrl: "https://www.nakheel.com/en/new-launches/como-residences",
    sourceName: "nakheel.com",
    verifiedOn: "2026-10-01",
    featured: false,
    newLaunch: true,
    offPlan: true,
    galleryImages: [
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853403/knc-horizon/projects/como-residences/como-residences-palm-jumeirah-bay-and-beach.jpg",
        alt: "Curving sandy beach and turquoise water on Palm Jumeirah, Dubai, with resorts on the crescent in the distance",
        representative: true,
        credit: "Nelemson G / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853404/knc-horizon/projects/como-residences/como-residences-beach-promenade-and-skyline.jpg",
        alt: "Beach and palm-lined promenade on Palm Jumeirah with the Dubai skyline across the water",
        representative: true,
        credit: "Javlon Pulatov / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853404/knc-horizon/projects/como-residences/como-residences-skyline-from-palm-beach.jpg",
        alt: "Turquoise water and a sandy beach on Palm Jumeirah with the Dubai skyline reflected across the lagoon",
        representative: true,
        credit: "Ayrat / Pexels"
      }
    ]
  },
  {
    id: "palm-jebel-ali",
    slug: "palm-jebel-ali",
    title: "Palm Jebel Ali Villas",
    developer: "Nakheel",
    location: "Palm Jebel Ali",
    category: "Villas",
    status: "Under construction",
    unitTypes: "Beachfront villas on the fronds",
    startingPrice: 0,
    handover: "",
    description: "Nakheel's second palm-shaped island, where beachfront villas are being built on private fronds with walkable landscaped streets, pocket parks and easy access to the beach.",
    image: "https://res.cloudinary.com/complaintreview/image/upload/v1790853405/knc-horizon/projects/palm-jebel-ali/palm-jebel-ali-aerial-fronds-with-villas.jpg",
    coverImageAlt: "Aerial view of villa-lined fronds and blue water on Palm Jumeirah, Dubai, with the city skyline in the distance",
    coverImageRepresentative: true,
    coverImageCredit: "Abid Ali / Pexels",
    gallery: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853405/knc-horizon/projects/palm-jebel-ali/palm-jebel-ali-frond-tip-villas-and-beach.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853405/knc-horizon/projects/palm-jebel-ali/palm-jebel-ali-aerial-palm-island-fronds.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853405/knc-horizon/projects/palm-jebel-ali/palm-jebel-ali-villas-across-the-water.jpg"
    ],
    amenities: [
      "Hotels and resorts",
      "Lifestyle malls",
      "Leisure parks",
      "Waterfront promenade",
      "Beach clubs",
      "Yacht club",
      "Sports and wellness"
    ],
    highlights: [
      "Overall construction progress 26.75% (Nakheel, internal inspection of 10 March 2026)",
      "24 minutes from Al Maktoum International Airport, 19 from Ibn Battuta Mall"
    ],
    sourceUrl: "https://www.nakheel.com/en/construction-progress/palm-jebel-ali",
    sourceName: "nakheel.com",
    verifiedOn: "2026-10-01",
    featured: false,
    offPlan: true,
    galleryImages: [
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853405/knc-horizon/projects/palm-jebel-ali/palm-jebel-ali-frond-tip-villas-and-beach.jpg",
        alt: "Aerial view of beachfront villas at the tip of a frond on Palm Jumeirah, Dubai",
        representative: true,
        credit: "Djimmer Koster / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853405/knc-horizon/projects/palm-jebel-ali/palm-jebel-ali-aerial-palm-island-fronds.jpg",
        alt: "Aerial view across the fronds, villas and lagoons of Palm Jumeirah, Dubai",
        representative: true,
        credit: "Abid Ali / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853405/knc-horizon/projects/palm-jebel-ali/palm-jebel-ali-villas-across-the-water.jpg",
        alt: "Rows of beachfront villas seen across the water from a beach on Palm Jumeirah, Dubai",
        representative: true,
        credit: "Nelemson G / Pexels"
      }
    ]
  },
  {
    id: "eltiera-views",
    slug: "eltiera-views",
    title: "Eltiera Views",
    developer: "Ellington",
    location: "Jumeirah Islands",
    category: "Apartments",
    unitTypes: "1 to 4-bedroom apartments",
    startingPrice: 0,
    handover: "",
    description: "Lake-view apartments by Ellington Properties within Jumeirah Islands, following Eltiera Heights, with one to four-bedroom homes arranged around a four-level clubhouse.",
    image: "https://res.cloudinary.com/complaintreview/image/upload/v1790853406/knc-horizon/projects/eltiera-views/eltiera-views-aerial-island-villas-lakes-and-skyline.jpg",
    coverImageAlt: "Aerial view of the villa clusters and lakes of Jumeirah Islands, Dubai, with the tower skyline on the horizon",
    coverImageRepresentative: true,
    coverImageCredit: "Lloyd Alozie / Pexels",
    gallery: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853406/knc-horizon/projects/eltiera-views/eltiera-views-top-down-island-villa-clusters.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853406/knc-horizon/projects/eltiera-views/eltiera-views-lake-villas-and-towers.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853407/knc-horizon/projects/eltiera-views/eltiera-views-lakeside-palms-and-towers.jpg"
    ],
    amenities: [
      "Infinity-edge pool",
      "Four-level clubhouse",
      "Fitness area",
      "Steam and sauna rooms",
      "Outdoor kids' play",
      "Water garden",
      "Games station"
    ],
    highlights: ["Overlooks the lake at Jumeirah Islands", "Next to Jumeirah Lakes Towers and Uptown Dubai"],
    sourceUrl: "https://www.ellingtonproperties.ae/en/property-for-sale/eltiera-views-jumeirah-islands",
    sourceName: "ellingtonproperties.ae",
    verifiedOn: "2026-10-01",
    featured: false,
    galleryImages: [
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853406/knc-horizon/projects/eltiera-views/eltiera-views-top-down-island-villa-clusters.jpg",
        alt: "Top-down aerial view of circular villa clusters ringed by water at Jumeirah Islands, Dubai",
        representative: true,
        credit: "Lloyd Alozie / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853406/knc-horizon/projects/eltiera-views/eltiera-views-lake-villas-and-towers.jpg",
        alt: "Lake with lawns and white villas on the shore, and a cluster of Dubai towers rising behind",
        representative: true,
        credit: "Alexander Shabanov / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853407/knc-horizon/projects/eltiera-views/eltiera-views-lakeside-palms-and-towers.jpg",
        alt: "Lake with green banks and palm trees below residential towers in Dubai",
        representative: true,
        credit: "Ayrat / Pexels"
      }
    ]
  },
  {
    id: "bayz-101",
    slug: "bayz-101",
    title: "Bayz 101 by Danube",
    developer: "Danube",
    location: "Business Bay",
    category: "Apartments",
    status: "Off-plan",
    unitTypes: "Studio, 1, 2, 3 and 4-bedroom apartments",
    startingPrice: 1175e3,
    handover: "June 2028",
    description: "A 101-level residential tower by Danube Properties in Business Bay with 1,346 fully furnished apartments, some with private pools, and views towards the Burj Khalifa and Downtown Dubai.",
    image: "https://res.cloudinary.com/complaintreview/image/upload/v1790853407/knc-horizon/projects/bayz-101/bayz-101-high-rise-view-to-burj-khalifa-at-twilight.jpg",
    coverImageAlt: "Twilight view between two towers toward the Burj Khalifa, with light trails on the highway below, Dubai",
    coverImageRepresentative: true,
    coverImageCredit: "Irshad Ahmad / Pexels",
    gallery: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853408/knc-horizon/projects/bayz-101/bayz-101-canal-skyline-at-night.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853408/knc-horizon/projects/bayz-101/bayz-101-burj-khalifa-and-skyline-by-day.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853409/knc-horizon/projects/bayz-101/bayz-101-rooftop-pool-facing-burj-khalifa.jpg"
    ],
    amenities: ["Tennis court", "Bowling centre", "Gym", "Library"],
    highlights: [
      "101 levels and 1,346 apartments (Danube)",
      "Payment plan: 2% monthly (Danube)",
      "1 minute from Business Bay Metro, 3 from Dubai Mall"
    ],
    sourceUrl: "https://danubeproperties.com/portfolio/bayz101/",
    sourceName: "danubeproperties.com",
    verifiedOn: "2026-10-01",
    featured: false,
    offPlan: true,
    galleryImages: [
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853408/knc-horizon/projects/bayz-101/bayz-101-canal-skyline-at-night.jpg",
        alt: "Illuminated towers and the Burj Khalifa reflected in the water at night, seen from beneath a road bridge in Dubai",
        representative: true,
        credit: "Walid Ahmad / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853408/knc-horizon/projects/bayz-101/bayz-101-burj-khalifa-and-skyline-by-day.jpg",
        alt: "The Burj Khalifa and neighbouring towers under a blue sky, seen from an elevated viewpoint in Dubai",
        representative: true,
        credit: "San Photography / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853409/knc-horizon/projects/bayz-101/bayz-101-rooftop-pool-facing-burj-khalifa.jpg",
        alt: "Rooftop infinity pool looking toward the Burj Khalifa and the Dubai skyline at sunrise",
        representative: true,
        credit: "Holger Raukamp / Pexels"
      }
    ]
  },
  {
    id: "diamondz",
    slug: "diamondz",
    title: "Diamondz by Danube",
    developer: "Danube",
    location: "Jumeirah Lake Towers",
    category: "Apartments",
    status: "Off-plan",
    unitTypes: "Studio, 1, 2, 3 and 4-bedroom apartments",
    startingPrice: 11e5,
    handover: "November 2027",
    description: "A residential tower by Danube Properties in Jumeirah Lake Towers with 1,219 fully furnished apartments, from studios to four bedrooms.",
    image: "https://res.cloudinary.com/complaintreview/image/upload/v1790853409/knc-horizon/projects/diamondz/diamondz-lake-towers-at-sunset.jpg",
    coverImageAlt: "Office and residential towers around a lake at sunset in Dubai",
    coverImageRepresentative: true,
    coverImageCredit: "Anton Massalov / Pexels",
    gallery: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853409/knc-horizon/projects/diamondz/diamondz-looking-up-at-almas-tower.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853409/knc-horizon/projects/diamondz/diamondz-tower-with-faceted-glass-podium.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790853410/knc-horizon/projects/diamondz/diamondz-towers-beside-highway-and-metro.jpg"
    ],
    amenities: ["Sky deck yoga", "Gym", "Infinity pool", "Rain shower", "Aquatic gym"],
    highlights: ["1,219 apartments (Danube)", "Payment plan: 0.5% monthly (Danube)", "2 minutes from DMCC Metro"],
    sourceUrl: "https://danubeproperties.com/portfolio/diamondz/",
    sourceName: "danubeproperties.com",
    verifiedOn: "2026-10-01",
    featured: false,
    offPlan: true,
    galleryImages: [
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853409/knc-horizon/projects/diamondz/diamondz-looking-up-at-almas-tower.jpg",
        alt: "Looking straight up at Almas Tower and the neighbouring towers in Jumeirah Lakes Towers, Dubai",
        representative: true,
        credit: "Denys Gromov / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853409/knc-horizon/projects/diamondz/diamondz-tower-with-faceted-glass-podium.jpg",
        alt: "Tall glass tower with a faceted glass podium and neighbouring high-rises under a blue sky in Dubai",
        representative: true,
        credit: "Denys Gromov / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790853410/knc-horizon/projects/diamondz/diamondz-towers-beside-highway-and-metro.jpg",
        alt: "Row of high-rise towers beside a multi-lane highway and an elevated metro line in Dubai",
        representative: true,
        credit: "Nelemson G / Pexels"
      }
    ]
  },
  {
    id: "bay-grove-dubai-islands",
    slug: "bay-grove-dubai-islands",
    title: "Bay Grove Residences",
    developer: "Nakheel",
    location: "Dubai Islands",
    category: "Apartments",
    status: "New launch",
    unitTypes: "1 to 4-bedroom residences and a signature penthouse",
    startingPrice: 0,
    handover: "",
    description: "Waterfront residences by Nakheel on Dubai Islands with direct access to Crystal Beach; the final phase adds four residential buildings of one to four-bedroom homes and a signature penthouse.",
    image: "https://res.cloudinary.com/complaintreview/image/upload/v1790577280/knc-horizon/projects/dubai-islands-from-space.jpg",
    coverImageAlt: "Dubai Islands and their shoreline off Deira, photographed from the International Space Station (representative image)",
    coverImageRepresentative: true,
    coverImageCredit: "NASA Johnson Space Center, Earth Science and Remote Sensing Unit / Wikimedia Commons",
    gallery: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790844456/knc-horizon/projects/bay-grove-dubai-islands/bay-grove-deira-coast-sunset.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790844457/knc-horizon/projects/bay-grove-dubai-islands/bay-grove-dubai-coastline.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790844457/knc-horizon/projects/bay-grove-dubai-islands/bay-grove-beachfront-pools-aerial.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790844458/knc-horizon/projects/bay-grove-dubai-islands/bay-grove-dubai-coast-aerial.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790844458/knc-horizon/projects/bay-grove-dubai-islands/bay-grove-apartment-living-room.jpg"
    ],
    amenities: ["Beach-level snack bar", "Gym", "Swimming pool", "Children's pool", "Podium gardens", "Kids' play area", "Yoga"],
    highlights: [
      "Direct access to Crystal Beach",
      "20 minutes from Dubai International Airport",
      "24 minutes from Downtown Dubai"
    ],
    sourceUrl: "https://www.nakheel.com/en/new-launches/baygrove-residences",
    sourceName: "nakheel.com",
    verifiedOn: "2026-10-01",
    featured: false,
    newLaunch: true,
    offPlan: true,
    galleryImages: [
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790844456/knc-horizon/projects/bay-grove-dubai-islands/bay-grove-deira-coast-sunset.jpg",
        alt: "The Deira shoreline and its towers at sunset, near Dubai Islands",
        representative: true,
        credit: "Kirandeep Singh Walia / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790844457/knc-horizon/projects/bay-grove-dubai-islands/bay-grove-dubai-coastline.jpg",
        alt: "Dubai's coastline with turquoise water and a sandy beach under a clear sky",
        representative: true,
        credit: "Nelemson G / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790844457/knc-horizon/projects/bay-grove-dubai-islands/bay-grove-beachfront-pools-aerial.jpg",
        alt: "Beachfront pools and gardens on the Dubai shore, aerial view",
        representative: true,
        credit: "The Lazy Artist Gallery / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790844458/knc-horizon/projects/bay-grove-dubai-islands/bay-grove-dubai-coast-aerial.jpg",
        alt: "Aerial view of Dubai's beaches and skyline on a sunny day",
        representative: true,
        credit: "Vika Glitter / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790844458/knc-horizon/projects/bay-grove-dubai-islands/bay-grove-apartment-living-room.jpg",
        alt: "Living room with a beige sofa and a wooden table by a window in a Dubai apartment",
        representative: true,
        credit: "AJ Ahamad / Pexels"
      }
    ]
  },
  {
    id: "sobha-one",
    slug: "sobha-one",
    title: "Sobha One",
    developer: "Sobha Realty",
    location: "Ras Al Khor",
    category: "Apartments",
    status: "Off-plan",
    unitTypes: "1 to 4-bedroom apartments and 4 to 5-bedroom duplexes",
    startingPrice: 0,
    handover: "",
    description: "Five interlinked towers of 30 to 65 storeys by Sobha Realty beside the Ras Al Khor Wildlife Sanctuary, on an 8.5-acre plot with an 18-hole pitch and putt golf course and four themed courtyards.",
    image: "https://res.cloudinary.com/complaintreview/image/upload/v1790577283/knc-horizon/projects/ras-al-khor-towers.jpg",
    coverImageAlt: "Flamingos at Ras Al Khor Wildlife Sanctuary, Dubai, with new high-rise towers beyond the mangroves (representative image)",
    coverImageRepresentative: true,
    coverImageCredit: "Kate Bazhenova83 / Wikimedia Commons",
    gallery: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790844461/knc-horizon/projects/sobha-one/sobha-one-golf-course-skyline.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790844461/knc-horizon/projects/sobha-one/sobha-one-creek-skyline.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790844463/knc-horizon/projects/sobha-one/sobha-one-creek-aerial-dusk.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790844463/knc-horizon/projects/sobha-one/sobha-one-waterside-towers.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790844463/knc-horizon/projects/sobha-one/sobha-one-dubai-skyline-sunset.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790844463/knc-horizon/projects/sobha-one/sobha-one-apartment-city-view.jpg"
    ],
    amenities: [
      "18-hole pitch & putt golf course",
      "Infinity pools",
      "Rooftop terraces",
      "Fitness centres",
      "Themed courtyards",
      "Waterside esplanade with dining"
    ],
    highlights: ["Five towers, 30 to 65 storeys", "8.5-acre plot with four themed courtyards"],
    sourceUrl: "https://www.sobharealty.com/sobha-communities/sobha-one",
    sourceName: "sobharealty.com",
    verifiedOn: "2026-10-01",
    featured: false,
    offPlan: true,
    galleryImages: [
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790844461/knc-horizon/projects/sobha-one/sobha-one-golf-course-skyline.jpg",
        alt: "Golf course fairway with the Dubai skyline blurred in the background",
        representative: true,
        credit: "Khuram Naseem / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790844461/knc-horizon/projects/sobha-one/sobha-one-creek-skyline.jpg",
        alt: "Dubai Creek with the city skyline rising behind it",
        representative: true,
        credit: "MAMADO UAE / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790844463/knc-horizon/projects/sobha-one/sobha-one-creek-aerial-dusk.jpg",
        alt: "Aerial view of Dubai Creek and the surrounding districts at dusk",
        representative: true,
        credit: "Mo Eid / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790844463/knc-horizon/projects/sobha-one/sobha-one-waterside-towers.jpg",
        alt: "A boat on the water with Dubai's towers behind it",
        representative: true,
        credit: "Kirandeep Singh Walia / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790844463/knc-horizon/projects/sobha-one/sobha-one-dubai-skyline-sunset.jpg",
        alt: "Dubai skyline at sunset with modern towers under a dramatic sky",
        representative: true,
        credit: "Walid Ahmad / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790844463/knc-horizon/projects/sobha-one/sobha-one-apartment-city-view.jpg",
        alt: "Bright living room with a panoramic city view through a large window in Dubai",
        representative: true,
        credit: "AJ Ahamad / Pexels"
      }
    ]
  },
  {
    id: "binghatti-circle-jvc",
    slug: "binghatti-circle-jvc",
    title: "Binghatti Circle",
    developer: "Binghatti",
    location: "Jumeirah Village Circle",
    category: "Apartments",
    status: "Off-plan",
    unitTypes: "Studio, 1, 2 and 3-bedroom apartments",
    startingPrice: 674999,
    handover: "Q2 2027",
    description: "A residential tower by Binghatti in Jumeirah Village Circle, described by the developer as the tallest residential tower in JVC, with about 776 studio to three-bedroom apartments.",
    image: "https://res.cloudinary.com/complaintreview/image/upload/v1790577282/knc-horizon/projects/jvc-towers-construction.jpg",
    coverImageAlt: "Apartment towers under construction with tower cranes in Jumeirah Village Circle, Dubai (representative image)",
    coverImageRepresentative: true,
    coverImageCredit: "Ben Koorengevel / Unsplash",
    gallery: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790844458/knc-horizon/projects/binghatti-circle-jvc/binghatti-circle-tower-greenery.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790844458/knc-horizon/projects/binghatti-circle-jvc/binghatti-circle-district-skyline.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790844459/knc-horizon/projects/binghatti-circle-jvc/binghatti-circle-residential-facade.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790844460/knc-horizon/projects/binghatti-circle-jvc/binghatti-circle-balconies.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790844460/knc-horizon/projects/binghatti-circle-jvc/binghatti-circle-apartment-complex.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790844461/knc-horizon/projects/binghatti-circle-jvc/binghatti-circle-apartment-interior.jpg"
    ],
    highlights: [
      "About 776 residences (Binghatti)",
      "Payment plan: 20% down payment, 30% on completion (Binghatti)"
    ],
    sourceUrl: "https://www.binghatti.com/en/projects/binghatti-circle",
    sourceName: "binghatti.com",
    verifiedOn: "2026-10-01",
    featured: false,
    offPlan: true,
    galleryImages: [
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790844458/knc-horizon/projects/binghatti-circle-jvc/binghatti-circle-tower-greenery.jpg",
        alt: "Residential high-rise rising behind pink bougainvillea and greenery in Dubai",
        representative: true,
        credit: "Rehman Ashraf / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790844458/knc-horizon/projects/binghatti-circle-jvc/binghatti-circle-district-skyline.jpg",
        alt: "Dubai high-rises above a leafy residential district, aerial view",
        representative: true,
        credit: "Abid Ali / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790844459/knc-horizon/projects/binghatti-circle-jvc/binghatti-circle-residential-facade.jpg",
        alt: "Modern residential building with orange balcony accents in Dubai",
        representative: true,
        credit: "Subbu Rayan / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790844460/knc-horizon/projects/binghatti-circle-jvc/binghatti-circle-balconies.jpg",
        alt: "Close view of geometric balconies on a modern Dubai apartment building",
        representative: true,
        credit: "San Photography / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790844460/knc-horizon/projects/binghatti-circle-jvc/binghatti-circle-apartment-complex.jpg",
        alt: "Apartment complex against a bright blue sky in Dubai",
        representative: true,
        credit: "aboodi vesakaran / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790844461/knc-horizon/projects/binghatti-circle-jvc/binghatti-circle-apartment-interior.jpg",
        alt: "Compact modern apartment interior with minimalist decor in Dubai",
        representative: true,
        credit: "AJ Ahamad / Pexels"
      }
    ]
  },
  {
    id: "the-valley-by-emaar",
    slug: "the-valley-by-emaar",
    title: "The Valley by Emaar",
    developer: "Emaar",
    location: "Dubai\u2013Al Ain Road",
    category: "Villas & Townhouses",
    status: "New launches",
    unitTypes: "3 to 5-bedroom townhouses and villas",
    startingPrice: 8897888,
    handover: "",
    description: "A family community by Emaar along the Dubai\u2013Al Ain Road, planned around a town centre, a sports village, parks and the Golden Beach, with townhouses and villas released cluster by cluster since 2019.",
    image: "https://res.cloudinary.com/complaintreview/image/upload/v1790577280/knc-horizon/projects/dubai-villa-community-golf-lake.jpg",
    coverImageAlt: "Lake, palm-lined lawns and golf greens with villas around them in a Dubai residential community (representative image)",
    coverImageRepresentative: true,
    coverImageCredit: "Nelemson Guevarra / Unsplash",
    gallery: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790844452/knc-horizon/projects/the-valley-by-emaar/the-valley-townhouse-rows-aerial.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790844452/knc-horizon/projects/the-valley-by-emaar/the-valley-community-lake.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790844453/knc-horizon/projects/the-valley-by-emaar/the-valley-park-fountain.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790844453/knc-horizon/projects/the-valley-by-emaar/the-valley-greenery-aerial.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790844453/knc-horizon/projects/the-valley-by-emaar/the-valley-family-playground.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790844454/knc-horizon/projects/the-valley-by-emaar/the-valley-family-living-room.jpg"
    ],
    amenities: ["Town Centre", "Golden Beach", "Sports Village", "Kids Dale play area", "Pocket parks"],
    highlights: [
      "Launched by Emaar in 2019",
      "The price shown is Emaar's current 'from' price for Ovelle at The Valley (4 to 5 bedrooms)",
      "25 minutes from Dubai International Airport, 8 from Dubai Outlet Mall"
    ],
    sourceUrl: "https://www.emaar.com/en/our-communities/the-valley",
    sourceName: "emaar.com",
    verifiedOn: "2026-10-01",
    featured: false,
    newLaunch: true,
    galleryImages: [
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790844452/knc-horizon/projects/the-valley-by-emaar/the-valley-townhouse-rows-aerial.jpg",
        alt: "Rows of modern townhouses with uniform architecture amid greenery in Dubai, aerial view",
        representative: true,
        credit: "Subbu Rayan / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790844452/knc-horizon/projects/the-valley-by-emaar/the-valley-community-lake.jpg",
        alt: "A calm lake with lawns and trees in a residential district of Dubai",
        representative: true,
        credit: "Alexander Shabanov / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790844453/knc-horizon/projects/the-valley-by-emaar/the-valley-park-fountain.jpg",
        alt: "Park with a fountain, lawns and modern low-rise buildings in Dubai",
        representative: true,
        credit: "Alexander Shabanov / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790844453/knc-horizon/projects/the-valley-by-emaar/the-valley-greenery-aerial.jpg",
        alt: "Tree-lined streets and low-rise homes in Dubai seen from the air",
        representative: true,
        credit: "San Photography / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790844453/knc-horizon/projects/the-valley-by-emaar/the-valley-family-playground.jpg",
        alt: "Colourful children's playground beside apartment buildings in a Dubai residential area",
        representative: true,
        credit: "AJ Ahamad / Pexels"
      },
      {
        url: "https://res.cloudinary.com/complaintreview/image/upload/v1790844454/knc-horizon/projects/the-valley-by-emaar/the-valley-family-living-room.jpg",
        alt: "Family living room with a grey sofa and indoor plants in a Dubai home",
        representative: true,
        credit: "AJ Ahamad / Pexels"
      }
    ]
  }
];
var defaultPosts = [
  {
    id: "where-to-live-in-dubai",
    slug: "where-to-live-in-dubai",
    title: "Where to live in Dubai when the city needs to feel like home",
    excerpt: "A local read on choosing between the energy of Downtown, the water of the Marina, and the space of the suburbs.",
    content: "Dubai rewards a slower first question: how do you want an ordinary Tuesday to feel? From walkable city life to private garden streets, the right community is the one that supports the life you are building.",
    category: "Area guide",
    image: "https://res.cloudinary.com/complaintreview/image/upload/v1790577260/knc-horizon/blog/marina-palm-view.jpg",
    author: "KNC Horizon",
    publishedAt: "2025-01-15T00:00:00.000Z"
  },
  {
    id: "buying-off-plan-in-dubai",
    slug: "buying-off-plan-in-dubai",
    title: "A clear-eyed guide to buying off-plan in Dubai",
    excerpt: "The questions worth asking about a developer, a handover, a payment plan, and the value of a future address.",
    content: "Off-plan property can offer access to a new generation of communities, but the strongest decisions come from context. Understand the developer, the delivery timeline, the surrounding infrastructure, and how the payment plan fits your horizon.",
    category: "Investment",
    image: "https://res.cloudinary.com/complaintreview/image/upload/v1790577259/knc-horizon/blog/dubai-tower-construction-cranes.jpg",
    author: "KNC Horizon",
    publishedAt: "2025-02-01T00:00:00.000Z"
  },
  {
    id: "the-dubai-rental-reset",
    slug: "the-dubai-rental-reset",
    title: "The Dubai rental reset: what tenants should look for now",
    excerpt: "A practical checklist for comparing a home beyond the headline rent.",
    content: "The strongest rental decisions come from looking at the whole year, not only the first month. Consider the building, the commute, the renewal terms, the maintenance response, and the daily ease of the address.",
    category: "Renting",
    image: "https://res.cloudinary.com/complaintreview/image/upload/v1790577259/knc-horizon/blog/dubai-residential-buildings.jpg",
    author: "KNC Horizon",
    publishedAt: "2025-02-14T00:00:00.000Z"
  },
  {
    id: "designing-a-better-home-search",
    slug: "designing-a-better-home-search",
    title: "Designing a better home search",
    excerpt: "The right shortlist is not the longest one. It is the one that makes the decision clearer.",
    content: "A good search begins with a few strong filters and the confidence to remove what does not fit. When the brief reflects how you actually live, the right homes become easier to recognise.",
    category: "Perspective",
    image: "https://res.cloudinary.com/complaintreview/image/upload/v1790577259/knc-horizon/blog/city-walk-residences.jpg",
    author: "KNC Horizon",
    publishedAt: "2025-02-20T00:00:00.000Z"
  }
];
var defaultDevelopers = [
  {
    id: "emaar",
    slug: "emaar",
    name: "Emaar Properties",
    shortDescription: "Dubai-based property developer known for major master-planned communities and residential developments.",
    description: "Emaar Properties is a publicly listed Dubai-based real estate developer established in 1997. The company is responsible for shaping landmark master communities across Dubai, including Downtown Dubai, Dubai Marina, Dubai Hills Estate, and Dubai Creek Harbour.",
    officialWebsite: "https://www.emaar.com",
    website: "https://www.emaar.com",
    published: true,
    featured: true,
    sortOrder: 1,
    areas: ["Downtown Dubai", "Dubai Marina", "Dubai Hills Estate", "Dubai Creek Harbour", "Arabian Ranches"]
  },
  {
    id: "damac",
    slug: "damac",
    name: "DAMAC Properties",
    shortDescription: "Dubai-based property developer with residential, hospitality and branded-development projects.",
    description: "DAMAC Properties was founded in 2002 as a private residential, leisure, and commercial developer in Dubai. The developer is recognised for large-scale master communities including DAMAC Hills and luxury branded residential collaborations.",
    officialWebsite: "https://www.damacproperties.com",
    website: "https://www.damacproperties.com",
    published: true,
    featured: true,
    sortOrder: 2,
    areas: ["Dubai Marina", "Business Bay", "DAMAC Hills", "Dubai Maritime City"]
  },
  {
    id: "sobha-realty",
    slug: "sobha-realty",
    name: "Sobha Realty",
    shortDescription: "Dubai-based developer known for residential communities and its vertically integrated development approach.",
    description: "Sobha Realty is an international luxury developer active in the UAE since 2003. Known for its backward-integrated construction and design model, its flagship Dubai developments include Sobha Hartland and Sobha Hartland II in Mohammed Bin Rashid City.",
    officialWebsite: "https://www.sobharealty.com",
    website: "https://www.sobharealty.com",
    published: true,
    featured: true,
    sortOrder: 3,
    areas: ["Mohammed Bin Rashid City", "Sobha Hartland", "Ras Al Khor", "Dubai Marina"]
  },
  {
    id: "binghatti",
    slug: "binghatti",
    name: "Binghatti",
    shortDescription: "Dubai-based developer with residential and branded developments across several Dubai communities.",
    description: "Binghatti Developers is a Dubai-headquartered property brand recognised for its distinct architectural styling and portfolio of branded residential partnerships across major central and residential districts.",
    officialWebsite: "https://www.binghatti.com",
    website: "https://www.binghatti.com",
    published: true,
    featured: true,
    sortOrder: 4,
    areas: ["Business Bay", "Downtown Dubai", "Jumeirah Village Circle", "Al Jaddaf"]
  },
  {
    id: "nakheel",
    slug: "nakheel",
    name: "Nakheel",
    shortDescription: "Dubai-based master developer known for landmark waterfront destinations and master-planned residential communities.",
    description: "Nakheel is a major Dubai master developer celebrated for landmark coastal projects including Palm Jumeirah and Dubai Islands, alongside extensive family residential master communities throughout the emirate.",
    officialWebsite: "https://www.nakheel.com",
    website: "https://www.nakheel.com",
    published: true,
    featured: true,
    sortOrder: 5,
    areas: ["Palm Jumeirah", "Dubai Islands", "Jumeirah Islands", "Jumeirah Park"]
  },
  {
    id: "danube",
    slug: "danube",
    name: "Danube Properties",
    shortDescription: "Dubai-based property developer focusing on residential developments and private residences across Dubai.",
    description: "Danube Properties is the property development arm of the Danube Group, launched in 2014. The developer focuses on contemporary urban apartments with flexible payment models across established Dubai residential corridors.",
    officialWebsite: "https://www.danubeproperties.com",
    website: "https://www.danubeproperties.com",
    published: true,
    featured: false,
    sortOrder: 6,
    areas: ["Al Furjan", "JLT", "Business Bay", "Arjan"]
  },
  {
    id: "ellington",
    slug: "ellington",
    name: "Ellington Properties",
    shortDescription: "Dubai-based boutique design-led property developer creating residential properties and communities.",
    description: "Ellington Properties, established in 2014, is a design-focused Dubai boutique developer producing high-specification residences across prime and emerging neighbourhoods.",
    officialWebsite: "https://www.ellingtonproperties.ae",
    website: "https://www.ellingtonproperties.ae",
    published: true,
    featured: false,
    sortOrder: 7,
    areas: ["Downtown Dubai", "Palm Jumeirah", "MBR City", "JVC"]
  },
  {
    id: "meraas",
    slug: "meraas",
    name: "Meraas",
    shortDescription: "Dubai-based developer known for destination-led residential, mixed-use, and waterfront communities.",
    description: "Meraas is a Dubai-based master development company with a portfolio of urban and coastal residential destinations including City Walk, Bluewaters Island, and Port de La Mer.",
    officialWebsite: "https://www.meraas.com",
    website: "https://www.meraas.com",
    published: true,
    featured: false,
    sortOrder: 8,
    areas: ["City Walk", "Bluewaters Island", "Port de La Mer", "Jumeirah"]
  }
];

// src/middleware/share-preview.ts
var API = (process.env.SEO_API_URL || "https://knchorizonrealtor.onrender.com/api").replace(/\/+$/, "");
var FRESH_MS = 6e4;
var RETRY_MS = 3e4;
var WAIT_MS = 1200;
var GIVE_UP_MS = 1e4;
var MAX_CACHED = 300;
var FALLBACK_PHOTO = "https://res.cloudinary.com/complaintreview/image/upload/v1790577279/knc-horizon/pages/dubai-skyline-from-sea.jpg";
var cache = /* @__PURE__ */ new Map();
var inFlight = /* @__PURE__ */ new Map();
function remember(path, value, forMs) {
  cache.delete(path);
  cache.set(path, { until: Date.now() + forMs, value });
  if (cache.size > MAX_CACHED) cache.delete(cache.keys().next().value);
}
function ask(path) {
  const running = inFlight.get(path);
  if (running) return running;
  const stop = new AbortController();
  const timer = setTimeout(() => stop.abort(), GIVE_UP_MS);
  const request = fetch(`${API}${path}`, { headers: { accept: "application/json" }, signal: stop.signal }).then(async (response) => {
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`API answered ${response.status}`);
    return response.json();
  }).then((value) => {
    remember(path, value, FRESH_MS);
    return value;
  }).catch(() => {
    const known = cache.get(path)?.value;
    remember(path, known, RETRY_MS);
    return known;
  }).finally(() => {
    clearTimeout(timer);
    inFlight.delete(path);
  });
  inFlight.set(path, request);
  return request;
}
async function api(path, context) {
  const known = cache.get(path);
  if (known && Date.now() < known.until) return known.value;
  const request = ask(path);
  context?.waitUntil?.(request);
  if (known && known.value !== void 0) return known.value;
  const tooLate = new Promise((resolve) => setTimeout(resolve, WAIT_MS));
  const value = await Promise.race([request, tooLate]);
  if (value === void 0 && inFlight.has(path)) remember(path, void 0, RETRY_MS);
  return value;
}
var LIST_PAGES = {
  properties: /* @__PURE__ */ new Set(["sale", "rent", "residential", "commercial", "investment", "off-plan", "filter", "live"]),
  projects: /* @__PURE__ */ new Set(["featured", "new-launches", "off-plan", "filter"])
};
function pageAt(path) {
  const meta = PAGE_META[path] ?? PAGE_META[canonicalPath(path)];
  if (meta) {
    const photo = PAGE_IMAGES[path] ?? PAGE_IMAGES[canonicalPath(path)];
    return { kind: "page", input: async () => ({ title: meta[0], description: meta[1], path, image: photo?.[0], imageAlt: photo?.[1] }) };
  }
  const match = /^\/(properties|property|projects|project|blog|journal|communities|developers)\/([^/]{1,200})$/.exec(path);
  if (!match) return void 0;
  const [, section, slug] = match;
  if (LIST_PAGES[section]?.has(slug)) return void 0;
  const id = encodeURIComponent(slug);
  if (section === "properties" || section === "property") {
    return {
      kind: "property",
      input: async (context) => {
        const data = await api(`/public/properties/${id}`, context);
        const property = data?.property ?? defaultRemoteProperties.find((item) => item.slug === slug || item.id === slug);
        if (!property) return void 0;
        return {
          title: property.title,
          description: propertyDescription(property.title, property.location),
          path: `/properties/${property.slug}`,
          seo: data?.seo ?? null,
          image: property.images?.[0],
          imageAlt: property.title
        };
      }
    };
  }
  if (section === "projects" || section === "project") {
    return {
      kind: "project",
      input: async (context) => {
        const data = await api(`/public/projects/${id}`, context);
        const project = data?.project ?? defaultProjects.find((item) => item.slug === slug || item.id === slug);
        if (!project) return void 0;
        return {
          title: project.title,
          description: projectDescription(project.title, project.location),
          path: `/projects/${project.slug}`,
          seo: data?.seo ?? null,
          image: project.image,
          imageAlt: project.title
        };
      }
    };
  }
  if (section === "blog" || section === "journal") {
    return {
      kind: "article",
      input: async (context) => {
        const data = await api(`/blogs/${id}`, context);
        const post = data?.blog ?? defaultPosts.find((item) => item.slug === slug);
        if (!post) return void 0;
        const customTitle = post.seoTitle && post.seoTitle.trim() !== post.title.trim() ? post.seoTitle : null;
        return {
          title: post.title,
          description: post.excerpt ?? "",
          path: `/blog/${post.slug}`,
          seo: { ...data?.seo ?? {}, seoTitle: customTitle, metaDescription: post.seoDescription || null },
          image: post.featuredImage || post.image || FALLBACK_PHOTO,
          imageAlt: post.title,
          type: "article"
        };
      }
    };
  }
  if (section === "communities") {
    return {
      kind: "community",
      input: async (context) => {
        const data = await api("/public/communities", context);
        const community = data?.communities?.find((item) => item.slug === slug);
        const area = areas.find((item) => item.id === slug);
        const name = community?.name ?? area?.name;
        if (!name) return void 0;
        return {
          title: `${name} property guide`,
          description: community?.description || area?.detail || `Properties and off-plan projects in ${name}, Dubai.`,
          path,
          image: community?.image || area?.image || FALLBACK_PHOTO,
          imageAlt: name
        };
      }
    };
  }
  return {
    kind: "developer",
    input: async (context) => {
      const key = slug.trim().toLowerCase();
      const data = await api(`/developers/${encodeURIComponent(key)}`, context);
      const developer = data?.developer ?? defaultDevelopers.find((item) => item.slug === key);
      if (!developer) return void 0;
      return {
        // The same words as DeveloperDetailPage.
        title: `KNC Horizon Realtor | ${developer.name}`,
        description: developer.shortDescription || developer.description || "Explore verified Dubai developers with KNC Horizon Realtor.",
        path,
        image: developer.coverImage,
        imageAlt: developer.name
      };
    }
  };
}
var shells = /* @__PURE__ */ new Map();
async function appShell(origin) {
  const known = shells.get(origin);
  if (known && Date.now() < known.until) return known.html;
  const stop = new AbortController();
  const timer = setTimeout(() => stop.abort(), 3e3);
  try {
    const response = await fetch(`${origin}/index.html`, { headers: { accept: "text/html" }, signal: stop.signal });
    const html = response.ok ? await response.text() : "";
    if (!html.includes('<div id="root">') || !/<\/head>/i.test(html)) return void 0;
    shells.set(origin, { until: Date.now() + 6e4, html });
    return html;
  } finally {
    clearTimeout(timer);
  }
}
var escaped = (value) => value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function withHead(html, head) {
  let page = html;
  const put = (pattern, tag) => {
    if (pattern.test(page)) page = page.replace(pattern, () => tag);
    else if (tag) page = page.replace(/<\/head>/i, () => `  ${tag}
  </head>`);
  };
  const meta = (attribute, key, content) => put(new RegExp(`<meta\\s+${attribute}="${key}"[^>]*>`, "i"), content ? `<meta ${attribute}="${key}" content="${escaped(content)}" />` : "");
  put(/<title>[^<]*<\/title>/i, `<title>${escaped(head.title)}</title>`);
  meta("name", "description", head.description);
  meta("name", "robots", head.robots);
  put(/<link\s+rel="canonical"[^>]*>/i, `<link rel="canonical" href="${escaped(head.canonical)}" />`);
  meta("property", "og:title", head.ogTitle);
  meta("property", "og:description", head.ogDescription);
  meta("property", "og:type", head.ogType);
  meta("property", "og:url", head.canonical);
  meta("property", "og:image", head.ogImage);
  meta("property", "og:image:alt", head.ogImageAlt);
  meta("name", "twitter:title", head.ogTitle);
  meta("name", "twitter:description", head.ogDescription);
  meta("name", "twitter:image", head.ogImage);
  meta("name", "twitter:image:alt", head.ogImageAlt);
  return page;
}
async function middleware(request, context) {
  try {
    if (request.method !== "GET") return (0, import_middleware.next)();
    const url = new URL(request.url);
    const path = decodeURIComponent(url.pathname).replace(/\/+$/, "") || "/";
    const page = pageAt(path);
    if (!page) return (0, import_middleware.next)();
    const [html, input, site, seo] = await Promise.all([
      appShell(url.origin),
      page.input(context),
      api("/public/settings", context),
      api("/public/seo", context)
    ]);
    if (!html || !input) return (0, import_middleware.next)();
    const ctx = {
      siteName: site?.settings?.siteName?.trim() || "KNC Horizon Realtor",
      siteUrl: seo?.settings?.siteUrl || SITE_URL,
      fallbackDescription: site?.settings?.seoDescription?.trim() || "",
      defaultOgImage: seo?.settings?.defaultOgImage,
      defaultOgImageAlt: seo?.settings?.defaultOgImageAlt
    };
    const fields = input.seo === void 0 ? seo?.pages?.[canonicalPath(input.path)] : input.seo;
    const imageAlt = page.kind === "page" && fields?.ogImage ? void 0 : input.imageAlt;
    const head = resolveHead({ ...input, seo: fields, imageAlt }, ctx);
    return new Response(withHead(html, head), {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=0, must-revalidate",
        // The same three as vercel.json sets on every other response.
        "x-content-type-options": "nosniff",
        "x-frame-options": "SAMEORIGIN",
        "referrer-policy": "strict-origin-when-cross-origin",
        "x-seo-head": page.kind
      }
    });
  } catch {
    return (0, import_middleware.next)();
  }
}
export {
  middleware as default,
  withHead
};

export const config = {
  runtime: 'nodejs',
  matcher: ['/', '/((?!api/|assets/|admin|.*\\.).*)'],
};
