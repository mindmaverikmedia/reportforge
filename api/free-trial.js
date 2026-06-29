/**
 * /api/free-trial
 * Dedicated high-conversion landing page for paid ad traffic.
 *
 * Update your LinkedIn ad destination URL to:
 * https://reportforge-2ap7.vercel.app/api/free-trial?utm_source=linkedin&utm_medium=cpc&utm_campaign=founders&utm_content=founder_story
 *
 * Once LinkedIn Insight Tag partner ID is confirmed, replace YOUR_PARTNER_ID below.
 */
export default function handler(req, res) {
  const { utm_source = '', utm_campaign = '', utm_content = '' } = req.query;
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Free Market Intelligence Report — ReportForge AI</title>
<meta name="description" content="Generate a full market intelligence brief on any industry in under 60 seconds. Free, no card required.">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--navy:#07111F;--card:#0D1B2E;--amber:#F59E0B;--white:#F8FAFC;--slate:#94A3B8;--muted:#475569;--border:#1E293B;--green:#10B981}
body{background:var(--navy);color:var(--white);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;min-height:100vh}
.top-bar{background:var(--amber);height:4px;width:100%}
nav{display:flex;align-items:center;justify-content:space-between;padding:1rem 2rem;border-bottom:1px solid var(--border)}
.logo{display:flex;align-items:center;gap:10px;text-decoration:none}
.logo-dot{width:10px;height:10px;border-radius:50%;background:var(--amber)}
.logo-text{font-size:16px;font-weight:700;color:var(--white)}
.nav-badge{font-size:11px;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);color:var(--amber);padding:3px 10px;border-radius:20px}
.hero{max-width:960px;margin:0 auto;padding:4rem 2rem 3rem;display:grid;grid-template-columns:1fr 1fr;gap:3rem;align-items:start}
@media(max-width:700px){.hero{grid-template-columns:1fr;padding:2rem 1.25rem;gap:2rem}}
.eyebrow{font-size:11px;font-weight:500;color:var(--amber);letter-spacing:.08em;text-transform:uppercase;margin-bottom:14px}
h1{font-size:clamp(30px,5vw,50px);font-weight:700;line-height:1.1;margin-bottom:16px}
h1 span{color:var(--amber)}
.sub{font-size:16px;color:var(--slate);line-height:1.65;margin-bottom:24px}
.trust-row{display:flex;flex-wrap:wrap;gap:14px;margin-bottom:24px}
.trust-item{display:flex;align-items:center;gap:7px;font-size:13px;color:var(--slate)}
.trust-dot{width:6px;height:6px;border-radius:50%;background:var(--green);flex-shrink:0}
.report-preview{background:var(--card);border:1px solid var(--amber);border-left:3px solid var(--amber);border-radius:8px;padding:16px}
.rp-label{font-size:10px;font-weight:500;color:var(--amber);text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px;font-family:monospace}
.rp-title{font-size:14px;font-weight:600;color:var(--white);margin-bottom:10px}
.rp-row{display:flex;align-items:flex-start;gap:8px;margin-bottom:7px;font-size:12px}
.rp-bullet{width:5px;height:5px;border-radius:50%;background:var(--amber);flex-shrink:0;margin-top:5px}
.rp-text{color:var(--slate);line-height:1.5}
.rp-text strong{color:var(--white)}
.form-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:1.75rem;position:sticky;top:2rem}
.form-title{font-size:15px;font-weight:600;margin-bottom:4px}
.form-sub{font-size:13px;color:var(--slate);margin-bottom:18px}
.form-label{display:block;font-size:11px;font-weight:500;color:var(--slate);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;margin-top:14px}
.form-label:first-of-type{margin-top:0}
input[type=text],input[type=email]{width:100%;background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:8px;padding:11px 14px;color:var(--white);font-size:14px;font-family:inherit;transition:border-color .15s}
input:focus{outline:none;border-color:var(--amber)}
.submit-btn{width:100%;background:var(--amber);color:var(--navy);border:none;padding:14px;border-radius:8px;font-weight:700;font-size:15px;cursor:pointer;margin-top:18px;transition:opacity .15s}
.submit-btn:hover{opacity:.9}
.submit-btn:disabled{opacity:.5;cursor:not-allowed}
.form-note{font-size:11px;color:var(--muted);margin-top:10px;text-align:center}
.status{margin-top:12px;padding:10px 14px;border-radius:8px;font-size:13px;display:none}
.status.ok{background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.25);color:#6EE7B7;display:block}
.status.err{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.25);color:#FCA5A5;display:block}
.sections{max-width:960px;margin:0 auto;padding:2rem 2rem 3rem}
.sections-title{font-size:11px;font-weight:500;color:var(--slate);text-transform:uppercase;letter-spacing:.07em;margin-bottom:1.25rem}
.sections-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px}
.section-card{background:var(--card);border:1px solid var(--border);border-left:3px solid var(--border);border-radius:8px;padding:12px 14px;display:flex;gap:10px}
.section-num{font-size:10px;font-weight:500;color:var(--amber);background:rgba(245,158,11,.1);border-radius:4px;padding:2px 7px;flex-shrink:0;margin-top:1px;font-family:monospace}
.section-name{font-size:13px;font-weight:500;color:var(--white);margin-bottom:3px}
.section-desc{font-size:12px;color:var(--slate);line-height:1.5}
.stats-row{max-width:960px;margin:0 auto;padding:0 2rem 3rem;display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
@media(max-width:600px){.stats-row{grid-template-columns:repeat(2,1fr)}}
.stat-card{background:var(--card);border:1px solid var(--border);border-radius:8px;padding:14px 16px}
.stat-val{font-size:28px;font-weight:700;color:var(--amber);margin-bottom:4px}
.stat-label{font-size:12px;color:var(--slate);line-height:1.4}
.plans{max-width:960px;margin:0 auto;padding:0 2rem 2.5rem;border-top:1px solid var(--border);padding-top:2rem}
.plans-label{font-size:13px;color:var(--slate);margin-bottom:14px;text-align:center}
.plans-row{display:flex;flex-wrap:wrap;gap:10px;justify-content:center}
.plan-link{display:inline-block;background:transparent;border:1px solid var(--border);color:var(--slate);padding:9px 20px;border-radius:8px;font-size:13px;font-weight:500;text-decoration:none;transition:border-color .15s}
.plan-link:hover{border-color:var(--amber);color:var(--amber)}
footer{border-top:1px solid var(--border);padding:1.25rem 2rem;display:flex;align-items:center;justify-content:space-between;max-width:960px;margin:0 auto}
.footer-text{font-size:12px;color:var(--muted)}
.footer-link{font-size:12px;color:var(--muted);text-decoration:none}
</style>
</head>
<body>
<div class="top-bar"></div>
<nav>
  <a href="/" class="logo">
    <div class="logo-dot"></div>
    <span class="logo-text">ReportForge AI</span>
  </a>
  <span class="nav-badge">Free trial — no card required</span>
</nav>

<section class="hero">
  <div>
    <div class="eyebrow">Market Intelligence · Instant Reports · Any Industry</div>
    <h1>Market research in<br><span>60 seconds.</span><br>Not 60 days.</h1>
    <p class="sub">Generate a structured market intelligence brief on any industry using Claude AI. What consultants charge $5,000 for — in under a minute.</p>
    <div class="trust-row">
      <div class="trust-item"><div class="trust-dot"></div>Free — no credit card</div>
      <div class="trust-item"><div class="trust-dot"></div>One complete report included</div>
      <div class="trust-item"><div class="trust-dot"></div>Instant delivery</div>
    </div>
    <div class="report-preview">
      <div class="rp-label">Sample output — Global Recorded Music Market · 58 seconds</div>
      <div class="rp-title">Market Intelligence Brief</div>
      <div class="rp-row"><div class="rp-bullet"></div><div class="rp-text">Market projected to reach <strong>$47.2B by 2026</strong>, streaming now accounts for <strong>84% of total revenue</strong></div></div>
      <div class="rp-row"><div class="rp-bullet"></div><div class="rp-text">Album-equivalent sales at <strong>6.3% CAGR</strong>, driven by Asia-Pacific expansion and catalogue streaming</div></div>
      <div class="rp-row"><div class="rp-bullet"></div><div class="rp-text">Physical sales declining <strong>-8.2% annually</strong> — vinyl now a standalone <strong>$1.9B segment globally</strong></div></div>
    </div>
  </div>
  <div>
    <div class="form-card">
      <div class="form-title">Get your free intelligence brief</div>
      <div class="form-sub">Enter any market or industry. Your report is generated in under 60 seconds.</div>
      <label class="form-label">First name</label>
      <input type="text" id="firstName" placeholder="Your first name" autocomplete="given-name">
      <label class="form-label">Work email</label>
      <input type="email" id="email" placeholder="you@company.com" autocomplete="email">
      <button class="submit-btn" id="submitBtn" onclick="handleSubmit()">Get My Free Report →</button>
      <p class="form-note">No spam. Unsubscribe any time.</p>
      <div class="status" id="statusMsg"></div>
    </div>
  </div>
</section>

<section class="sections">
  <div class="sections-title">What's in every report — all six sections</div>
  <div class="sections-grid">
    <div class="section-card"><span class="section-num">01</span><div><div class="section-name">Executive Summary</div><div class="section-desc">3 key insights, each with a specific $ or % data point</div></div></div>
    <div class="section-card"><span class="section-num">02</span><div><div class="section-name">Market Size &amp; Growth</div><div class="section-desc">Current value, CAGR, and 5-year revenue projection</div></div></div>
    <div class="section-card"><span class="section-num">03</span><div><div class="section-name">Competitive Landscape</div><div class="section-desc">Top 4–5 players with market share and positioning</div></div></div>
    <div class="section-card"><span class="section-num">04</span><div><div class="section-name">Growth Opportunities</div><div class="section-desc">3 ranked gaps with estimated addressable market value</div></div></div>
    <div class="section-card"><span class="section-num">05</span><div><div class="section-name">Risk Assessment</div><div class="section-desc">High / Medium / Low — probability × impact matrix</div></div></div>
    <div class="section-card"><span class="section-num">06</span><div><div class="section-name">Recommendations</div><div class="section-desc">5 specific, immediately actionable strategic next steps</div></div></div>
  </div>
</section>

<div class="stats-row">
  <div class="stat-card"><div class="stat-val">$5,000</div><div class="stat-label">Average cost of a traditional market research report</div></div>
  <div class="stat-card"><div class="stat-val">&lt;60s</div><div class="stat-label">Time to generate a full ReportForge intelligence brief</div></div>
  <div class="stat-card"><div class="stat-val">6</div><div class="stat-label">Structured sections ready to copy into your pitch deck</div></div>
  <div class="stat-card"><div class="stat-val">$0</div><div class="stat-label">Cost to try — no card, no commitment required</div></div>
</div>

<div class="plans">
  <div class="plans-label">Already know you want unlimited reports?</div>
  <div class="plans-row">
    <a href="https://reportforgemaverik.lemonsqueezy.com/checkout/buy/32fcdaa0-5bc1-4a7b-b0a9-a0b0c730e00e" class="plan-link">Analyst — $29/mo</a>
    <a href="https://reportforgemaverik.lemonsqueezy.com/checkout/buy/5cbe259a-4ebe-4960-8942-a45a02109338" class="plan-link">Intelligence — $79/mo</a>
    <a href="https://reportforgemaverik.lemonsqueezy.com/checkout/buy/683761df-c4ce-4de1-949d-a2cd94010b78" class="plan-link">Enterprise — $249/mo</a>
    <a href="https://maverikmind.gumroad.com/l/reportforge-lifetime" class="plan-link">Lifetime — $149</a>
  </div>
</div>

<footer>
  <span class="footer-text">© 2026 ReportForge AI · Powered by Claude AI</span>
  <a href="/" class="footer-link">← Back to app</a>
</footer>

<!-- LinkedIn Insight Tag — get YOUR_PARTNER_ID from Campaign Manager → Assets → Insight Tag -->
<script type="text/javascript">
_linkedin_partner_id = "YOUR_PARTNER_ID";
window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
window._linkedin_data_partner_ids.push(_linkedin_partner_id);
</script>
<script type="text/javascript">
(function(l){if(!l){window.lintrk=function(a,b){window.lintrk.q.push([a,b])};window.lintrk.q=[]}
var s=document.getElementsByTagName("script")[0];var b=document.createElement("script");
b.type="text/javascript";b.async=true;b.src="https://snap.licdn.com/li.lms-analytics/insight.min.js";
s.parentNode.insertBefore(b,s);})(window.lintrk);
</script>

<script>
const utmData = { source: '${utm_source}', campaign: '${utm_campaign}', content: '${utm_content}' };

async function handleSubmit() {
  const email = document.getElementById('email').value.trim();
  const firstName = document.getElementById('firstName').value.trim();
  const btn = document.getElementById('submitBtn');
  const status = document.getElementById('statusMsg');
  if (!email || !email.includes('@')) {
    status.className = 'status err';
    status.textContent = 'Please enter a valid email address.';
    return;
  }
  btn.disabled = true;
  btn.textContent = 'Sending access link...';
  status.className = 'status'; status.style.display = 'none';
  try {
    if (window.lintrk) window.lintrk('track', { conversion_id: 'free_trial_signup' });
    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, firstName, source: utmData.source || 'landing_page' })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    status.className = 'status ok';
    status.textContent = '✓ Check your email — your access link arrives within 2 minutes from Gumroad.';
    btn.textContent = 'Access link sent ✓';
    setTimeout(() => { window.location.href = '/'; }, 4500);
  } catch(err) {
    status.className = 'status err';
    status.textContent = 'Something went wrong — try again or visit maverikmind.gumroad.com/l/reportforge-free directly.';
    btn.disabled = false;
    btn.textContent = 'Get My Free Report →';
  }
}
document.addEventListener('keydown', e => { if (e.key === 'Enter') handleSubmit(); });
</script>
</body>
</html>`);
}
