// Seed / patch the "Can Indians buy property in Dubai?" article.
// If the article is missing, it creates it.
// If it exists but has no featured image, it patches the image.
//
// Run against local:      node scratch/seed-dubai-guide.mjs
// Run against production: BASE=https://knc-backend.onrender.com/api node scratch/seed-dubai-guide.mjs

const BASE = process.env.BASE ?? 'http://localhost:5000/api';
const SLUG = 'can-indians-buy-property-in-dubai';
const FEATURED_IMAGE = 'https://res.cloudinary.com/complaintreview/image/upload/v1790577260/knc-horizon/blog/marina-palm-view.jpg';

const ARTICLE_CONTENT = `<p class="article-lead">Dubai has firmly established itself as one of the world's most attractive real estate markets for Indian investors and home-buyers. Whether you are looking for high rental yields, capital growth, or a second home for family holidays, the legal framework in Dubai makes purchasing property straightforward and transparent.</p>

<h2>What is freehold property in Dubai?</h2>
<p>Under the landmark Law No. 7 of 2006, the Government of Dubai opened designated areas to foreign nationals of any nationality, granting them <strong>100% absolute ownership rights</strong> (freehold title) registered directly with the Dubai Land Department (DLD).</p>
<p>As a freehold owner, you receive an official Title Deed (Mulkiya) issued by the DLD. You have complete legal freedom to occupy the property, rent it out, sell it, or pass it on to your legal heirs without needing a local Emirati partner or sponsor.</p>

<h2>Where can Indians buy property in Dubai?</h2>
<p>Dubai land is categorised into three ownership zones. Only freehold areas are fully open to Indian nationals.</p>
<div class="structured-cost-card">
  <div class="cost-item">
    <h4>Freehold areas</h4>
    <p>Full 100% ownership registered with the DLD. Open to all nationalities. Covers Dubai Marina, Downtown Dubai, Palm Jumeirah, Business Bay, Jumeirah Village Circle, Dubai Hills Estate, Arabian Ranches, DAMAC Hills, Meydan, Creek Harbour, and 60+ other master communities.</p>
  </div>
  <div class="cost-item">
    <h4>Leasehold areas</h4>
    <p>Long-term leases (typically 99 years) granted to expatriates, also registered with the DLD. Found in older commercial districts such as Deira, Bur Dubai and parts of Jumeirah.</p>
  </div>
  <div class="cost-item">
    <h4>Non-designated areas</h4>
    <p>Restricted to UAE and GCC nationals only. Includes most heritage and established residential zones outside the formal freehold map.</p>
  </div>
</div>
<p>Designated freehold zones can be updated over time, so confirm the area's status with the DLD or a licensed agent before you make an offer.</p>

<h2>What types of property can Indians buy?</h2>
<p>Within freehold zones, Indian buyers have access to the same range of property types as any foreign buyer.</p>
<ul>
  <li><strong>Apartments</strong> — Studios to four-bedroom units across all budgets, from AED 400,000 in outer communities to AED 20M+ penthouses on the Palm.</li>
  <li><strong>Villas</strong> — Standalone or semi-detached homes in gated communities. Popular in Dubai Hills Estate, Arabian Ranches and DAMAC Hills.</li>
  <li><strong>Townhouses</strong> — A middle ground between apartments and villas. Strong rental demand in family-oriented communities like Jumeirah Village Circle and Town Square.</li>
  <li><strong>Luxury properties</strong> — Penthouses, sky villas and branded residences (Bugatti, Lamborghini, Four Seasons) available in Downtown and Palm Jumeirah.</li>
  <li><strong>Off-plan properties</strong> — Units purchased directly from developers before or during construction, with flexible payment plans and lower entry prices.</li>
</ul>

<h2>What costs should Indian buyers consider?</h2>
<p>The advertised property price is only one part of the total cost. These are the categories to budget for.</p>
<div class="structured-cost-card">
  <div class="cost-item">
    <h4>Property price</h4>
    <p>The agreed purchase price of the unit.</p>
  </div>
  <div class="cost-item">
    <h4>DLD registration fee</h4>
    <p>Charged by the Dubai Land Department to register the title deed (4% of property value + admin fees).</p>
  </div>
  <div class="cost-item">
    <h4>Agency commission</h4>
    <p>Fee paid to the real estate agency facilitating the transaction (typically 2% + 5% VAT for secondary market; often 0% on off-plan).</p>
  </div>
  <div class="cost-item">
    <h4>Service charges</h4>
    <p>Ongoing building and community maintenance fees paid after purchase, calculated per square foot annually.</p>
  </div>
  <div class="cost-item">
    <h4>Mortgage-related costs</h4>
    <p>Arrangement and processing fees, property valuation fee, and mortgage registration fee (0.25% of loan amount) where financing is used.</p>
  </div>
  <div class="cost-item">
    <h4>Currency conversion</h4>
    <p>Bank transfer fees and exchange margin when converting INR to AED via authorised dealer banks.</p>
  </div>
</div>
<p><em>Budget the sticker price plus at least 5–7% for a ready unit, or 2–4% for off-plan where agent fees are usually zero.</em></p>

<h2>What documents do Indians need?</h2>
<p>Requirements vary slightly by property type and whether you buy in person or remotely. Expect to provide:</p>
<ul>
  <li><strong>Valid passport</strong> — plus a copy if you are already in the UAE.</li>
  <li><strong>Proof of funds or income</strong> — particularly for larger transactions or mortgage applications.</li>
  <li><strong>Power of Attorney</strong> — if you appoint the developer or an agent as an authorised signatory on your behalf.</li>
  <li><strong>Bank account details</strong> — for payment transfers and, where relevant, mortgage processing.</li>
</ul>
<p>Confirm the exact requirements with your agent, the developer and the Dubai Land Department before you start.</p>

<h2>How does the buying process work?</h2>
<p>At a high level, a property purchase typically follows seven steps.</p>
<ol class="article-steps-list">
  <li><strong>Choose your objective</strong> — Decide use: rental income, long-term investment, or family home.</li>
  <li><strong>Choose a location</strong> — Match to your lifestyle goals and financial capacity.</li>
  <li><strong>Shortlist properties</strong> — Tour in person or via virtual viewing sessions.</li>
  <li><strong>Verify the property and developer</strong> — Check DLD registration and developer approval status.</li>
  <li><strong>Review terms and total costs</strong> — Including DLD fee, agent commission and payment plan.</li>
  <li><strong>Complete documentation</strong> — Sign the SPA or MOU. Down payment is typically 10–30%.</li>
  <li><strong>Complete payment and registration</strong> — Complete at the DLD office or through an authorised trustee office.</li>
</ol>

<h2>How do Indian buyers transfer funds to Dubai?</h2>
<p>Indian residents must comply with both Indian foreign exchange regulations and UAE remittance rules when sending property purchase funds abroad.</p>
<ul>
  <li><strong>RBI Liberalised Remittance Scheme (LRS)</strong> — Permits each resident Indian to remit up to USD 250,000 per financial year for overseas property investment. Multiple family members can pool their allowances.</li>
  <li><strong>FEMA compliance</strong> — Funds must be transferred via authorised dealer banks. Retain all wire transfer receipts and Form A2 records for future repatriation or sale.</li>
  <li><strong>Wire transfer</strong> — Direct bank-to-bank SWIFT transfer to the developer's RERA-registered project escrow account or to the seller's DLD-verified account.</li>
  <li><strong>Currency timing</strong> — AED is pegged to USD (1 USD = 3.67 AED). Use a forward contract or currency specialist for large transfers to reduce exchange rate risk.</li>
</ul>

<h2>Can buying property lead to a UAE residency or Golden Visa?</h2>
<p>Property ownership does not automatically grant UAE residency, but it opens two government residency pathways:</p>
<ul>
  <li><strong>2-Year Property Investor Visa</strong> — Available for completed (ready) properties valued at AED 750,000 or more (approx. &#8377;1.7 Crore). Renewable every two years while ownership continues.</li>
  <li><strong>10-Year UAE Golden Visa</strong> — Available for property purchases of AED 2,000,000 or more (approx. &#8377;4.5 Crore). Allows 100% family sponsorship and unlimited re-entry with no restriction on time spent outside the UAE. Off-plan properties with approved developers qualify once minimum equity thresholds are met.</li>
</ul>
<p>Check the exact threshold and eligibility criteria with the Dubai Land Department, as these change periodically.</p>

<h2>Is Dubai property a good investment for Indians?</h2>
<ul>
  <li><strong>Rental yields</strong> — Dubai typically delivers gross rental yields of 5–9% per year depending on community and unit size. This compares favourably to most Indian metros, where yields sit at 2–3%.</li>
  <li><strong>Zero tax</strong> — Dubai levies 0% personal income tax, 0% capital gains tax and 0% inheritance tax. The UAE-India DTAA prevents double taxation on rental income.</li>
  <li><strong>Currency benefit</strong> — Earnings in AED (pegged to USD) provide a natural hedge against INR depreciation.</li>
  <li><strong>Capital appreciation</strong> — Prime areas saw 15–25% price growth in 2022–2024. Off-plan projects in emerging master communities offer higher upside.</li>
  <li><strong>Regulatory transparency</strong> — DLD and RERA provide a strong legal framework: all transactions are registered, escrow is mandatory for off-plan, and developer defaults are protected under RERA law.</li>
</ul>`;

