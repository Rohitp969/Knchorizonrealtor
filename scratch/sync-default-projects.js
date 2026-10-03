const fs = require('fs');
const path = require('path');

const siteDataPath = path.resolve('frontend/src/lib/site-data.ts');
let siteDataContent = fs.readFileSync(siteDataPath, 'utf8');

const verifiedData = JSON.parse(fs.readFileSync(path.resolve('backend/scripts/verified-listings.json'), 'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.resolve('backend/scripts/cloudinary-images.json'), 'utf8'));
const manifestMap = new Map(manifest.map(m => [m.local, m]));

// 1. Update Business Bay area image
siteDataContent = siteDataContent.replace(
  /\{ id: 'business-bay', name: 'Business Bay', descriptor: 'A vertical pulse', image: '[^']+',/,
  `{ id: 'business-bay', name: 'Business Bay', descriptor: 'A vertical pulse', image: 'https://res.cloudinary.com/complaintreview/image/upload/v1790577284/knc-horizon/properties/business-bay-towers-aerial.jpg',`
);

// 2. Locate defaultProjects in siteDataContent
const startMarker = 'export const defaultProjects = [';
const endMarker = '\nexport const defaultPosts = [';

const startIndex = siteDataContent.indexOf(startMarker);
const endIndex = siteDataContent.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  throw new Error('Could not find defaultProjects in site-data.ts');
}

const projectsBlock = siteDataContent.slice(startIndex, endIndex);

// Build map of verified projects
const verifiedProjMap = new Map(verifiedData.projects.map(p => [p.slug, p]));

// For each verified project with photos, update its corresponding entry in defaultProjects
let updatedCount = 0;
for (const vp of verifiedData.projects) {
  if (Array.isArray(vp.photos) && vp.photos.length) {
    const slug = vp.slug;
    const coverLocal = vp.photos[0].local;
    const coverAsset = manifestMap.get(coverLocal);
    if (!coverAsset) {
      console.warn(`Cover asset not found for ${coverLocal}`);
      continue;
    }
    const coverUrl = coverAsset.url;
    const galleryUrls = vp.photos.slice(1).map(ph => {
      const a = manifestMap.get(ph.local);
      return a ? a.url : null;
    }).filter(Boolean);

    // Regex to find the project block by slug
    const regex = new RegExp(`(\\{[\\s\\S]*?slug:\\s*'${slug}'[\\s\\S]*?\\},)`, 'g');
    siteDataContent = siteDataContent.replace(regex, (match) => {
      let m = match;
      // replace image
      m = m.replace(/image:\s*'[^']+'/, `image: '${coverUrl}'`);
      // replace coverImage if present
      if (m.includes('coverImage:')) {
        m = m.replace(/coverImage:\s*'[^']+'/, `coverImage: '${coverUrl}'`);
      }
      // replace gallery
      if (galleryUrls.length && m.includes('gallery:')) {
        const galStr = `gallery: [\n      '${galleryUrls.join("',\n      '")}',\n    ]`;
        m = m.replace(/gallery:\s*\[[\s\S]*?\],/, `${galStr},`);
      }
      updatedCount++;
      return m;
    });
  }
}

console.log(`Updated ${updatedCount} occurrences of project entries in site-data.ts`);

fs.writeFileSync(siteDataPath, siteDataContent, 'utf8');
console.log('Saved updated site-data.ts');
