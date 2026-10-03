const fs = require('fs');
const path = require('path');

const verifiedPath = path.resolve('backend/scripts/verified-listings.json');
const manifestPath = path.resolve('backend/scripts/cloudinary-images.json');

const verifiedData = JSON.parse(fs.readFileSync(verifiedPath, 'utf8'));
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const manifestMap = new Map(manifest.map(m => [m.local, m]));

const uniqueUpdates = {
  'wasl-green-park-3-bedroom-rent': [
    {
      local: '/images/dubai-apartment-open-plan-living.jpg',
      alt: 'Spacious 3-bedroom open-plan apartment living room with expansive dining area in Dubai',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/downtown-dubai-apartment-twin-bedroom.jpg',
      alt: 'Bright master bedroom with floor-to-ceiling windows and wood accents',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/apt-building-mid-rise-residential-blocks.jpg',
      alt: 'Mid-rise modern residential building nestled in landscaped green community',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/rental-geometric-apartment-facade.jpg',
      alt: 'Geometric balcony facade at wasl green park',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    }
  ],
  'wasl-port-views-1-bedroom-rent': [
    {
      local: '/images/apt-interior-living-room-sofa-and-palm.jpg',
      alt: 'Cozy 1-bedroom apartment living room with contemporary sofa, houseplant and natural lighting',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/interiors-bedroom-with-pendant-lights.jpg',
      alt: 'Peaceful 1-bedroom suite with pendant lighting and built-in wardrobes',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/apt-interior-kitchen-white-cabinets.jpg',
      alt: 'Modern kitchen with white cabinetry and stainless steel appliances',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/rental-harbour-yachts-and-skyline.jpg',
      alt: 'Maritime view near the historic port and harbour district',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    }
  ],
  'silva-dubai-creek-harbour': [
    {
      local: '/images/apt-interior-living-room-neutral-tones.jpg',
      alt: 'Contemporary luxury apartment living room in neutral tones with panoramic views at Dubai Creek Harbour',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/dubai-creek-harbour-towers.jpg',
      alt: 'Modern high-rise residential towers at Dubai Creek Harbour overlooking landscaped waterfront',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/apt-interior-bedroom-with-city-view.jpg',
      alt: 'Master bedroom suite with floor-to-ceiling windows and city skyline view',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/dubai-creek-harbour-marina-from-above.jpg',
      alt: 'Aerial panorama of Dubai Creek Harbour marina and promenade',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    }
  ],
  'the-element-at-sobha-one': [
    {
      local: '/images/sobha-one-apartment-city-view.jpg',
      alt: 'Modern luxury apartment interior at The Element, Sobha One with floor-to-ceiling city views',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/sobha-one-waterside-towers.jpg',
      alt: 'The Element waterside residential towers rising in Ras Al Khor',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/sobha-one-golf-course-skyline.jpg',
      alt: 'Views over the Pitch and Putt golf course towards Dubai skyline',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/sobha-one-dubai-skyline-sunset.jpg',
      alt: 'Panoramic sunset view across the water and skyline',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    }
  ]
};

// Validate photos exist
for (const [slug, photos] of Object.entries(uniqueUpdates)) {
  for (const p of photos) {
    if (!manifestMap.has(p.local)) {
      throw new Error(`Missing ${p.local} in manifest!`);
    }
  }
}

// Update verified-listings.json
for (const prop of verifiedData.properties) {
  if (uniqueUpdates[prop.slug]) {
    prop.photos = uniqueUpdates[prop.slug];
    console.log(`Updated verified listing [${prop.slug}] with unique cover: ${prop.photos[0].local}`);
  }
}

fs.writeFileSync(verifiedPath, JSON.stringify(verifiedData, null, 2), 'utf8');
console.log('Saved verified-listings.json');
