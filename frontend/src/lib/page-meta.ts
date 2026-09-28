/*
 * The built-in title and description of every static page, by path. The SEO console's
 * overrides (from /public/seo) replace these per field; anything left empty there falls back
 * to the values here.
 */
export const PAGE_META: Record<string, [string, string]> = {
  '/': [
    'Dubai Property Advisory',
    'KNC Horizon Realtor connects clients with exceptional Dubai property, investment, design, and interiors services.',
  ],

  '/properties': [
    'Properties',
    'Explore selected homes and investment opportunities across Dubai with KNC Horizon Realtor.',
  ],

  '/projects': [
    'Projects',
    'Explore considered off-plan and new development opportunities across Dubai.',
  ],

  '/blog': [
    'Blog',
    'Real-estate guidance, neighbourhood notes, and property perspective from KNC Horizon Realtor.',
  ],

  '/gallery': [
    'Portfolio',
    'Explore the KNC Horizon visual archive of Dubai homes, interiors, and communities.',
  ],

  '/areas': [
    'Dubai Areas',
    'Find the Dubai neighbourhood that fits the way you want to live.',
  ],

  '/communities': [
    'Dubai Communities',
    'Explore premier Dubai neighbourhoods, waterfront communities, and master developments.',
  ],

  '/about': [
    'About',
    'Meet KNC Horizon Realtor, an independent Dubai property advisory built around context, candour, and care.',
  ],

  '/about/approach': [
    'Our Approach',
    'Learn about KNC Horizon Realtor’s disciplined advisory framework, due diligence, and client care.',
  ],

  '/about/india-office': [
    'India Office · DLF Phase 1 Gurugram',
    'Connecting Indian HNIs and NRI investors to prime Dubai real estate through our Gurugram advisory desk.',
  ],

  '/market-insights': [
    'Dubai Market Insights',
    'Essential market fundamentals, freehold regulations, rental yields, and investment intelligence.',
  ],

  '/properties/sale': [
    'Properties for Sale',
    'Curated freehold homes, luxury villas, and prime penthouses for sale across Dubai.',
  ],

  '/properties/rent': [
    'Properties for Rent',
    'Exceptional luxury residences and prime commercial properties available for lease in Dubai.',
  ],

  '/properties/residential': [
    'Residential Properties',
    'Explore residential real estate opportunities in Dubai.',
  ],

  '/properties/commercial': [
    'Commercial Properties',
    'Explore commercial real estate opportunities in Dubai.',
  ],

  '/properties/investment': [
    'Investment Opportunities',
    'Explore investment real estate opportunities in Dubai.',
  ],

  '/developers': [
    'Dubai Developers',
    'Explore established developers shaping residential, investment and mixed-use communities across Dubai.',
  ],

  '/off-plan': [
    'Off-Plan Developments',
    'Explore premier off-plan developments and payment plans from Dubai’s top master developers.',
  ],

  '/off-plan/new-launches': [
    'New Launches',
    'The newest property launches from leading Dubai developers including Emaar, Sobha, and Meraas.',
  ],

  '/off-plan/apartments': [
    'Off-Plan Apartments',
    'Prime waterfront and skyline off-plan apartments across Dubai’s highest-performing corridors.',
  ],

  '/off-plan/villas-townhouses': [
    'Off-Plan Villas & Townhouses',
    'Master-planned off-plan villas and family townhouses in Dubai’s premier gated communities.',
  ],

  '/off-plan/developers': [
    'Top Dubai Developers',
    'Explore verified developments by Emaar, Sobha, Omniyat, Nakheel, Meraas, and Ellington.',
  ],

  '/services': [
    'Services',
    'Property advisory, design, interiors, and relocation support from KNC Horizon Realtor in Dubai.',
  ],

  '/design-build': [
    'Design & Build',
    'KNC Horizon Design & Build brings together concept, build coordination, and considered delivery for Dubai homes.',
  ],

  '/interiors': [
    'Interiors & Furniture',
    'Interior design, bespoke furniture, and styling for Dubai homes from KNC Horizon Realtor.',
  ],

  '/contact': [
    'Contact',
    'Start a conversation with KNC Horizon Realtor about your next Dubai property move.',
  ],

  /*
   * ========================================================
   * TERMS & CONDITIONS
   * ========================================================
   */

  '/terms': [
    'Terms & Conditions',
    'General terms and conditions for using the KNC Horizon Realtor website.',
  ],

  '/terms-and-conditions': [
    'Terms & Conditions',
    'General terms and conditions for using the KNC Horizon Realtor website.',
  ],

  /*
   * ========================================================
   * PRIVACY POLICY
   * ========================================================
   */

  '/privacy': [
    'Privacy Policy',
    'Privacy information explaining how KNC Horizon Realtor may collect, use and protect website enquiry information.',
  ],

  '/privacy-policy': [
    'Privacy Policy',
    'Privacy information explaining how KNC Horizon Realtor may collect, use and protect website enquiry information.',
  ],
};

