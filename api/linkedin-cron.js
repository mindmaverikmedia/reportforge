/**
 * /api/linkedin-cron
 * Triggered automatically by Vercel Cron — Sun/Tue/Thu at 08:00 UTC (09:00 BST).
 * Publishes that day's pre-approved post to the personal LinkedIn profile.
 *
 * Security: Vercel signs cron requests with a CRON_SECRET bearer token.
 * Add CRON_SECRET as a Vercel env var (any random string) before relying on this.
 */

// ── This week's 3 posts — music & media audience angle ──────────────────
// Day-of-week key: 0 = Sunday, 2 = Tuesday, 4 = Thursday
const SCHEDULED_POSTS = {
  0: {
    label: "Sunday — Launch hook",
    text: `Six months ago I paid $4,800 for a market research report. It took 3 weeks and was outdated by the time it landed.

For anyone in music or media, that timeline is a problem. The catalogue market moves faster than a 3-week report cycle can keep up with — sync licensing windows close, an artist's streaming trajectory shifts, a sub-genre breaks out and the data is already stale.

So I built ReportForge AI. It generates structured market intelligence — market size, competitive landscape, growth opportunities, risk factors — on any sector, in under 60 seconds, using Claude AI.

I ran it on the global recorded music market last week just to test it. Full brief, properly sourced-feeling data, ready in 58 seconds.

Free to try — no card required: maverikmind.gumroad.com/l/reportforge-free

What would you want a 60-second market brief on?`,
  },
  2: {
    label: "Tuesday — Proof / real data",
    text: `Ran ReportForge AI on the global recorded music market this week. Here's what came back in under 60 seconds:

→ Global recorded music revenue projected to reach $47.2 billion by 2026
→ Streaming now accounts for ~84% of total industry income
→ Album-equivalent unit sales forecast at 6.3% CAGR, driven largely by Asia-Pacific expansion
→ Physical album sales declining -8.2% annually — vinyl now a $1.9 billion standalone segment

That's not a teaser. That's the actual output. Market size, growth drivers, structural shifts — the kind of brief that used to take a research team a week to assemble.

For anyone in label strategy, artist management, or media investment who needs a fast read on where a market is heading before committing budget or time — this is built for exactly that moment.

Try it free on any market: maverikmind.gumroad.com/l/reportforge-free`,
  },
  4: {
    label: "Thursday — Persona-specific CTA",
    text: `If you work in A&R, label strategy, or artist management, you already know the problem: by the time a proper market report reaches your desk, the window it was meant to inform has often already moved.

ReportForge AI generates a full market intelligence brief — size, growth rate, competitive landscape, opportunities, risk — on any sector in under 60 seconds. Built on Claude AI.

A few ways people in music and media are using it:
→ Sizing an emerging sub-genre before pitching a signing strategy
→ Mapping the sync licensing market before a catalogue negotiation
→ Quick competitive read before a media investment decision
→ Validating a new vertical (podcasting, artist-owned labels, fan platforms) before committing resources

It's not a replacement for deep catalogue analysis. It's the fast first pass that tells you whether something is worth that deeper work.

Free trial, no card needed: maverikmind.gumroad.com/l/reportforge-free

What market would you run it on first?`,
  },
};

export default async function handler(req, res) {
  // ── Security check — only Vercel's cron system should trigger this ──
  const authHeader = req.headers.authorization || "";
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // 0=Sun, 2=Tue, 4=Thu (matches cron schedule)

  const post = SCHEDULED_POSTS[dayOfWeek];
  if (!post) {
    return res.status(200).json({ skipped: true, reason: `No post scheduled for day ${dayOfWeek}` });
  }

  const LI_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN;
  const MEMBER_URN = process.env.LINKEDIN_MEMBER_URN;

  if (!LI_TOKEN || !MEMBER_URN) {
    return res.status(500).json({ error: "LinkedIn credentials not configured" });
  }

  try {
    const postRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LI_TOKEN}`,
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        author: MEMBER_URN,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text: post.text },
            shareMediaCategory: "NONE",
          },
        },
        visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
      }),
    });

    const raw = await postRes.text();
    let data;
    try { data = JSON.parse(raw); } catch { data = { raw }; }

    if (!postRes.ok) {
      return res.status(200).json({
        published: false,
        label: post.label,
        error: `LinkedIn API error (${postRes.status}): ${JSON.stringify(data).slice(0, 300)}`,
      });
    }

    return res.status(200).json({ published: true, label: post.label, postId: data.id || null });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
