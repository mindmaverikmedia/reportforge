/**
 * /api/subscribe
 * Free-tier email drip without ConvertKit.
 *
 * OPTION A (recommended — zero cost, no platform): Resend + Upstash Redis
 *   Sends Email 1 immediately via Resend. Stores subscriber in Upstash KV.
 *   The /api/email-drip cron (running daily) sends emails 2-5 automatically.
 *   Required env vars: RESEND_API_KEY, UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
 *
 * OPTION B (simpler UI — EmailOctopus free plan): add subscriber to list,
 *   EmailOctopus automation handles the drip sequence.
 *   Required env vars: EMAILOCTOPUS_API_KEY, EMAILOCTOPUS_LIST_ID
 *
 * The handler auto-detects which option is configured based on env vars present.
 * If both are set, Option A (Resend) takes priority.
 */

const EMAIL_1 = {
  subject: "Your ReportForge access + one thing to try first",
  html: `<div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:32px 20px;color:#1a1a1a">
<p style="font-size:15px;line-height:1.7">Hey {{firstName}},</p>
<p style="font-size:15px;line-height:1.7">Your free market intelligence report is ready.</p>
<p style="font-size:15px;line-height:1.7"><a href="https://reportforge-2ap7.vercel.app" style="background:#F59E0B;color:#07111F;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:700;display:inline-block">Generate your free report →</a></p>
<p style="font-size:15px;line-height:1.7">Type in any market, industry, or niche. Your full brief comes back in under 60 seconds.</p>
<p style="font-size:15px;line-height:1.7">One tip: the more specific your input, the sharper the output. <em>"Music streaming in Southeast Asia"</em> gives you more useful data than <em>"music industry."</em></p>
<p style="font-size:15px;line-height:1.7">Reply to this email if you have questions — I read everything.</p>
<p style="font-size:15px;line-height:1.7">— ReportForge AI</p>
<hr style="border:none;border-top:1px solid #e5e5e5;margin:24px 0">
<p style="font-size:12px;color:#888">ReportForge AI · reportforge-2ap7.vercel.app</p>
</div>`
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const { email, firstName = "", source = "landing_page" } = req.body;
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Valid email required" });
  }

  const results = {};

  // ─── OPTION A: Resend + Upstash ─────────────────────────────────────────
  if (process.env.RESEND_API_KEY) {
    // Send Email 1 immediately
    try {
      const sendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "ReportForge AI <onboarding@resend.dev>",
          to: [email],
          subject: EMAIL_1.subject,
          html: EMAIL_1.html.replace("{{firstName}}", firstName || "there"),
        }),
      });
      const sendData = await sendRes.json();
      results.email1 = sendRes.ok ? "sent" : `error: ${sendData.message}`;
    } catch (err) {
      results.email1 = `failed: ${err.message}`;
    }

    // Store subscriber in Upstash for the drip cron to pick up
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      try {
        const key = `sub:${email.toLowerCase().replace(/[^a-z0-9@._-]/g, "")}`;
        const value = JSON.stringify({
          email, firstName, source,
          signupAt: Date.now(),
          emailsSent: 1,
        });
        await fetch(
          `${process.env.UPSTASH_REDIS_REST_URL}/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}`,
          { headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` } }
        );
        results.stored = "upstash";
      } catch (err) {
        results.stored = `upstash_error: ${err.message}`;
      }
    }

    return res.status(200).json({ success: true, method: "resend", ...results });
  }

  // ─── OPTION B: EmailOctopus ──────────────────────────────────────────────
  if (process.env.EMAILOCTOPUS_API_KEY && process.env.EMAILOCTOPUS_LIST_ID) {
    try {
      const eoRes = await fetch(
        `https://emailoctopus.com/api/1.6/lists/${process.env.EMAILOCTOPUS_LIST_ID}/contacts`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: process.env.EMAILOCTOPUS_API_KEY,
            email_address: email,
            fields: { FirstName: firstName },
            tags: ["reportforge-signup", source],
            status: "SUBSCRIBED",
          }),
        }
      );
      const eoData = await eoRes.json();
      results.emailoctopus = eoRes.ok
        ? "subscribed"
        : `error: ${eoData.error?.message || JSON.stringify(eoData)}`;
    } catch (err) {
      results.emailoctopus = `failed: ${err.message}`;
    }
    return res.status(200).json({ success: true, method: "emailoctopus", ...results });
  }

  // ─── No email provider configured ────────────────────────────────────────
  return res.status(200).json({
    success: true,
    method: "none",
    note: "No email provider configured. Add RESEND_API_KEY (recommended) or EMAILOCTOPUS_API_KEY + EMAILOCTOPUS_LIST_ID to Vercel env vars.",
  });
}
