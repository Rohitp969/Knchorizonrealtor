/*
 * End-to-end check of every API the site and the admin console use, against whatever the
 * server is actually serving.
 *
 * CRUD tests create clearly-marked temporary records and delete them again, so nothing
 * fabricated is left in the database.
 *
 *   node scripts/test-api.mjs [baseUrl]
 */
import "dotenv/config";

const BASE = process.argv[2] || "http://localhost:5000/api";
const EMAIL = process.env.ADMIN_EMAIL;
const PASSWORD = process.env.ADMIN_PASSWORD;

let passed = 0;
let failed = 0;
const failures = [];

function check(name, condition, detail = "") {
  if (condition) {
    passed++;
    console.log(`  ok   ${name}`);
  } else {
    failed++;
    failures.push(`${name}${detail ? ` — ${detail}` : ""}`);
    console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

async function api(path, options = {}) {
  const response = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "content-type": "application/json" } : {}),
      ...(options.token ? { authorization: `Bearer ${options.token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
  const text = await response.text();
  let body;
  try { body = text ? JSON.parse(text) : undefined; } catch { body = text; }
  return { status: response.status, body };
}

function section(title) {
  console.log(`\n### ${title}`);
}

/* ---------------- public reads ---------------- */

section("Public content");

const properties = await api("/public/properties?limit=50");
check("GET /public/properties 200", properties.status === 200);
check("returns every published property", properties.body?.properties?.length === 18, `got ${properties.body?.properties?.length}`);
check("pagination block present", typeof properties.body?.pagination?.total === "number");

const first = properties.body?.properties?.[0];
check("property keeps camelCase API shape", Boolean(first?.id && first?.slug && first?.title && Array.isArray(first?.images) && Array.isArray(first?.amenities)),
  first ? Object.keys(first).slice(0, 8).join(",") : "no rows");
check("property id is the 24-hex id from MongoDB", /^[0-9a-f]{24}$/.test(String(first?.id ?? "")), String(first?.id));
check("numeric fields are numbers", typeof first?.price === "number" && typeof first?.bedrooms === "number");

const detail = await api("/public/properties/palm-jumeirah-azure");
check("GET /public/properties/:slug 200", detail.status === 200);
check("detail carries description and images", Boolean(detail.body?.property?.description) && detail.body?.property?.images?.length > 0);

const aliased = await api("/public/properties/azure-house-palm-jumeirah");
check("legacy Azure House slug still resolves", aliased.status === 200 && aliased.body?.property?.slug === "palm-jumeirah-azure");

const missing = await api("/public/properties/not-a-real-listing");
check("unknown property slug is 404", missing.status === 404);

const projects = await api("/public/projects");
check("GET /public/projects 200", projects.status === 200);
check("returns every published project", projects.body?.projects?.length === 7, `got ${projects.body?.projects?.length}`);
check("project keeps startingPrice/handover", typeof projects.body?.projects?.[0]?.startingPrice === "number" && typeof projects.body?.projects?.[0]?.handover === "string");

const featuredProjects = await api("/public/projects?featured=true");
check("GET /public/projects?featured=true filters", featuredProjects.status === 200 && featuredProjects.body.projects.every((p) => p.featured === true));

const projectDetail = await api("/public/projects/the-oasis-by-emaar");
check("GET /public/projects/:slug 200", projectDetail.status === 200 && projectDetail.body?.project?.slug === "the-oasis-by-emaar");

const developers = await api("/public/developers");
check("GET /public/developers 200", developers.status === 200);
check("returns every published developer", developers.body?.developers?.length === 8, `got ${developers.body?.developers?.length}`);
check("developer areas survive as an array", Array.isArray(developers.body?.developers?.[0]?.areas));

const devAlias = await api("/developers");
check("GET /developers alias 200", devAlias.status === 200 && devAlias.body?.developers?.length === 8);

const emaar = await api("/developers/emaar");
check("GET /developers/:slug 200", emaar.status === 200);
check("developer profile resolves its projects", Array.isArray(emaar.body?.projects) && emaar.body.projects.length > 0, `got ${emaar.body?.projects?.length}`);
check("developer projects all belong to Emaar", (emaar.body?.projects ?? []).every((p) => /emaar/i.test(p.developer)));

const byName = await api("/developers/Emaar%20Properties");
check("developer lookup by name works", byName.status === 200 && byName.body?.developer?.slug === "emaar");

const blog = await api("/public/blog");
check("GET /public/blog 200", blog.status === 200 && blog.body?.posts?.length === 5, `got ${blog.body?.posts?.length}`);

const blogs = await api("/blogs");
check("GET /blogs alias 200", blogs.status === 200 && blogs.body?.blogs?.length === 5);

const blogDetail = await api("/blogs/where-to-live-in-dubai");
check("GET /blogs/:slug 200", blogDetail.status === 200 && blogDetail.body?.blog?.slug === "where-to-live-in-dubai");
check("blog returns up to three related posts", Array.isArray(blogDetail.body?.related) && blogDetail.body.related.length === 3, `got ${blogDetail.body?.related?.length}`);
check("related posts exclude the post itself", (blogDetail.body?.related ?? []).every((p) => p.slug !== "where-to-live-in-dubai"));
check("publishedAt survives as a date", Boolean(Date.parse(String(blogDetail.body?.blog?.publishedAt))));

const blogSearch = await api("/public/blog?q=dubai");
check("blog text search works", blogSearch.status === 200 && blogSearch.body.posts.length > 0);

const gallery = await api("/public/gallery");
check("GET /public/gallery 200", gallery.status === 200 && gallery.body?.gallery?.length === 25, `got ${gallery.body?.gallery?.length}`);

const testimonials = await api("/public/testimonials");
check("GET /public/testimonials 200", testimonials.status === 200 && testimonials.body?.testimonials?.length === 5);

const communities = await api("/public/communities");
check("GET /public/communities 200", communities.status === 200 && communities.body?.communities?.length === 6);

const communityDetail = await api(`/public/communities/${communities.body.communities[0].slug}`);
check("GET /public/communities/:slug 200", communityDetail.status === 200);

const insights = await api("/public/insights");
check("GET /public/insights 200", insights.status === 200 && insights.body?.insights?.length === 6);

/* ---------------- property search ---------------- */

section("Property search (Buy / Rent / Off-Plan)");

const filters = await api("/public/property-filters");
check("GET /public/property-filters 200", filters.status === 200);
const listings = filters.body?.listings ?? [];
check("one row per published property and project", listings.length === 25, `got ${listings.length}`);

const buy = listings.filter((row) => row.mode === "buy");
const rent = listings.filter((row) => row.mode === "rent");
const offplan = listings.filter((row) => row.mode === "offplan");
check("Buy rows present", buy.length > 0, `${buy.length}`);
check("Rent rows present", rent.length > 0, `${rent.length}`);
check("Off-Plan rows present", offplan.length === 7, `${offplan.length}`);
check("rent detection falls back to status text", rent.length === 6, `${rent.length} rent rows`);
check("every row carries a location", listings.every((row) => typeof row.location === "string"));
check("buy/rent rows carry type and beds", [...buy, ...rent].every((row) => typeof row.type === "string" && typeof row.beds === "number"));
check("off-plan rows carry developer, project and handover", offplan.every((row) => typeof row.developer === "string" && typeof row.project === "string" && typeof row.handover === "string"));
check("every row carries a numeric price", listings.every((row) => typeof row.price === "number"));

// Server-side filters used by the listing pages.
const byLocation = await api(`/public/properties?community=${encodeURIComponent("Business Bay")}&limit=50`);
check("filter by Location (community)", byLocation.status === 200 && byLocation.body.properties.length > 0 && byLocation.body.properties.every((p) => p.community === "Business Bay"), `got ${byLocation.body?.properties?.length}`);

const byType = await api("/public/properties?type=Apartment&limit=50");
check("filter by Property Type", byType.status === 200 && byType.body.properties.length > 0 && byType.body.properties.every((p) => p.type === "Apartment" || p.propertyType === "Apartment"));

const byListing = await api("/public/properties?listingType=rent&limit=50");
check("filter by listing type (Rent)", byListing.status === 200 && byListing.body.properties.every((p) => p.listingType === "rent"));

const byBudget = await api("/public/properties?minPrice=1000000&maxPrice=5000000&limit=50");
check("filter by Budget range", byBudget.status === 200 && byBudget.body.properties.every((p) => p.price >= 1000000 && p.price <= 5000000), `got ${byBudget.body?.properties?.length}`);

const byBeds = await api("/public/properties?bedrooms=3&limit=50");
check("filter by Bedrooms (>=)", byBeds.status === 200 && byBeds.body.properties.every((p) => p.bedrooms >= 3), `got ${byBeds.body?.properties?.length}`);

const byQuery = await api("/public/properties?q=marina&limit=50");
check("free-text search matches title/location/community", byQuery.status === 200 && byQuery.body.properties.length > 0 && byQuery.body.properties.every((p) => /marina/i.test(`${p.title} ${p.location} ${p.community}`)));

const sortedAsc = await api("/public/properties?sort=price-asc&limit=50");
const prices = sortedAsc.body?.properties?.map((p) => p.price) ?? [];
check("sort=price-asc orders by price", prices.every((price, index) => index === 0 || prices[index - 1] <= price));

const paged = await api("/public/properties?limit=5&page=2");
check("pagination returns the second page", paged.status === 200 && paged.body.properties.length === 5 && paged.body.pagination.page === 2);

const featuredOnly = await api("/public/properties?featured=true&limit=50");
check("featured filter", featuredOnly.status === 200 && featuredOnly.body.properties.every((p) => p.featured === true));

/* ---------------- leads ---------------- */

section("Leads");

const stamp = Date.now();
const inquiry = await api("/inquiries", {
  method: "POST",
  body: JSON.stringify({
    name: "Migration Test",
    email: `migration-test-${stamp}@example.com`,
    phone: "+971500000000",
    interest: "Buy a property",
    message: "Automated migration test — safe to delete.",
    propertySlug: "palm-jumeirah-azure",
    inquiryType: "property",
  }),
});
check("POST /inquiries 201", inquiry.status === 201, JSON.stringify(inquiry.body).slice(0, 160));
check("inquiry links to the property it names", inquiry.body?.inquiry?.property != null, String(inquiry.body?.inquiry?.property));
const inquiryId = inquiry.body?.inquiry?.id;

const badInquiry = await api("/inquiries", { method: "POST", body: JSON.stringify({ name: "x" }) });
check("POST /inquiries rejects an incomplete body", badInquiry.status === 400);

const testEmail = `migration-test-${stamp}@example.com`;
const newsletter = await api("/newsletter", { method: "POST", body: JSON.stringify({ email: testEmail }) });
check("POST /newsletter 201", newsletter.status === 201);
const newsletterAgain = await api("/newsletter", { method: "POST", body: JSON.stringify({ email: testEmail }) });
check("POST /newsletter is idempotent for a known address", newsletterAgain.status === 200);

/* ---------------- auth + admin ---------------- */

section("Authentication");

const unauthorised = await api("/admin/dashboard");
check("admin routes reject an anonymous request", unauthorised.status === 401);

const badLogin = await api("/auth/login", { method: "POST", body: JSON.stringify({ email: EMAIL, password: "wrong-password" }) });
check("login rejects a wrong password", badLogin.status === 401);

const login = await api("/auth/login", { method: "POST", body: JSON.stringify({ email: EMAIL, password: PASSWORD }) });
check("POST /auth/login 200", login.status === 200, JSON.stringify(login.body).slice(0, 120));
const token = login.body?.token;
check("login returns a token and an admin user", Boolean(token) && login.body?.user?.role === "admin");
check("migrated bcrypt hashes still verify", Boolean(token));

const me = await api("/auth/me", { token });
check("GET /auth/me 200", me.status === 200 && me.body?.user?.role === "admin");

section("Admin");

const dashboard = await api("/admin/dashboard", { token });
check("GET /admin/dashboard 200", dashboard.status === 200);
const counts = dashboard.body?.counts ?? {};
check("dashboard counts match the migrated data",
  counts.properties === 18 && counts.projects === 7 && counts.developers === 8 && counts.communities === 6 && counts.posts === 5 && counts.insights === 6 && counts.gallery === 25,
  JSON.stringify(counts));
check("dashboard splits sale and rent", counts.forSale > 0 && counts.forRent > 0, `sale=${counts.forSale} rent=${counts.forRent}`);
check("dashboard counts commercial by type", typeof counts.commercial === "number");
check("recent inquiries returned", Array.isArray(dashboard.body?.recentInquiries));

const adminInquiries = await api("/admin/inquiries", { token });
check("GET /admin/inquiries 200", adminInquiries.status === 200 && adminInquiries.body.inquiries.length >= 11);

if (inquiryId) {
  const patched = await api(`/admin/inquiries/${inquiryId}`, { token, method: "PATCH", body: JSON.stringify({ status: "contacted" }) });
  check("PATCH /admin/inquiries/:id updates status", patched.status === 200 && patched.body?.inquiry?.status === "contacted");
}

const adminUsers = await api("/admin/users", { token });
check("GET /admin/users 200", adminUsers.status === 200 && adminUsers.body.users.length === 2);
check("user list never exposes a password hash", (adminUsers.body?.users ?? []).every((user) => user.passwordHash === undefined));

for (const [label, path, expected] of [
  ["properties-list", "/admin/properties-list", 18],
  ["projects-list", "/admin/projects-list", 7],
  ["blog", "/admin/blog", 5],
  ["gallery-list", "/admin/gallery-list", 25],
  ["communities-list", "/admin/communities-list", 6],
  ["insights-list", "/admin/insights-list", 6],
  ["developers-detail", "/admin/developers-detail", 8],
  ["media", "/admin/media", 0],
]) {
  const response = await api(path, { token });
  const rows = response.body?.items ?? response.body?.posts ?? response.body?.developers ?? [];
  check(`GET ${path}`, response.status === 200 && rows.length === expected, `got ${rows.length}`);
}

const devDetail = await api("/admin/developers-detail", { token });
const emaarDetail = (devDetail.body?.items ?? []).find((dev) => dev.slug === "emaar");
check("developers-detail reports assigned projects", (emaarDetail?.projectCount ?? 0) > 0, `emaar projectCount=${emaarDetail?.projectCount}`);

/*
 * Generic resource routes used by the admin resource manager. `users` is deliberately not in
 * this list: Express matches the specific /admin/users route first and answers with {users},
 * which is what it did before the migration too, and the console reads that shape.
 */
for (const resource of ["properties", "projects", "posts", "gallery", "testimonials", "developers", "communities", "insights", "subscribers"]) {
  const response = await api(`/admin/${resource}`, { token });
  check(`GET /admin/${resource} (generic)`, response.status === 200 && Array.isArray(response.body?.items), `status ${response.status}`);
}
const usersGeneric = await api("/admin/users", { token });
check("GET /admin/users keeps its {users} shape", usersGeneric.status === 200 && Array.isArray(usersGeneric.body?.users));

const unknownResource = await api("/admin/not-a-resource", { token });
check("unknown admin resource is 404", unknownResource.status === 404);

const badId = await api("/admin/properties/not-an-id", { token, method: "DELETE" });
check("malformed id is rejected with 400", badId.status === 400);

/* ---------------- admin CRUD round trips ---------------- */

section("Admin CRUD (temporary records, removed afterwards)");

const created = {};

// Property
const propCreate = await api("/admin/properties", {
  token, method: "POST",
  body: JSON.stringify({
    title: "ZZ Migration Check", slug: `zz-migration-check-${stamp}`, location: "Test Location",
    community: "Test Community", type: "Apartment", listingType: "rent", status: "For rent",
    price: 123456, currency: "AED", bedrooms: 2, bathrooms: 2, size: 900,
    description: "Temporary record created by the migration test.",
    images: ["/images/dubai-skyline-from-sea.jpg"], amenities: ["Pool"], published: false, featured: false,
  }),
});
check("POST /admin/properties 201", propCreate.status === 201, JSON.stringify(propCreate.body).slice(0, 160));
created.property = propCreate.body?.item?.id;
check("created property round-trips its arrays", Array.isArray(propCreate.body?.item?.images) && propCreate.body.item.images[0] === "/images/dubai-skyline-from-sea.jpg");
check("created property keeps listingType", propCreate.body?.item?.listingType === "rent");

const propUpdate = await api(`/admin/properties/${created.property}`, {
  token, method: "PUT",
  body: JSON.stringify({ title: "ZZ Migration Check Updated", slug: `zz-migration-check-${stamp}`, price: 654321, bedrooms: 3, published: true }),
});
check("PUT /admin/properties/:id 200", propUpdate.status === 200 && propUpdate.body?.item?.title === "ZZ Migration Check Updated");
check("update preserves untouched fields", propUpdate.body?.item?.community === "Test Community" && propUpdate.body?.item?.listingType === "rent");
check("update applies the changed fields", propUpdate.body?.item?.price === 654321 && propUpdate.body?.item?.bedrooms === 3);

const publishedNow = await api(`/public/properties/zz-migration-check-${stamp}`);
check("published property becomes publicly visible", publishedNow.status === 200);

// Project, including the developer link
const projCreate = await api("/admin/projects", {
  token, method: "POST",
  body: JSON.stringify({
    title: "ZZ Migration Project", slug: `zz-migration-project-${stamp}`,
    description: "Temporary record created by the migration test.",
    developer: "Emaar Properties", location: "Test Location", category: "Apartments",
    status: "Launching", startingPrice: 1000000, handover: "Q4 2030",
    image: "/images/dubai-skyline-from-sea.jpg", published: false,
  }),
});
check("POST /admin/projects 201", projCreate.status === 201, JSON.stringify(projCreate.body).slice(0, 160));
created.project = projCreate.body?.item?.id;
check("new project links to its developer profile", projCreate.body?.item?.developerSlug === "emaar", String(projCreate.body?.item?.developerSlug));

const projUpdate = await api(`/admin/projects/${created.project}`, {
  token, method: "PUT",
  body: JSON.stringify({ title: "ZZ Migration Project", slug: `zz-migration-project-${stamp}`, developer: "Nakheel", category: "Villas" }),
});
check("PUT /admin/projects/:id re-links the developer", projUpdate.status === 200 && projUpdate.body?.item?.developerSlug === "nakheel", String(projUpdate.body?.item?.developerSlug));
check("project keeps its category edit", projUpdate.body?.item?.category === "Villas");

// Blog post
const postCreate = await api("/admin/blog", {
  token, method: "POST",
  body: JSON.stringify({ title: "ZZ Migration Note", slug: `zz-migration-note-${stamp}`, content: "Temporary record.", excerpt: "Temp", category: "General", status: "draft" }),
});
check("POST /admin/blog 201", postCreate.status === 201, JSON.stringify(postCreate.body).slice(0, 160));
created.post = postCreate.body?.post?.id;
check("draft post is not published", postCreate.body?.post?.published === false);

const postPublish = await api(`/admin/blog/${created.post}`, { token, method: "PATCH", body: JSON.stringify({ title: "ZZ Migration Note", slug: `zz-migration-note-${stamp}`, content: "Temporary record.", status: "published" }) });
check("PATCH /admin/blog/:id publishes", postPublish.status === 200 && postPublish.body?.post?.published === true);

// Developer
const devCreate = await api("/admin/developers", {
  token, method: "POST",
  body: JSON.stringify({ name: "ZZ Migration Developer", description: "Temporary record.", areas: "Area One, Area Two", published: false }),
});
check("POST /admin/developers 201", devCreate.status === 201, JSON.stringify(devCreate.body).slice(0, 160));
created.developer = devCreate.body?.item?.id;
check("developer areas parse from a comma list", Array.isArray(devCreate.body?.item?.areas) && devCreate.body.item.areas.length === 2);
check("developer slug is generated", devCreate.body?.item?.slug === "zz-migration-developer");

const devUpdate = await api(`/admin/developers/${created.developer}`, { token, method: "PUT", body: JSON.stringify({ name: "ZZ Migration Developer", sortOrder: 99, featured: true }) });
check("PUT /admin/developers/:id 200", devUpdate.status === 200 && devUpdate.body?.item?.sortOrder === 99 && devUpdate.body?.item?.featured === true);

// Community
const commCreate = await api("/admin/communities", { token, method: "POST", body: JSON.stringify({ name: "ZZ Migration Community", description: "Temporary record.", published: false }) });
check("POST /admin/communities 201", commCreate.status === 201, JSON.stringify(commCreate.body).slice(0, 160));
created.community = commCreate.body?.item?.id;

const commUpdate = await api(`/admin/communities/${created.community}`, { token, method: "PUT", body: JSON.stringify({ name: "ZZ Migration Community", description: "Updated.", published: false, sortOrder: 5 }) });
check("PUT /admin/communities/:id 200", commUpdate.status === 200 && commUpdate.body?.item?.description === "Updated.");

// Insight
const insCreate = await api("/admin/insights", { token, method: "POST", body: JSON.stringify({ title: "ZZ Migration Insight", summary: "Temp", content: "Temporary record.", published: false }) });
check("POST /admin/insights 201", insCreate.status === 201, JSON.stringify(insCreate.body).slice(0, 160));
created.insight = insCreate.body?.item?.id;

const insUpdate = await api(`/admin/insights/${created.insight}`, { token, method: "PUT", body: JSON.stringify({ title: "ZZ Migration Insight", summary: "Updated", content: "Temporary record.", published: false }) });
check("PUT /admin/insights/:id 200", insUpdate.status === 200 && insUpdate.body?.item?.summary === "Updated");

// Gallery
const galCreate = await api("/admin/gallery", { token, method: "POST", body: JSON.stringify({ title: "ZZ Migration Image", image: "/images/dubai-skyline-from-sea.jpg", category: "Test" }) });
check("POST /admin/gallery 201", galCreate.status === 201, JSON.stringify(galCreate.body).slice(0, 160));
created.gallery = galCreate.body?.item?.id;

const galUpdate = await api(`/admin/gallery/${created.gallery}`, { token, method: "PUT", body: JSON.stringify({ title: "ZZ Migration Image 2", image: "/images/dubai-skyline-from-sea.jpg", category: "Test" }) });
check("PUT /admin/gallery/:id 200", galUpdate.status === 200 && galUpdate.body?.item?.title === "ZZ Migration Image 2");

/* ---------------- cleanup ---------------- */

section("Cleanup (temporary records removed)");

const deletions = [
  ["/admin/properties", created.property],
  ["/admin/projects", created.project],
  ["/admin/blog", created.post],
  ["/admin/developers", created.developer],
  ["/admin/communities", created.community],
  ["/admin/insights", created.insight],
  ["/admin/gallery", created.gallery],
];
for (const [path, id] of deletions) {
  if (!id) { check(`DELETE ${path}/:id (no record created)`, false); continue; }
  const response = await api(`${path}/${id}`, { token, method: "DELETE" });
  check(`DELETE ${path}/:id 204`, response.status === 204, `status ${response.status}`);
}

if (inquiryId) {
  const response = await api(`/admin/inquiries/${inquiryId}`, { token, method: "DELETE" });
  check("DELETE /admin/inquiries/:id 204", response.status === 204);
}

// The newsletter signup this suite made has to go too, or repeated runs leave rows behind.
const subscribers = await api("/admin/subscribers", { token });
const subscriber = (subscribers.body?.items ?? []).find((row) => row.email === testEmail);
if (subscriber) {
  const response = await api(`/admin/subscribers/${subscriber.id}`, { token, method: "DELETE" });
  check("DELETE /admin/subscribers/:id 204", response.status === 204);
} else {
  check("test newsletter signup is findable for cleanup", false, "not found in /admin/subscribers");
}

// Nothing this suite created may survive it.
const leftoverInquiries = await api("/admin/inquiries", { token });
check("no test enquiry left behind", !(leftoverInquiries.body?.inquiries ?? []).some((row) => String(row.email).startsWith("migration-test-")));
const leftoverSubscribers = await api("/admin/subscribers", { token });
check("no test subscriber left behind", !(leftoverSubscribers.body?.items ?? []).some((row) => String(row.email).startsWith("migration-test-")));

const afterCleanup = await api("/public/properties?limit=50");
check("public property count is back to the migrated total", afterCleanup.body?.properties?.length === 18, `got ${afterCleanup.body?.properties?.length}`);

const projectsAfter = await api("/public/projects");
check("public project count is back to the migrated total", projectsAfter.body?.projects?.length === 7);

const developersAfter = await api("/public/developers");
check("public developer count is back to the migrated total", developersAfter.body?.developers?.length === 8);

/* ---------------- result ---------------- */

console.log(`\n==================================`);
console.log(`passed ${passed}   failed ${failed}`);
if (failures.length) {
  console.log("\nFailures:");
  for (const failure of failures) console.log(`  - ${failure}`);
}
process.exitCode = failed === 0 ? 0 : 1;
