/**
 * /api/linkedin-tla-auto
 * Risk mitigation update: posts now lead with Intelligence tier ($79/mo)
 * targeting consultants and analysts who can justify the ROI immediately.
 * Music/media vertical niche added as Post 3.
 *
 * Trigger: GET https://reportforge-2ap7.vercel.app/api/linkedin-tla-auto?key=YOUR_CRON_SECRET
 */

const TLA_POSTS = [
  {
    id: "consultant_roi",
    campaign: "Consultants — Intelligence tier",
    prompt: `Write a LinkedIn Thought Leader Ad post from the founder of ReportForge AI targeting freelance consultants and strategy professionals.

HOOK (first 2 lines — shown before 'see more'):
Open with: "My consulting rate is £150/hour. At that rate, 3 hours of market research costs me £450 per proposal."
Then pivot immediately to the solution.

STRUCTURE:
- Hook (the hourly rate calculation — make it personal and specific)
- The problem: Every proposal needs market context. Building it manually takes 3-4 hours. At consulting rates, that's £450-£600 of billable time spent on research, not advice.
- The solution: ReportForge AI generates a complete market intelligence brief — market size, competitive landscape, opportunities, risks, recommendations — in under 60 seconds.
- The business case: Intelligence plan at £79/month. That's 31 minutes of billing at £150/hour. If it recovers one 3-hour research block per month, the ROI is 6:1 in the first month.
- Concrete outcome: "I now include a market brief in every proposal I send. My close rate is up and clients comment on the market depth."
- CTA: "Intelligence plan — £79/month, unlimited reports: reportforge-2ap7.vercel.app"

RULES:
- First person, consultant peer voice
- 200-240 words
- No hashtags
- End with the CTA on its own line
- The £79 Intelligence plan is the primary offer — mention it by name and price`,
  },
  {
    id: "analyst_screening",
    campaign: "Analysts — Intelligence tier",
    prompt: `Write a LinkedIn Thought Leader Ad post from the founder of ReportForge AI targeting investment analysts and sector researchers.

HOOK (first 2 lines — shown before 'see more'):
Open with: "Before you commit analyst hours to a sector, you need a market map. Most first-pass research takes half a day to produce properly."

STRUCTURE:
- Hook (the first-pass research time problem)
- The specific pain: Before deciding whether a sector deserves deeper work, analysts need: market size, CAGR, key incumbents, white space, structural risks. Getting that coherently takes 3-5 hours.
- What ReportForge does: Generates that structured first-pass in under 60 seconds. Market size + CAGR + competitive positioning + opportunity matrix + risk assessment.
- Important framing: Not diligence-grade. First-pass grade. The question it answers is "does this sector deserve analyst hours?" — not "is this investment ready?"
- Usage pattern: Screen 10 sectors in a morning instead of 2. Drop the output directly into an investment memo as the market context section.
- Data point: Use this real data as an example output — global recorded music market at $38.4B growing at 6.8% CAGR to $52.1B by 2029, streaming at 84% of revenue.
- CTA: "Intelligence plan — £79/month: reportforge-2ap7.vercel.app"

RULES:
- Clinical, data-first tone — no adjectives, only verbs and numbers
- 180-220 words
- No hashtags
- The Intelligence plan at £79/month is the primary CTA`,
  },
  {
    id: "music_media_niche",
    campaign: "Music and Media — vertical niche",
    prompt: `Write a LinkedIn Thought Leader Ad post from the founder of ReportForge AI specifically for music, media, and entertainment industry professionals.

HOOK (first 2 lines — shown before 'see more'):
Open with: "Every major record deal, sync licensing agreement, and catalogue acquisition starts with a market view. The problem is getting that view fast enough to matter."

STRUCTURE:
- Hook (the speed problem in music/media market intelligence)
- The industry reality: A&R teams, label strategists, and catalogue investors regularly need to size a market, map the competitive landscape, or assess structural risk — before a pitch, before a negotiation, before committing resource. The traditional way takes weeks.
- What changes with ReportForge AI: 60-second structured intelligence briefs on any music or media sector. Tested example — ran it on the global recorded music market and got back: $47.2B by 2026, streaming at 84% of revenue, vinyl a standalone $1.9B segment, Asia-Pacific driving CAGR.
- Three specific use cases written as flowing sentences (not bullets): sizing an emerging sub-genre before pitching a signing strategy; mapping sync licensing market dynamics before a catalogue negotiation; validating a new vertical like spatial audio or fan investment platforms before committing budget.
- Close: This is the fast first pass that tells you whether something deserves deeper work. At £79/month, it's the cost of one lunch meeting.
- CTA: "Intelligence plan: reportforge-2ap7.vercel.app"

RULES:
- Industry insider voice — peer-to-peer, not vendor
- 220-260 words
- No hashtags
- Mention the £79 Intelligence plan`,
  },
];

