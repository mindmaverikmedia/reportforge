/**
 * /api/linkedin-post
 * POST { topic, target: "company" | "personal", autoPublish: bool }
 *
 * Generates a LinkedIn post using Claude, optionally publishes it
 * to the ReportForge AI company page or your personal profile.
 */
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const { topic, target = "company", autoPublish = false, useExactText = false } = req.body;

  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
  const LI_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN;
  const ORG_URN = process.env.LINKEDIN_ORG_URN;       // urn:li:organization:129994109
  const MEMBER_URN = process.env.LINKEDIN_MEMBER_URN; // urn:li:person:xxxxx

  if (!useExactText && !ANTHROPIC_KEY) return res.status(500).json({ error: "ANTHROPIC_API_KEY not set" });

  // ── Step 1: Generate the post content with Claude ──────────────
  let postText;
  if (useExactText) {
    postText = (topic || "").trim();
    if (!postText) return res.status(400).json({ error: "No text provided to publish" });
  } else {
    const prompt = `Write a LinkedIn post for ReportForge AI, a tool that generates AI market intelligence reports in 60 seconds using Claude AI (replaces $500-$5,000 consultant reports).

Topic/angle for this post: ${topic || "general value proposition — pick a compelling angle about speed, cost savings, or a specific use case for founders/consultants/analysts"}

Rules:
- Hook in the first line (this is what shows before "see more")
- Use line breaks for readability, short paragraphs
- Include 1-2 concrete numbers or stats
- End with a soft CTA (free trial: maverikmind.gumroad.com/l/reportforge-free)
- 150-250 words
- Sound like a founder talking, not corporate marketing
- No hashtags (LinkedIn's algorithm doesn't reward stuffed hashtags)
- ${target === "personal" ? "Write in first person as the founder, suitable for boosting as a Thought Leader Ad" : "Write as the company brand voice"}

Output ONLY the post text, nothing else.`;

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
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const claudeData = await claudeRes.json();
      if (claudeData.error) return res.status(400).json({ error: `Claude error: ${claudeData.error.message}` });
      postText = claudeData.content?.[0]?.text?.trim() || "";
    } catch (err) {
      return res.status(500).json({ error: `Claude request failed: ${err.message}` });
    }

    if (!postText) return res.status(500).json({ error: "Claude returned empty content" });
  }

  // If not auto-publishing, just return the draft for review
  if (!autoPublish) {
    return res.status(200).json({ draft: postText, target, published: false });
  }

  // ── Step 2: Publish to LinkedIn ──────────────────────────────────
  if (!LI_TOKEN) {
    return res.status(200).json({
      draft: postText, target, published: false,
      note: "LINKEDIN_ACCESS_TOKEN not set — returning draft only. Complete OAuth via /api/linkedin-auth first.",
    });
  }

  const authorUrn = target === "personal" ? MEMBER_URN : ORG_URN;
  if (!authorUrn) {
    return res.status(200).json({
      draft: postText, target, published: false,
      note: `Missing ${target === "personal" ? "LINKEDIN_MEMBER_URN" : "LINKEDIN_ORG_URN"} env var.`,
    });
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
        author: authorUrn,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text: postText },
            shareMediaCategory: "NONE",
          },
        },
        visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
      }),
    });

    const postRaw = await postRes.text();
    let postData;
    try { postData = JSON.parse(postRaw); } catch { postData = { raw: postRaw }; }

    if (!postRes.ok) {
      return res.status(200).json({
        draft: postText, target, published: false,
        error: `LinkedIn API error (${postRes.status}): ${JSON.stringify(postData).slice(0, 300)}`,
      });
    }

    return res.status(200).json({
      draft: postText, target, published: true,
      postId: postData.id || null,
    });

  } catch (err) {
    return res.status(200).json({
      draft: postText, target, published: false,
      error: `Publish request failed: ${err.message}`,
    });
  }
}
