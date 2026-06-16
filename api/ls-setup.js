/**
 * /api/ls-setup — One-time Lemon Squeezy product creation
 * Call once: https://reportforge-2ap7.vercel.app/api/ls-setup
 * Creates all 3 subscription products + variants, returns checkout URLs
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' });

  const LS_KEY = process.env.LEMONSQUEEZY_API_KEY;
  if (!LS_KEY) return res.status(500).json({ error: 'LEMONSQUEEZY_API_KEY not set in Vercel env vars' });

  const BASE = 'https://api.lemonsqueezy.com/v1';
  const headers = {
    'Authorization': `Bearer ${LS_KEY}`,
    'Accept': 'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json',
  };

  const api = async (path, method = 'GET', body) => {
    const r = await fetch(`${BASE}${path}`, {
      method, headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    return r.json();
  };

  try {
    // 1. Get store
    const storesRes = await api('/stores');
    const store = storesRes.data?.[0];
    if (!store) return res.status(400).json({ error: 'No store found. Create a store at app.lemonsqueezy.com first.' });

    const storeId = store.id;
    const storeSlug = store.attributes.slug;
    console.log(`Store: ${store.attributes.name} (${storeSlug})`);

    // 2. Define our 3 plans
    const plans = [
      { name: 'ReportForge Analyst', desc: '5 market research reports/month for individual strategists', price: 2900 },
      { name: 'ReportForge Intelligence', desc: 'Unlimited reports, API access, custom branding for teams', price: 7900 },
      { name: 'ReportForge Enterprise', desc: 'Unlimited reports, white-label, 10 seats, agencies & funds', price: 24900 },
    ];

    const results = [];

    for (const plan of plans) {
      // 3. Create product
      const productRes = await api('/products', 'POST', {
        data: {
          type: 'products',
          attributes: { name: plan.name, description: plan.desc },
          relationships: { store: { data: { type: 'stores', id: storeId } } },
        },
      });

      const productId = productRes.data?.id;
      if (!productId) {
        results.push({ plan: plan.name, error: JSON.stringify(productRes).slice(0, 200) });
        continue;
      }

      // 4. Create monthly subscription variant
      const variantRes = await api('/variants', 'POST', {
        data: {
          type: 'variants',
          attributes: {
            name: 'Monthly',
            price: plan.price,
            is_subscription: true,
            interval: 'month',
            interval_count: 1,
            status: 'published',
          },
          relationships: { product: { data: { type: 'products', id: productId } } },
        },
      });

      const variantId = variantRes.data?.id;
      const checkoutUrl = variantId
        ? `https://${storeSlug}.lemonsqueezy.com/checkout/buy/${variantId}`
        : null;

      results.push({
        plan: plan.name,
        productId,
        variantId,
        checkoutUrl,
        price: `$${plan.price / 100}/mo`,
      });

      console.log(`✅ ${plan.name}: variant ${variantId}`);
    }

    // 5. Return everything needed
    return res.status(200).json({
      success: true,
      store: { id: storeId, slug: storeSlug, name: store.attributes.name },
      products: results,
      nextStep: 'Copy the checkoutUrls and add them as Vercel env vars: LS_URL_ANALYST, LS_URL_INTELLIGENCE, LS_URL_ENTERPRISE. Then redeploy.',
      envVars: results.map(r => `LS_URL_${r.plan.replace('ReportForge ', '').toUpperCase()} = ${r.checkoutUrl}`).join('\n'),
    });

  } catch (err) {
    return res.status(500).json({ error: err.message, stack: err.stack?.split('\n').slice(0, 5) });
  }
}
