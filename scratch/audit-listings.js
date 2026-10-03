const fs = require('fs');

const verifiedData = JSON.parse(fs.readFileSync('backend/scripts/verified-listings.json', 'utf8'));

console.log('=== AUDITING VERIFIED LISTINGS ===');
verifiedData.properties.forEach((l, idx) => {
  const cover = (l.photos && l.photos[0]) ? l.photos[0].local : 'NONE';
  const totalPhotos = (l.photos || []).length;
  console.log(`[${idx + 1}] SLUG: ${l.slug}`);
  console.log(`     Title: ${l.title}`);
  console.log(`     Type: ${l.propertyType || l.category || 'N/A'} | Purpose: ${l.purpose || l.type || 'N/A'}`);
  console.log(`     Cover: ${cover} (${totalPhotos} photos total)`);
  if (l.photos && l.photos.length > 1) {
    console.log(`     Gallery: ${l.photos.slice(1).map(p => p.local).join(', ')}`);
  }
});