/*
 * The share image of every static page, by path: the photo the page itself opens with, and
 * what that photo shows. An OG image set in the SEO console replaces it; the site-wide default
 * image is only used by a page that is not listed here.
 */
export const PAGE_IMAGES: Record<string, [string, string]> = {
  '/': ['https://res.cloudinary.com/complaintreview/image/upload/v1790577272/knc-horizon/hero/hero-dubai-sunset.jpg', 'The Dubai skyline at sunset'],
  '/properties': ['https://res.cloudinary.com/complaintreview/image/upload/v1790577268/knc-horizon/hero/downtown-safa-park.jpg', 'Downtown Dubai and Business Bay seen across the water from Safa Park'],
  '/properties/sale': ['https://res.cloudinary.com/complaintreview/image/upload/v1790577267/knc-horizon/hero/burj-khalifa-aerial.jpg', 'The Burj Khalifa above the Downtown Dubai skyline in daylight'],
  '/properties/rent': ['https://res.cloudinary.com/complaintreview/image/upload/v1790577273/knc-horizon/hero/jbr-residences-street.jpg', 'Jumeirah Beach Residence towers beside Dubai Marina residential high-rises'],
  '/properties/residential': ['https://res.cloudinary.com/complaintreview/image/upload/v1790577275/knc-horizon/hero/the-greens-residential.jpg', 'Low-rise apartments, a palm-lined avenue and residential towers in The Greens, Dubai'],
  '/properties/commercial': ['https://res.cloudinary.com/complaintreview/image/upload/v1790577268/knc-horizon/hero/difc-green-towers.jpg', 'Office towers on Sheikh Zayed Road near the Dubai World Trade Centre'],
  '/properties/investment': ['https://res.cloudinary.com/complaintreview/image/upload/v1790577268/knc-horizon/hero/business-bay-skyline-day.jpg', 'Business Bay towers beside the water with the Burj Khalifa rising behind'],
  '/off-plan': ['https://res.cloudinary.com/complaintreview/image/upload/v1790577271/knc-horizon/hero/dubai-new-towers-aerial.jpg', 'Aerial view of new towers rising around Business Bay, Dubai'],
  '/projects': ['https://res.cloudinary.com/complaintreview/image/upload/v1790577271/knc-horizon/hero/dubai-new-towers-aerial.jpg', 'Aerial view of new towers rising around Business Bay, Dubai'],
  '/off-plan/new-launches': ['https://res.cloudinary.com/complaintreview/image/upload/v1790577271/knc-horizon/hero/dubai-waterfront-tower-construction.jpg', 'Residential tower under construction beside finished glass towers on a Dubai waterfront'],
  '/off-plan/apartments': ['https://res.cloudinary.com/complaintreview/image/upload/v1790577269/knc-horizon/hero/dubai-apartment-towers-sunset.jpg', 'Modern residential apartment towers over a Dubai neighbourhood at sunset'],
  '/off-plan/villas-townhouses': ['https://res.cloudinary.com/complaintreview/image/upload/v1790577268/knc-horizon/hero/daria-island-seafront-villa.jpg', 'Aerial view of a seafront villa garden and pool in Dubai'],
  '/off-plan/developers': ['https://res.cloudinary.com/complaintreview/image/upload/v1790577269/knc-horizon/hero/downtown-skyline-cranes.jpg', 'Downtown Dubai skyline over Burj Lake with tower cranes on new residential towers'],
  '/developers': ['https://res.cloudinary.com/complaintreview/image/upload/v1790577269/knc-horizon/hero/downtown-skyline-cranes.jpg', 'Downtown Dubai skyline over Burj Lake with tower cranes on new residential towers'],
  '/communities': ['https://res.cloudinary.com/complaintreview/image/upload/v1790577274/knc-horizon/hero/marina-resort-greens.jpg', 'The Dubai Marina yacht club and the Palm Jumeirah shoreline, with the Burj Al Arab in the distance'],
  '/areas': ['https://res.cloudinary.com/complaintreview/image/upload/v1790577274/knc-horizon/hero/marina-resort-greens.jpg', 'The Dubai Marina yacht club and the Palm Jumeirah shoreline, with the Burj Al Arab in the distance'],
  '/about': ['https://res.cloudinary.com/complaintreview/image/upload/v1790577270/knc-horizon/hero/dubai-skyline-creek-sunset.jpg', 'The Dubai skyline silhouetted at sunset across Dubai Creek'],
  '/about/approach': ['https://res.cloudinary.com/complaintreview/image/upload/v1790577267/knc-horizon/hero/al-fahidi-wind-towers.jpg', 'Traditional houses with wind towers around a courtyard in Al Bastakiya, old Dubai'],
  '/about/india-office': ['https://res.cloudinary.com/complaintreview/image/upload/v1790577272/knc-horizon/hero/gurugram-skyline.jpg', 'Gurugram skyline of residential and office high-rises'],
  '/market-insights': ['https://res.cloudinary.com/complaintreview/image/upload/v1790577274/knc-horizon/hero/sheikh-zayed-road-aerial.jpg', 'Aerial view of Sheikh Zayed Road interchanges and high-rise towers in Dubai'],
  '/services': ['https://res.cloudinary.com/complaintreview/image/upload/v1790577271/knc-horizon/hero/dubai-skyline-golf-course.jpg', 'Dubai skyline with the Burj Khalifa seen across water and green lawns'],
  '/design-build': ['https://res.cloudinary.com/complaintreview/image/upload/v1790577270/knc-horizon/hero/dubai-hills-construction.jpg', 'Residential blocks under construction with tower cranes in Dubai Hills'],
  '/interiors': ['https://res.cloudinary.com/complaintreview/image/upload/v1790577269/knc-horizon/hero/dubai-apartment-living-room.jpg', 'Furnished Dubai apartment living room with cream sofa and green armchairs'],
  '/blog': ['https://res.cloudinary.com/complaintreview/image/upload/v1790577269/knc-horizon/hero/dubai-creek-dusk.jpg', 'Dubai Creek at dusk with the Deira waterfront and abras'],
  '/gallery': ['https://res.cloudinary.com/complaintreview/image/upload/v1790577274/knc-horizon/hero/madinat-jumeirah-canal.jpg', 'A canal at Souk Madinat Jumeirah with the Burj Al Arab beyond the palms'],
  '/contact': ['https://res.cloudinary.com/complaintreview/image/upload/v1790577273/knc-horizon/hero/jlt-towers-sheikh-zayed-road.jpg', 'Jumeirah Lake Towers office towers beside Sheikh Zayed Road'],
  '/terms': ['https://res.cloudinary.com/complaintreview/image/upload/v1790577272/knc-horizon/hero/fountain-pen-writing.jpg', 'A fountain pen writing in ink on lined paper'],
  '/terms-and-conditions': ['https://res.cloudinary.com/complaintreview/image/upload/v1790577272/knc-horizon/hero/fountain-pen-writing.jpg', 'A fountain pen writing in ink on lined paper'],
  '/privacy': ['https://res.cloudinary.com/complaintreview/image/upload/v1790577275/knc-horizon/hero/signing-documents.jpg', 'A hand signing a paper document with a pen'],
  '/privacy-policy': ['https://res.cloudinary.com/complaintreview/image/upload/v1790577275/knc-horizon/hero/signing-documents.jpg', 'A hand signing a paper document with a pen'],
};
