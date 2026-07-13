/**
 * /api/subscribe
 * v3 — adds a browser-visible diagnostic mode and honest error reporting.
 *
 * DIAGNOSTIC: open this URL in a browser to see exactly which env vars
 * the function can see (values masked):
 *   https://reportforge-2ap7.vercel.app/api/subscribe?diag=1
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

const mask = (v) => (v ? `${v.slice(0, 7)}…${v.slice(-4)} (len ${v.length})` : null);

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  // ─── DIAGNOSTIC MODE — GET ?diag=1 ─────────────────────────────────────
  if (req.method === "GET") {
    if (req.query.diag !== "1") return res.status(405).json({ error: "POST only (or GET ?diag=1)" });
    const rk = process.env.RESEND_API_KEY || "";
    return res.status(200).json({
      diagnostics: {
        RESEND_API_KEY: rk ? mask(rk) : "❌ NOT VISIBLE",
        RESEND_KEY_HAS_WHITESPACE: rk !== rk.trim() ? "⚠️ YES — re-save without spaces/newlines" : "no",
        RESEND_KEY_STARTS_CORRECTLY: rk.startsWith("re_") ? "yes" : "❌ NO — should start with re_",
        UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL ? mask(process.env.UPSTASH_REDIS_REST_URL) : "❌ NOT VISIBLE",
        UPSTASH_URL_FORMAT: (process.env.UPSTASH_REDIS_REST_URL || "").startsWith("https://") ? "yes" : "❌ must start with https://",
        UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN ? mask(process.env.UPSTASH_REDIS_REST_TOKEN) : "❌ NOT VISIBLE",
        deployment: process.env.VERCEL_GIT_COMMIT_SHA ? process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7) : "unknown",
      }
    });
  }

  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const { email, firstName = "", source = "landing_page" } = req.body;
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Valid email required" });
  }

  const RESEND_KEY = (process.env.RESEND_API_KEY || "").trim();

  // ─── HONEST FAILURE: no provider = explicit error, not silent success ──
  if (!RESEND_KEY) {
    return res.status(500).json({
      error: "Email provider not configured — RESEND_API_KEY is not visible to this function. Check Vercel env vars and redeploy.",
    });
  }

  const results = {};

  // Send Email 1 via Resend
  try {
    const sendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_KEY}`,
      },
      body: JSON.stringify({
        from: "ReportForge AI <hello@mindmaverikmedia.com>",
        reply_to: "mindmaverikmedia@gmail.com",
        to: [email],
        subject: EMAIL_1.subject,
        html: EMAIL_1.html.replace("{{firstName}}", firstName || "there"),
      }),
    });
    const sendData = await sendRes.json();
    if (!sendRes.ok) {
      // Surface the real Resend error to the page
      return res.status(502).json({
        error: `Resend rejected the send (HTTP ${sendRes.status}): ${sendData.message || JSON.stringify(sendData)}`,
      });
    }
    results.email1 = "sent";
    results.resendId = sendData.id || null;
  } catch (err) {
    return res.status(502).json({ error: `Resend request failed: ${err.message}` });
  }

  // Store subscriber in Upstash for the drip cron
  const R_URL = (process.env.UPSTASH_REDIS_REST_URL || "").trim();
  const R_TOK = (process.env.UPSTASH_REDIS_REST_TOKEN || "").trim();
  if (R_URL && R_TOK) {
    try {
      const key = `sub:${email.toLowerCase().replace(/[^a-z0-9@._-]/g, "")}`;
      const value = JSON.stringify({ email, firstName, source, signupAt: Date.now(), emailsSent: 1 });
      await fetch(`${R_URL}/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}`, {
        headers: { Authorization: `Bearer ${R_TOK}` },
      });
      results.stored = "upstash";
    } catch (err) {
      results.stored = `upstash_error: ${err.message}`;
    }
  } else {
    results.stored = "skipped — Upstash env vars not visible";
  }

  return res.status(200).json({ success: true, method: "resend", ...results });
}
