# Image sources and licences

Every photo on the KNC Horizon Realtor website is listed here: what it shows, where it is used, where it came from, its licence and its photographer. Keep this file up to date whenever an image is added, replaced or removed.

## The rules the photos follow

- **Real photographs only.** No 3D renders, CGI or AI-generated images. The five AI images that came with the original template, marked inside the files as OpenAI-generated, were removed in September 2026.
- **Taken where the text says.** Each photo's source page names the place: Dubai, or Gurugram for the India office. Photos from other countries are not used.
- **Licences that need no permission or credit and cannot be withdrawn:**
  - [CC0](https://creativecommons.org/publicdomain/zero/1.0/) or public domain (Wikimedia Commons, Flickr)
  - the [Unsplash License](https://unsplash.com/license) (never Unsplash+)
  - the [Pexels License](https://www.pexels.com/license/)
- **Licences that are not used:** CC BY, CC BY-SA, non-commercial or "all rights reserved". These require credit or permission.
- **Each photo appears once.** Gallery items are the exception: the gallery is a showcase and may repeat a photo used elsewhere.
- **A listing's cover shows its type.** The photo on a listing's card is a home or office of that type (an apartment room or balcony, a villa, a townhouse, a fitted office). Photos of the area come after it, inside the listing.
- **Served from Cloudinary.** Every photo and logo is delivered from the KNC Cloudinary account (cloud name `complaintreview`) under `knc-horizon/`; see [Where the files live](#where-the-files-live). No image is hotlinked from another website.
- **Checked on 25 September 2026:**
  - Every licence was re-read from the photo's own page.
  - Commons photos were checked through the Wikimedia API; Unsplash, Pexels and Flickr photos were checked on their photo pages.
  - Every file was scanned for AI-generation markers and compared against the others for duplicates.

## Things to keep in mind

- **These photo licences cover the photographer's copyright only.**
  - **Trademarks:** they do not cover trademarks visible in a photo, such as developer names on buildings. A developer's name appears only on that developer's own profile page (Emaar, DAMAC).
  - **People:** they do not cover the rights of people who can be recognised. No photo shows an identifiable person as its subject.
  - **Buildings:** the UAE has no "freedom of panorama" exception, so the design of a modern building can carry its own copyright, separate from the photo. This applies to every photo of modern Dubai and to real-estate websites in general.
    - To keep this risk low, no photo shows a single signature landmark on its own, such as the Dubai Frame, Dubai Opera or Museum of the Future.
    - Buildings finished before March 1993, such as the Al Fahidi houses and Jumeirah Mosque, are not affected.
    - For zero risk on listings, use the agency's own photos, or the developer's marketing images with their permission.
- **Representative photos.** Some listings and pages use a real photo of a comparable place in Dubai, because no free-licence photo of that exact community exists. The alt text for these names only what is actually shown:
  - Courtyard 17 (Dubai Hills), Saheel Villa (Arabian Ranches), Garden Residence (Jumeirah), Desert Modern (Al Barari), Park Row (Dubai Hills) and Square House (Town Square) show villas or townhouses elsewhere in Dubai.
  - Gallery photos added on 28 September 2026 show a real home of the listing's type in Dubai, not the listed home itself: villa pools (Azure House), a villa front (Courtyard 17), a townhouse garden and rooms (Park Row, Square House) and fitted offices (both JLT offices; the Cluster Office photos are a coworking centre in Moon Tower). Saheel Villa and Garden Residence keep their cover only: the only candidates showed a car with a readable number plate, or no garden or pool.
  - Apartment galleries (added 28 September 2026) show a real Dubai apartment of the listing's kind, with a view that fits the listing's area or no identifiable view; none is the listed unit. Canal Duplex shows a Business Bay residence without its double-height room or staircase: no free-licence photo of a Dubai duplex interior exists (checked on Pexels and Unsplash).
  - Seven photos are kept in the media library and are not shown on any page: the uncropped originals `dubai-townhouse-garden-swing`, `dubai-townhouse-patio-lounge`, `dubai-townhouse-sofa-garden-doors` and `dubai-office-meeting-room-breakout`, the earlier crops `dubai-office-meeting-room-lounge` and `downtown-dubai-balcony-burj-khalifa-dusk`, and `dubai-marina-apartment-living-room`. They can be deleted from the admin Media Library.
  - Some gallery photos are cropped: portrait photos are framed to the site's landscape cards, and four are trimmed so a developer's name on a distant building is not shown. The Pexels License allows this. Each crop is recorded in `backend/scripts/cloudinary-images.json`.
  - The Meridian Residence (penthouse, Dubai Marina): the cover and the window view are real views from a high floor in Dubai Marina (AJ Ahamad, January 2025). The living room, dining room and bedroom are one real Dubai penthouse (Real Estate 4k, April 2023); those photos do not show which district it is in. No free-licence photo of a penthouse that is itself in Dubai Marina exists on Wikimedia Commons, Unsplash, Pexels or Flickr (checked 28 September 2026).
  - Bay Grove Residences (Dubai Islands) shows the islands from the International Space Station. No free-licence ground photo of Dubai Islands exists yet on Wikimedia Commons, Unsplash or Pexels (checked 28 September 2026); Nakheel's own images, used with permission, would be the next step.
  - The Arabian Ranches community card shows another Dubai villa community.
  - Sobha Realty, Danube and Ellington show an area where each builds (Meydan, Dubai Silicon Oasis, Business Bay), not one of their own buildings.
  - Bay by Cavalli shows Port Rashid, next to Dubai Maritime City.
  - When real photos of these properties are available, replace these first.

## Where the files live

- **Cloudinary** delivers every image the site shows: cloud `complaintreview`, root folder `knc-horizon/`. Each file is its own asset, public_id `knc-horizon/<folder>/<file name without extension>`, e.g. `https://res.cloudinary.com/complaintreview/image/upload/v…/knc-horizon/properties/dubai-marina-promenade.jpg`. The pages ask Cloudinary for `f_auto,q_auto` and a width that fits the layout.
- **No image is served from the site itself.** The files that used to live in `frontend/public/images/`, `frontend/public/brand/` and `frontend/public/favicon.svg` were uploaded to Cloudinary unchanged (same bytes) and removed from the repo on 28 September 2026; git history still has them. The "File" column below is each photo's file name in Cloudinary.
- **Favicon.** The masters are in `backend/scripts/brand/` (`knc-favicon.svg` and the PNG, ICO and Apple files rendered from it). `frontend/index.html` links the Cloudinary copies, and `frontend/vercel.json` answers `/favicon.ico`, `/favicon.svg`, `/favicon.png` and `/apple-touch-icon.png` with them. The emblem is sized to sit inside the circle Google Search crops favicons to.
- **`backend/scripts/cloudinary-images.json`** lists every image with its folder, public_id and URL; photos added later also carry `source`, the licensed original they were uploaded from. `backend/scripts/migrate-images-to-cloudinary.mjs` uploads new entries and registers them in the media library.

| Folder | What it holds | Files |
|---|---|---|
| `knc-horizon/properties` | Property listing photos (59 shown on listings, 1 shown on the Gallery page only, 7 kept in the media library only) | 67 |
| `knc-horizon/projects` | Off-plan project photos | 7 |
| `knc-horizon/developers` | Developer profile covers | 8 |
| `knc-horizon/communities` | Community photos, and the default share image | 6 |
| `knc-horizon/interiors` | Interiors and design-and-build photos | 3 |
| `knc-horizon/gallery` | Gallery-only photos | 9 |
| `knc-horizon/blog` | Blog covers | 5 |
| `knc-horizon/hero` | Page headers | 29 |
| `knc-horizon/pages` | Other in-page photos and the fallback image | 2 |
| `knc-horizon/logos` | KNC Horizon Realtor logos (6 SVG) and favicon files (SVG, PNG 48/96/192/512, ICO, Apple touch icon, and the first favicon) | 14 |

Images the admin uploads go to the same account, in these folders or their sub-folders, such as `knc-horizon/properties/residential`.

## Property listings

| File | Used for | Shows | Source | Licence | Photographer |
|---|---|---|---|---|---|
| `address-sky-view-night.jpg` | Listing: The Address Sky View, gallery | Address Sky View tower in Downtown Dubai lit up at night, with the EMAAR name on its crown | [Unsplash](https://unsplash.com/photos/modern-skyscraper-illuminated-at-night-with-unique-architecture-dt-T0vW-o5U) | Unsplash License | Vishnu Kalanad |
| `business-bay-towers-aerial.jpg` | Listing: Canal Duplex, gallery | Cluster of Business Bay residential high-rises on a clear day, seen from high above, Dubai | [Unsplash](https://unsplash.com/photos/an-aerial-view-of-a-city-with-tall-buildings-1FuwIHTJL0A) | Unsplash License | Nelemson Guevarra |
| `business-bay-canal-day.jpg` | Listing: Canal House, gallery | Business Bay towers along the canal on a clear day, seen from high above, Dubai | [Unsplash](https://unsplash.com/photos/an-aerial-view-of-a-city-with-tall-buildings-cxtmm36ItkQ) | Unsplash License | Nelemson Guevarra |
| `dubai-water-canal-night.jpg` | Listing: Canal Studio, gallery | Dubai Water Canal at night, lit promenades on both banks and towers along the skyline | [Unsplash](https://unsplash.com/photos/lighted-buildings-at-night-52kHTpGahi8) | Unsplash License | Pranav Madhu |
| `dubai-coworking-office.jpg` | Listing: Cluster Office Floor (JLT) | Shared work desk and meeting table under pendant lights in a coworking office in Dubai | [Unsplash](https://unsplash.com/photos/a-room-with-a-table-chairs-and-a-clock-on-the-wall-yDBsF9eID8Q) | Unsplash License | Coralt Zou |
| `dubai-creek-harbour-towers.jpg` | Listing: Creekside Loft, gallery | Residential towers at Dubai Creek Harbour in late-afternoon sun, with palm trees below | [Unsplash](https://unsplash.com/photos/cars-parked-near-high-rise-buildings-during-daytime-onP3aM_3tuA) | Unsplash License | Aadil Sabeer |
| `dubai-contemporary-villa.jpg` | Listing: Courtyard 17 (villa) | Contemporary villa with a landscaped front garden on a quiet residential street in Dubai | [Pexels](https://www.pexels.com/photo/modern-villa-in-dubai-residential-area-34188580/) | Pexels License | AJ Ahamad |
| `dubai-villa-community-lake.jpg` | Listing: Desert Modern (villa) | Aerial view of villas among palms and lush trees beside a lake in a Dubai villa community | [Unsplash](https://unsplash.com/photos/a-birds-eye-view-of-a-residential-neighborhood-TqouW9u0qmk) | Unsplash License | Eslam Tawakol |
| `dubai-mediterranean-villas.jpg` | Listing: Saheel Villa (villa) | Mediterranean-style villas with terracotta roofs behind date palms and lawns in Dubai | [Pexels](https://www.pexels.com/photo/mediterranean-villas-with-lush-garden-landscape-33977060/) | Pexels License | Ayrat |
| `dubai-villas-pools-aerial.jpg` | Listing: Garden Residence (villa) | Aerial view of villas with private pools and leafy gardens around a cul-de-sac in Dubai | [Pexels](https://www.pexels.com/photo/aerial-view-of-buildigns-1642125/) | Pexels License | The Lazy Artist Gallery |
| `palm-jumeirah-frond-villas.jpg` | Listing: Azure House (Palm Jumeirah) | Villas and palm trees on a Palm Jumeirah frond in Dubai, with the Burj Al Arab in the distance | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Views_from_Palm_Jumeirah_Monorail_7.jpg) | CC0 (public domain dedication) | EditQ |
| `dubai-townhouse-street.jpg` | Listing: Park Row (townhouse) | Row of Mediterranean-style townhouses on a quiet Dubai community street, city skyline in the distance | [Unsplash](https://unsplash.com/photos/a-beautiful-cityscape-with-buildings-and-streets-R9Dc1pwBTjY) | Unsplash License | Ben Koorengevel |
| `dubai-townhouse-row.jpg` | Listing: Square House (townhouse) | Row of cream townhouses with tiled roofs and balconies in a Dubai residential community | [Unsplash](https://unsplash.com/photos/row-of-modern-townhouses-against-a-pale-sky-JC0WFl2S3v8) | Unsplash License | aboodi vesakaran |
| `jvc-circle-aerial.jpg` | Listing: Circle Gardens, gallery | Aerial view at dusk of a landscaped circle and apartment blocks in Jumeirah Village Circle, Dubai | [Unsplash](https://unsplash.com/photos/an-aerial-view-of-a-city-with-a-circular-building-Djln5-h7r0I) | Unsplash License | Alim |
| `downtown-night-aerial.jpg` | Listing: City Light Residence, gallery; Gallery page | Downtown Dubai and Sheikh Zayed Road lit up at night, seen from above | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Downtown,_Dubai_(36714617205).jpg) | CC0 (public domain dedication) | bulletrain743 (via Pixabay) |
| `dubai-marina-dusk.jpg` | Listing: Marina Sunline, gallery; Gallery page | Dubai Marina towers and the marina canal at dusk | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Dubai_Marina_27.12.2024.jpg) | CC0 (public domain dedication) | Maaroo24 |
| `dubai-marina-night-view-high-floor.jpg` | Listing: The Meridian Residence, gallery | Dubai Marina at night from a high floor: lit towers above the marina, a dhow and moored yachts | [Pexels](https://www.pexels.com/photo/vibrant-dubai-marina-skyline-at-night-30554306/) | Pexels License | AJ Ahamad |
| `dubai-marina-canal-window-view.jpg` | Listing: The Meridian Residence, gallery | The Dubai Marina canal, a bridge and yachts at golden hour, seen through a high-floor apartment window | [Pexels](https://www.pexels.com/photo/30554295/) | Pexels License | AJ Ahamad |
| `dubai-penthouse-living-room.jpg` | Listing: The Meridian Residence, cover (the photo on the card) | Living room of a Dubai penthouse: grey sofa, armchairs and a patterned rug on white marble | [Pexels](https://www.pexels.com/photo/18305070/) (titled "Penthouse") | Pexels License | Real Estate 4k |
| `dubai-penthouse-dining-room.jpg` | Listing: The Meridian Residence, gallery | Dining room of the same penthouse: ten-seat walnut table under pendant lights, living area beyond | [Pexels](https://www.pexels.com/photo/18305067/) | Pexels License | Real Estate 4k |
| `dubai-penthouse-master-bedroom.jpg` | Listing: The Meridian Residence, gallery | Master bedroom of the same penthouse: king bed, writing desk, corridor to the dressing area | [Pexels](https://www.pexels.com/photo/18305069/) | Pexels License | Real Estate 4k |
| `jlt-lake-towers.jpg` | Listing: Lake Level Office, gallery | Jumeirah Lake Towers high-rises around a JLT lake, seen from the lakeside walk | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:JLT_Lake_from_first_level.jpg) | CC0 (public domain dedication) | Yourusernamewillbepublic2 |
| `dubai-villa-lap-pool-deck.jpg` | Listing: Azure House, gallery | Modern two-storey Dubai villa with a long lap pool, timber deck and palms | [Pexels](https://www.pexels.com/photo/10647324/) | Pexels License | Abid Ali |
| `dubai-villa-pool-terrace-lounge.jpg` | Listing: Azure House, gallery | The same villa's pool from the garden: hanging chair, covered terrace lounge, mature trees | [Pexels](https://www.pexels.com/photo/10647349/) | Pexels License | Abid Ali |
| `dubai-modern-villa-garage-front.jpg` | Listing: Courtyard 17, gallery | Front of a contemporary cream villa with a double garage and carport (photographer's Dubai real-estate series, August 2025; the page itself carries no location field) | [Pexels](https://www.pexels.com/photo/34188582/) | Pexels License | AJ Ahamad |
| `dubai-townhouse-garden-swing-lawn.jpg` | Listing: Park Row, gallery | Private townhouse garden with a wooden swing on the lawn, a palm and bougainvillea. Landscape crop of a portrait photo | [Pexels](https://www.pexels.com/photo/30250659/) | Pexels License | AJ Ahamad |
| `dubai-townhouse-patio-seating.jpg` | Listing: Park Row, gallery | Sunlit patio seating in front of a garden screen (same home). Landscape crop of a portrait photo | [Pexels](https://www.pexels.com/photo/30250657/) | Pexels License | AJ Ahamad |
| `dubai-townhouse-sofa-by-garden-doors.jpg` | Listing: Park Row, gallery | Living-room sofa beside sliding doors onto the garden (same home). Landscape crop of a portrait photo | [Pexels](https://www.pexels.com/photo/30250660/) | Pexels License | AJ Ahamad |
| `dubai-townhouse-row-street.jpg` | Listing: Square House, gallery | Street of contemporary cream townhouses with carports (photographer's Dubai real-estate series, August 2025; the page itself carries no location field) | [Pexels](https://www.pexels.com/photo/34188578/) | Pexels License | AJ Ahamad |
| `dubai-townhouse-living-room-arched-doors.jpg` | Listing: Square House, gallery | Living room with a plush sofa and green armchairs behind arched black-framed glass doors, Dubai | [Unsplash](https://unsplash.com/photos/MME_XnKUTIg) | Unsplash License | Usman Mehmood |
| `dubai-townhouse-dining-room.jpg` | Listing: Square House, gallery | Dining room with a round table and green chairs, framed by arched glass doors (same home) | [Unsplash](https://unsplash.com/photos/XnWwYYFvGrE) | Unsplash License | Usman Mehmood |
| `dubai-office-coffee-bar-reception.jpg` | Listing: Cluster Office Floor, gallery | Fitted office floor in Moon Tower, Dubai: round coffee bar, glass meeting pods, full-height glazing (same shoot as the cover) | [Unsplash](https://unsplash.com/photos/the-coffee-bar-is-located-in-the-middle-of-the-building-T3jf5TUaHOE) | Unsplash License | Coralt Zou |
| `dubai-office-breakout-world-map.jpg` | Listing: Cluster Office Floor, gallery | Office breakout area with a bar counter, high stools and a world-map wall (same shoot) | [Unsplash](https://unsplash.com/photos/8L3QuLJeTKs) | Unsplash License | Coralt Zou |
| `dubai-office-meeting-room-lounge.jpg` | Media library only (an earlier crop of the Lake Level Office photo) | Breakout seating with white armchairs beside a fluted-glass partitioned meeting room in a Dubai office. Landscape crop of a portrait photo | [Pexels](https://www.pexels.com/photo/interior-of-office-20417389/) | Pexels License | Muhammad Haris |
| `dubai-villa-master-bedroom-suite.jpg` | Listing: Desert Modern, gallery | Master bedroom with floor-to-ceiling curtained glazing and floating shelves, Dubai | [Pexels](https://www.pexels.com/photo/30217028/) | Pexels License | S3T Koncepts |
| `dubai-villa-bedroom-media-wall.jpg` | Listing: Desert Modern, gallery | The same bedroom from the bed: media wall, open shelving, doorway to the dressing room | [Pexels](https://www.pexels.com/photo/30217120/) | Pexels License | S3T Koncepts |
| `dubai-villa-ensuite-bathroom.jpg` | Listing: Desert Modern, gallery | En-suite bathroom with arched backlit mirrors and stone walls (same home) | [Pexels](https://www.pexels.com/photo/30217152/) | Pexels License | S3T Koncepts |
| `business-bay-residence-kitchen-island.jpg` | Listing: Canal Duplex, cover (the photo on the card) | Kitchen with oak joinery and a black island, terrace above Business Bay. Cropped to leave out a developer's sign on a distant tower | [Pexels](https://www.pexels.com/photo/36903860/) | Pexels License | Waqas Ilyas |
| `business-bay-residence-bathroom-view.jpg` | Listing: Canal Duplex, gallery | Freestanding bath at floor-to-ceiling glass over the Business Bay towers (same residence) | [Pexels](https://www.pexels.com/photo/36903893/) | Pexels License | Waqas Ilyas |
| `business-bay-apartment-canal-view-lounge.jpg` | Listing: Canal House, cover (the photo on the card) | Two armchairs at full-height windows over the Business Bay canal. Cropped at the left edge | [Pexels](https://www.pexels.com/photo/32418264/) | Pexels License | Kailas Prasad |
| `business-bay-apartment-dining-room.jpg` | Listing: Canal House, gallery | Dining table under pendant lights, lounge and terrace beyond (same apartment). Cropped at the left edge | [Pexels](https://www.pexels.com/photo/32418265/) | Pexels License | Kailas Prasad |
| `business-bay-residence-pool-deck.jpg` | Listing: Canal House, gallery | Pool deck with timber loungers and Business Bay towers behind | [Pexels](https://www.pexels.com/photo/36903870/) | Pexels License | Waqas Ilyas |
| `dubai-studio-apartment-sofa-bed.jpg` | Listing: Canal Studio, cover (the photo on the card) | Furnished studio with a sofa bed made up, two artworks and the balcony door, Dubai | [Pexels](https://www.pexels.com/photo/32168965/) | Pexels License | AJ Ahamad |
| `dubai-studio-balcony-breakfast.jpg` | Listing: Canal Studio, gallery | Breakfast on the same studio's balcony table at night | [Pexels](https://www.pexels.com/photo/32168955/) | Pexels License | AJ Ahamad |
| `dubai-apartment-balcony-midrise-view.jpg` | Listing: Circle Gardens, cover (the photo on the card) | Apartment balcony with two chairs and mid-rise blocks beyond, Dubai | [Pexels](https://www.pexels.com/photo/29247919/) | Pexels License | AJ Ahamad |
| `dubai-apartment-kitchen-bar-table.jpg` | Listing: Circle Gardens, gallery | Open kitchen with a bar table and stools, Dubai apartment | [Pexels](https://www.pexels.com/photo/29149072/) | Pexels License | AJ Ahamad |
| `dubai-apartment-living-room-sofa.jpg` | Listing: Circle Gardens, gallery | Living room with a grey sofa and coffee table (same apartment as the kitchen). Landscape crop of a portrait photo | [Pexels](https://www.pexels.com/photo/29149071/) | Pexels License | AJ Ahamad |
| `downtown-dubai-balcony-burj-khalifa-dusk.jpg` | Media library only (an earlier crop of the City Light Residence balcony photo) | Balcony with two chairs facing the Burj Khalifa at dusk. Landscape crop of a portrait photo | [Pexels](https://www.pexels.com/photo/33363140/) | Pexels License | Mary Rose Relente |
| `downtown-dubai-apartment-dining-table.jpg` | Listing: City Light Residence, gallery | Dining table set for four in a Downtown Dubai apartment. Landscape crop of a portrait photo | [Pexels](https://www.pexels.com/photo/30336909/) | Pexels License | AJ Ahamad |
| `downtown-dubai-apartment-sofa-corner.jpg` | Listing: City Light Residence, gallery | Sofa corner with a vase on a gold side table (same apartment). Landscape crop of a portrait photo | [Pexels](https://www.pexels.com/photo/30336905/) | Pexels License | AJ Ahamad |
| `dubai-apartment-open-plan-living.jpg` | Listing: Creekside Loft, cover (the photo on the card) | Open-plan living and dining room of a Dubai apartment, no window view (the apartment itself is in Dubai Marina) | [Pexels](https://www.pexels.com/photo/33621947/) | Pexels License | Real Estate 4k |
| `dubai-creek-harbour-marina-from-above.jpg` | Listing: Creekside Loft, gallery | Dubai Creek Harbour marina seen from a high floor. Landscape crop of a portrait photo | [Pexels](https://www.pexels.com/photo/19495373/) | Pexels License | AJ Ahamad |
| `dubai-creek-sunset-skyline.jpg` | Listing: Creekside Loft, gallery | Sunset over Dubai Creek with the Downtown skyline (same shoot). Landscape crop of a portrait photo | [Pexels](https://www.pexels.com/photo/19495374/) | Pexels License | AJ Ahamad |
| `dubai-marina-apartment-bedroom.jpg` | Listing: Marina Sunline, cover (the photo on the card) | Bedroom of a furnished Dubai Marina apartment (the apartment whose views the Meridian Residence uses) | [Pexels](https://www.pexels.com/photo/30554296/) | Pexels License | AJ Ahamad |
| `dubai-marina-apartment-sofa-olive-tree.jpg` | Listing: Marina Sunline, gallery | Sofa corner with an olive tree beside the kitchenette (same apartment). Landscape crop of a portrait photo | [Pexels](https://www.pexels.com/photo/30554291/) | Pexels License | AJ Ahamad |
| `dubai-marina-apartment-bathroom-vanity.jpg` | Listing: Marina Sunline, gallery | Bathroom vanity with rolled towels and an orchid (same apartment). Landscape crop of a portrait photo | [Pexels](https://www.pexels.com/photo/30554300/) | Pexels License | AJ Ahamad |
| `downtown-dubai-balcony-burj-khalifa.jpg` | Listing: The Address Sky View, gallery | Balcony corner looking up at the Burj Khalifa and Downtown towers. Cropped at the left edge to leave out part of a sign | [Pexels](https://www.pexels.com/photo/29080570/) | Pexels License | AJ Ahamad |
| `downtown-dubai-apartment-living-dining.jpg` | Listing: The Address Sky View, cover (the photo on the card) | Living and dining area with a curved sofa and round table (same Downtown apartment). Landscape crop of a portrait photo | [Pexels](https://www.pexels.com/photo/29080566/) | Pexels License | AJ Ahamad |
| `downtown-dubai-apartment-twin-bedroom.jpg` | Listing: The Address Sky View, gallery | Twin bedroom with scalloped headboards (same Downtown apartment). Landscape crop of a portrait photo | [Pexels](https://www.pexels.com/photo/29080565/) | Pexels License | AJ Ahamad |
| `downtown-dubai-balcony-table-burj-khalifa.jpg` | Listing: City Light Residence, cover (the photo on the card) | Apartment balcony with a chair and table facing the Burj Khalifa. Landscape crop of a portrait photo | [Pexels](https://www.pexels.com/photo/modern-cityscape-view-with-burj-khalifa-33363140/) | Pexels License | Mary Rose Relente |
| `dubai-office-lounge-glass-partition.jpg` | Listing: Lake Level Office, cover (the photo on the card) | Office lounge with white armchairs and a sofa beside a fluted-glass partitioned meeting room, Dubai. Landscape crop of a portrait photo | [Pexels](https://www.pexels.com/photo/interior-of-office-20417389/) | Pexels License | Muhammad Haris |

## Off-plan projects

| File | Used for | Shows | Source | Licence | Photographer |
|---|---|---|---|---|---|
| `jumeirah-islands-lakeside-villas.jpg` | Project: The Oasis | Aerial view of lakeside villas with pools and gardens in Jumeirah Islands, Dubai | [Unsplash](https://unsplash.com/photos/an-aerial-view-of-a-house-with-a-swimming-pool-4mcc0wEhmlM) | Unsplash License | Eslam Tawakol |
| `dubai-villa-community-golf-lake.jpg` | Project: The Valley | Lake, palm-lined lawns and golf greens with villas around them in a Dubai residential community | [Unsplash](https://unsplash.com/photos/a-large-body-of-water-surrounded-by-palm-trees-6g7PM3PIsZo) | Unsplash License | Nelemson Guevarra |
| `jvc-towers-construction.jpg` | Project: Binghatti Circle (JVC) | Apartment towers under construction with tower cranes in Jumeirah Village Circle, Dubai | [Unsplash](https://unsplash.com/photos/construction-of-several-high-rise-buildings-is-underway-gROCANC38BU) | Unsplash License | Ben Koorengevel |
| `ras-al-khor-towers.jpg` | Project: Sobha One (Ras Al Khor) | Flamingos at Ras Al Khor Wildlife Sanctuary, Dubai, with new high-rise towers rising beyond the mangroves | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Flamingos_in_the_background_of_the_city.jpg) | CC0 (public domain dedication) | Kate Bazhenova83 |
| `jaddaf-waterfront.jpg` | Project: Avenue (Al Jaddaf) | Jaddaf Waterfront promenade and Dubai Creek seen from a waterfront building in Al Jaddaf, Dubai | [Unsplash](https://unsplash.com/photos/a-hotel-with-a-pool-and-palm-trees-in-front-of-it-YwpS1BHzHI8) | Unsplash License | Riyas Mohammed |
| `dubai-islands-from-space.jpg` | Project: Bay Grove Residences (Dubai Islands) | Astronaut photo from the ISS of Dubai Islands (then Deira Islands) and their shoreline off Deira, May 2021 | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:ISS065-E-74317_-_View_of_Earth.jpg) | Public domain | NASA Johnson Space Center, Earth Science and Remote Sensing Unit |
| `port-rashid-waterfront.jpg` | Project: Bay by Cavalli (Dubai Maritime City) | The Port Rashid waterfront beside Dubai Maritime City, with the Dubai skyline beyond | [Unsplash](https://unsplash.com/photos/a-large-body-of-water-with-a-city-in-the-background-s2TS09e5-8A) | Unsplash License | Emiel Molenaar |

## Communities

| File | Used for | Shows | Source | Licence | Photographer |
|---|---|---|---|---|---|
| `dubai-fountain-downtown.jpg` | Community: Downtown Dubai | The Burj Khalifa and Downtown Dubai towers beside Burj Lake at sunset | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:The_Dubai_Fountain_%26_Burj_Khalifa_Pixabay.jpg) | CC0 (public domain dedication) | Christian Raggini |
| `dubai-marina-canal-day.jpg` | Community: Dubai Marina | Residential towers along the Dubai Marina canal on a clear day | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Dubai_Marina_3.jpg) | CC0 (public domain dedication) | EditQ |
| `palm-jumeirah-aerial.jpg` | Community: Palm Jumeirah; gallery | Palm Jumeirah and its fronds photographed from space | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Palm_Island_Resort.jpg) | Public domain | Commander Leroy Chiao |
| `hero-dubai-skyline.jpg` | Community: Business Bay; gallery; default share (Open Graph) image | Business Bay towers and the Burj Khalifa at night, reflected in still water | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Dubai_skyline_unsplash.jpg) | CC0 (public domain dedication) | Robert Bock |
| `jumeirah-coast-burj-al-arab.jpg` | Community: Jumeirah; gallery | The Jumeirah coastline with the Burj Al Arab and the city behind it | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Dubai_skyscrapers,_coastline_and_Burj_Al-Arab.jpg) | CC0 (public domain dedication) | Ahmad Ardity |
| `dubai-villa-community-aerial.jpg` | Community: Arabian Ranches (representative Dubai villa community; Arabian Ranches itself has no free-licence photo) | Low-rise villa community in Dubai seen from above, with towers on the horizon | [Unsplash](https://unsplash.com/photos/Yeq7xHJ87_U) | Unsplash License | Kate Trysh |

## Developer profiles

| File | Used for | Shows | Source | Licence | Photographer |
|---|---|---|---|---|---|
| `dubai-mall-emaar.jpg` | Developer: Emaar | Emaar towers beside The Dubai Mall entrance in Downtown Dubai, EMAAR signage on tower and mall | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Dubai_Mall_9.jpg) | CC0 (public domain dedication) | EditQ |
| `palm-jumeirah-avenue.jpg` | Developer: Nakheel; gallery | A palm-lined avenue on Palm Jumeirah under a clear sky | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Palm_Jumeirah_1.jpg) | CC0 (public domain dedication) | EditQ |
| `bluewaters-ain-dubai.jpg` | Developer: Meraas | Aerial view of Bluewaters Island and the Ain Dubai wheel off the Dubai coast, a Meraas development | [Unsplash](https://unsplash.com/photos/an-aerial-view-of-a-city-and-the-ocean-XRYbyKU05lg) | Unsplash License | Nelemson Guevarra |
| `damac-hills-towers.jpg` | Developer: DAMAC | DAMAC-branded residential towers and modern villas at night in DAMAC Hills, Dubai | [Unsplash](https://unsplash.com/photos/modern-city-skyline-with-illuminated-buildings-and-streets-at-night-KvRWT6x6Kag) | Unsplash License | Nejc Soklič |
| `meydan-bridge-night.jpg` | Developer: Sobha Realty (Meydan / MBR City area) | The illuminated Meydan Bridge at night in Meydan, Dubai | [Unsplash](https://unsplash.com/photos/gray-road-o95oi0fdYCo) | Unsplash License | Iwona Castiello d'Antonio |
| `binghatti-building.jpg` | Developer: Binghatti | Facade of a Binghatti residential building in Dubai with zig-zag white balconies and red accents | [Unsplash](https://unsplash.com/photos/5qQmC6_1X8U) | Unsplash License | Saj Shafique |
| `dubai-silicon-oasis.jpg` | Developer: Danube (Dubai Silicon Oasis area) | Dubai Silicon Oasis headquarters building behind palm trees in Dubai Silicon Oasis | [Unsplash](https://unsplash.com/photos/white-and-blue-concrete-building-near-green-trees-under-blue-sky-during-daytime-gUNZQ3Mc7HA) | Unsplash License | Saj Shafique |
| `business-bay-canal-night.jpg` | Developer: Ellington (Business Bay area) | Residential towers along the Business Bay canal at night, seen from the waterfront promenade in Dubai | [Flickr](https://www.flickr.com/photos/76319087@N08/55158256386) | CC0 (public domain dedication) | Werner Bayer |

## Home page and service cards

| File | Used for | Shows | Source | Licence | Photographer |
|---|---|---|---|---|---|
| `hero-dubai-sunset.jpg` | Home: hero | The Dubai skyline and the Burj Khalifa silhouetted against a sunset across the water | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Dubai_UAE_Landscape.jpg) | CC0 (public domain dedication) | Rupak Chatterjee |
| `difc-aerial-day.jpg` | Home: Invest in Dubai section | The DIFC and Sheikh Zayed Road business towers seen from above in daylight | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:View_of_DIFC_from_At_The_Top_Burj_Khalifa.jpg) | CC0 (public domain dedication) | Yourusernamewillbepublic2 |
| `dubai-townhouses-construction.jpg` | Service card: Design & Build (home and Services) | Row of two-storey townhouses under construction in Dubai, with a concrete pump boom and site barriers | [Unsplash](https://unsplash.com/photos/OKftsPvkW4U) | Unsplash License | Milo Bunnik |
| `dubai-living-room-finished.jpg` | Service card: Interiors & Furniture (home and Services) | Finished Dubai living room with grey sofa, glass coffee table, white rug and ring pendant light | [Unsplash](https://unsplash.com/photos/a-living-room-with-a-gray-couch-and-a-white-rug-_BBps6MAJ2w) | Unsplash License | Riyas Mohammed |
| `dubai-skyline-from-sea.jpg` | Home: closing call-to-action; also the fallback when an image is missing | The Dubai skyline and the Burj Al Arab seen across the sea | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Dubai_skylines_(Pixabay_1536496).jpg) | CC0 (public domain dedication) | Ronald Sagarino |

## Page headers

| File | Used for | Shows | Source | Licence | Photographer |
|---|---|---|---|---|---|
| `dubai-skyline-creek-sunset.jpg` | Header: About | The Dubai skyline silhouetted at sunset across Dubai Creek | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Dubai_skyline_in_the_evening.jpg) | Public domain | Lehtm25 |
| `al-fahidi-wind-towers.jpg` | Header: Our Approach | Traditional sand-coloured houses with wind towers around a quiet courtyard in Al Bastakiya, old Dubai | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Al_Bastakiya_5.jpg) | CC0 (public domain dedication) | EditQ |
| `gurugram-skyline.jpg` | Header: India Office | Gurugram (Gurgaon) skyline of residential and office high-rises under an overcast sky | [Unsplash](https://unsplash.com/photos/qWJspbJNnD4) | Unsplash License | Ishaan Sen |
| `marina-resort-greens.jpg` | Header: Areas / Communities; gallery | The Dubai Marina yacht club and the Palm Jumeirah shoreline, with the Burj Al Arab in the distance | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Dubai_Marina_and_Skyline_from_Le_Royal_M%C3%A9ridien_Beach_Resort_and_Spa.jpg) | Public domain | CT Cooper |
| `sheikh-zayed-road-aerial.jpg` | Header: Market Insights | Aerial view of Sheikh Zayed Road interchanges and high-rise towers in Dubai | [Unsplash](https://unsplash.com/photos/9MsvwQVimvE) | Unsplash License | Kate Trysh |
| `jlt-towers-sheikh-zayed-road.jpg` | Header: Contact | Row of Jumeirah Lake Towers office towers beside Sheikh Zayed Road and the Dubai Metro on a clear day | [Unsplash](https://unsplash.com/photos/bSNOgbA5R_k) | Unsplash License | Nelemson Guevarra |
| `dubai-skyline-golf-course.jpg` | Header: Services | Dubai skyline with the Burj Khalifa seen across water and green palm-dotted lawns on a clear day | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Dubai_12.jpg) | CC0 (public domain dedication) | EditQ |
| `dubai-hills-construction.jpg` | Header: Design & Build | Scaffolded mid-rise residential blocks under construction with tower cranes in Dubai Hills, Dubai | [Unsplash](https://unsplash.com/photos/white-concrete-building-during-daytime-7zb61IiSIV8) | Unsplash License | Milo Bunnik |
| `dubai-apartment-living-room.jpg` | Header: Interiors & Furniture | Furnished Dubai apartment living room with cream sofa, green armchairs and plants by tall windows | [Unsplash](https://unsplash.com/photos/modern-living-room-with-plush-sofa-and-green-chairs-MME_XnKUTIg) | Unsplash License | Usman Mehmood |
| `dubai-interior-styling.jpg` | Interiors page: body image | Black side table with a white ceramic vase of dried stems beside a boucle headboard | [Unsplash](https://unsplash.com/photos/a-vase-with-a-flower-in-it-sitting-on-a-table-GoqQtIumXIU) | Unsplash License | Taru Goyal |
| `downtown-safa-park.jpg` | Header: Properties; gallery | Downtown Dubai and Business Bay seen across the water from Safa Park | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Downtown_Burj_Dubai_and_Business_Bay,_seen_from_Safa_Park.jpg) | Public domain | Robert Luxemburg |
| `burj-khalifa-aerial.jpg` | Header: Properties for sale; gallery | The Burj Khalifa above the Downtown Dubai skyline in daylight | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Dubai,_United_Arab_Emirates_(Unsplash_suv4vuJsH6g).jpg) | CC0 (public domain dedication) | Caleb Whiting dogbear869 |
| `jbr-residences-street.jpg` | Header: Properties for rent | Jumeirah Beach Residence towers beside Dubai Marina residential high-rises | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Dubai_Marina_16.jpg) | CC0 (public domain dedication) | EditQ |
| `the-greens-residential.jpg` | Header: Residential properties | Elevated view of low-rise apartments, palm-lined avenue and residential towers in The Greens, Dubai | [Unsplash](https://unsplash.com/photos/whO4mSrOvCI) | Unsplash License | Dubai Prod |
| `difc-green-towers.jpg` | Header: Commercial properties; gallery | Office towers on Sheikh Zayed Road near the Dubai World Trade Centre | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Sheikh_Zayed_Road_10.jpg) | CC0 (public domain dedication) | EditQ |
| `business-bay-skyline-day.jpg` | Header: Investment properties | Business Bay towers beside the water with the Burj Khalifa rising behind on a clear day | [Unsplash](https://unsplash.com/photos/lMo2HjtoUpM) | Unsplash License | Sirav Talwar |
| `jvc-tower-construction-dusk.jpg` | Header: Off-plan properties | Concrete tower frame and crane rising at dusk in Jumeirah Village Circle, Dubai, with a distant skyline | [Unsplash](https://unsplash.com/photos/a-city-with-tall-buildings-W5r3LGIbB3s) | Unsplash License | Timothy Yiadom |
| `dubai-new-towers-aerial.jpg` | Header: Projects / Off-plan | Aerial view from Burj Khalifa of new towers rising, some still under construction, around Business Bay, Dubai | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Dubai,_View_from_Burj_Khalifa,_2018.jpg) | CC0 (public domain dedication) | Ubahnverleih |
| `burj-night-water.jpg` | Header: Featured projects; gallery | The Downtown Dubai skyline and the Burj Khalifa at night, seen across the water | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Dubai_skyscrapers_at_night_2011.jpg) | CC0 (public domain dedication) | Michaelbibin from Pixabay |
| `dubai-waterfront-tower-construction.jpg` | Header: New launches | Residential tower under construction with two tower cranes beside finished glass towers on a Dubai waterfront | [Unsplash](https://unsplash.com/photos/a-group-of-tall-buildings-next-to-a-body-of-water-Kpa3c-eVAeg) | Unsplash License | Tawana Chitumba |
| `dubai-tower-cranes-twilight.jpg` | Header: Off-plan projects | Concrete tower rising under two tower cranes at twilight in Dubai, with finished high-rises behind | [Unsplash](https://unsplash.com/photos/construction-site-with-cranes-and-unfinished-building-nhFkTSG1RdE) | Unsplash License | Luan Fonseca |
| `dubai-apartment-towers-sunset.jpg` | Header: Off-plan apartments | Modern residential apartment towers rising over a Dubai neighbourhood at sunset | [Unsplash](https://unsplash.com/photos/an-aerial-view-of-a-city-with-tall-buildings-bpIISsHtlWk) | Unsplash License | Sajimon Sahadevan |
| `daria-island-seafront-villa.jpg` | Header: Off-plan villas & townhouses | Aerial view of a seafront villa garden and pool beside a rock breakwater in Dubai, next to a plot under construction | [Unsplash](https://unsplash.com/photos/a-birds-eye-view-of-a-beach-and-a-body-of-water-XMAZKeBpdsA) | Unsplash License | Eslam Tawakol |
| `downtown-skyline-cranes.jpg` | Header: Developers | Downtown Dubai skyline over Burj Lake with tower cranes on new residential towers under construction | [Unsplash](https://unsplash.com/photos/city-skyline-across-body-of-water-during-daytime-ZeeBAKnEku8) | Unsplash License | M o e |
| `dubai-creek-dusk.jpg` | Header: Blog; gallery | Dubai Creek at dusk with the Deira waterfront and abras | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Deira_Dubai_Creek.jpg) | CC0 (public domain dedication) | kallerna |
| `madinat-jumeirah-canal.jpg` | Header: Gallery; gallery | A canal at Souk Madinat Jumeirah with the Burj Al Arab beyond the palms | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Dubai_in_January_2025_12.jpg) | CC0 (public domain dedication) | Renek78 |
| `signing-documents.jpg` | Header: Privacy Policy | A hand signing a paper document with a pen | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Sign_here_(Unsplash).jpg) | CC0 (public domain dedication) | Helloquence helloquence |
| `fountain-pen-writing.jpg` | Header: Terms & Conditions | A fountain pen writing in ink on lined paper | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Writing_with_a_fountain_pen_(Unsplash).jpg) | CC0 (public domain dedication) | Aaron Burden aaronburden |
| `maritime-city-towers.jpg` | Header: community not found; gallery ("The Dubai Marina coast") | Hotel towers on the Dubai Marina coast overlooking the yacht club and Palm Jumeirah | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Dubai_Marina_and_skyline_from_Le_Royal_M%C3%A9ridien_Beach_Resort_and_Spa_3.jpg) | Public domain | CT Cooper |

## Blog covers

| File | Used for | Shows | Source | Licence | Photographer |
|---|---|---|---|---|---|
| `dubai-tower-construction-cranes.jpg` | Blog: A clear-eyed guide to buying off-plan in Dubai | Residential tower under construction with two tower cranes beside a finished apartment building in Dubai | [Unsplash](https://unsplash.com/photos/a-couple-of-tall-buildings-next-to-each-other-9HP5UpkyptM) | Unsplash License | Kate Trysh |
| `city-walk-residences.jpg` | Blog: Designing a better home search | Modern mid-rise residential buildings along a quiet palm-lined street in Dubai's City Walk area | [Unsplash](https://unsplash.com/photos/a-city-street-with-tall-buildings-and-palm-trees-DsCHv9hLAQA) | Unsplash License | Kate Trysh |
| `dubai-residential-buildings.jpg` | Blog: The Dubai rental reset | Mid-rise and high-rise residential apartment buildings in a Dubai neighbourhood under a clear sky | [Unsplash](https://unsplash.com/photos/a-city-with-tall-buildings-and-a-sandy-beach-MnGrHKTYDLM) | Unsplash License | aboodi vesakaran |
| `marina-palm-view.jpg` | Blog: Where to live in Dubai; gallery | Dubai Marina in the foreground with Palm Jumeirah beyond | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Dubai_Marina_and_skyline_from_Le_Royal_M%C3%A9ridien_Beach_Resort_and_Spa.jpg) | Public domain | CT Cooper |
| `dubai-coast-from-space.jpg` | Blog: A first-time buyer's map of Dubai | Dubai's coastline, Palm Jumeirah and The World islands photographed from the International Space Station | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Dubai_from_space_(iss066e126122).jpg) | Public domain | Raja Chari |

## Gallery only

| File | Used for | Shows | Source | Licence | Photographer |
|---|---|---|---|---|---|
| `dubai-marina-apartment-living-room.jpg` | Media library only (was in the Meridian Residence gallery on 28 September 2026, replaced by the penthouse rooms) | Living room of a Dubai Marina apartment: beige sofa and glass coffee table beside tall windows onto the towers | [Pexels](https://www.pexels.com/photo/modern-living-room-with-cozy-beige-sofa-and-decor-30554301/) | Pexels License | AJ Ahamad |
| `dubai-marina-promenade.jpg` | Gallery (was the Meridian Residence cover until 28 September 2026: a street-level view showing an EMAAR sign did not suit a penthouse) | The Dubai Marina promenade curving past the towers in daylight | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Dubai_Marina_5.jpg) | CC0 (public domain dedication) | EditQ |
| `dubai-spice-souk.jpg` | Gallery | Woven baskets and bowls piled with colourful dried flowers and spices at the Dubai Spice Souk | [Unsplash](https://unsplash.com/photos/sliced-apple-fruits-on-brown-woven-baskets-dLyt-mceALY) | Unsplash License | Jon Villanueva |
| `abras-dubai-creek.jpg` | Gallery | Traditional wooden abra boats flying the UAE flag crossing Dubai Creek in daylight | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Abras_on_Dubai_Creek_1.jpg) | CC0 (public domain dedication) | EditQ |
| `jumeirah-mosque.jpg` | Gallery | Jumeirah Mosque in Dubai with a carved stone dome and twin minarets behind trees under a blue sky | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Jumeirah_Mosque_3.jpg) | CC0 (public domain dedication) | EditQ |
| `dubai-metro-skyline.jpg` | Gallery | Dubai Metro train on the elevated track between towers with the city skyline at sunset | [Unsplash](https://unsplash.com/photos/blue-and-white-train-on-rail-road-during-daytime-NnRv949hZ1Q) | Unsplash License | Damir Babacic |
| `dubai-miracle-garden.jpg` | Gallery | Floral clock, flower-covered cottages and floral peacocks at Dubai Miracle Garden under a blue sky | [Unsplash](https://unsplash.com/photos/a-garden-with-a-flower-bed-7aXWDmmlZeo) | Unsplash License | yasara hansani |
| `dubai-desert-dunes.jpg` | Gallery | Rippled orange sand dunes stretching into the distance in the desert outside Dubai | [Unsplash](https://unsplash.com/photos/brown-desert-field-QmEos0q08TM) | Unsplash License | Juliana Malta |
| `jumeira-public-beach.jpg` | Gallery | Wide pale-sand Jumeira Public Beach in Dubai with a lifeguard tower, palms and distant beachgoers | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Jumeira_Public_Beach_1.jpg) | CC0 (public domain dedication) | EditQ |
| `hatta-mountains-reservoir.jpg` | Gallery | Teal reservoir water beneath rugged rocky Hajar Mountains in Hatta, Dubai, with boulders in front | [Unsplash](https://unsplash.com/photos/brown-rocky-mountain-beside-lake-during-daytime-7zXqPO7MgZI) | Unsplash License | azher zee |
| `community-garden-villas.jpg` | Gallery ("Beachfront gardens") | Beachfront hotel gardens and pools on the Dubai Marina coast, with a yacht marina beyond | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Beach_from_Le_Royal_M%C3%A9ridien_Beach_Resort_and_Spa_in_Dubai_2.jpg) | Public domain | CT Cooper |

## Adding a new photo

1. **Use a real photo taken at the place the text describes.** The source page must name that place.
2. **Check the licence on the photo's own page.** It must be one of the licences listed at the top of this file.
3. **Upload it to Cloudinary**, either through the admin Media Library into the right `knc-horizon/` folder, or by adding an entry with a descriptive file name and its `source` URL to `backend/scripts/cloudinary-images.json` and running `node scripts/migrate-images-to-cloudinary.mjs upload` from `backend/`. Never put images in `frontend/public/`, and do not link to an image hosted on another site.
4. **Add a row to the right table above** with the source link, licence and photographer.
5. **Make sure it is not a copy or near-copy of a photo already on the site.**
