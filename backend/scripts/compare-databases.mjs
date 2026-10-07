import pg from 'pg';

const serverUrl = 'postgresql://knc_user:KNChorizon123@45.82.75.49:5432/knc_db';
const supabaseUrl = 'postgresql://postgres.jrtexurwqffnygrcauvo:Knchorizonllc%40969@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres';

async function check() {
  const server = new pg.Client({ connectionString: serverUrl, ssl: false });
  const supabase = new pg.Client({ connectionString: supabaseUrl, ssl: { rejectUnauthorized: false } });

  await server.connect();
  await supabase.connect();

  console.log('--- GALLERY DIFFERENCE ---');
  const serverGallery = (await server.query('select id, title from gallery order by created_at')).rows;
  const supaGallery = (await supabase.query('select id, title from gallery order by created_at')).rows;
  const serverGalleryIds = new Set(serverGallery.map(g => g.id));
  const supaGalleryIds = new Set(supaGallery.map(g => g.id));
  const missingInServerGallery = supaGallery.filter(g => !serverGalleryIds.has(g.id));
  console.log('Gallery missing on Own Server (' + missingInServerGallery.length + '):', missingInServerGallery.map(g => g.title));

  console.log('\n--- SEO_META DIFFERENCE ---');
  const serverSeo = (await server.query('select id, page_key, property_id, project_id, post_id from seo_meta')).rows;
  const supaSeo = (await supabase.query('select id, page_key, property_id, project_id, post_id from seo_meta')).rows;
  const serverSeoKeys = new Set(serverSeo.map(s => `${s.page_key || ''}|${s.property_id || ''}|${s.project_id || ''}|${s.post_id || ''}`));
  const missingInServerSeo = supaSeo.filter(s => !serverSeoKeys.has(`${s.page_key || ''}|${s.property_id || ''}|${s.project_id || ''}|${s.post_id || ''}`));
  console.log('SEO meta missing on Own Server (' + missingInServerSeo.length + '):', missingInServerSeo.map(s => ({ page_key: s.page_key, prop: s.property_id, proj: s.project_id, post: s.post_id })));

  console.log('\n--- PROPERTIES / PROJECTS IN SUPABASE NOT IN SERVER ---');
  const serverProps = (await server.query('select id, slug from properties')).rows;
  const supaProps = (await supabase.query('select id, slug from properties')).rows;
  const serverPropSlugs = new Set(serverProps.map(p => p.slug));
  const missingProps = supaProps.filter(p => !serverPropSlugs.has(p.slug));
  console.log('Properties in Supabase not in Server:', missingProps.map(p => p.slug));

  const serverProjs = (await server.query('select id, slug from projects')).rows;
  const supaProjs = (await supabase.query('select id, slug from projects')).rows;
  const serverProjSlugs = new Set(serverProjs.map(p => p.slug));
  const missingProjs = supaProjs.filter(p => !serverProjSlugs.has(p.slug));
  console.log('Projects in Supabase not in Server:', missingProjs.map(p => p.slug));

  const serverPosts = (await server.query('select id, slug from posts')).rows;
  const supaPosts = (await supabase.query('select id, slug from posts')).rows;
  const serverPostSlugs = new Set(serverPosts.map(p => p.slug));
  const missingPosts = supaPosts.filter(p => !serverPostSlugs.has(p.slug));
  console.log('Posts in Supabase not in Server:', missingPosts.map(p => p.slug));

  await server.end();
  await supabase.end();
}

check().catch(console.error);
