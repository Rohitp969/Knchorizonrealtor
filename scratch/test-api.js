async function main() {
  try {
    const res = await fetch('http://localhost:5000/api/public/properties');
    const json = await res.json();
    const props = json.data || json.properties || json;
    console.log('Total properties from API:', props.length);
    props.forEach((p, idx) => {
      const cover = p.images && p.images[0] ? p.images[0] : (p.coverPhoto || 'NONE');
      console.log(`[${idx+1}] ${p.slug} | Type: ${p.type || p.propertyType} | Listing: ${p.listingType || p.status}`);
      console.log(`     Cover: ${cover}`);
    });
  } catch (err) {
    console.error('API Fetch failed:', err.message);
  }
}
main();
