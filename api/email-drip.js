/**
 * /api/email-drip
 * Daily cron — sends emails 2-5 to subscribers stored in Upstash Redis.
 * Fires at 08:30 UTC (09:30 BST) — 30 minutes after the main cron.
 *
 * Add to vercel.json crons:
 * { "path": "/api/email-drip", "schedule": "30 8 * * *" }
 *
 * Required env vars: RESEND_API_KEY, UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, CRON_SECRET
 */

const DRIP_EMAILS = {
  2: {
    subject: "What a ReportForge brief actually looks like (real output)",
    delayDays: 3,
    html: `<div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:32px 20px;color:#1a1a1a">
<p style="font-size:15px;line-height:1.7">Hey {{firstName}},</p>
<p style="font-size:15px;line-height:1.7">I ran ReportForge AI on the global recorded music market as a test. Here's what came back in 57 seconds:</p>
<div style="background:#f5f5f5;border-left:3px solid #F59E0B;padding:16px;margin:20px 0;border-radius:4px">
<p style="margin:0 0 8px;font-size:14px">→ Global recorded music revenue projected at <strong>$47.2B by 2026</strong></p>
<p style="margin:0 0 8px;font-size:14px">→ Streaming accounts for <strong>84% of total industry income</strong></p>
<p style="margin:0 0 8px;font-size:14px">→ Album-equivalent unit sales at <strong>6.3% CAGR</strong>, driven by Asia-Pacific expansion</p>
<p style="margin:0 0 8px;font-size:14px">→ Vinyl now a standalone <strong>$1.9B global segment</strong></p>
<p style="margin:0;font-size:14px">→ Top opportunity: emerging market subscribers — estimated <strong>$8.2B TAM by 2028</strong></p>
</div>
<p style="font-size:15px;line-height:1.7">That's ONE of six sections. The full brief also covers competitive landscape, risk matrix, and five strategic recommendations.</p>
<p style="font-size:15px;line-height:1.7">If you haven't generated yours yet: <a href="https://reportforge-2ap7.vercel.app" style="color:#F59E0B;font-weight:700">reportforge-2ap7.vercel.app</a></p>
<p style="font-size:15px;line-height:1.7">— ReportForge AI</p>
<hr style="border:none;border-top:1px solid #e5e5e5;margin:24px 0">
<p style="font-size:12px;color:#888">ReportForge AI · <a href="https://reportforge-2ap7.vercel.app/api/unsubscribe?email={{email}}" style="color:#888">Unsubscribe</a></p>
</div>`
  },
  3: {
    subject: "Three ways people in music and media are using this",
    delayDays: 6,
    html: `<div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:32px 20px;color:#1a1a1a">
<p style="font-size:15px;line-height:1.7">Hey {{firstName}},</p>
<p style="font-size:15px;line-height:1.7">A few patterns I've noticed in how people are actually using ReportForge:</p>
<p style="font-size:15px;line-height:1.7"><strong>1. Before a pitch or proposal</strong><br>A&R teams and label strategists are running briefs on the genre or market they're pitching before the meeting. "This market is at $X billion, growing at Y%" is a different conversation than "we think this market is growing."</p>
<p style="font-size:15px;line-height:1.7"><strong>2. Before committing resource or budget</strong><br>Artist managers and media investment teams use it as a quick sanity check before allocating meaningful time or money to a new direction. Not deep diligence — a 60-second first-pass filter.</p>
<p style="font-size:15px;line-height:1.7"><strong>3. Inside consulting proposals</strong><br>Freelance strategy consultants are adding a market brief to every proposal. The ones who've mentioned it say their proposals now include market context that clients associate with large advisory firms.</p>
<p style="font-size:15px;line-height:1.7">Generate a brief: <a href="https://reportforge-2ap7.vercel.app" style="color:#F59E0B;font-weight:700">reportforge-2ap7.vercel.app</a></p>
<p style="font-size:15px;line-height:1.7">— ReportForge AI</p>
<hr style="border:none;border-top:1px solid #e5e5e5;margin:24px 0">
<p style="font-size:12px;color:#888">ReportForge AI · <a href="https://reportforge-2ap7.vercel.app/api/unsubscribe?email={{email}}" style="color:#888">Unsubscribe</a></p>
</div>`
  },
  4: {
    subject: "The honest case for upgrading (and when it doesn't make sense)",
    delayDays: 10,
    html: `<div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:32px 20px;color:#1a1a1a">
<p style="font-size:15px;line-height:1.7">Hey {{firstName}},</p>
<p style="font-size:15px;line-height:1.7">The free trial gives you one complete report. I want to be straight about when it makes sense to upgrade, and when it doesn't.</p>
<p style="font-size:15px;line-height:1.7"><strong>It makes sense if:</strong><br>
→ You generate more than one market brief per month<br>
→ You're advising clients who expect market context in proposals<br>
→ You're tracking a fast-moving sector where data shifts quarterly<br>
→ You're validating multiple ideas and need to move quickly</p>
<p style="font-size:15px;line-height:1.7"><strong>Intelligence plan — £79/month</strong><br>
Unlimited reports, priority generation, PDF export. Best for consultants who include market briefs in client work. One recovered research block per month pays for itself.</p>
<p style="font-size:15px;line-height:1.7"><strong>Analyst plan — £29/month</strong><br>
Unlimited reports, all six sections. Best for individuals who run briefs regularly.</p>
<p style="font-size:15px;line-height:1.7"><strong>Lifetime deal — £149 once</strong><br>
Pay once, use forever. Breaks even after 2 months vs Intelligence plan.</p>
<p style="font-size:15px;line-height:1.7"><a href="https://reportforge-2ap7.vercel.app" style="background:#F59E0B;color:#07111F;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:700;display:inline-block">See all plans →</a></p>
<p style="font-size:15px;line-height:1.7">If you have questions about which plan fits your workflow, reply to this email.</p>
<p style="font-size:15px;line-height:1.7">— ReportForge AI</p>
<hr style="border:none;border-top:1px solid #e5e5e5;margin:24px 0">
<p style="font-size:12px;color:#888">ReportForge AI · <a href="https://reportforge-2ap7.vercel.app/api/unsubscribe?email={{email}}" style="color:#888">Unsubscribe</a></p>
</div>`
  },
  5: {
    subject: "Last one from me — and a question",
    delayDays: 14,
    html: `<div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:32px 20px;color:#1a1a1a">
<p style="font-size:15px;line-height:1.7">Hey {{firstName}},</p>
<p style="font-size:15px;line-height:1.7">This is the last email in this sequence — I won't keep filling your inbox after this.</p>
<p style="font-size:15px;line-height:1.7">Two things:</p>
<p style="font-size:15px;line-height:1.7"><strong>1.</strong> Your free report access is still active: <a href="https://reportforge-2ap7.vercel.app" style="color:#F59E0B;font-weight:700">reportforge-2ap7.vercel.app</a></p>
<p style="font-size:15px;line-height:1.7"><strong>2.</strong> If you tried it and have feedback — what worked, what didn't, what you wish it covered differently — I'd genuinely like to hear it. Reply to this email. The product gets better when people tell me what's actually useful versus what sounds good in theory.</p>
<p style="font-size:15px;line-height:1.7">If you upgraded, thank you. If you didn't, no hard feelings. If the timing is ever right: <a href="https://reportforge-2ap7.vercel.app" style="color:#F59E0B;font-weight:700">reportforge-2ap7.vercel.app</a></p>
<p style="font-size:15px;line-height:1.7">— ReportForge AI</p>
<hr style="border:none;border-top:1px solid #e5e5e5;margin:24px 0">
<p style="font-size:12px;color:#888">ReportForge AI · <a href="https://reportforge-2ap7.vercel.app/api/unsubscribe?email={{email}}" style="color:#888">Unsubscribe</a></p>
</div>`
  }
};

