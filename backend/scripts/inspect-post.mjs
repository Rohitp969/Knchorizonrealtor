import pg from 'pg';

const supabase = new pg.Client({
  connectionString: 'postgresql://postgres.jrtexurwqffnygrcauvo:Knchorizonllc%40969@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await supabase.connect();
  const res = await supabase.query("select id, slug, title, status, published, published_at from posts where slug = 'dubai-property-price-in-inr'");
  console.log('Post details:', JSON.stringify(res.rows, null, 2));
  await supabase.end();
}

main();