async function run() {
  // 1. Login
  const loginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@knchorizonrealtor.com', password: 'Knchorizonllc@969' }),
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  if (!token) { console.error('Login failed:', loginData); process.exit(1); }
  console.log('✓ Login OK');

  const authHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  // 2. Check if article exists
  const checkRes = await fetch(`${BASE}/blogs/${SLUG}`);
  console.log('Article in DB:', checkRes.status);

  if (checkRes.status === 404) {
    // Create the article
    const createRes = await fetch(`${BASE}/admin/blog`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'Can Indians buy property in Dubai?',
        slug: SLUG,
        excerpt: 'A comprehensive legal and financial guide for Indian citizens buying freehold homes and investment properties in Dubai.',
        category: 'Guides',
        author: 'KNC Horizon',
        featuredImage: FEATURED_IMAGE,
        image: FEATURED_IMAGE,
        published: true,
        status: 'published',
        publishedAt: new Date().toISOString(),
        content: ARTICLE_CONTENT,
      }),
    });
    const result = await createRes.json();
    if (createRes.ok) {
      console.log('✓ Article created with image:', result?.post?.id ?? result);
    } else {
      console.error('✗ Create failed:', result);
    }
    return;
  }

  // 3. Article exists — always update content + image so DB matches site-data.ts
  const listRes = await fetch(`${BASE}/admin/blog`, { headers: authHeaders });
  const listData = await listRes.json();
  const posts = listData.posts ?? listData.items ?? [];
  const existing = posts.find((p) => p.slug === SLUG);

  if (!existing) {
    console.log('Could not find article in admin list — try editing it manually in the admin UI.');
    return;
  }

  // Always patch both content and featured image together
  const patchRes = await fetch(`${BASE}/admin/blog/${existing.id}`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({ featuredImage: FEATURED_IMAGE, content: ARTICLE_CONTENT }),
  });
  const patchResult = await patchRes.json();
  if (patchRes.ok) {
    console.log('✓ Article content + featured image updated:', existing.id);
  } else {
    console.error('✗ Patch failed:', patchResult);
    console.log('→ Fix manually: go to admin → Articles → Edit the article.');
  }
}

run().catch(console.error);
