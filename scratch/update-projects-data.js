const fs = require('fs');
const path = require('path');

const verifiedListingsPath = path.resolve('backend/scripts/verified-listings.json');
const verifiedData = JSON.parse(fs.readFileSync(verifiedListingsPath, 'utf8'));

const manifest = JSON.parse(fs.readFileSync(path.resolve('backend/scripts/cloudinary-images.json'), 'utf8'));
const manifestMap = new Map(manifest.map(m => [m.local, m]));

const projectPhotos = {
  'the-oasis-by-emaar': [
    {
      local: '/images/the-oasis-villa-pool-garden.jpg',
      alt: 'The Oasis by Emaar luxury villa with private swimming pool and landscaped garden',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/the-oasis-villa-community-aerial.jpg',
      alt: 'The Oasis master community aerial with lagoons and green spaces',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/the-oasis-villa-living-room.jpg',
      alt: 'Contemporary open-plan villa living room with expansive garden views',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/the-oasis-community-greenery-aerial.jpg',
      alt: 'Lush landscape corridors and walking trails throughout The Oasis',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    }
  ],
  'the-valley-by-emaar': [
    {
      local: '/images/the-valley-townhouse-rows-aerial.jpg',
      alt: 'The Valley by Emaar master-planned townhouse community aerial view',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/the-valley-community-lake.jpg',
      alt: 'Central park and leisure lake at The Valley',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/the-valley-family-living-room.jpg',
      alt: 'Spacious modern family townhouse living room',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/the-valley-park-fountain.jpg',
      alt: 'Community park and water feature for families',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    }
  ],
  'bay-by-cavalli': [
    {
      local: '/images/bay-by-cavalli-marina-towers-day.jpg',
      alt: 'DAMAC Bay by Cavalli luxury waterfront towers at Dubai Harbour',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/bay-by-cavalli-rooftop-pool.jpg',
      alt: 'Exclusive Cavalli-branded rooftop infinity pool overlooking Dubai Harbour',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/bay-by-cavalli-pool-terrace.jpg',
      alt: 'Curved private pool terrace with palm trees and sun loungers',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/bay-by-cavalli-marina-night.jpg',
      alt: 'Dubai Harbour and Marina illuminated at night',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    }
  ],
  'sobha-one': [
    {
      local: '/images/sobha-one-waterside-towers.jpg',
      alt: 'Sobha One modern waterside residential towers in Ras Al Khor',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/sobha-one-apartment-city-view.jpg',
      alt: 'Floor-to-ceiling glass apartment interior overlooking the skyline',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/sobha-one-golf-course-skyline.jpg',
      alt: '18-hole Pitch and Putt golf course with Downtown skyline backdrop',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/sobha-one-dubai-skyline-sunset.jpg',
      alt: 'Panoramic sunset view across Ras Al Khor wildlife sanctuary and Dubai skyline',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    }
  ],
  'bay-grove-dubai-islands': [
    {
      local: '/images/bay-grove-beachfront-pools-aerial.jpg',
      alt: 'Bay Grove Residences beachfront infinity pools and landscaped podium on Dubai Islands',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/bay-grove-apartment-living-room.jpg',
      alt: 'Sunlit beachfront apartment living room with ocean view terrace',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/bay-grove-dubai-coastline.jpg',
      alt: 'Pristine white sand beach and turquoise Arabian Gulf shoreline',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/bay-grove-deira-coast-sunset.jpg',
      alt: 'Golden hour sunset along the Dubai Islands waterfront promenade',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    }
  ],
  'binghatti-circle-jvc': [
    {
      local: '/images/binghatti-circle-apartment-complex.jpg',
      alt: 'Binghatti Circle signature architectural residential facade in Jumeirah Village Circle',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/binghatti-circle-apartment-interior.jpg',
      alt: 'Contemporary designer apartment interior with bespoke finishes',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/binghatti-circle-balconies.jpg',
      alt: 'Iconic geometric woven balconies and private outdoor terraces',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/binghatti-circle-residential-facade.jpg',
      alt: 'Close-up of modern facade detailing and glass paneling',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    }
  ]
};

// Check all photos exist in manifest
for (const [slug, photos] of Object.entries(projectPhotos)) {
  for (const ph of photos) {
    if (!manifestMap.has(ph.local)) {
      throw new Error(`Missing photo in manifest: ${ph.local}`);
    }
  }
}

// Update verified-listings.json
let updatedCount = 0;
for (const p of verifiedData.projects) {
  if (projectPhotos[p.slug]) {
    p.photos = projectPhotos[p.slug];
    delete p.dropPhotos; // no longer needed
    updatedCount++;
    console.log(`Updated project [${p.slug}] with ${p.photos.length} photos`);
  }
}

fs.writeFileSync(verifiedListingsPath, JSON.stringify(verifiedData, null, 2), 'utf8');
console.log(`Saved ${updatedCount} updated projects to ${verifiedListingsPath}`);
