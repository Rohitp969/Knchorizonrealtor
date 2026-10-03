const fs = require('fs');

const d = JSON.parse(fs.readFileSync('backend/scripts/verified-listings.json', 'utf8'));

const allCovers = {};

d.properties.forEach(p => {
  const cover = p.photos && p.photos[0] ? p.photos[0].local : 'NONE';
  allCovers[cover] = allCovers[cover] || [];
  allCovers[cover].push({ type: 'Property', slug: p.slug, title: p.title });
});

d.projects.forEach(p => {
  const cover = p.photos && p.photos[0] ? p.photos[0].local : 'NONE';
  allCovers[cover] = allCovers[cover] || [];
  allCovers[cover].push({ type: 'Project', slug: p.slug, title: p.title });
});

console.log('=== GLOBAL DUPLICATE COVERS AUDIT (Properties + Projects) ===');
let found = 0;
for (const [img, list] of Object.entries(allCovers)) {
  if (list.length > 1) {
    found++;
    console.log(`\nDUPLICATE #${found}: ${img} (used ${list.length} times)`);
    list.forEach(item => console.log(`  - [${item.type}] ${item.slug} ("${item.title}")`));
  }
}

if (!found) {
  console.log('ALL COVERS ARE 100% GLOBALLY UNIQUE!');
}