const DAY_MS = 86400000;

export default async function handler(req, res) {
  const key = req.query.key || req.headers["x-api-key"];
  if (!process.env.CRON_SECRET || key !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const RESEND_KEY = process.env.RESEND_API_KEY;
  const REDIS_URL  = process.env.UPSTASH_REDIS_REST_URL;
  const REDIS_TOK  = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!RESEND_KEY || !REDIS_URL || !REDIS_TOK) {
    return res.status(500).json({ error: "Missing RESEND_API_KEY, UPSTASH_REDIS_REST_URL, or UPSTASH_REDIS_REST_TOKEN" });
  }

  // Get all subscriber keys from Upstash
  let keys = [];
  try {
    const keysRes = await fetch(`${REDIS_URL}/keys/sub:*`, {
      headers: { Authorization: `Bearer ${REDIS_TOK}` }
    });
    const keysData = await keysRes.json();
    keys = keysData.result || [];
  } catch (err) {
    return res.status(500).json({ error: `Upstash keys fetch failed: ${err.message}` });
  }

  if (!keys.length) return res.status(200).json({ sent: 0, message: "No subscribers yet" });

  const results = [];
  const nowMs = Date.now();

  for (const k of keys) {
    // Fetch subscriber record
    let sub;
    try {
      const getRes = await fetch(`${REDIS_URL}/get/${encodeURIComponent(k)}`, {
        headers: { Authorization: `Bearer ${REDIS_TOK}` }
      });
      const getData = await getRes.json();
      sub = JSON.parse(getData.result);
    } catch { continue; }

    if (!sub || !sub.email || !sub.signupAt) continue;

    const daysSince = Math.floor((nowMs - sub.signupAt) / DAY_MS);
    const emailsSent = sub.emailsSent || 1;
    const nextEmailNum = emailsSent + 1;
    const nextEmail = DRIP_EMAILS[nextEmailNum];

    if (!nextEmail) continue; // All 5 sent
    if (daysSince < nextEmail.delayDays) continue; // Not time yet

    // Send the email via Resend
    try {
      const html = nextEmail.html
        .replace(/\{\{firstName\}\}/g, sub.firstName || "there")
        .replace(/\{\{email\}\}/g, encodeURIComponent(sub.email));

      const sendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_KEY}`,
        },
        body: JSON.stringify({
          from: "ReportForge AI <onboarding@resend.dev>",
          to: [sub.email],
          subject: nextEmail.subject,
          html,
        }),
      });

      if (sendRes.ok) {
        // Update subscriber record
        const updated = { ...sub, emailsSent: nextEmailNum };
        await fetch(`${REDIS_URL}/set/${encodeURIComponent(k)}/${encodeURIComponent(JSON.stringify(updated))}`, {
          headers: { Authorization: `Bearer ${REDIS_TOK}` }
        });
        results.push({ email: sub.email, emailNum: nextEmailNum, status: "sent" });
      } else {
        const errData = await sendRes.json();
        results.push({ email: sub.email, emailNum: nextEmailNum, status: "failed", error: errData.message });
      }
    } catch (err) {
      results.push({ email: sub.email, emailNum: nextEmailNum, status: "error", error: err.message });
    }
  }

  return res.status(200).json({ sent: results.filter(r => r.status === "sent").length, total: keys.length, results });
}
