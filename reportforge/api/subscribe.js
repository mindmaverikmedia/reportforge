/**
 * /api/subscribe — Adds a new user to ConvertKit
 * Called automatically when a user generates their first report
 */
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, firstName = "", plan = "trial" } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  const API_KEY    = process.env.CONVERTKIT_API_KEY;
  const API_SECRET = process.env.CONVERTKIT_API_SECRET;
  const SEQ_ID     = process.env.CONVERTKIT_SEQUENCE_ID;
  const TAG_TRIAL  = process.env.CONVERTKIT_TAG_TRIAL;

  if (!API_KEY) return res.status(500).json({ error: "ConvertKit not configured" });

  const BASE = "https://api.convertkit.com/v3";

  try {
    // 1. Create/update subscriber
    const subRes = await fetch(`${BASE}/subscribers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_secret: API_SECRET,
        email_address: email,
        first_name: firstName,
        fields: { plan, signed_up: new Date().toISOString().split("T")[0] },
      }),
    });
    const sub = await subRes.json();
    const subscriberId = sub.subscriber?.id;

    // 2. Tag as trial user
    if (subscriberId && TAG_TRIAL) {
      await fetch(`${BASE}/subscribers/${subscriberId}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_secret: API_SECRET, tag: { id: TAG_TRIAL } }),
      });
    }

    // 3. Add to onboarding sequence
    if (SEQ_ID && email) {
      await fetch(`${BASE}/sequences/${SEQ_ID}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: API_KEY,
          email,
          first_name: firstName,
        }),
      });
    }

    return res.status(200).json({ success: true, subscriberId });
  } catch (err) {
    // Non-fatal — don't block the user experience if email capture fails
    console.error("ConvertKit subscribe error:", err.message);
    return res.status(200).json({ success: false, error: err.message });
  }
}
