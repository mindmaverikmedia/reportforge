/**
 * /api/checkout?plan=analyst|intelligence|enterprise&email=user@example.com
 * Returns the Lemon Squeezy checkout URL, with email pre-filled if provided.
 */

// Checkout URLs — set from Lemon Squeezy dashboard (variant IDs)
const CHECKOUT_URLS = {
  ANALYST:      process.env.LS_URL_ANALYST      || "https://reportforgemaverik.lemonsqueezy.com/checkout/buy/1796175",
  INTELLIGENCE: process.env.LS_URL_INTELLIGENCE || "https://reportforgemaverik.lemonsqueezy.com/checkout/buy/1796186",
  ENTERPRISE:   process.env.LS_URL_ENTERPRISE   || "https://reportforgemaverik.lemonsqueezy.com/checkout/buy/1796192",
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
