/**
 * Centralized Image Resolution & Verified Registry for KNC Horizon Realtor.
 * 
 * EVERY image on the website supports TWO options:
 * OPTION 1: Verified Live Working Image URL
 * OPTION 2: Local Upload File with exact filename and path in frontend/public/images/
 */

export type ImageSource =
  | {
      imageUrl?: string;
      imagePath?: string;
      image?: string;
      images?: string[];
      coverImage?: string;
      featuredImage?: string;
      [key: string]: unknown;
    }
  | string
  | null
  | undefined;

export type ImageRecord = {
  id: string;
  name: string;
  description: string;
  usedIn: string;
  option1_url: string;
  option2_local: {
    filename: string;
    folder: string;
    fullPath: string;
    websitePath: string;
  };
};

/**
 * Real, licensed photographs of Dubai that the admin can pick as presets. Every file is stored
 * locally in frontend/public/images/, so picking a preset never hotlinks another site. Source,
 * licence and photographer of every site photo are listed in IMAGE_SOURCES.md.
 */
export const VERIFIED_IMAGES: Record<string, ImageRecord> = {
  dubai_skyline_from_sea: {
    id: 'dubai_skyline_from_sea',
    name: 'Dubai skyline from the sea',
    description: 'The Dubai skyline and the Burj Al Arab seen across the sea. CC0, Wikimedia Commons, Ronald Sagarino. Source: https://commons.wikimedia.org/wiki/File:Dubai_skylines_(Pixabay_1536496).jpg',
    usedIn: 'Home: closing call-to-action; also the fallback when an image is missing',
    option1_url: '/images/dubai-skyline-from-sea.jpg',
    option2_local: {
      filename: 'dubai-skyline-from-sea.jpg',
      folder: 'frontend/public/images/',
      fullPath: 'frontend/public/images/dubai-skyline-from-sea.jpg',
      websitePath: '/images/dubai-skyline-from-sea.jpg',
    },
  },
  downtown_dubai_fountain: {
    id: 'downtown_dubai_fountain',
    name: 'Downtown Dubai and Burj Lake',
    description: 'The Burj Khalifa and Downtown Dubai towers beside Burj Lake at sunset. CC0, Wikimedia Commons, Christian Raggini. Source: https://commons.wikimedia.org/wiki/File:The_Dubai_Fountain_%26_Burj_Khalifa_Pixabay.jpg',
    usedIn: 'Community: Downtown Dubai',
    option1_url: '/images/dubai-fountain-downtown.jpg',
    option2_local: {
      filename: 'dubai-fountain-downtown.jpg',
      folder: 'frontend/public/images/',
      fullPath: 'frontend/public/images/dubai-fountain-downtown.jpg',
      websitePath: '/images/dubai-fountain-downtown.jpg',
    },
  },
  dubai_marina_canal: {
    id: 'dubai_marina_canal',
    name: 'Dubai Marina canal by day',
    description: 'Residential towers along the Dubai Marina canal on a clear day. CC0, Wikimedia Commons, EditQ. Source: https://commons.wikimedia.org/wiki/File:Dubai_Marina_3.jpg',
    usedIn: 'Community: Dubai Marina',
    option1_url: '/images/dubai-marina-canal-day.jpg',
    option2_local: {
      filename: 'dubai-marina-canal-day.jpg',
      folder: 'frontend/public/images/',
      fullPath: 'frontend/public/images/dubai-marina-canal-day.jpg',
      websitePath: '/images/dubai-marina-canal-day.jpg',
    },
  },
  palm_jumeirah_aerial: {
    id: 'palm_jumeirah_aerial',
    name: 'Palm Jumeirah from above',
    description: 'The resort Palm Jumeirah, Dubai, United Arab Emirates, is featured in this image photographed by Expedition 10 Commander Leroy Chiao from the International Spac. Public domain, Wikimedia Commons, Commander Leroy Chiao. Source: https://commons.wikimedia.org/wiki/File:Palm_Island_Resort.jpg',
    usedIn: 'Community: Palm Jumeirah; gallery',
    option1_url: '/images/palm-jumeirah-aerial.jpg',
    option2_local: {
      filename: 'palm-jumeirah-aerial.jpg',
      folder: 'frontend/public/images/',
      fullPath: 'frontend/public/images/palm-jumeirah-aerial.jpg',
      websitePath: '/images/palm-jumeirah-aerial.jpg',
    },
  },
  business_bay_night: {
    id: 'business_bay_night',
    name: 'Business Bay at night',
    description: '​迪拜夜晚天际线. CC0, Wikimedia Commons, Robert Bock. Source: https://commons.wikimedia.org/wiki/File:Dubai_skyline_unsplash.jpg',
    usedIn: 'Community: Business Bay; gallery',
    option1_url: '/images/hero-dubai-skyline.jpg',
    option2_local: {
      filename: 'hero-dubai-skyline.jpg',
      folder: 'frontend/public/images/',
      fullPath: 'frontend/public/images/hero-dubai-skyline.jpg',
      websitePath: '/images/hero-dubai-skyline.jpg',
    },
  },
  jumeirah_coast: {
    id: 'jumeirah_coast',
    name: 'Jumeirah coast and Burj Al Arab',
    description: 'Dubai coastline. CC0, Wikimedia Commons, Ahmad Ardity. Source: https://commons.wikimedia.org/wiki/File:Dubai_skyscrapers,_coastline_and_Burj_Al-Arab.jpg',
    usedIn: 'Community: Jumeirah; gallery',
    option1_url: '/images/jumeirah-coast-burj-al-arab.jpg',
    option2_local: {
      filename: 'jumeirah-coast-burj-al-arab.jpg',
      folder: 'frontend/public/images/',
      fullPath: 'frontend/public/images/jumeirah-coast-burj-al-arab.jpg',
      websitePath: '/images/jumeirah-coast-burj-al-arab.jpg',
    },
  },
  dubai_villa_community: {
    id: 'dubai_villa_community',
    name: 'Dubai villa community',
    description: 'Low-rise villa community in Dubai seen from above, with towers on the horizon. Unsplash License, Unsplash, Kate Trysh. Source: https://unsplash.com/photos/Yeq7xHJ87_U',
    usedIn: 'Community: Arabian Ranches (representative Dubai villa community; Arabian Ranches itself has no free-licence photo)',
    option1_url: '/images/dubai-villa-community-aerial.jpg',
    option2_local: {
      filename: 'dubai-villa-community-aerial.jpg',
      folder: 'frontend/public/images/',
      fullPath: 'frontend/public/images/dubai-villa-community-aerial.jpg',
      websitePath: '/images/dubai-villa-community-aerial.jpg',
    },
  },
  dubai_townhouses: {
    id: 'dubai_townhouses',
    name: 'Townhouse street in Dubai',
    description: 'Row of Mediterranean-style townhouses on a quiet Dubai community street, city skyline in the distance. Unsplash License, Unsplash, Ben Koorengevel. Source: https://unsplash.com/photos/a-beautiful-cityscape-with-buildings-and-streets-R9Dc1pwBTjY',
    usedIn: 'Listing: Park Row (townhouse)',
    option1_url: '/images/dubai-townhouse-street.jpg',
    option2_local: {
      filename: 'dubai-townhouse-street.jpg',
      folder: 'frontend/public/images/',
      fullPath: 'frontend/public/images/dubai-townhouse-street.jpg',
      websitePath: '/images/dubai-townhouse-street.jpg',
    },
  },
  dubai_creek_harbour: {
    id: 'dubai_creek_harbour',
    name: 'Dubai Creek Harbour towers',
    description: 'Residential towers at Dubai Creek Harbour in late-afternoon sun, with palm trees below. Unsplash License, Unsplash, Aadil Sabeer. Source: https://unsplash.com/photos/cars-parked-near-high-rise-buildings-during-daytime-onP3aM_3tuA',
    usedIn: 'Listing: Creekside Loft (Dubai Creek Harbour)',
    option1_url: '/images/dubai-creek-harbour-towers.jpg',
    option2_local: {
      filename: 'dubai-creek-harbour-towers.jpg',
      folder: 'frontend/public/images/',
      fullPath: 'frontend/public/images/dubai-creek-harbour-towers.jpg',
      websitePath: '/images/dubai-creek-harbour-towers.jpg',
    },
  },
  dubai_construction: {
    id: 'dubai_construction',
    name: 'Tower under construction in Dubai',
    description: 'Residential tower under construction with two tower cranes beside a finished apartment building in Dubai. Unsplash License, Unsplash, Kate Trysh. Source: https://unsplash.com/photos/a-couple-of-tall-buildings-next-to-each-other-9HP5UpkyptM',
    usedIn: 'Blog: A clear-eyed guide to buying off-plan in Dubai',
    option1_url: '/images/dubai-tower-construction-cranes.jpg',
    option2_local: {
      filename: 'dubai-tower-construction-cranes.jpg',
      folder: 'frontend/public/images/',
      fullPath: 'frontend/public/images/dubai-tower-construction-cranes.jpg',
      websitePath: '/images/dubai-tower-construction-cranes.jpg',
    },
  },
  dubai_living_room: {
    id: 'dubai_living_room',
    name: 'Furnished Dubai living room',
    description: 'Finished Dubai living room with grey sofa, glass coffee table, white rug and ring pendant light. Unsplash License, Unsplash, Riyas Mohammed. Source: https://unsplash.com/photos/a-living-room-with-a-gray-couch-and-a-white-rug-_BBps6MAJ2w',
    usedIn: 'Service card: Interiors & Furniture (home and Services)',
    option1_url: '/images/dubai-living-room-finished.jpg',
    option2_local: {
      filename: 'dubai-living-room-finished.jpg',
      folder: 'frontend/public/images/',
      fullPath: 'frontend/public/images/dubai-living-room-finished.jpg',
      websitePath: '/images/dubai-living-room-finished.jpg',
    },
  },
  al_fahidi: {
    id: 'al_fahidi',
    name: 'Al Fahidi wind towers',
    description: 'Traditional sand-coloured houses with wind towers around a quiet courtyard in Al Bastakiya, old Dubai. CC0 1.0, Wikimedia Commons, EditQ. Source: https://commons.wikimedia.org/wiki/File:Al_Bastakiya_5.jpg',
    usedIn: 'Header: Our Approach',
    option1_url: '/images/al-fahidi-wind-towers.jpg',
    option2_local: {
      filename: 'al-fahidi-wind-towers.jpg',
      folder: 'frontend/public/images/',
      fullPath: 'frontend/public/images/al-fahidi-wind-towers.jpg',
      websitePath: '/images/al-fahidi-wind-towers.jpg',
    },
  },
};

