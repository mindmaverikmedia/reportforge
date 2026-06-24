/**
 * /api/linkedin-tla-auto
 * Generates 3 TLA-optimized posts using Claude and publishes them
 * directly to the personal LinkedIn profile. Each post is immediately
 * eligible to boost as a Thought Leader Ad in Campaign Manager.
 *
 * Trigger: GET https://reportforge-2ap7.vercel.app/api/linkedin-tla-auto?key=YOUR_CRON_SECRET
 *
 * After calling this endpoint:
 * 1. Go to LinkedIn Campaign Manager
 * 2. Create → new campaign → objective: Engagement
 * 3. Ad format: Thought Leader Ad
 * 4. Browse existing content → select the post you want to boost
 * 5. Apply Founders/Consultants/Analysts targeting → £15/day → Launch
 */

const TLA_POSTS = [
  {
    id: "founder_story",
    campaign: "Founders",
    prompt: `Write a LinkedIn Thought Leader Ad post for ReportForge AI from the perspective of its founder.

HOOK (first 2 lines — these show before 'see more' and determine whether someone clicks):
Start with this exact opening: "Last year I paid $4,800 for a market research report on the music streaming market."
Then immediately contrast it with what ReportForge does.

STRUCTURE:
- 2-line hook (the payment story)
- The problem with traditional research (2-3 lines, specific)  
- What ReportForge does instead (3-4 lines with specific numbers: 60 seconds, $29/mo, 6 sections)
- One concrete real-world output example — use this real data: global music market $38.4B growing at 6.8% CAGR to $52.1B by 2029
- Soft CTA: "Free on any market — no card: maverikmind.gumroad.com/l/reportforge-free"

RULES:
- First person founder voice throughout
- 180-220 words total
- No hashtags
- No bullet points — flowing prose and line breaks only
- End with the CTA link on its own line
- Sound like a real person, not marketing copy`,
  },
  {
    id: "data_proof",
    campaign: "Consultants",
    prompt: `Write a LinkedIn Thought Leader Ad post for ReportForge AI showing real output.

HOOK (first 2 lines — these show before 'see more'):
Start with: "I ran ReportForge AI on the global music market this morning. Here's what came back in 57 seconds:"

STRUCTURE:
- Hook line
- 4-5 bullet-style data points formatted as → arrows (not bullet symbols) showing real output. Use these real figures:
  → Global recorded music revenue projected at $47.2B by 2026
  → Streaming accounts for 84% of total industry income  
  → Album-equivalent unit sales at 6.3% CAGR through 2026
  → Vinyl now a standalone $1.9B global segment
  → Top opportunity: emerging market subscriber growth — estimated $8.2B TAM by 2028
- One paragraph explaining this is ONE of six sections in every brief
- Context: what consultants/strategists use it for (proposals, pitches, first-pass research)
- CTA: "Free brief on any market: maverikmind.gumroad.com/l/reportforge-free"

RULES:
- First person, slightly analytical tone
- 160-200 words
- No hashtags
- The data points are real — present them confidently
- End on the CTA link`,
  },
  {
    id: "music_media_usecase",
    campaign: "Music_Media_Professionals",
    prompt: `Write a LinkedIn Thought Leader Ad post for ReportForge AI targeting music, media, and entertainment professionals.

HOOK (first 2 lines):
Start with: "The problem with market research in music and media isn't access to data — it's structured intelligence at the speed decisions actually move."

STRUCTURE:
- Hook
- The specific pain: A&R teams, label strategists, and artist managers need market context fast — before a pitch, before a negotiation, before committing budget
- How ReportForge solves it: 60-second briefs covering market size, competitive landscape, growth opportunities, risk assessment, strategic recommendations
- 3 specific music/media use cases written as "→" lines:
  → Sizing an emerging sub-genre before pitching a signing strategy
  → Mapping sync licensing market dynamics before a catalogue negotiation  
  → Validating a new vertical (fan platforms, artist-owned labels, spatial audio) before committing resources
- Close: This is the fast first pass that tells you whether something deserves deeper work
- CTA: "Free brief on any market: maverikmind.gumroad.com/l/reportforge-free"

RULES:
- First person, industry-insider tone
- 200-240 words
- No hashtags
- Speaks peer-to-peer, not as a vendor
- End on CTA link`,
  },
];

