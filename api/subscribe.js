/**
 * /api/subscribe
 * Captures email signups and:
 * 1. Creates/updates the subscriber in ConvertKit
 * 2. Enrolls them in the onboarding sequence (CONVERTKIT_SEQUENCE_ID)
 * 3. Tags them as reportforge-free-trial (CONVERTKIT_TAG_ID, optional)
 *
 * Required Vercel env vars:
 *   CONVERTKIT_API_KEY      — your ConvertKit API key
 *   CONVERTKIT_SEQUENCE_ID  — ID from the URL when viewing your sequence
 *   CONVERTKIT_TAG_ID       — (optional) tag ID for "reportforge-free-trial"
 */
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const { email, firstName, source = "landing_page" } = req.body;

  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Valid email required" });
  }

  const API_KEY     = process.env.CONVERTKIT_API_KEY;
  const SEQ_ID      = process.env.CONVERTKIT_SEQUENCE_ID;
  const TAG_ID      = process.env.CONVERTKIT_TAG_ID;

  if (!API_KEY) {
    return res.status(500).json({ error: "CONVERTKIT_API_KEY not configured" });
  }

  const results = {};

  // ── Step 1: Add subscriber to ConvertKit ──────────────────────────────────
  // If a sequence ID exists, subscribe directly to the sequence (this both
  // creates the subscriber AND enrolls them, in one call).
  if (SEQ_ID) {
    try {
      const seqRes = await fetch(
        `https://api.convertkit.com/v3/sequences/${SEQ_ID}/subscribe`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: API_KEY,
            email,
            first_name: firstName || "",
            fields: { source },
          }),
        }
      );
      const seqData = await seqRes.json();
      if (seqData.subscription) {
        results.sequence = { enrolled: true, sequenceId: SEQ_ID };
      } else {
        results.sequence = { enrolled: false, error: JSON.stringify(seqData).slice(0, 200) };
      }
    } catch (err) {
      results.sequence = { enrolled: false, error: err.message };
    }
  } else {
    // No sequence ID yet — fall back to plain subscriber creation
    try {
      const subRes = await fetch("https://api.convertkit.com/v3/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: API_KEY,
          email,
          first_name: firstName || "",
          fields: { source },
        }),
      });
      const subData = await subRes.json();
      results.subscriber = { created: !!subData.subscriber };
    } catch (err) {
      results.subscriber = { created: false, error: err.message };
    }
  }

  // ── Step 2: Apply tag (optional) ──────────────────────────────────────────
  if (TAG_ID) {
    try {
      await fetch(`https://api.convertkit.com/v3/tags/${TAG_ID}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: API_KEY, email }),
      });
      results.tag = { applied: true };
    } catch (err) {
      results.tag = { applied: false, error: err.message };
    }
  }

  return res.status(200).json({ success: true, ...results });
}
