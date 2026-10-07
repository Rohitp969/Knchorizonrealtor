import fs from 'node:fs';
import pg from 'pg';

const serverUrl = 'postgresql://knc_user:KNChorizon123@45.82.75.49:5432/knc_db';
const verified = JSON.parse(fs.readFileSync('scripts/verified-listings.json', 'utf8'));

async function checkVerified() {
  const client = new pg.Client({ connectionString: serverUrl, ssl: false });
  await client.connect();

  const projs = (await client.query('select slug from projects')).rows.map(r => r.slug);
  const props = (await client.query('select slug from properties')).rows.map(r => r.slug);

  const missingProjs = verified.projects.filter(p => !projs.includes(p.slug));
  const missingProps = verified.properties.filter(p => !props.includes(p.slug));

  console.log('Verified projects in json:', verified.projects.length);
  console.log('Verified projects missing in Server DB:', missingProjs.length);
  if (missingProjs.length) console.log(missingProjs.map(p => p.slug));

  console.log('Verified properties in json:', verified.properties.length);
  console.log('Verified properties missing in Server DB:', missingProps.length);
  if (missingProps.length) console.log(missingProps.map(p => p.slug));

  await client.end();
}

checkVerified().catch(console.error);
