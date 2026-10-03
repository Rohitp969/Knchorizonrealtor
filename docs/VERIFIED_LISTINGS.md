# Verified projects, homes, rentals and commercial listings

Checked on **2026-10-01**. Source of truth: `backend/scripts/verified-listings.json` (applied to the database with `backend/backups/tools/apply-verified-listings.mjs`). This page is generated from that file; edit the JSON, not this page.

## The rules

- Only listings that the developer or the landlord itself publishes on its own website are shown: projects and homes for sale from the developer, rentals and offices for rent from the landlord (Dubai Residential, wasl). The page each fact was read from is recorded and shown on the website ("Details as published on ...").
- A fact the developer does not publish is left empty. The website then says **Price on request** or **Not published by the developer**; no figure is estimated.
- Status is written only when the developer states it (off-plan, new launch, under construction) or when it follows directly from the developer's own completion date; the *Evidence* column says which.
- KNC Horizon Realtor is not described as a partner or authorised seller of any developer. Each page says the listing is "offered for rent by" its landlord or that the development is "developed and marketed by" its developer and that KNC confirms availability and pricing on enquiry.
- Photos are real, free-licence photographs (Pexels, Unsplash, Wikimedia Commons), each used once. A photo that does not show the development itself is labelled **Representative image** on the website. Developers' own renders are not used: none of the developers' websites grants a reuse licence. Every photo's page, licence and photographer is in `docs/IMAGE_SOURCES.md`.
- Prices move. The dated source link is on every page so a visitor can check the current figure; re-check before quoting.

## Projects (22)