export default async function handler(req, res) {
  // Security gate
  const key = req.query.key || req.headers["x-api-key"];
  if (!process.env.CRON_SECRET || key !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized — pass ?key=YOUR_CRON_SECRET" });
  }

  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
  const LI_TOKEN      = process.env.LINKEDIN_ACCESS_TOKEN;
  const MEMBER_URN    = process.env.LINKEDIN_MEMBER_URN;

  if (!ANTHROPIC_KEY) return res.status(500).json({ error: "ANTHROPIC_API_KEY missing" });
  if (!LI_TOKEN)      return res.status(500).json({ error: "LINKEDIN_ACCESS_TOKEN missing" });
  if (!MEMBER_URN)    return res.status(500).json({ error: "LINKEDIN_MEMBER_URN missing" });

  const results = [];

  for (const post of TLA_POSTS) {
    const result = { id: post.id, campaign: post.campaign };

    // ── Generate with Claude ────────────────────────────────────────────────
    try {
      const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 600,
          messages: [{ role: "user", content: post.prompt }],
        }),
      });
      const claudeData = await claudeRes.json();
      result.text = claudeData.content?.[0]?.text?.trim() || "";
      if (!result.text) throw new Error("Empty response from Claude");
      result.generated = true;
    } catch (err) {
      result.generated = false;
      result.error = `Claude: ${err.message}`;
      results.push(result);
      continue;
    }

    // ── Publish to LinkedIn personal profile ────────────────────────────────
    // Add a 3-second gap between posts to avoid LinkedIn rate limiting
    if (results.length > 0) {
      await new Promise(r => setTimeout(r, 3000));
    }

    try {
      const liRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
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
              shareCommentary: { text: result.text },
              shareMediaCategory: "NONE",
            },
          },
          visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
        }),
      });

      const raw = await liRes.text();
      let liData;
      try { liData = JSON.parse(raw); } catch { liData = { raw }; }

      if (liRes.ok) {
        result.published = true;
        result.postId = liData.id || null;
        result.boostUrl = "https://www.linkedin.com/campaignmanager/";
      } else {
        result.published = false;
        result.liError = `HTTP ${liRes.status}: ${JSON.stringify(liData).slice(0, 200)}`;
      }
    } catch (err) {
      result.published = false;
      result.liError = err.message;
    }

    results.push(result);
  }

  // Return a clear summary page
  const allPublished = results.every(r => r.published);
  const somePublished = results.some(r => r.published);

  return res.status(200).send(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>TLA Auto-Post Results</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#07111F;color:#F1F5F9;font-family:-apple-system,sans-serif;padding:40px 20px;max-width:720px;margin:0 auto}
h1{color:#F59E0B;font-size:22px;margin-bottom:6px}
.sub{color:#475569;font-size:13px;margin-bottom:28px}
.card{background:#0D1B2E;border:1px solid #1E293B;border-radius:10px;padding:20px;margin-bottom:16px}
.card.ok{border-left:4px solid #10B981}
.card.err{border-left:4px solid #EF4444}
.card-label{font-size:10px;font-weight:500;color:#F59E0B;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px}
.card-status{font-size:13px;margin-bottom:12px}
.post-text{font-size:12px;color:#94A3B8;white-space:pre-wrap;line-height:1.6;background:#070F1C;padding:12px;border-radius:6px;margin-top:10px}
.next-step{background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.2);border-radius:8px;padding:16px;margin-top:24px}
.next-step h2{color:#F59E0B;font-size:14px;margin-bottom:8px}
.next-step p{font-size:13px;color:#94A3B8;line-height:1.6;margin-bottom:6px}
a{color:#F59E0B}
</style>
</head><body>
<h1>${allPublished ? "✅" : somePublished ? "⚠️" : "❌"} TLA Auto-Post Results</h1>
<div class="sub">${new Date().toLocaleString("en-GB", {timeZone:"Europe/London"})} · ${results.filter(r=>r.published).length} of ${results.length} posts published</div>

${results.map(r => `
<div class="card ${r.published ? 'ok' : 'err'}">
  <div class="card-label">${r.campaign} campaign · ${r.published ? "✓ Published" : "✗ Failed"}</div>
  <div class="card-status">${r.published ? `Post ID: ${r.postId || "confirmed"}` : `Error: ${r.liError || r.error || "Unknown"}`}</div>
  ${r.text ? `<div class="post-text">${r.text.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>` : ''}
</div>`).join('')}

<div class="next-step">
  <h2>Next step — boost these as Thought Leader Ads</h2>
  <p>1. Go to <a href="https://www.linkedin.com/campaignmanager/" target="_blank">LinkedIn Campaign Manager</a></p>
  <p>2. Create → new campaign → objective: <strong>Engagement</strong></p>
  <p>3. Ad format: <strong>Thought Leader Ad</strong></p>
  <p>4. Click <strong>Browse existing content</strong> → your posts will appear (published in last few minutes)</p>
  <p>5. Select the post matching each campaign → apply targeting from the campaign kit → set £15/day → Launch</p>
</div>
</body></html>`);
}
