/**
 * /api/checkout?plan=analyst|intelligence|enterprise
 * Returns the correct Lemon Squeezy checkout URL for the selected plan.
 * Pre-fills email if passed as query param: ?plan=analyst&email=user@example.com
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { plan = '', email = '' } = req.query;
  const key = `LS_URL_${plan.toUpperCase()}`;
  let checkoutUrl = process.env[key];

  if (!checkoutUrl) {
    // Fallback: direct store URL while env vars are being configured
    const storeSlug = process.env.LS_STORE_SLUG || 'reportforge';
    checkoutUrl = `https://${storeSlug}.lemonsqueezy.com`;
  }

  // Pre-fill email in checkout if available
  if (email && checkoutUrl.includes('lemonsqueezy.com')) {
    checkoutUrl += `?checkout[email]=${encodeURIComponent(email)}`;
  }

  return res.status(200).json({ url: checkoutUrl, plan });
}
