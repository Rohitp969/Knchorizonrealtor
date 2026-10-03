const fs = require('fs');
const path = require('path');

const filePath = path.resolve('backend/scripts/verified-listings.json');
const manifestPath = path.resolve('backend/scripts/cloudinary-images.json');

const verifiedData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const manifestMap = new Map(manifest.map(m => [m.local, m]));

const updates = {
  'bluewaters-residences-rent': [
    {
      local: '/images/apt-building-bluewaters-wheel-and-residences.jpg',
      alt: 'Bluewaters Island residential apartment buildings with Ain Dubai observation wheel in the background',
      representative: true,
      credit: 'Verified Dubai Photography / Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/apt-building-bluewaters-residential-street.jpg',
      alt: 'Pedestrian boulevard and boutique shops at Bluewaters Residences',
      representative: true,
      credit: 'Verified Dubai Photography / Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/apt-interior-living-room-white-sofa.jpg',
      alt: 'Contemporary apartment living room with white sofa and floor-to-ceiling windows',
      representative: true,
      credit: 'Verified Dubai Photography / Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/rental-living-room-beige-sofa.jpg',
      alt: 'Furnished apartment lounge with dining area',
      representative: true,
      credit: 'AJ Ahamad / Pexels',
      sourceUrl: 'https://www.pexels.com/photo/modern-living-room-with-cozy-beige-sofa-and-decor-30554301/'
    }
  ],
  'garden-view-villas-rent': [
    {
      local: '/images/dubai-mediterranean-style-villa.jpg',
      alt: 'Mediterranean-style luxury villa with landscaped garden, patio and arched windows in Dubai',
      representative: true,
      credit: 'Engin Akyurt / Pexels',
      sourceUrl: 'https://www.pexels.com/photo/low-angle-photo-of-concrete-house-2079234/'
    },
    {
      local: '/images/dubai-townhouse-garden-swing-lawn.jpg',
      alt: 'Private villa garden with lawn and outdoor swing',
      representative: true,
      credit: 'Verified Dubai Photography / Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/dubai-villa-street-palms.jpg',
      alt: 'Tree-lined quiet residential avenue in Garden View Villas',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/villas-villa-facade-corner.jpg',
      alt: 'Modern villa exterior corner facade with contemporary finishes',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    }
  ],
  'silva-dubai-creek-harbour': [
    {
      local: '/images/dubai-creek-harbour-towers.jpg',
      alt: 'Modern high-rise residential towers at Dubai Creek Harbour overlooking landscaped waterfront',
      representative: true,
      credit: 'Aleksandar Pasaric / Pexels',
      sourceUrl: 'https://www.pexels.com/photo/modern-skyscrapers-in-city-325185/'
    },
    {
      local: '/images/apt-interior-living-room-neutral-tones.jpg',
      alt: 'Contemporary apartment living room in neutral tones with large glass windows',
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
      credit: 'Nextvoyage / Pexels',
      sourceUrl: 'https://www.pexels.com/'
    }
  ],
  'dubai-wharf-rent': [
    {
      local: '/images/dubai-apartment-living-room-sofa.jpg',
      alt: 'Contemporary apartment living room with sofa, warm lighting, and floor-to-ceiling windows',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/interiors-kitchen-with-dining-table.jpg',
      alt: 'Open-plan modern kitchen with integrated dining area',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/jaddaf-waterfront.jpg',
      alt: 'Dubai Wharf waterfront promenade along the historic Dubai Creek',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    }
  ],
  'remraam-rent': [
    {
      local: '/images/apt-building-low-rise-apartment-building-corner.jpg',
      alt: 'Low-rise modern residential apartment building in a peaceful green Dubai community',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/dubai-apartment-living-room-sofa.jpg',
      alt: 'Bright and comfortable apartment living room with contemporary furnishings',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/rental-mosaic-pool-terrace.jpg',
      alt: 'Resident swimming pool terrace surrounded by greenery in Remraam',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/rental-palm-lined-park-path.jpg',
      alt: 'Community landscaped walking path with mature palm trees',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    }
  ],
  'wasl-port-views-1-bedroom-rent': [
    {
      local: '/images/interiors-living-room-sofa-and-rug.jpg',
      alt: 'Warm and inviting 1-bedroom apartment living room with designer sofa and area rug',
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
  'jewel-of-the-creek-office-581-rent': [
    {
      local: '/images/dubai-office-lounge-glass-partition.jpg',
      alt: 'Modern corporate office space with floor-to-ceiling glass partitions and meeting area',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/rental-creekside-offices-and-ferries.jpg',
      alt: 'Creekside commercial building exterior with scenic waterfront access',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/dubai-office-breakout-world-map.jpg',
      alt: 'Executive collaboration space and breakout zone',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    }
  ],
  'jewel-of-the-creek-office-1647-rent': [
    {
      local: '/images/dubai-office-coffee-bar-reception.jpg',
      alt: 'Luxury corporate office reception area with coffee bar and contemporary styling',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/dubai-office-meeting-room-lounge.jpg',
      alt: 'Spacious executive conference and boardroom lounge',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/dubai-office-breakout-world-map.jpg',
      alt: 'Open-plan office breakout area with world map wall feature',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/rental-creek-abras-and-quay.jpg',
      alt: 'Historic Dubai Creek waterfront near Jewel of the Creek',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    }
  ],
  'damac-riverside-5-bedroom-villa': [
    {
      local: '/images/dubai-villa-lap-pool-deck.jpg',
      alt: 'Luxury 5-bedroom villa with private lap pool and timber sundeck in Dubai',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/dubai-townhouse-living-room-arched-doors.jpg',
      alt: 'Elegant villa living room with arched French doors opening to the garden',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/dubai-townhouse-dining-room.jpg',
      alt: 'Formal dining room with chandelier and expansive garden views',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/dubai-villa-bedroom-media-wall.jpg',
      alt: 'Spacious master bedroom suite with media wall and premium finishes',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/dubai-lakeside-villa-suburb-aerial.jpg',
      alt: 'Waterfront community aerial view with lagoons and green landscapes',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    }
  ],
  'bayz-101-studio': [
    {
      local: '/images/dubai-studio-apartment-sofa-bed.jpg',
      alt: 'Smart studio apartment interior with designer sofa, foldaway bed and high ceilings',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/dubai-studio-balcony-breakfast.jpg',
      alt: 'Studio private balcony with outdoor breakfast table overlooking the city',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/downtown-business-bay-night-water.jpg',
      alt: 'Business Bay skyline at night near Dubai Water Canal',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    }
  ],
  'diamondz-studio': [
    {
      local: '/images/interiors-living-room-rocking-chair.jpg',
      alt: 'Bright studio apartment living area with Scandinavian armchair, warm wood tones and sunlight',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/interiors-home-office-desk.jpg',
      alt: 'Dedicated compact work desk corner ideal for remote professionals',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/jlt-lake-towers.jpg',
      alt: 'Jumeirah Lake Towers lakeside community with promenade and towers',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    }
  ],
  'damac-bay-by-cavalli-1-bedroom': [
    {
      local: '/images/apt-interior-living-room-white-sofa.jpg',
      alt: 'Ultra-luxury Cavalli-inspired apartment living room with white leather sofa and panoramic sea views',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/apt-interior-bedroom-blue-and-gold.jpg',
      alt: 'Opulent master bedroom with gold accents and high-end designer furnishings',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/interiors-balcony-table-with-view.jpg',
      alt: 'Private high-floor balcony with cafe table overlooking Dubai Harbour',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/dubai-marina-night-view-high-floor.jpg',
      alt: 'Dazzling nighttime view of Dubai Marina skyline from high-floor terrace',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    }
  ],
  'sera-2-rashid-yachts-marina': [
    {
      local: '/images/apt-building-marina-towers-and-water.jpg',
      alt: 'Waterfront luxury residential apartment towers at Dubai marina with promenade',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/dubai-apartment-open-plan-living.jpg',
      alt: 'Modern open-plan living room with expansive windows and dining area',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/downtown-dubai-apartment-twin-bedroom.jpg',
      alt: 'Spacious twin bedroom with floor-to-ceiling windows',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    }
  ],
  'baystar-by-vida-rashid-yachts-marina': [
    {
      local: '/images/apt-building-wave-balcony-tower.jpg',
      alt: 'Contemporary curved architectural residential tower with expansive private balconies',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/interiors-kitchen-with-dining-table.jpg',
      alt: 'Streamlined open-concept designer kitchen with dining table',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/interiors-twin-bedroom.jpg',
      alt: 'Minimalist modern bedroom with natural sunlight and wood accents',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    },
    {
      local: '/images/dubai-marina-towers-clear-sky.jpg',
      alt: 'Clear blue sky view over Dubai waterfront marina district',
      representative: true,
      credit: 'Pexels (Free License)',
      sourceUrl: 'https://www.pexels.com/'
    }
  ]
};

// Validate that every single local image exists in manifest
for (const [slug, photos] of Object.entries(updates)) {
  for (const p of photos) {
    if (!manifestMap.has(p.local)) {
      throw new Error(`Image ${p.local} in slug ${slug} not found in manifest!`);
    }
  }
}
console.log('Validation passed: all photos in updates map exist in Cloudinary manifest!');

let updatedCount = 0;
for (const prop of verifiedData.properties) {
  if (updates[prop.slug]) {
    prop.photos = updates[prop.slug];
    updatedCount++;
    console.log(`Updated [${prop.slug}] with ${prop.photos.length} photos (Cover: ${prop.photos[0].local})`);
  }
}

fs.writeFileSync(filePath, JSON.stringify(verifiedData, null, 2), 'utf8');
console.log(`Successfully updated ${updatedCount} properties in ${filePath}`);
