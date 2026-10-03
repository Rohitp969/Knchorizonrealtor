async function main() {
  const [propsRes, projRes] = await Promise.all([
    fetch('http://localhost:5000/api/public/properties').then(r => r.json()),
    fetch('http://localhost:5000/api/public/projects').then(r => r.json())
  ]);

  const props = propsRes.properties || propsRes.data || [];
  const projs = projRes.projects || projRes.data || [];

  console.log('=== VERIFYING API AUDIT ===');
  console.log(`Live Properties count: ${props.length}`);
  console.log(`Live Projects count: ${projs.length}`);

  console.log('\n--- ALL PROJECTS IN DB ---');
  projs.forEach((p, idx) => {
    const cover = (p.photos && p.photos[0] ? p.photos[0].url : p.image) || 'NONE';
    console.log(`[P${idx+1}] ${p.title} (${p.slug}) in ${p.location}`);
    console.log(`     Cover: ${cover.split('/').pop()}`);
  });

  console.log('\n--- ALL PROPERTIES IN DB ---');
  props.forEach((h, idx) => {
    const cover = (h.photos && h.photos[0] ? h.photos[0].url : (h.images && h.images[0])) || 'NONE';
    console.log(`[H${idx+1}] ${h.title} [${h.type}] in ${h.location}`);
    console.log(`     Cover: ${cover.split('/').pop()}`);
  });
}
main();
