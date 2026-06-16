/**
 * /api/checkout?plan=analyst|intelligence|enterprise&email=user@example.com
 * Returns the Lemon Squeezy checkout URL, with email pre-filled if provided.
 */

// Checkout URLs — set from Lemon Squeezy dashboard (variant IDs)
const CHECKOUT_URLS = {
  ANALYST:      process.env.LS_URL_ANALYST      || "https://reportforgemaverik.lemonsqueezy.com/checkout/buy/32fcdaa0-5bc1-4a7b-b0a9-a0b0c730e00e",
  INTELLIGENCE: process.env.LS_URL_INTELLIGENCE || "https://reportforgemaverik.lemonsqueezy.com/checkout/buy/5cbe259a-4ebe-4960-8942-a45a02109338",
  ENTERPRISE:   process.env.LS_URL_ENTERPRISE   || "https://reportforgemaverik.lemonsqueezy.com/checkout/buy/683761df-c4ce-4de1-949d-a2cd94010b78",
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { plan = "", email = "" } = req.query;
  const key = plan.toUpperCase();
  let checkoutUrl = CHECKOUT_URLS[key];

  if (!checkoutUrl) {
    return res.status(400).json({
      error: `Unknown plan: ${plan}. Valid plans: analyst, intelligence, enterprise`,
    });
  }

  // Pre-fill email in Lemon Squeezy checkout overlay
  if (email) {
    checkoutUrl += `?checkout[email]=${encodeURIComponent(email)}`;
  }

  return res.status(200).json({ url: checkoutUrl, plan });
}
