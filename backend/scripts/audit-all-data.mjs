import pg from 'pg';

const serverUrl = 'postgresql://knc_user:KNChorizon123@45.82.75.49:5432/knc_db';
const supabaseUrl = 'postgresql://postgres.jrtexurwqffnygrcauvo:Knchorizonllc%40969@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres';

const TABLES = [
  'developers',
  'properties',
  'projects',
  'posts',
  'communities',
  'insights',
  'gallery',
  'testimonials',
  'users',
  'inquiries',
  'newsletter',
  'media',
  'settings',
  'seo_meta',
  'seo_settings'
];

async function audit() {
  const server = new pg.Client({ connectionString: serverUrl, ssl: false });
  const supabase = new pg.Client({ connectionString: supabaseUrl, ssl: { rejectUnauthorized: false } });

  await server.connect();
  await supabase.connect();

  console.log('Table Comparison (Own Server vs Supabase):');
  console.log('--------------------------------------------------');
  for (const table of TABLES) {
    const sCount = (await server.query(`select count(*) from "${table}"`)).rows[0].count;
    const supCount = (await supabase.query(`select count(*) from "${table}"`)).rows[0].count;
    console.log(`${table.padEnd(16)} | Server: ${String(sCount).padStart(4)} | Supabase: ${String(supCount).padStart(4)}`);
  }

  // Check posts
  console.log('\nPosts in Server:');
  const serverPosts = (await server.query('select slug, title, published from posts')).rows;
  serverPosts.forEach(p => console.log(`  - [${p.published ? 'LIVE' : 'DRAFT'}] ${p.slug}: ${p.title}`));

  console.log('\nPosts in Supabase:');
  const supPosts = (await supabase.query('select slug, title, published from posts')).rows;
  supPosts.forEach(p => console.log(`  - [${p.published ? 'LIVE' : 'DRAFT'}] ${p.slug}: ${p.title}`));

  await server.end();
  await supabase.end();
}

audit().catch(console.error);
