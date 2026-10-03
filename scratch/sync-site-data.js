const fs = require('fs');
const path = require('path');

const siteDataPath = path.resolve('frontend/src/lib/site-data.ts');
let siteDataContent = fs.readFileSync(siteDataPath, 'utf8');

const verifiedData = JSON.parse(fs.readFileSync(path.resolve('backend/scripts/verified-listings.json'), 'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.resolve('backend/scripts/cloudinary-images.json'), 'utf8'));
const manifestMap = new Map(manifest.map(m => [m.local, m]));

// Update fallback properties array (home page)
siteDataContent = siteDataContent.replace(
  /\/\/ Garden View Villas —[\s\S]*?note: 'For rent',\s*\},/,
  `// Garden View Villas — luxury Mediterranean-style villa with garden and arched architecture.
    id: 'garden-view-villas-rent',
    slug: 'garden-view-villas-rent',
    title: 'Townhouses and Villas for Rent at Garden View Villas',
    location: 'Garden View Villas',
    type: 'Villa',
    price: 'From AED 200,000 / year',
    details: '3 to 4 beds',
    image: 'https://res.cloudinary.com/complaintreview/image/upload/v1790844468/knc-horizon/properties/residential/dubai-mediterranean-style-villa.jpg',
    imageAlt: 'Mediterranean-style luxury villa with landscaped garden, patio and arched windows in Dubai',
    note: 'For rent',
  },`
);

siteDataContent = siteDataContent.replace(
  /\/\/ DAMAC Bay Penthouse —[\s\S]*?note: 'Off-plan',\s*\},/,
  `// DAMAC Bay Penthouse — interior of a real Dubai penthouse with double-height ceiling and skyline views.
    id: 'damac-bay-by-cavalli-4-bedroom-penthouse',
    slug: 'damac-bay-by-cavalli-4-bedroom-penthouse',
    title: '4-Bedroom Penthouse at DAMAC Bay by Cavalli',
    location: 'Dubai Harbour',
    type: 'Penthouse',
    price: 'From AED 66,843,000',
    details: '4 beds · up to 10,036 sq ft',
    image: 'https://res.cloudinary.com/complaintreview/image/upload/v1791012023/knc-horizon/properties/residential/penthouse-double-height-lounge-skyline-view.jpg',
    imageAlt: 'Ultra-luxury penthouse double-height lounge with floor-to-ceiling glass and panoramic Dubai skyline view',
    note: 'Off-plan',
  },`
);

// Now update defaultRemoteProperties
const startMarker = 'export const defaultRemoteProperties = ';
const startIndex = siteDataContent.indexOf(startMarker);
const endMarker = '];\n\nexport const defaultProjects = [';
const endIndex = siteDataContent.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  throw new Error('Markers not found in site-data.ts');
}

const remoteJsonStr = siteDataContent.slice(startIndex + startMarker.length, endIndex + 1);
const remoteProperties = JSON.parse(remoteJsonStr);
console.log('Successfully parsed', remoteProperties.length, 'defaultRemoteProperties');

const verifiedMap = new Map(verifiedData.properties.map(p => [p.slug, p]));

let syncedCount = 0;
for (const p of remoteProperties) {
  const verified = verifiedMap.get(p.slug);
  if (verified && Array.isArray(verified.photos) && verified.photos.length) {
    const urls = verified.photos.map(photo => {
      const asset = manifestMap.get(photo.local);
      if (!asset) throw new Error(`Missing photo in manifest: ${photo.local}`);
      return asset.url;
    });
    
    p.images = urls;
    p.coverImage = urls[0];
    p.coverImageAlt = verified.photos[0].alt || '';
    p.gallery = urls.slice(1);
    p.galleryImages = verified.photos.slice(1).map(ph => {
      const asset = manifestMap.get(ph.local);
      return {
        url: asset.url,
        alt: ph.alt || '',
        publicId: asset.publicId || null,
        representative: ph.representative === true,
        credit: ph.credit || '',
        sourceUrl: ph.sourceUrl || ''
      };
    });
    syncedCount++;
  }
}

console.log(`Synced ${syncedCount} remoteProperties with verified photos!`);

const newRemoteJson = JSON.stringify(remoteProperties, null, 2);
const newSiteDataContent = siteDataContent.slice(0, startIndex + startMarker.length) +
  newRemoteJson +
  ';\n\n' +
  siteDataContent.slice(endIndex + '];\n\n'.length);

fs.writeFileSync(siteDataPath, newSiteDataContent, 'utf8');
console.log('Successfully updated site-data.ts with all verified property photos!');