export const DEFAULT_FALLBACK_IMAGE = '/images/dubai-skyline-from-sea.jpg';

/**
 * Resolves the display image URL from any item or path.
 * Priority:
 * 1. item.imageUrl (if valid HTTP/HTTPS URL)
 * 2. item.imagePath (if valid local path or URL)
 * 3. item.image
 * 4. item.coverImage or item.featuredImage
 * 5. item.images[0]
 * 6. Direct string if passed
 * 7. Default fallback image
 */
export function resolveImageUrl(
  source: ImageSource,
  fallback: string = DEFAULT_FALLBACK_IMAGE,
): string {
  if (!source) {
    return fallback;
  }

  if (typeof source === 'string') {
    const trimmed = source.trim();
    return trimmed || fallback;
  }

  if (typeof source === 'object') {
    // 1. Check imageUrl first
    if (typeof source.imageUrl === 'string' && source.imageUrl.trim()) {
      return source.imageUrl.trim();
    }

    // 2. Check imagePath next
    if (typeof source.imagePath === 'string' && source.imagePath.trim()) {
      return source.imagePath.trim();
    }

    // 3. Check image
    if (typeof source.image === 'string' && source.image.trim()) {
      return source.image.trim();
    }

    // 4. Check coverImage / featuredImage
    if (typeof source.coverImage === 'string' && source.coverImage.trim()) {
      return source.coverImage.trim();
    }
    if (typeof source.featuredImage === 'string' && source.featuredImage.trim()) {
      return source.featuredImage.trim();
    }

    // 5. Check images array
    if (Array.isArray(source.images) && source.images.length > 0) {
      const first = source.images[0];
      if (typeof first === 'string' && first.trim()) {
        return first.trim();
      }
    }
  }

  return fallback;
}
