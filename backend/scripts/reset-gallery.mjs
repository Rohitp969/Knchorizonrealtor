/*
 * reset-gallery.mjs
 *
 * Replaces all non-real-estate demo/seed gallery records with premium
 * Dubai real-estate focused gallery items.
 *
 * Safe to run multiple times: it checks for existing titles before inserting.
 * All images are already uploaded to the project's Cloudinary account under
 * knc-horizon/ and are used under their original licences (Unsplash, Pexels,
 * Wikimedia CC0 / Public Domain).
 *
 * Usage:
 *   cd backend
 *   node scripts/reset-gallery.mjs
 *
 * Requires DATABASE_URL in backend/.env (or the environment).
 */

import "dotenv/config";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL must be set.");

const client = new pg.Client({
  connectionString,
  ssl: process.env.DATABASE_SSL_CA
    ? { ca: process.env.DATABASE_SSL_CA, rejectUnauthorized: true }
    : { rejectUnauthorized: false },
});

await client.connect();

try {
  // ── 1. Remove all old non-real-estate gallery records ──────────────────────
  //
  // Targets every title/category combination belonging to heritage, tourism,
  // nature or any other non-property theme.
  //
  const nonRealEstateTitles = [
    "The Spice Souk",
    "Spice Souk",
    "Abras on Dubai Creek",
    "Abras on the Creek",
    "Jumeirah Mosque",
    "Desert dunes",
    "Desert Dunes",
    "Jumeira Public Beach",
    "Jumeirah Public Beach",
    "Beachfront gardens",
    "The Dubai Metro",
    "Dubai Metro",
    "Dubai Miracle Garden",
    "Miracle Garden",
    "Hatta",
    "Desert",
    "The Spice Market",
  ];

  const nonRealEstateCategories = [
    "Heritage",
    "Landscapes",
    "Nature",
    "Tourism",
    "Culture",
    "Leisure",
  ];

  for (const title of nonRealEstateTitles) {
    const result = await client.query(
      "DELETE FROM gallery WHERE lower(title) = lower($1)",
      [title],
    );
    if (result.rowCount > 0) {
      console.log(`  Deleted ${result.rowCount} row(s) — title: "${title}"`);
    }
  }

  for (const cat of nonRealEstateCategories) {
    const result = await client.query(
      "DELETE FROM gallery WHERE lower(category) = lower($1)",
      [cat],
    );
    if (result.rowCount > 0) {
      console.log(`  Deleted ${result.rowCount} row(s) — category: "${cat}"`);
    }
  }

  // ── 2. Insert the new real-estate gallery items ────────────────────────────
  const newItems = [
    // Palm Jumeirah
    {
      title: "The Palm from Above",
      category: "Palm Jumeirah",
      image: "https://res.cloudinary.com/complaintreview/image/upload/v1790577261/knc-horizon/communities/palm-jumeirah-aerial.jpg",
      image_public_id: "knc-horizon/communities/palm-jumeirah-aerial",
      alt: "Aerial view of Palm Jumeirah and its fronds — Dubai's iconic palm-shaped island with luxury waterfront residences and villas",
    },
    {
      title: "Palm Jumeirah Beach & Shoreline",
      category: "Palm Jumeirah",
      image: "https://res.cloudinary.com/complaintreview/image/upload/v1790853403/knc-horizon/projects/como-residences/como-residences-palm-jumeirah-beach-and-shoreline.jpg",
      image_public_id: "knc-horizon/projects/como-residences/como-residences-palm-jumeirah-beach-and-shoreline",
      alt: "Sandy beach with palm trees and luxury shoreline apartments on Palm Jumeirah, Dubai",
    },
    {
      title: "Palm Jumeirah — The Road In",
      category: "Palm Jumeirah",
      image: "https://res.cloudinary.com/complaintreview/image/upload/v1790577264/knc-horizon/developers/palm-jumeirah-avenue.jpg",
      image_public_id: "knc-horizon/developers/palm-jumeirah-avenue",
      alt: "Palm-lined avenue leading onto Palm Jumeirah under a clear blue sky — the gateway to Dubai's most exclusive addresses",
    },

    // Dubai Skyline
    {
      title: "Burj Khalifa — Icon of Dubai",
      category: "Dubai Skyline",
      image: "https://res.cloudinary.com/complaintreview/image/upload/v1790577267/knc-horizon/hero/burj-khalifa-aerial.jpg",
      image_public_id: "knc-horizon/hero/burj-khalifa-aerial",
      alt: "The Burj Khalifa rising above the Downtown Dubai skyline — the world's tallest tower surrounded by premium residential and commercial real estate",
    },
    {
      title: "Business Bay at Night",
      category: "Dubai Skyline",
      image: "https://res.cloudinary.com/complaintreview/image/upload/v1790577261/knc-horizon/communities/hero-dubai-skyline.jpg",
      image_public_id: "knc-horizon/communities/hero-dubai-skyline",
      alt: "Business Bay towers and the Burj Khalifa illuminated at night, reflected in still water — Dubai's premium business and residential district",
    },
    {
      title: "Dubai Marina at Night",
      category: "Dubai Skyline",
      image: "https://res.cloudinary.com/complaintreview/image/upload/v1790844454/knc-horizon/projects/bay-by-cavalli/bay-by-cavalli-marina-night.jpg",
      image_public_id: "knc-horizon/projects/bay-by-cavalli/bay-by-cavalli-marina-night",
      alt: "Yachts moored in Dubai Marina at night beneath illuminated luxury residential towers — one of Dubai's most sought-after waterfront addresses",
    },
    {
      title: "Downtown Dubai Skyline",
      category: "Dubai Skyline",
      image: "https://res.cloudinary.com/complaintreview/image/upload/v1790853408/knc-horizon/projects/bayz-101/bayz-101-canal-skyline-at-night.jpg",
      image_public_id: "knc-horizon/projects/bayz-101/bayz-101-canal-skyline-at-night",
      alt: "Illuminated towers and the Burj Khalifa reflected in the water at night — Downtown Dubai's iconic residential and commercial skyline",
    },

    // Luxury Villas
    {
      title: "Lakeside Villa Community",
      category: "Luxury Villas",
      image: "https://res.cloudinary.com/complaintreview/image/upload/v1790577280/knc-horizon/projects/dubai-villa-community-golf-lake.jpg",
      image_public_id: "knc-horizon/projects/dubai-villa-community-golf-lake",
      alt: "Lake, palm-lined lawns and luxury villas in a gated residential community in Dubai — premium villa living with landscaped surroundings",
    },
    {
      title: "Waterway Villas — Aerial View",
      category: "Luxury Villas",
      image: "https://res.cloudinary.com/complaintreview/image/upload/v1790853395/knc-horizon/projects/damac-islands/damac-islands-aerial-villa-clusters-on-waterways.jpg",
      image_public_id: "knc-horizon/projects/damac-islands/damac-islands-aerial-villa-clusters-on-waterways",
      alt: "Aerial view of luxury villa clusters set around winding waterways in Dubai at sunrise — exclusive waterfront villa communities",
    },
    {
      title: "Jumeirah Islands — Lakeside Villas",
      category: "Luxury Villas",
      image: "https://res.cloudinary.com/complaintreview/image/upload/v1790577282/knc-horizon/projects/jumeirah-islands-lakeside-villas.jpg",
      image_public_id: "knc-horizon/projects/jumeirah-islands-lakeside-villas",
      alt: "Aerial view of lakeside villas with private pools and landscaped gardens in Jumeirah Islands, Dubai",
    },

    // Luxury Apartments
    {
      title: "Dubai Marina — Waterfront Apartments",
      category: "Luxury Apartments",
      image: "https://res.cloudinary.com/complaintreview/image/upload/v1790844455/knc-horizon/projects/bay-by-cavalli/bay-by-cavalli-marina-towers-day.jpg",
      image_public_id: "knc-horizon/projects/bay-by-cavalli/bay-by-cavalli-marina-towers-day",
      alt: "Dubai Marina skyline with waterfront luxury apartment towers and yachts on a clear day — premium marina-facing residences",
    },

    // Penthouses
    {
      title: "Penthouse — Marina Skyline View",
      category: "Penthouses",
      image: "https://res.cloudinary.com/complaintreview/image/upload/v1790844456/knc-horizon/projects/bay-by-cavalli/bay-by-cavalli-night-view-window.jpg",
      image_public_id: "knc-horizon/projects/bay-by-cavalli/bay-by-cavalli-night-view-window",
      alt: "Dubai Marina's illuminated night skyline seen through floor-to-ceiling windows from a luxury penthouse",
    },

    // Modern Architecture
    {
      title: "Modern Architecture — Geometric Balconies",
      category: "Modern Architecture",
      image: "https://res.cloudinary.com/complaintreview/image/upload/v1790844460/knc-horizon/projects/binghatti-circle-jvc/binghatti-circle-balconies.jpg",
      image_public_id: "knc-horizon/projects/binghatti-circle-jvc/binghatti-circle-balconies",
      alt: "Close-up of geometric balconies on a modern Dubai apartment tower — contemporary residential architecture in Dubai",
    },
    {
      title: "Contemporary Residential Facade",
      category: "Modern Architecture",
      image: "https://res.cloudinary.com/complaintreview/image/upload/v1790844459/knc-horizon/projects/binghatti-circle-jvc/binghatti-circle-residential-facade.jpg",
      image_public_id: "knc-horizon/projects/binghatti-circle-jvc/binghatti-circle-residential-facade",
      alt: "Modern residential building with distinctive orange balcony accents — Dubai's bold contemporary architectural style",
    },

    // Premium Interiors
    {
      title: "Luxury Living Room",
      category: "Premium Interiors",
      image: "https://res.cloudinary.com/complaintreview/image/upload/v1790577269/knc-horizon/hero/dubai-apartment-living-room.jpg",
      image_public_id: "knc-horizon/hero/dubai-apartment-living-room",
      alt: "Furnished Dubai apartment living room with cream sofa, green armchairs and lush plants beside tall windows — premium interior design",
    },
    {
      title: "Contemporary Dubai Living Room",
      category: "Premium Interiors",
      image: "https://res.cloudinary.com/complaintreview/image/upload/v1790844458/knc-horizon/projects/bay-grove-dubai-islands/bay-grove-apartment-living-room.jpg",
      image_public_id: "knc-horizon/projects/bay-grove-dubai-islands/bay-grove-apartment-living-room",
      alt: "Elegant living room with a beige sofa and wooden coffee table by a window in a luxury Dubai apartment",
    },
    {
      title: "Modern Dubai Apartment Interior",
      category: "Premium Interiors",
      image: "https://res.cloudinary.com/complaintreview/image/upload/v1790844461/knc-horizon/projects/binghatti-circle-jvc/binghatti-circle-apartment-interior.jpg",
      image_public_id: "knc-horizon/projects/binghatti-circle-jvc/binghatti-circle-apartment-interior",
      alt: "Compact modern apartment interior with minimalist decor and clean lines in Dubai — premium contemporary living space",
    },

    // Pools & Outdoor Living
    {
      title: "Rooftop Infinity Pool",
      category: "Pools & Outdoor Living",
      image: "https://res.cloudinary.com/complaintreview/image/upload/v1790853409/knc-horizon/projects/bayz-101/bayz-101-rooftop-pool-facing-burj-khalifa.jpg",
      image_public_id: "knc-horizon/projects/bayz-101/bayz-101-rooftop-pool-facing-burj-khalifa",
      alt: "Rooftop infinity pool overlooking the Burj Khalifa and the Dubai skyline at sunrise — the ultimate outdoor luxury amenity",
    },
    {
      title: "Beachfront Pools & Gardens",
      category: "Pools & Outdoor Living",
      image: "https://res.cloudinary.com/complaintreview/image/upload/v1790844457/knc-horizon/projects/bay-grove-dubai-islands/bay-grove-beachfront-pools-aerial.jpg",
      image_public_id: "knc-horizon/projects/bay-grove-dubai-islands/bay-grove-beachfront-pools-aerial",
      alt: "Aerial view of beachfront pools and landscaped gardens on the Dubai shore — luxury outdoor living at a premium waterfront residence",
    },
    {
      title: "Pool Terrace — Marina View",
      category: "Pools & Outdoor Living",
      image: "https://res.cloudinary.com/complaintreview/image/upload/v1790844456/knc-horizon/projects/bay-by-cavalli/bay-by-cavalli-pool-terrace.jpg",
      image_public_id: "knc-horizon/projects/bay-by-cavalli/bay-by-cavalli-pool-terrace",
      alt: "Rooftop pool with white minimalist architecture against the Dubai skyline — luxury poolside outdoor living with panoramic city views",
    },
  ];

  let inserted = 0;
  for (const item of newItems) {
    // Skip if a record with this exact title already exists (idempotent)
    const existing = await client.query(
      "SELECT id FROM gallery WHERE lower(title) = lower($1)",
      [item.title],
    );
    if (existing.rowCount > 0) {
      console.log(`  Skipped (already exists): "${item.title}"`);
      continue;
    }

    await client.query(
      `INSERT INTO gallery (title, category, image, image_public_id, alt, published, created_at)
       VALUES ($1, $2, $3, $4, $5, true, now())`,
      [item.title, item.category, item.image, item.image_public_id, item.alt],
    );
    console.log(`  Inserted: "${item.title}" [${item.category}]`);
    inserted++;
  }

  // ── 3. Summary ────────────────────────────────────────────────────────────
  const { rows } = await client.query(
    "SELECT category, count(*)::int AS n FROM gallery WHERE published GROUP BY category ORDER BY category",
  );
  console.log("\nGallery after reset:");
  for (const row of rows) {
    console.log(`  ${row.category.padEnd(28)} ${row.n} item(s)`);
  }
  console.log(`\nDone. Inserted ${inserted} new real-estate gallery items.`);
} finally {
  await client.end();
}
