const fs = require('fs');

const content = fs.readFileSync('frontend/src/lib/site-data.ts', 'utf8');
const start = content.indexOf('export const defaultRemoteProperties');
console.log('defaultRemoteProperties position:', start);

const verifiedData = JSON.parse(fs.readFileSync('backend/scripts/verified-listings.json', 'utf8'));
console.log('Total verified properties in JSON:', verifiedData.properties.length);
