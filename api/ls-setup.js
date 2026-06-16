/**
 * /api/ls-setup
 * Lists all Lemon Squeezy products + variants and returns checkout URLs.
 * Create your products in the LS dashboard first, then call this endpoint.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' });

  const LS_KEY = process.env.LEMONSQUEEZY_API_KEY;
  if (!LS_KEY) return res.status(500).json({ error: 'LEMONSQUEEZY_API_KEY not set' });

  const BASE = 'https://api.lemonsqueezy.com/v1';
  const headers = {
    'Authorization': `Bearer ${LS_KEY}`,
    'Accept': 'application/vnd.api+json',
  };

  const api = async (path) => {
    const r = await fetch(`${BASE}${path}`, { headers });
    return r.json();
  };

  try {
    // Get store
    const storesRes = await api('/stores');
    const store = storesRes.data?.[0];
    if (!store) return res.status(400).json({ error: 'No store found.' });
    const storeId = store.id;
    const storeSlug = store.attributes.slug;

    // Get all products for this store
    const productsRes = await api(`/products?filter[store_id]=${storeId}`);
    const products = productsRes.data || [];

    if (products.length === 0) {
      return res.status(200).json({
        ready: false,
        store: { id: storeId, slug: storeSlug, name: store.attributes.name },
        message: 'No products found. Create your 3 plans in the Lemon Squeezy dashboard first.',
        dashboardUrl: 'https://app.lemonsqueezy.com/products',
        instructions: [
          '1. Go to https://app.lemonsqueezy.com/products',
          '2. Click "New product" — create "ReportForge Analyst" at $29/month (subscription)',
          '3. Click "New product" — create "ReportForge Intelligence" at $79/month (subscription)',
          '4. Click "New product" — create "ReportForge Enterprise" at $249/month (subscription)',
          '5. Come back and call this endpoint again to get your checkout URLs',
        ],
      });
    }

    // Get variants for each product
    const results = [];
    for (const product of products) {
      const variantsRes = await api(`/variants?filter[product_id]=${product.id}`);
      const variants = variantsRes.data || [];
      const activeVariant = variants.find(v => v.attributes.status === 'published') || variants[0];

      results.push({
        name: product.attributes.name,
        productId: product.id,
        variantId: activeVariant?.id,
        price: activeVariant ? `$${(activeVariant.attributes.price / 100).toFixed(2)}/mo` : 'no variant',
        checkoutUrl: activeVariant
          ? `https://${storeSlug}.lemonsqueezy.com/checkout/buy/${activeVariant.id}`
          : null,
        status: product.attributes.status,
      });
    }

    // Build env var block
    const envBlock = results.map(r => {
      const key = r.name
        .replace('ReportForge ', '')
        .toUpperCase()
        .replace(/\s+/g, '_');
      return `LS_URL_${key}=${r.checkoutUrl}`;
    }).join('\n');

    return res.status(200).json({
      ready: true,
      store: { slug: storeSlug, name: store.attributes.name },
      products: results,
      addToVercel: envBlock,
      instruction: 'Copy the addToVercel block into Vercel → Settings → Environment Variables, then redeploy.',
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