export default async function handler(req, res) {
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

  // Generate all 3 posts in parallel — cuts runtime from ~45s to ~18s
  const generated = await Promise.all(
    TLA_POSTS.map(async (post) => {
      const result = { id: post.id, campaign: post.campaign };
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
      }
      return result;
    })
  );

  const results = [];
  for (const result of generated) {
    if (!result.generated) { results.push(result); continue; }
    if (results.length > 0) await new Promise(r => setTimeout(r, 1500));
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
      let liData; try { liData = JSON.parse(raw); } catch { liData = { raw }; }
      result.published = liRes.ok;
      result.postId = liData.id || null;
      if (!liRes.ok) result.liError = `HTTP ${liRes.status}: ${JSON.stringify(liData).slice(0,200)}`;
    } catch (err) {
      result.published = false;
      result.liError = err.message;
    }
    results.push(result);
  }

  const published = results.filter(r => r.published).length;
  return res.status(200).send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>TLA Results</title>
<style>*{box-sizing:border-box}body{background:#07111F;color:#F1F5F9;font-family:-apple-system,sans-serif;padding:32px 20px;max-width:680px;margin:0 auto}h1{color:#F59E0B;margin-bottom:4px}p{color:#475569;font-size:13px;margin-bottom:24px}.card{background:#0D1B2E;border:1px solid #1E293B;border-radius:8px;padding:16px;margin-bottom:12px;border-left:3px solid #10B981}.card.fail{border-left-color:#EF4444}.label{font-size:10px;color:#F59E0B;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;font-weight:500}.body{font-size:12px;color:#94A3B8;white-space:pre-wrap;line-height:1.6;background:#040B13;padding:10px;border-radius:6px;margin-top:8px}.next{background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.2);border-radius:8px;padding:16px;margin-top:20px}.next h2{color:#F59E0B;font-size:14px;margin-bottom:10px}a{color:#F59E0B}</style>
</head><body>
<h1>${published === 3 ? "✅" : published > 0 ? "⚠️" : "❌"} ${published}/3 posts published</h1>
<p>Intelligence-tier focused posts — ${new Date().toLocaleString("en-GB",{timeZone:"Europe/London"})}</p>
${results.map(r=>`<div class="card ${r.published?'':'fail'}"><div class="label">${r.campaign} · ${r.published?"✓ Live":"✗ Failed"}</div>${r.liError?`<div style="color:#FCA5A5;font-size:12px;margin-bottom:8px">${r.liError}</div>`:''}${r.text?`<div class="body">${r.text.replace(/</g,'&lt;')}</div>`:''}</div>`).join('')}
<div class="next"><h2>Boost these as Thought Leader Ads</h2>
<p>1. Go to your LinkedIn profile → find each new post → click <strong>Boost</strong></p>
<p>2. Select audience: Consultants (Management Consulting, 1-50 employees, UK+US)</p>
<p>3. Set £15/day → confirm</p>
<p>Or: <a href="https://www.linkedin.com/campaignmanager/" target="_blank">Campaign Manager</a> → Create → Engagement → Thought Leader Ad → Browse content</p>
</div></body></html>`);
}
