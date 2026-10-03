const fs = require('fs');

const d = JSON.parse(fs.readFileSync('backend/scripts/verified-listings.json', 'utf8'));
const counts = {};

d.properties.forEach(p => {
  const cover = p.photos && p.photos[0] ? p.photos[0].local : 'NONE';
  counts[cover] = counts[cover] || [];
  counts[cover].push({ slug: p.slug, title: p.title });
});

console.log('=== DUPLICATE COVERS IN PROPERTIES ===');
let dupFound = false;
for (const [img, list] of Object.entries(counts)) {
  if (list.length > 1) {
    dupFound = true;
    console.log(`\nDUPLICATE: ${img} used ${list.length} times:`);
    list.forEach(item => console.log(`  - [${item.slug}] "${item.title}"`));
  }
}

if (!dupFound) {
  console.log('No duplicates found!');
}

// Also check live API
async function checkLive() {
  try {
    const res = await fetch('http://localhost:5000/api/public/properties');
    const json = await res.json();
    const props = json.properties || json.data || [];
    const liveCounts = {};
    props.forEach(p => {
      const cover = (p.images && p.images[0]) || (p.photos && p.photos[0] ? p.photos[0].url : 'NONE');
      const filename = cover.split('/').pop();
      liveCounts[filename] = liveCounts[filename] || [];
      liveCounts[filename].push({ slug: p.slug, title: p.title });
    });

    console.log('\n=== DUPLICATE COVERS IN LIVE API (24 properties) ===');
    for (const [img, list] of Object.entries(liveCounts)) {
      if (list.length > 1) {
        console.log(`\nLIVE DUPLICATE: ${img} used ${list.length} times:`);
        list.forEach(item => console.log(`  - [${item.slug}] "${item.title}"`));
      }
    }
  } catch (e) {
    console.error('Live API fetch error:', e.message);
  }
}
checkLive();
