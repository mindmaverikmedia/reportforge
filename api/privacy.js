export default function handler(req, res) {
  res.setHeader("Content-Type","text/html");
  res.status(200).send(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Privacy Policy — ReportForge AI</title>
<style>*{box-sizing:border-box}body{background:#07111F;color:#F1F5F9;font-family:-apple-system,sans-serif;max-width:720px;margin:0 auto;padding:40px 20px;line-height:1.7}nav{display:flex;align-items:center;gap:10px;margin-bottom:32px;border-bottom:1px solid #1E293B;padding-bottom:16px}.dot{width:9px;height:9px;border-radius:50%;background:#F59E0B}.logo{font-weight:700;font-size:15px}h1{font-size:26px;font-weight:500;margin-bottom:6px;color:#F8FAFC}h2{font-size:16px;font-weight:500;margin:28px 0 8px;color:#F59E0B}p,li{font-size:14px;color:#94A3B8;margin-bottom:8px}ul{padding-left:20px}a{color:#F59E0B}footer{margin-top:40px;padding-top:16px;border-top:1px solid #1E293B;font-size:12px;color:#475569}</style>
</head><body>
<nav><div class="dot"></div><span class="logo">ReportForge AI</span></nav>
<h1>Privacy Policy</h1>
<p>Last updated: June 2026</p>
<p>ReportForge AI ("we", "us", "our") operates reportforge-2ap7.vercel.app. This policy explains how we collect, use, and protect your information.</p>
<h2>Information we collect</h2>
<ul>
<li>Email address and first name when you sign up for a free trial or paid plan</li>
<li>Market topics and geographic regions you enter when generating reports</li>
<li>Usage data including pages visited and features used (via Vercel Analytics)</li>
<li>Payment information processed by Lemon Squeezy or Gumroad — we do not store card details</li>
</ul>
<h2>How we use your information</h2>
<ul>
<li>To deliver the market intelligence reports you request</li>
<li>To send onboarding emails and product updates via ConvertKit (you can unsubscribe at any time)</li>
<li>To improve the product and fix issues</li>
<li>We do not sell, rent, or share your personal data with third parties for marketing purposes</li>
</ul>
<h2>LinkedIn data</h2>
<p>If you connect via LinkedIn (for Lead Gen Forms or authentication), we receive your name, email address, job title, and company name as provided by LinkedIn. This data is used solely to deliver your free trial access and enroll you in our onboarding sequence.</p>
<h2>Data retention</h2>
<p>We retain your email address and usage history for as long as your account is active. You may request deletion at any time by emailing us.</p>
<h2>Your rights</h2>
<p>You may request access to, correction of, or deletion of your personal data at any time. To exercise these rights, contact: mindmaverikmedia@gmail.com</p>
<h2>Cookies</h2>
<p>We use only essential cookies required for the application to function. We do not use advertising or tracking cookies.</p>
<h2>Contact</h2>
<p>Questions about this policy: <a href="mailto:mindmaverikmedia@gmail.com">mindmaverikmedia@gmail.com</a></p>
<footer>© 2026 ReportForge AI · <a href="/api/terms">Terms of Service</a> · <a href="/">Back to app</a></footer>
</body></html>`);
}
