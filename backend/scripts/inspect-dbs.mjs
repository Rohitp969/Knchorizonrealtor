import pg from 'pg';

const dbs = [
  { name: 'Own Server (45.82.75.49)', url: 'postgresql://knc_user:KNChorizon123@45.82.75.49:5432/knc_db', ssl: false },
  { name: 'Supabase (aws-0-ap-northeast-1)', url: 'postgresql://postgres.jrtexurwqffnygrcauvo:Knchorizonllc%40969@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres', ssl: { rejectUnauthorized: false } }
];

async function main() {
  for (const db of dbs) {
    console.log(`\n=== Testing ${db.name} ===`);
    try {
      const client = new pg.Client({
        connectionString: db.url,
        connectionTimeoutMillis: 10000,
        ssl: db.ssl,
      });
      await client.connect();
      console.log(`Connected successfully to ${db.name}`);
      const res = await client.query("select table_name from information_schema.tables where table_schema = 'public' and table_type = 'BASE TABLE' order by 1");
      console.log('Tables found (' + res.rows.length + '):', res.rows.map(r => r.table_name).join(', '));
      for (const t of ['developers', 'properties', 'projects', 'posts', 'communities', 'insights', 'gallery', 'testimonials', 'users', 'inquiries', 'newsletter', 'media', 'settings', 'seo_meta', 'seo_settings']) {
        try {
          const count = await client.query(`select count(*) from "${t}"`);
          console.log(`  ${t.padEnd(16)}: ${count.rows[0].count} rows`);
        } catch {
          console.log(`  ${t.padEnd(16)}: [table missing]`);
        }
      }
      await client.end();
    } catch (err) {
      console.log(`Failed to connect to ${db.name}:`, err.message);
    }
  }
}

main();
