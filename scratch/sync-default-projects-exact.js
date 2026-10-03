const fs = require('fs');
const path = require('path');

const siteDataPath = path.resolve('frontend/src/lib/site-data.ts');
let content = fs.readFileSync(siteDataPath, 'utf8');

const verifiedData = JSON.parse(fs.readFileSync(path.resolve('backend/scripts/verified-listings.json'), 'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.resolve('backend/scripts/cloudinary-images.json'), 'utf8'));
const manifestMap = new Map(manifest.map(m => [m.local, m]));

// Update Business Bay area image
content = content.replace(
  /\{ id: 'business-bay', name: 'Business Bay', descriptor: 'A vertical pulse', image: '[^']+',/,
  `{ id: 'business-bay', name: 'Business Bay', descriptor: 'A vertical pulse', image: 'https://res.cloudinary.com/complaintreview/image/upload/v1790577284/knc-horizon/properties/business-bay-towers-aerial.jpg',`
);

// Find defaultProjects
const startMarker = 'export const defaultProjects = [';
const endMarker = '\nexport const defaultPosts = [';
const pStart = content.indexOf(startMarker);
const pEnd = content.indexOf(endMarker);

if (pStart === -1 || pEnd === -1) {
  throw new Error('Could not find defaultProjects markers');
}

let projectsSection = content.slice(pStart, pEnd);

for (const p of verifiedData.projects) {
  if (!Array.isArray(p.photos) || !p.photos.length) continue;
  const slug = p.slug;
  const targetSlug = `slug: '${slug}'`;
  const slugIdx = projectsSection.indexOf(targetSlug);
  if (slugIdx === -1) {
    console.warn(`Project slug not found in defaultProjects: ${slug}`);
    continue;
  }

  // Find start of this object
  const objStart = projectsSection.lastIndexOf('\n  {', slugIdx);
  // Find end of this object
  const objEnd = projectsSection.indexOf('\n  },', slugIdx) + '\n  },'.length;

  let block = projectsSection.slice(objStart, objEnd);

  const coverLocal = p.photos[0].local;
  const coverAsset = manifestMap.get(coverLocal);
  if (!coverAsset) {
    console.warn(`Cover asset missing: ${coverLocal}`);
    continue;
  }
  const coverUrl = coverAsset.url;
  const coverAlt = p.photos[0].alt || '';

  const galleryUrls = p.photos.slice(1).map(ph => {
    const a = manifestMap.get(ph.local);
    return a ? a.url : null;
  }).filter(Boolean);

  // Replace image
  block = block.replace(/image:\s*'[^']+'/, `image: '${coverUrl}'`);
  // Replace coverImageAlt
  if (block.includes('coverImageAlt:')) {
    block = block.replace(/coverImageAlt:\s*'[^']*'/, `coverImageAlt: '${coverAlt.replace(/'/g, "\\'")}'`);
  }
  // Replace gallery
  if (galleryUrls.length && block.includes('gallery:')) {
    const galStr = `gallery: [\n      '${galleryUrls.join("',\n      '")}',\n    ]`;
    block = block.replace(/gallery:\s*\[[\s\S]*?\],/, `${galStr},`);
  }

  // Replace back into projectsSection
  projectsSection = projectsSection.slice(0, objStart) + block + projectsSection.slice(objEnd);
  console.log(`Successfully updated project block: ${slug} -> ${coverLocal.split('/').pop()}`);
}

content = content.slice(0, pStart) + projectsSection + content.slice(pEnd);
fs.writeFileSync(siteDataPath, content, 'utf8');
console.log('Successfully saved site-data.ts with exact replacements!');