| Project | Developer | Location | Type | Homes | Status | Starting price | Handover | Source | Cloudinary folder (photos) |
|---|---|---|---|---|---|---|---|---|---|
| **The Oasis by Emaar** (`/projects/the-oasis-by-emaar`) | Emaar | Dubailand | Villas | 4 to 7-bedroom villas and mansions | New launches | not published | not published | [emaar.com](https://www.emaar.com/en/our-communities/the-oasis) | `knc-horizon/projects/the-oasis-by-emaar/` (5), `knc-horizon/projects/` (1) |
| **The Valley by Emaar** (`/projects/the-valley-by-emaar`) | Emaar | Dubai–Al Ain Road | Villas & Townhouses | 3 to 5-bedroom townhouses and villas | New launches | AED 8,897,888 | not published | [emaar.com](https://www.emaar.com/en/our-communities/the-valley) | `knc-horizon/projects/the-valley-by-emaar/` (6), `knc-horizon/projects/` (1) |
| **DAMAC Bay by Cavalli** (`/projects/bay-by-cavalli`) | DAMAC | Dubai Harbour | Apartments | 1 to 3-bedroom apartments and 3 to 5-bedroom duplexes | Off-plan | AED 3,939,000 | not published | [damacproperties.com](https://www.damacproperties.com/en/projects/damac-bay-by-cavalli/) | `knc-horizon/projects/bay-by-cavalli/` (6) |
| **Sobha One** (`/projects/sobha-one`) | Sobha Realty | Ras Al Khor | Apartments | 1 to 4-bedroom apartments and 4 to 5-bedroom duplexes | Off-plan | not published | not published | [sobharealty.com](https://www.sobharealty.com/sobha-communities/sobha-one) | `knc-horizon/projects/sobha-one/` (5) |
| **Bay Grove Residences** (`/projects/bay-grove-dubai-islands`) | Nakheel | Dubai Islands | Apartments | 1 to 4-bedroom residences and a signature penthouse | New launch | not published | not published | [nakheel.com](https://www.nakheel.com/en/new-launches/baygrove-residences) | `knc-horizon/projects/bay-grove-dubai-islands/` (5), `knc-horizon/projects/` (1) |
| **Binghatti Circle** (`/projects/binghatti-circle-jvc`) | Binghatti | Jumeirah Village Circle | Apartments | Studio, 1, 2 and 3-bedroom apartments | Off-plan | AED 674,999 | Q2 2027 | [binghatti.com](https://www.binghatti.com/en/projects/binghatti-circle) | `knc-horizon/projects/binghatti-circle-jvc/` (6) |
| **Rashid Yachts & Marina** (`/projects/rashid-yachts-marina`) | Emaar | Rashid Yachts & Marina | Apartments | 1 to 3-bedroom apartments | New launches | AED 2,112,888 | not published | [emaar.com](https://www.emaar.com/en/our-communities/rashid-yachts-marina) | `knc-horizon/projects/rashid-yachts-marina/` (4) |
| **Dubai Creek Harbour** (`/projects/dubai-creek-harbour`) | Emaar | Dubai Creek Harbour | Apartments | 1 to 4-bedroom apartments and penthouses | New launches | AED 1,790,888 | not published | [emaar.com](https://www.emaar.com/en/our-communities/dubai-creek-harbour) | `knc-horizon/projects/dubai-creek-harbour/` (4) |
| **Emaar Beachfront** (`/projects/emaar-beachfront`) | Emaar | Dubai Harbour | Apartments | 1 to 4-bedroom apartments | Off-plan | AED 3,594,888 | not published | [emaar.com](https://www.emaar.com/en/our-communities/emaar-beachfront) | `knc-horizon/projects/emaar-beachfront/` (4) |
| **DAMAC Islands** (`/projects/damac-islands`) | DAMAC | Dubailand | Villas & Townhouses | 4 and 5-bedroom townhouses, 6 and 7-bedroom villas | Off-plan | AED 2,750,000 | not published | [damacproperties.com](https://www.damacproperties.com/en/communities/damac-islands-community/) | `knc-horizon/projects/damac-islands/` (4) |
| **DAMAC Riverside** (`/projects/damac-riverside`) | DAMAC | Dubai Investment Park | Townhouses & Apartments | 4 and 5-bedroom townhouses; 1 and 2-bedroom apartments at Riverside Views | Off-plan | AED 1,354,000 | not published | [damacproperties.com](https://www.damacproperties.com/en/communities/damac-riverside/) | `knc-horizon/projects/damac-riverside/` (4) |
| **Sobha Hartland II** (`/projects/sobha-hartland-2`) | Sobha Realty | Mohammed Bin Rashid City | Apartments & Villas | 1 to 4-bedroom apartments; 5 and 6-bedroom villas at Sobha Estates | not stated | not published | not published | [sobharealty.com](https://www.sobharealty.com/sobha-communities/sobha-hartland-2) | `knc-horizon/projects/sobha-hartland-2/` (4) |
| **Sobha SeaHaven** (`/projects/sobha-seahaven`) | Sobha Realty | Dubai Harbour | Apartments | 1 to 4-bedroom apartments; 5 and 6-bedroom penthouses | not stated | not published | not published | [sobharealty.com](https://www.sobharealty.com/sobha-communities/sobha-seahaven) | `knc-horizon/projects/sobha-seahaven/` (4) |
| **Binghatti Skyrise** (`/projects/binghatti-skyrise`) | Binghatti | Business Bay | Apartments | Studio, 1, 2 and 3-bedroom apartments | Off-plan | AED 1,050,000 | Q4 2026 | [binghatti.com](https://www.binghatti.com/en/projects/binghatti-skyrise) | `knc-horizon/projects/binghatti-skyrise/` (4) |
| **Binghatti Skyblade** (`/projects/binghatti-skyblade`) | Binghatti | Downtown Dubai | Apartments | Studio, 1, 2 and 3-bedroom apartments | Off-plan | AED 1,674,999 | Q4 2027 | [binghatti.com](https://www.binghatti.com/en/projects/binghatti-skyblade) | `knc-horizon/projects/binghatti-skyblade/` (4) |
| **Como Residences** (`/projects/como-residences`) | Nakheel | Palm Jumeirah | Apartments | 76 residences over 76 storeys | New launch | not published | not published | [nakheel.com](https://www.nakheel.com/en/new-launches/como-residences) | `knc-horizon/projects/como-residences/` (4) |
| **Palm Jebel Ali Villas** (`/projects/palm-jebel-ali`) | Nakheel | Palm Jebel Ali | Villas | Beachfront villas on the fronds | Under construction | not published | not published | [nakheel.com](https://www.nakheel.com/en/construction-progress/palm-jebel-ali) | `knc-horizon/projects/palm-jebel-ali/` (4) |
| **Eltiera Views** (`/projects/eltiera-views`) | Ellington | Jumeirah Islands | Apartments | 1 to 4-bedroom apartments | not stated | not published | not published | [ellingtonproperties.ae](https://www.ellingtonproperties.ae/en/property-for-sale/eltiera-views-jumeirah-islands) | `knc-horizon/projects/eltiera-views/` (4) |
| **Bayz 101 by Danube** (`/projects/bayz-101`) | Danube | Business Bay | Apartments | Studio, 1, 2, 3 and 4-bedroom apartments | Off-plan | AED 1,175,000 | June 2028 | [danubeproperties.com](https://danubeproperties.com/portfolio/bayz101/) | `knc-horizon/projects/bayz-101/` (4) |
| **Diamondz by Danube** (`/projects/diamondz`) | Danube | Jumeirah Lake Towers | Apartments | Studio, 1, 2, 3 and 4-bedroom apartments | Off-plan | AED 1,100,000 | November 2027 | [danubeproperties.com](https://danubeproperties.com/portfolio/diamondz/) | `knc-horizon/projects/diamondz/` (4) |
| **City Walk Crestlane** (`/projects/city-walk-crestlane`) | Meraas | City Walk | Apartments | 1 to 4-bedroom apartments and duplexes | New launch | AED 2,700,000 | not published | [meraas.com](https://www.meraas.com/en/project/city-walk-crestlane) | `knc-horizon/projects/city-walk-crestlane/` (4) |
| **The Edit at d3** (`/projects/the-edit-at-d3`) | Meraas | Dubai Design District | Apartments | 1 to 4-bedroom residences and penthouses | New launch | AED 2,000,000 | not published | [meraas.com](https://www.meraas.com/en/the-edit-at-d3) | `knc-horizon/projects/the-edit-at-d3/` (4) |

100 project photos in all.

### Evidence, project by project

**The Oasis by Emaar** (Emaar)

- *unitTypes*: Properties in The Oasis: Palmiera 4-5, Mirage at The Oasis 5-6, Lavita at The Oasis 6 - 7, Address Villas – Tierra 4 - 6 (bedrooms); 'Villas and Mansions'
- *status*: Listed on Emaar's 'Latest Emaar Projects' page (emaar.com/en/latest-launches) under 'Emaar communities: newly launched / now available'
- *startingPrice*: Not published: the page's 'Prices from' field is blank
- *handover*: Not published on the page
- *location*: The page gives drive times only; 'Dubailand' is the value already on record from the earlier check and is not restated on this page
- **Not available / left out:** startingPrice; handover; location (district name not on the developer's page)

**The Valley by Emaar** (Emaar)

- *location*: FAQ: 'The Valley is strategically located along the Dubai-Al Ain Road'
- *unitTypes*: FAQ: 'configurations such as 3 to 5 bedrooms'; footer bar: 'Villas & Townhouses'
- *status*: Listed on Emaar's 'Latest Emaar Projects' page under 'Emaar communities: newly launched / now available'
- *startingPrice*: 'Ovelle at The Valley, 4 - 5, FROM AED 8,897,888, 6 units remaining' (the only price shown on the page)
- *handover*: Not published on the page
- **Not available / left out:** handover

**DAMAC Bay by Cavalli** (DAMAC)

- *location*: FAQ: 'DAMAC Bay by Cavalli is located in Dubai Harbour which sits opposite Dubai Marina'
- *status*: FAQ: 'DAMAC Bay by Cavalli is an off-plan residential project'
- *unitTypes*: 'this exclusive tower offers 1-3 bedroom apartments and 3-5 bedroom duplexes'
- *startingPrice*: Available units: '1 BR Apartments, Dubai Harbour' at AED 3,939,000 in the page data (shown converted to the visitor's currency)
- *handover*: Conflicting on the page: the header says 'Project Handover Q3, 2027', the available units say 'Q4 / 2028'. Left out.
- **Not available / left out:** handover (the developer's page gives two different dates)

**Sobha One** (Sobha Realty)

- *location*: 'strategically located near Ras Al Khor Wildlife Sanctuary'
- *unitTypes*: 'Featuring lavish 1–4-bedroom apartments and exclusive 4-5 bedroom duplexes'
- *status*: The page's own FAQ asks 'Is it a good idea to invest in an off-plan apartment in Sobha One?'
- *startingPrice*: Not published on the page
- *handover*: Not published on the page
- **Not available / left out:** startingPrice; handover

**Bay Grove Residences** (Nakheel)

- *location*: 'set within Dubai Islands' most sought-after waterfront address'
- *unitTypes*: 'four residential buildings, offering 1- to 4-bedroom residences and a signature penthouse'
- *status*: Listed under Nakheel's 'New Launches' (nakheel.com/en/new-launches)
- *startingPrice*: Not published on the page
- *handover*: Not published on the page
- **Not available / left out:** startingPrice; handover

**Binghatti Circle** (Binghatti)

- *location*: Page header: 'Jumeirah Village Circle'
- *unitTypes*: 'STUDIO | 1 BR | 2 BR | 3 BR'
- *startingPrice*: Page header: 'FROM 674,999'
- *handover*: 'The completion date for Binghatti Circle is Q2, 2027.'
- *status*: Derived: the developer lists the project as 'Available' with completion in Q2 2027, so it is sold before completion

**Rashid Yachts & Marina** (Emaar)

- *unitTypes*: FAQ: 'a range of 1 to 3-bedroom apartment options within low to mid-rise towers'
- *status*: Listed on Emaar's 'Latest Emaar Projects' page under 'Emaar communities: newly launched / now available'
- *startingPrice*: Footer bar: 'PRICES FROM AED 2,112,888' (Sera 2 at Rashid Yachts & Marina)
- *handover*: Not published on the page
- **Not available / left out:** handover

**Dubai Creek Harbour** (Emaar)

- *unitTypes*: FAQ: 'stylish apartments and luxurious penthouses. Ranging from cosy 1-bedroom units to expansive 4-bedroom configurations'
- *status*: Listed on Emaar's 'Latest Emaar Projects' page under 'Emaar communities: newly launched / now available'
- *startingPrice*: Footer bar: 'PRICES FROM AED 1,790,888' (Silva, Dubai Creek Harbour)
- *handover*: Not published on the page (it differs by building)
- **Not available / left out:** handover

**Emaar Beachfront** (Emaar)

- *location*: 'a luxurious, private island lifestyle at Dubai Harbour'
- *status*: 'It's an off-plan development by Emaar Properties'
- *unitTypes*: Properties in Emaar Beachfront: Sunrise Bay 1 - 4, Marina Vista 1 - 3, Beach Isle 1 - 4 (bedrooms)
- *startingPrice*: Footer bar: 'PRICES FROM AED 3,594,888' (Bayview by Address Resorts at Emaar Beachfront)
- *handover*: Not published on the page (it differs by tower)
- **Not available / left out:** handover

**DAMAC Islands** (DAMAC)

- *location*: FAQ: 'DAMAC Islands is an off-plan project featuring townhouses and villas in Dubailand'
- *status*: FAQ: 'DAMAC Islands is an off-plan project'
- *unitTypes*: FAQ: 'a selection of 4 and 5-bedroom townhouses, and 6 and 7-bedroom villas'
- *startingPrice*: 'Starting price AED 2,750,000*'
- *handover*: Not published on the page
- **Not available / left out:** handover

**DAMAC Riverside** (DAMAC)

- *location*: Unit cards: 'Dubai Investment Park, Dubai'
- *status*: FAQ: 'DAMAC Riverside is an off-plan project offering exclusive townhouses'
- *unitTypes*: FAQ: 'a selection of 4 and 5-bedroom townhouses in multiple layouts'; card: 'DAMAC Riverside Views, 1 - 2 Bedrooms, Apartment'
- *startingPrice*: Card 'DAMAC Riverside Views' at AED 1,354,000 in the page data (shown converted to the visitor's currency)
- *handover*: Not published on the page
- **Not available / left out:** handover

**Sobha Hartland II** (Sobha Realty)

- *location*: Page title: 'Sobha Hartland 2 | Luxury Residences in MBR City Dubai'
- *unitTypes*: 'luxurious five- to six-bedroom Sobha Estate villas and one-bedroom to four-bedroom apartments in three clusters'
- *status*: Not stated on the page
- *startingPrice*: Not published on the page
- *handover*: Not published on the page
- **Not available / left out:** status; startingPrice; handover

**Sobha SeaHaven** (Sobha Realty)

- *location*: 'Spanning 104,948 sq. ft in Dubai Harbour'
- *unitTypes*: 'With 1-to-4-bedroom apartments and 5- to 6-bedroom penthouses'
- *status*: Not stated on the page
- *startingPrice*: Not published on the page
- *handover*: Not published on the page
- **Not available / left out:** status; startingPrice; handover

**Binghatti Skyrise** (Binghatti)

- *location*: Page header: 'Business Bay'
- *unitTypes*: 'STUDIO | 1 BR | 2 BR | 3 BR'
- *startingPrice*: Page header: 'FROM 1,050,000'
- *handover*: 'The delivery date for Binghatti Skyrise is set for Q4 2026.'
- *status*: Derived: the developer lists the project as 'Available' with delivery set for Q4 2026 and a payment plan that runs through construction

**Binghatti Skyblade** (Binghatti)

- *location*: Page header: 'Downtown Dubai'; 'a bold architectural statement on Burj Khalifa Boulevard'
- *unitTypes*: 'STUDIO | 1 BR | 2 BR | 3 BR'
- *startingPrice*: Page header: 'FROM 1,674,999'
- *handover*: 'Binghatti Skyblade's completion date is Q4 2027.'
- *status*: The page's structured FAQ: 'The project is currently under development'

**Como Residences** (Nakheel)

- *location*: 'set to redefine the skyline of Palm Jumeirah'
- *unitTypes*: 'It boasts 76 storeys of just 76 residences, standing at over 300 metres tall'
- *status*: Listed under Nakheel's 'New Launches' (nakheel.com/en/new-launches)
- *startingPrice*: Not published on the page
- *handover*: Not published on the page
- **Not available / left out:** startingPrice; handover; bedroom mix (not on the page)

**Palm Jebel Ali Villas** (Nakheel)

- *unitTypes*: 'Palm Jebel Ali villas will feature floor to ceiling windows ... in the exclusive private frond neighbourhoods'
- *status*: Nakheel's 'Construction Progress' page: 'PALM JEBEL ALI 26.75% Overall Progress', internal inspection 10 March 2026
- *startingPrice*: Not published on the page
- *handover*: Not published on the page
- **Not available / left out:** startingPrice; handover; bedroom mix (not on the page)

**Eltiera Views** (Ellington)

- *location*: 'Set within Jumeirah Islands and overlooking the calm of the lake'
- *unitTypes*: 'the development offers one to four-bedroom apartments'
- *status*: Not stated on the page
- *startingPrice*: Not published on the page
- *handover*: Not published on the page
- **Not available / left out:** status; startingPrice; handover

**Bayz 101 by Danube** (Danube)

- *location*: 'LOCATION: BUSINESS BAY, DUBAI'
- *unitTypes*: 'BEDROOMS: STUDIO, 1 BEDROOM, 2 BEDROOM, 3 BEDROOM, 4 BEDROOM'
- *startingPrice*: 'STARTING PRICE AED 1.175 MILLION'
- *handover*: 'COMPLETION JUNE 2028'; FAQ: 'Bayz101 is estimated to be completed by June 2028.'
- *status*: Derived: the developer sells the tower with completion estimated for June 2028

**Diamondz by Danube** (Danube)

- *location*: FAQ: 'Diamondz is a luxurious residential tower located in JLT, Dubai' (the page's location tile reads 'Dubai Marina, Dubai'; the title and text say Jumeirah Lake Towers)
- *unitTypes*: 'BEDROOMS: STUDIO, 1 BEDROOM, 2 BEDROOM, 3 BEDROOM, 4 BEDROOM'
- *startingPrice*: 'STARTING PRICE AED 1.1 MILLION'
- *handover*: 'COMPLETION NOVEMBER, 2027'; FAQ: 'Diamondz is estimated to be completed by November 2027.'
- *status*: Derived: the developer sells the tower with completion estimated for November 2027

**City Walk Crestlane** (Meraas)

- *location*: Page header: 'City Walk'
- *unitTypes*: 'an exclusive collection of 1- to 4-bedroom apartments and duplexes'
- *startingPrice*: Page header: 'From AED 2.70 M'
- *status*: Listed on Meraas's 'New Launches' page with 'Properties Available'
- *handover*: Not published on the page
- **Not available / left out:** handover

**The Edit at d3** (Meraas)

- *location*: Page header: 'Dubai Design District'
- *unitTypes*: 'The Edit at d3 offers 1 to 4-bedroom residences and exclusive penthouses.'
- *startingPrice*: Page header: 'From AED 2.00 M'
- *status*: Listed on Meraas's 'New Launches' page with 'Properties Available'
- *handover*: Not published on the page
- **Not available / left out:** handover

## Homes for sale in those projects (21)

Each is a home type or building the developer publishes a starting price for. The price is shown as "From AED ..."; it is not the price of one particular home. Bathrooms are shown only where the source gives them, and a size only where it states one.

| Listing | Offered by | Project | Location | Type | Bedrooms | Size | Price | Source | Evidence | Photos |
|---|---|---|---|---|---|---|---|---|---|---|
| **Sera 2 at Rashid Yachts & Marina** (`/properties/sera-2-rashid-yachts-marina`) | Emaar | `rashid-yachts-marina` | Rashid Yachts & Marina | Apartment | 1 to 3 | not published | From AED 2,112,888 | [emaar.com](https://www.emaar.com/en/our-communities/rashid-yachts-marina) | 'SERA 2 AT RASHID YACHTS & MARINA, 1 to 3, FROM AED 2,112,888' | 3 (representative) |
| **Baystar by Vida at Rashid Yachts & Marina** (`/properties/baystar-by-vida-rashid-yachts-marina`) | Emaar | `rashid-yachts-marina` | Rashid Yachts & Marina | Apartment | 1 to 4 | not published | From AED 2,175,888 | [emaar.com](https://www.emaar.com/en/our-communities/rashid-yachts-marina) | 'BAYSTAR BY VIDA AT RASHID YACHTS & MARINA, 1, 2, 3 & 4, FROM AED 2,175,888' | 3 (representative) |
| **Silva at Dubai Creek Harbour** (`/properties/silva-dubai-creek-harbour`) | Emaar | `dubai-creek-harbour` | Dubai Creek Harbour | Apartment | 1 to 3 | not published | From AED 1,790,888 | [emaar.com](https://www.emaar.com/en/our-communities/dubai-creek-harbour) | Page data: 'Silva - Dubai Creek Harbour', bedrooms '1 - 3', lowest unit price 1,790,888; footer bar 'PRICES FROM AED 1,790,888' | 3 (representative) |
| **Albero at Dubai Creek Harbour** (`/properties/albero-dubai-creek-harbour`) | Emaar | `dubai-creek-harbour` | Dubai Creek Harbour | Apartment | 1 to 3 | not published | From AED 1,813,888 | [emaar.com](https://www.emaar.com/en/our-communities/dubai-creek-harbour) | Page data: 'Albero at Dubai Creek Harbour', bedrooms '1 - 3', lowest unit price 1,813,888 ('FROM AED 1,813,888') | 3 (representative) |
| **Bayview by Address Resorts at Emaar Beachfront** (`/properties/bayview-by-address-resorts-emaar-beachfront`) | Emaar | `emaar-beachfront` | Dubai Harbour | Apartment | 1 to 4 | not published | From AED 3,594,888 | [emaar.com](https://www.emaar.com/en/our-communities/emaar-beachfront) | 'BAYVIEW BY ADDRESS RESORTS AT EMAAR BEACHFRONT, 1-4, FROM AED 3,594,888' | 3 (representative) |
| **1-Bedroom Apartment at Binghatti Skyrise** (`/properties/binghatti-skyrise-1-bedroom`) | Binghatti | `binghatti-skyrise` | Business Bay | Apartment | 1 | 831 sq ft | From AED 2,544,999 | [binghatti.com](https://www.binghatti.com/en/projects/binghatti-skyrise) | 'AVAILABLE UNITS: 1 BEDROOM, Starting AED 2,544,999, 831 sqft' | 3 (representative) |
| **Studio at Binghatti Skyblade** (`/properties/binghatti-skyblade-studio`) | Binghatti | `binghatti-skyblade` | Downtown Dubai | Apartment | Studio | 386 sq ft | From AED 1,764,999 | [binghatti.com](https://www.binghatti.com/en/projects/binghatti-skyblade) | 'AVAILABLE UNITS: STUDIO, Starting AED 1,764,999, 386 sqft' | 3 (representative) |
| **3-Bedroom Apartment at Binghatti Skyblade** (`/properties/binghatti-skyblade-3-bedroom`) | Binghatti | `binghatti-skyblade` | Downtown Dubai | Apartment | 3 | 2196 sq ft | From AED 13,394,999 | [binghatti.com](https://www.binghatti.com/en/projects/binghatti-skyblade) | 'AVAILABLE UNITS: 3 BEDROOM, Starting AED 13,394,999, 2196 sqft' | 3 (representative) |
| **Studio at Bayz 101 by Danube** (`/properties/bayz-101-studio`) | Danube | `bayz-101` | Business Bay | Apartment | Studio | not published | From AED 1,200,000 | [danubeproperties.com](https://danubeproperties.com/portfolio/bayz101/) | FAQ: 'Studios start around AED 1.2 million, 1-bedroom apartments from AED 2.05 million' | 3 (representative) |
| **1-Bedroom Apartment at Bayz 101 by Danube** (`/properties/bayz-101-1-bedroom`) | Danube | `bayz-101` | Business Bay | Apartment | 1 | not published | From AED 2,050,000 | [danubeproperties.com](https://danubeproperties.com/portfolio/bayz101/) | FAQ: 'Studios start around AED 1.2 million, 1-bedroom apartments from AED 2.05 million' | 3 (representative) |
| **Studio at Diamondz by Danube** (`/properties/diamondz-studio`) | Danube | `diamondz` | Jumeirah Lake Towers | Apartment | Studio | not published | From AED 1,100,000 | [danubeproperties.com](https://danubeproperties.com/portfolio/diamondz/) | FAQ: 'Studios start around AED 1.1 million, 1-bedroom apartments from AED 1.75 million' | 3 (representative) |
| **1-Bedroom Apartment at Diamondz by Danube** (`/properties/diamondz-1-bedroom`) | Danube | `diamondz` | Jumeirah Lake Towers | Apartment | 1 | not published | From AED 1,750,000 | [danubeproperties.com](https://danubeproperties.com/portfolio/diamondz/) | FAQ: 'Studios start around AED 1.1 million, 1-bedroom apartments from AED 1.75 million' | 3 (representative) |
| **1-Bedroom Apartment at DAMAC Bay by Cavalli** (`/properties/damac-bay-by-cavalli-1-bedroom`) | DAMAC | `bay-by-cavalli` | Dubai Harbour | Apartment | 1 | not published | From AED 3,939,000 | [damacproperties.com](https://www.damacproperties.com/en/projects/damac-bay-by-cavalli/) | Available units: '1 BR Apartments, Dubai Harbour, Dubai, 1 Bedroom, Up to 1304 sq.ft', price 3,939,000 AED in the page data | 3 (representative) |
| **4-Bedroom Penthouse at DAMAC Bay by Cavalli** (`/properties/damac-bay-by-cavalli-4-bedroom-penthouse`) | DAMAC | `bay-by-cavalli` | Dubai Harbour | Penthouse | 4 | not published | From AED 66,843,000 | [damacproperties.com](https://www.damacproperties.com/en/projects/damac-bay-by-cavalli/) | Available units: '4 BR Penthouse, Dubai Harbour, Dubai, 4 Bedrooms, Up to 10036 sq.ft', price 66,843,000 AED in the page data | 4 (representative) |
| **5-Bedroom Penthouse at DAMAC Bay by Cavalli** (`/properties/damac-bay-by-cavalli-5-bedroom-penthouse`) | DAMAC | `bay-by-cavalli` | Dubai Harbour | Penthouse | 5 | not published | From AED 73,036,000 | [damacproperties.com](https://www.damacproperties.com/en/projects/damac-bay-by-cavalli/) | Available units: '5 BR Penthouse, Dubai Harbour, Dubai, 5 Bedrooms, Up to 10054 sq.ft, Q4 / 2028'; price 73,036,000 AED in the page data (7303600000 fils), shown to this visitor as INR 1,850,793,168, in the same ratio to the 4 BR penthouse's 66,843,000 AED | 4 (representative) |
| **Penthouses at Sobha SeaHaven** (`/properties/sobha-seahaven-penthouses`) | Sobha Realty | `sobha-seahaven` | Dubai Harbour | Penthouse | 5 to 6 | not published | not published | [sobharealty.com](https://www.sobharealty.com/sobha-communities/sobha-seahaven) | 'Sobha SeaHaven's three towers offer diverse living options, including contemporary apartments, Sky Edition units, and luxurious penthouses and duplexes. With 1-to-4-bedroom apartments and 5- to 6-bedroom penthouses, each residence offers stunning waterfront and city views, complemented by podiums, sky amenities, and private terraces.'; no price and no handover date on the page | 3 (representative) |
| **Penthouses at The Edit at d3** (`/properties/the-edit-at-d3-penthouses`) | Meraas | `the-edit-at-d3` | Dubai Design District | Penthouse | Studio | not published | not published | [meraas.com](https://www.meraas.com/en/the-edit-at-d3) | 'The Edit at d3 offers 1 to 4-bedroom residences and exclusive penthouses.'; project card: 'Dubai Design District, 1 BR to 4 BR / Penthouse, From AED 2.00 M, Properties Available' (AED 2.00 M is the project's starting price, not a penthouse price); unit types on the page: '2 Bedroom, 3 Bedroom, 4 Bedroom, Penthouse' | 3 (representative) |
| **5-Bedroom Villa at DAMAC Islands** (`/properties/damac-islands-5-bedroom-villa`) | DAMAC | `damac-islands` | Dubailand | Villa | 5 | not published | From AED 3,930,000 | [damacproperties.com](https://www.damacproperties.com/en/communities/damac-islands-community/) | Card: 'DAMAC Islands, Dubailand, Dubai, 5 Bedrooms, Villa', price 3,930,000 AED in the page data | 3 (representative) |
| **5-Bedroom Villa at DAMAC Riverside** (`/properties/damac-riverside-5-bedroom-villa`) | DAMAC | `damac-riverside` | Dubai Investment Park | Villa | 5 | not published | From AED 4,337,000 | [damacproperties.com](https://www.damacproperties.com/en/communities/damac-riverside/) | Card: 'DAMAC Riverside, Dubai Investment Park, Dubai, 5 Bedrooms, Villa', price 4,337,000 AED in the page data | 5 (representative) |
| **Apartments at DAMAC Riverside Views** (`/properties/damac-riverside-views-apartments`) | DAMAC | `damac-riverside` | Dubai Investment Park | Apartment | 1 to 2 | not published | From AED 1,354,000 | [damacproperties.com](https://www.damacproperties.com/en/communities/damac-riverside/) | Card: 'DAMAC Riverside Views, Dubai Investment Park, Dubai, 1 - 2 Bedrooms, Apartment', price 1,354,000 AED in the page data | 3 (representative) |
| **The Element at Sobha One** (`/properties/the-element-at-sobha-one`) | Sobha Realty | `sobha-one` | Ras Al Khor | Apartment | 1 to 4 | not published | From AED 1,830,000 | [sobharealty.com](https://www.sobharealty.com/properties-in-dubai/sobha-one/the-element) | sobharealty.com/properties-in-uae lists 'The Element at Sobha One' among its apartments for sale (checked 3 October 2026). Its page: 'The Element offers a curated collection of 1 to 4 bedroom residences'; 'breathtaking 270° panoramic views overlooking the Ras Al Khor Wildlife Sanctuary, Dubai Skyline & world-class golf course'; 'Starting Prices AED 1.83 M* ... Subject to inventory availability*'; floor plans: 1 Bedroom Apartment Type A/B/C, total 740.02 / 729.37 / 753.48 sq ft; amenities 'Kids play area, BBQ & dining area, Jacuzzi, Outdoor gym, Business lounge, Rooftop lounge'; FAQ: 'a premium residential tower within Sobha One, developed by Sobha Realty and located in Sobha Hartland, Mohammed Bin Rashid City (MBR City)'. No handover date, no status word and no price range beyond the starting price are shown; a hidden page attribute carries 'AED 9.59 M*' as an upper figure, which is not displayed and is not used. | 3 (representative) |

## Homes for rent (11)

Rentals offered by the landlord itself. Dubai Residential (Dubai Holding Asset Management) publishes a starting rent per community; wasl lists single units with their rent, so those entries name the unit that was listed on the day and can go as soon as it is let. Rents are per year. Bathrooms are shown only where the source gives them, and a size only where it states one.

| Listing | Offered by | Project | Location | Type | Bedrooms | Size | Price | Source | Evidence | Photos |
|---|---|---|---|---|---|---|---|---|---|---|
| **Apartments for Rent at Bluewaters Residences** (`/properties/bluewaters-residences-rent`) | Dubai Residential | none | Bluewaters | Apartment | 1 to 4 | not published | From AED 277,000 / year | [dubairesidential.ae](https://dubairesidential.ae/en/our-communities/bluewaters) | Available units: 'Bluewaters, 808 Sqft, 1 [bed], 2 [bath], 277,000'; community page: '698 one, two, three and four-bedroom, glass-fronted apartments', 'Size 807 - 2,337 Sqft', 'Rent starting at 292,100' (the listed unit is lower) | 3 (representative) |
| **Apartments for Rent at City Walk Residences** (`/properties/city-walk-residences-rent`) | Dubai Residential | none | City Walk | Apartment | 1 to 4 | not published | From AED 157,500 / year | [dubairesidential.ae](https://dubairesidential.ae/en/our-communities/citywalk) | 'Size 984 - 4,483 Sqft', 'Rent starting at 157,500'; 'City Walk Residences 1 Bed - 4 Bed Apartments' | 3 (representative) |
| **Apartments for Rent at Dubai Wharf** (`/properties/dubai-wharf-rent`) | Dubai Residential | none | Al Jaddaf | Apartment | Studio to 3 | not published | From AED 49,200 / year | [dubairesidential.ae](https://dubairesidential.ae/en/our-communities/dubai-wharf) | 'Located on the Al Jaddaf Waterfront', 'Size 533 - 4,001 Sqft', 'Rent starting at 49,200'; 'Dubai Wharf Studio - 3 Bed Apartments' | 3 (representative) |
| **Apartments for Rent at Remraam** (`/properties/remraam-rent`) | Dubai Residential | none | Remraam | Apartment | Studio to 3 | not published | From AED 36,000 / year | [dubairesidential.ae](https://dubairesidential.ae/en/our-communities/remraam) | 'Dubai Residential owns and operates 18 well-maintained buildings in the Al Ramth Cluster', 'Size 388 - 2,582 Sqft', 'Rent starting at 36,000' | 5 (representative) |
| **Apartments for Rent at Al Khail Gate** (`/properties/al-khail-gate-rent`) | Dubai Residential | none | Al Khail Gate | Apartment | Studio to 3 | not published | From AED 23,100 / year | [dubairesidential.ae](https://dubairesidential.ae/en/our-communities/al-khail-gate) | 'the studios and 1 to 3 bedroom apartments offered within the community', 'Size 180 - 2,010 Sqft', 'Rent starting at 23,100' | 3 (representative) |
| **Townhouses and Villas for Rent at Garden View Villas** (`/properties/garden-view-villas-rent`) | Dubai Residential | none | Garden View Villas | Villa | 3 to 4 | not published | From AED 200,000 / year | [dubairesidential.ae](https://dubairesidential.ae/en/our-communities/garden-view-villas) | '3 bedroom townhouses and spacious villas ranging from 3 - 4 bedroom villas, some of which include private swimming pools', 'Size 2,427 - 4,330 Sqft', 'Rent starting at 200,000' | 3 (representative) |
| **Villas for Rent at Nad Al Sheba Villas** (`/properties/nad-al-sheba-villas-rent`) | Dubai Residential | none | Nad Al Sheba | Villa | 4 to 5 | not published | From AED 265,000 / year | [dubairesidential.ae](https://dubairesidential.ae/en/our-communities/nad-al-sheba) | 'Each of the four and five-bedroom villas', 'Size 3,731 - 4,587 Sqft', 'Rent starting at 265,000' | 3 (representative) |
| **1-Bedroom Apartment for Rent at wasl port views** (`/properties/wasl-port-views-1-bedroom-rent`) | wasl properties | none | Al Mina | Apartment | 1 | 897 sq ft | AED 75,000 / year | [wasl.ae](https://www.wasl.ae/en/search/residential) | wasl.ae residential search: 'wasl port views building 4, Al Mina, Unit No. 407, Price 75,000 / Year, Size (Sq.ft.) 897.00, Type: 1 bedroom' | 3 (representative) |
| **1-Bedroom Apartment for Rent at wasl village** (`/properties/wasl-village-1-bedroom-rent`) | wasl properties | none | Al Qusais | Apartment | 1 | 764 sq ft | AED 49,000 / year | [wasl.ae](https://www.wasl.ae/en/search/residential) | wasl.ae residential search: 'wasl Village - Building 15, Al Qusais Ind. Fifth, Unit No. 401, Price 49,000 / Year, Size (Sq.ft.) 764.24, Type: 1 bedroom' | 3 (representative) |
| **3-Bedroom Apartment for Rent at wasl green park** (`/properties/wasl-green-park-3-bedroom-rent`) | wasl properties | none | Ras Al Khor | Apartment | 3 | 1489 sq ft | AED 103,000 / year | [wasl.ae](https://www.wasl.ae/en/search/residential) | wasl.ae residential search: 'R1081-A1 - wasl green park, Ras Al Khor Ind. Third, Unit No. 312, Price 103,000 / Year, Size (Sq.ft.) 1,489.23, Type: 3 bedroom' | 3 (representative) |
| **3-Bedroom Villa for Rent at Al Diyafah Residences** (`/properties/al-diyafah-residences-3-bedroom-villa-rent`) | wasl properties | none | Al Badaa | Villa | 3 | 2664 sq ft | AED 160,000 / year | [wasl.ae](https://www.wasl.ae/en/search/residential) | wasl.ae residential search: 'PR1090 - Al Dhiyafa Residential Development, Al Badaa, Unit No. V038, Price 160,000 / Year, Size (Sq.ft.) 2,664.00, Type: 3 bedroom villa' | 3 (representative) |

## Commercial (6)

Offices and retail space, for rent from the landlord or for sale from the developer. Where no rent or price is published the website says "Price on request". Bathrooms are shown only where the source gives them, and a size only where it states one.

| Listing | Offered by | Project | Location | Type | Bedrooms | Size | Price | Source | Evidence | Photos |
|---|---|---|---|---|---|---|---|---|---|---|
| **Office for Rent at Jewel of the Creek (581 sq ft)** (`/properties/jewel-of-the-creek-office-581-rent`) | wasl properties | none | Port Saeed | Office | n/a | 581 sq ft | AED 98,770 / year | [wasl.ae](https://www.wasl.ae/en/search/commercial) | wasl.ae commercial search: 'Project P1039 - Jewel of the Creek F1F2 Office Building, Port Saeed, Unit No. OF403, Price 98,770 / Year, Size (Sq.ft.) 581.00, Type: office' | 3 (representative) |
| **Office for Rent at Jewel of the Creek (1,647 sq ft)** (`/properties/jewel-of-the-creek-office-1647-rent`) | wasl properties | none | Port Saeed | Office | n/a | 1647 sq ft | AED 247,050 / year | [wasl.ae](https://www.wasl.ae/en/search/commercial) | wasl.ae commercial search: 'Project P1039 - Jewel of the Creek F1F2 Office Building, Port Saeed, Unit No. OF502, Price 247,050 / Year, Size (Sq.ft.) 1,647.00, Type: office' | 3 (representative) |
| **Full-Floor Offices at Eaton Square** (`/properties/eaton-square-offices`) | Ellington | none | Mohammed Bin Rashid City | Office | n/a | not published | not published | [ellingtonproperties.ae](https://www.ellingtonproperties.ae/en/commercial/property-for-sale/eaton-square-mohammed-bin-rashid-city) | 'Eaton Square is Ellington's first commercial development'; 'Property type: Grade A Full-Floor Office – Shell and Core'; 'Status: Off Plan'; no price on the page | 3 (representative) |
| **Offices at Aspirz by Danube** (`/properties/aspirz-offices`) | Danube | none | Dubai Sports City | Office | n/a | not published | From AED 850,000 | [danubeproperties.com](https://danubeproperties.com/portfolio/aspirz/) | FAQ: 'Prices start from AED 850,000 for both Studio Flex apartments and Standard office units'; 'The estimated handover for ASPIRZ is Q4-2028'; 'separate entrances for residences and offices' | 3 (representative) |
| **Office at Binghatti Circle** (`/properties/binghatti-circle-office`) | Binghatti | `binghatti-circle-jvc` | Jumeirah Village Circle | Office | n/a | 1074 sq ft | From AED 2,685,600 | [binghatti.com](https://www.binghatti.com/en/projects/binghatti-circle) | 'AVAILABLE UNITS: OFFICE, Starting AED 2,685,600, 1074 sqft' | 3 (representative) |
| **Community Retail Space at City Walk Residences** (`/properties/city-walk-community-retail`) | Dubai Residential | none | City Walk | Retail | n/a | not published | not published | [dubairesidential.ae](https://dubairesidential.ae/en/community-shops) | 'our community retail spaces are strategically located within established high-density neighbourhoods'; 'Explore available retail opportunities'; shop names offered on the enquiry form: 'Meydan Residences 1, Meydan Heights, Bluewaters Residences, City Walk Residences, International City'; no rent on the page | 3 (representative) |

## Hidden, not deleted

- Project `avenue-al-jaddaf`: No project of this name is published by Azizi or any other developer (Azizi's Al Jaddaf projects are David, Farishta and Jaddaf Beach Oasis). Hidden, not deleted.
- 19 sample property listings: The 19 listings created with the site template on 2026-09-23 (and one copy made on 2026-09-28) describe homes, prices and sizes that no developer or register confirms. Hidden, not deleted; any that is a real listing can be published again from the admin.
  - `garden-residence-jumeirah`, `city-light-downtown`, `canal-studio-business-bay`, `cluster-office-jlt`, `creekside-loft`, `lake-level-office-jlt`, `desert-modern-al-barari`, `square-house-town-square`, `meridian-residence-dubai-marina`, `marina-sunline`, `canal-house-business-bay`, `circle-gardens-jvc`, `address-sky-view-downtown`, `palm-jumeirah-azure`, `canal-duplex-business-bay`, `park-row-dubai-hills`, `saheel-villa-arabian-ranches`, `courtyard-17-dubai-hills`, `the-meridian-residence-dubai-marina`

All of these rows are still in the database with `published = false`. To show one again: Admin > Properties (or Off-Plan Projects) > open it > tick "Published on the website". To undo the whole change: `node backups/tools/apply-verified-listings.mjs --restore backups/database/verified-listings/<file>.json` from `backend/`.

## What could not be verified

- **The Oasis by Emaar**: startingPrice; handover; location (district name not on the developer's page)
- **The Valley by Emaar**: handover
- **DAMAC Bay by Cavalli**: handover (the developer's page gives two different dates)
- **Sobha One**: startingPrice; handover
- **Bay Grove Residences**: startingPrice; handover
- **Rashid Yachts & Marina**: handover
- **Dubai Creek Harbour**: handover
- **Emaar Beachfront**: handover
- **DAMAC Islands**: handover
- **DAMAC Riverside**: handover
- **Sobha Hartland II**: status; startingPrice; handover
- **Sobha SeaHaven**: status; startingPrice; handover
- **Como Residences**: startingPrice; handover; bedroom mix (not on the page)
- **Palm Jebel Ali Villas**: startingPrice; handover; bedroom mix (not on the page)
- **Eltiera Views**: status; startingPrice; handover
- **City Walk Crestlane**: handover
- **The Edit at d3**: handover
- **Avenue (Al Jaddaf), Azizi**: the project itself; see above.
- **Warehouses and more retail**: wasl lists 121 retail units and 2 warehouses for rent, but its website began asking for a CAPTCHA before those pages could be read, so none was added. Dubai Residential publishes no rent for its community shops.
- **wasl single units**: the rental entries from wasl name the unit listed on the day; a unit can be let at any time, so re-check before quoting.
- **Dubai Land Department register**: not consulted. The DLD project search needs an interactive session; every listing here rests on the developer's own website instead.
- **Authorised-seller status**: nothing was provided by the company, so no page claims any relationship with a developer.

## Updating a listing

1. Open the developer's page (the *Source* link) and read the current figure.
2. Either edit it in the admin panel (Off-Plan Projects > the project > *Starting price*, *Handover*, *Status*, and set *Checked on* to today's date), or change `backend/scripts/verified-listings.json` and run `node backups/tools/apply-verified-listings.mjs` (dry run) and then with `--apply`.
3. If the developer no longer publishes a figure, set the price to 0 or clear the handover; the website will say so.
