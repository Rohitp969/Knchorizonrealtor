import pg from 'pg';

const supabaseUrl = 'postgresql://postgres.jrtexurwqffnygrcauvo:Knchorizonllc%40969@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres';

async function main() {
  const client = new pg.Client({ connectionString: supabaseUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const res = await client.query('select id, title, category, image_url from gallery');
  console.log('Total gallery items in Supabase:', res.rows.length);
  res.rows.forEach(r => console.log(`  - [${r.category}] ${r.title}: ${r.image_url}`));
  await client.end();
}

main();
