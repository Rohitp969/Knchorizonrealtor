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

<h2>What costs should Indian buyers consider?</h2>
<p>The advertised property price is only one part of the total cost. These are the categories to budget for.</p>

<div class="structured-cost-card">
  <div class="cost-item">
    <h4>Property price</h4>
    <p>The agreed purchase price of the unit between buyer and developer or seller.</p>
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
    <p>Bank transfer fees and exchange margin when converting Indian Rupees (INR) to UAE Dirhams (AED) via authorized dealer banks.</p>
  </div>
</div>

<h2>Step-by-step process for Indian buyers</h2>
<p>Buying property in Dubai from India follows a streamlined, digital-first procedure governed by the Real Estate Regulatory Agency (RERA):</p>
<ol class="article-steps-list">
  <li><strong>Select the Property &amp; Reserve:</strong> Identify the unit (off-plan or ready), sign the reservation agreement, and pay the booking deposit (typically 5% to 10%).</li>
  <li><strong>Sign the Sales Agreement (MOU / Form F):</strong> For secondary resale, both parties sign the standard RERA Form F. For off-plan, the developer issues the Sale and Purchase Agreement (SPA).</li>
  <li><strong>Remit Funds via RBI LRS:</strong> Wire the milestone payments or purchase balance from your Indian bank account directly to the RERA-regulated project escrow account or seller.</li>
  <li><strong>Obtain No Objection Certificate (NOC):</strong> The developer issues an NOC certifying all service charges and obligations are clear.</li>
  <li><strong>DLD Title Deed Transfer:</strong> The Dubai Land Department issues the official electronic Title Deed in your name, verified instantly via the Dubai REST application.</li>
</ol>

<h2>Golden Visa eligibility for Indian property owners</h2>
<p>Investing in Dubai real estate unlocks residency privileges for you and your family:</p>
<ul>
  <li><strong>2-Year Investor Visa:</strong> Available for properties valued at AED 750,000 (approx. ₹1.7 Crore) or more.</li>
  <li><strong>10-Year UAE Golden Visa:</strong> Available for property purchases of AED 2,000,000 (approx. ₹4.5 Crore) or more. This allows 100% family sponsorship, domestic staff sponsorship, and no restriction on maximum stay outside the UAE. Off-plan properties with approved developers also qualify once minimum equity is met.</li>
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

  // 3. Article exists — check if it has a featured image; patch if missing
  const listRes = await fetch(`${BASE}/admin/blog`, { headers: authHeaders });
  const listData = await listRes.json();
  const posts = listData.posts ?? listData.items ?? [];
  const existing = posts.find((p) => p.slug === SLUG);

  if (!existing) {
    console.log('Could not find article in admin list — try editing it manually in the admin UI.');
    return;
  }

  const hasImage = existing.featuredImage || existing.image || existing.imageUrl;
  if (hasImage) {
    console.log('✓ Article already has a featured image:', hasImage);
    return;
  }

  // Patch the image
  const patchRes = await fetch(`${BASE}/admin/blog/${existing.id}`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({ featuredImage: FEATURED_IMAGE }),
  });
  const patchResult = await patchRes.json();
  if (patchRes.ok) {
    console.log('✓ Featured image added to existing article:', FEATURED_IMAGE);
  } else {
    console.error('✗ Patch failed:', patchResult);
    console.log('→ Fix manually: go to admin → Articles → Edit → Featured Image → paste:', FEATURED_IMAGE);
  }
}

run().catch(console.error);
