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
    id: "palm-jumeirah-azure",
    slug: "palm-jumeirah-azure",
    title: "Azure House",
    location: "Frond M, Palm Jumeirah",
    community: "Palm Jumeirah",
    type: "Villa",
    status: "For sale",
    price: 245e5,
    currency: "AED",
    bedrooms: 5,
    bathrooms: 7,
    size: 8420,
    description: "A private waterfront villa shaped around quiet mornings, generous entertaining, and direct access to the water.",
    images: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790577289/knc-horizon/properties/palm-jumeirah-frond-villas.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790589063/knc-horizon/properties/dubai-villa-lap-pool-deck.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790589063/knc-horizon/properties/dubai-villa-pool-terrace-lounge.jpg"
    ],
    amenities: ["Private beach", "Infinity pool", "Staff suite", "Sea views"],
    featured: true,
    published: true
  },
  {
    id: "meridian-residence-dubai-marina",
    slug: "meridian-residence-dubai-marina",
    title: "The Meridian Residence",
    location: "Dubai Marina",
    community: "Dubai Marina",
    type: "Penthouse",
    status: "For sale",
    price: 89e5,
    currency: "AED",
    bedrooms: 3,
    bathrooms: 4,
    size: 2980,
    description: "A turnkey skyline residence with a wide marina outlook and a considered, light-filled interior.",
    images: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790585306/knc-horizon/properties/dubai-penthouse-living-room.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790585306/knc-horizon/properties/dubai-penthouse-dining-room.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790585306/knc-horizon/properties/dubai-penthouse-master-bedroom.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790581630/knc-horizon/properties/dubai-marina-night-view-high-floor.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790581635/knc-horizon/properties/dubai-marina-canal-window-view.jpg"
    ],
    amenities: ["Sea view", "Concierge", "Residents lounge", "Private lift"],
    featured: true,
    published: true
  },
  {
    id: "courtyard-17-dubai-hills",
    slug: "courtyard-17-dubai-hills",
    title: "Courtyard 17",
    location: "Dubai Hills Estate",
    community: "Dubai Hills Estate",
    type: "Villa",
    status: "For sale",
    price: 1175e4,
    currency: "AED",
    bedrooms: 4,
    bathrooms: 5,
    size: 4870,
    description: "A calm contemporary family home on a quiet street, with garden rooms that bring the outside in.",
    images: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790577284/knc-horizon/properties/dubai-contemporary-villa.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790589060/knc-horizon/properties/dubai-modern-villa-garage-front.jpg"
    ],
    amenities: ["Private garden", "Study", "Garage", "Community pool"],
    featured: false,
    published: true
  },
  {
    id: "address-sky-view-downtown",
    slug: "address-sky-view-downtown",
    title: "The Address Sky View",
    location: "Downtown Dubai",
    community: "Downtown Dubai",
    type: "Apartment",
    status: "For sale",
    price: 425e4,
    currency: "AED",
    bedrooms: 2,
    bathrooms: 3,
    size: 1640,
    description: "A polished city apartment with Burj Khalifa views and the service of one of Downtown\u2019s most recognisable addresses.",
    images: [
      "https://res.cloudinary.com/complaintreview/image/upload/v1790590503/knc-horizon/properties/downtown-dubai-apartment-living-dining.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790590505/knc-horizon/properties/downtown-dubai-balcony-burj-khalifa.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790590504/knc-horizon/properties/downtown-dubai-apartment-twin-bedroom.jpg",
      "https://res.cloudinary.com/complaintreview/image/upload/v1790577283/knc-horizon/properties/address-sky-view-night.jpg"
    ],
    amenities: ["Burj view", "Valet parking", "Pool", "Fitness studio"],
    featured: false,
    published: true
  }
];
var defaultProjects = [
  {
    id: "the-oasis-by-emaar",
    slug: "the-oasis-by-emaar",
    title: "The Oasis",
    developer: "Emaar",
    location: "Dubailand",
    startingPrice: 55e5,
    handover: "Q4 2028",
    description: "A low-density collection of villas and gardens designed around water, landscape, and long-term liveability.",
    image: "https://res.cloudinary.com/complaintreview/image/upload/v1790577282/knc-horizon/projects/jumeirah-islands-lakeside-villas.jpg",
    featured: true
  },
  {
    id: "bay-by-cavalli",
    slug: "bay-by-cavalli",
    title: "Bay by Cavalli",
    developer: "DAMAC",
    location: "Dubai Maritime City",
    startingPrice: 32e5,
    handover: "Q2 2028",
    description: "A waterfront address for buyers looking for a distinctive design language, resort amenities, and a central coastal position.",
    image: "https://res.cloudinary.com/complaintreview/image/upload/v1790577282/knc-horizon/projects/port-rashid-waterfront.jpg",
    featured: true
  },
  {
    id: "the-valley-by-emaar",
    slug: "the-valley-by-emaar",
    title: "The Valley",
    developer: "Emaar",
    location: "Jebel Ali",
    category: "Villas",
    status: "Launching",
    startingPrice: 29e5,
    handover: "Q1 2029",
    description: "A new collection of family villas set around open landscapes, trails, and everyday community life.",
    image: "https://res.cloudinary.com/complaintreview/image/upload/v1790577280/knc-horizon/projects/dubai-villa-community-golf-lake.jpg",
    featured: false
  },
  {
    id: "sobha-one",
    slug: "sobha-one",
    title: "Sobha One",
    developer: "Sobha Realty",
    location: "Ras Al Khor",
    category: "Apartments",
    status: "Under construction",
    startingPrice: 21e5,
    handover: "Q4 2028",
    description: "A golf-side vertical neighbourhood with generous views, thoughtful amenities, and a strong central position.",
    image: "https://res.cloudinary.com/complaintreview/image/upload/v1790577283/knc-horizon/projects/ras-al-khor-towers.jpg",
    featured: false
  },
  {
    id: "avenue-al-jaddaf",
    slug: "avenue-al-jaddaf",
    title: "Avenue",
    developer: "Azizi",
    location: "Al Jaddaf",
    category: "Waterfront",
    status: "Launching",
    startingPrice: 125e4,
    handover: "Q3 2027",
    description: "A compact waterfront address for buyers seeking access, amenity, and a considered entry into the Dubai market.",
    image: "https://res.cloudinary.com/complaintreview/image/upload/v1790577281/knc-horizon/projects/jaddaf-waterfront.jpg",
    featured: false
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
