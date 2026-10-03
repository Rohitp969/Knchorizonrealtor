const fs = require('fs');

const verifiedData = JSON.parse(fs.readFileSync('backend/scripts/verified-listings.json', 'utf8'));

console.log('=== 1. VERIFIED PROJECTS (' + verifiedData.projects.length + ') ===');
verifiedData.projects.forEach((p, i) => {
  const photos = p.photos || [];
  const cover = photos[0] ? photos[0].local : 'NONE';
  console.log(`[P${i+1}] ${p.slug} | "${p.title}" | Loc: ${p.location}`);
  console.log(`     Cover: ${cover}`);
  if (photos.length > 1) {
    console.log(`     Gallery: ${photos.slice(1).map(x => x.local).join(', ')}`);
  }
});

// Let's inspect site-data.ts defaultProjects
const siteData = fs.readFileSync('frontend/src/lib/site-data.ts', 'utf8');

function extractArray(marker, endMarker) {
  const s = siteData.indexOf(marker);
  if (s === -1) return null;
  const e = siteData.indexOf(endMarker, s);
  return siteData.slice(s, e !== -1 ? e : undefined);
}

console.log('\n=== 2. AREAS IN SITE DATA ===');
const areasBlock = extractArray('export const areas: Area[] = [', 'export const defaultRemoteProperties');
if (areasBlock) {
  const matches = [...areasBlock.matchAll(/name:\s*'([^']+)'[\s\S]*?descriptor:\s*'([^']+)'[\s\S]*?image:\s*'([^']+)'/g)];
  matches.forEach((m, idx) => {
    console.log(`[A${idx+1}] ${m[1]} (${m[2]}): ${m[3].split('/').pop()}`);
  });
}

console.log('\n=== 3. SPECIALIST SERVICES ===');
const specBlock = extractArray('export const specialistServices: SpecialistService[] = [', 'export const areas');
if (specBlock) {
  const matches = [...specBlock.matchAll(/title:\s*'([^']+)'[\s\S]*?image:\s*'([^']+)'/g)];
  matches.forEach((m, idx) => {
    console.log(`[S${idx+1}] ${m[1]}: ${m[2].split('/').pop()}`);
  });
}

console.log('\n=== 4. DEFAULT POSTS (BLOG) ===');
const postsBlock = extractArray('export const defaultPosts = [', 'export const defaultDevelopers');
if (postsBlock) {
  const matches = [...postsBlock.matchAll(/slug:\s*'([^']+)'[\s\S]*?title:\s*'([^']+)'[\s\S]*?image:\s*'([^']+)'/g)];
  matches.forEach((m, idx) => {
    console.log(`[B${idx+1}] ${m[1]} | "${m[2]}": ${m[3].split('/').pop()}`);
  });
}

console.log('\n=== 5. DEFAULT DEVELOPERS ===');
const devBlock = extractArray('export const defaultDevelopers = [', 'export const communities = [');
if (devBlock) {
  const matches = [...devBlock.matchAll(/slug:\s*'([^']+)'[\s\S]*?name:\s*'([^']+)'[\s\S]*?image:\s*'([^']+)'/g)];
  matches.forEach((m, idx) => {
    console.log(`[D${idx+1}] ${m[1]} | "${m[2]}": ${m[3].split('/').pop()}`);
  });
}
