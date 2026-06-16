export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { topic, geo = 'Global' } = req.body;
  if (!topic) return res.status(400).json({ error: 'Topic is required' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured. Add ANTHROPIC_API_KEY in Vercel environment settings.' });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        messages: [{
          role: 'user',
          content: `You are a senior market research analyst at a top strategy firm. Write a concise, authoritative market intelligence brief for: "${topic}" (Geography: ${geo}).

Use EXACTLY these section headings with # prefix:

# EXECUTIVE SUMMARY
3 bullet points, each with a specific $ or % data point.

# MARKET SIZE & GROWTH
One paragraph: current value ($), CAGR (%), 5-year forecast ($), key growth driver.

# KEY PLAYERS
4-5 companies with brief positioning and approximate market share.

# OPPORTUNITIES
3 items: **Opportunity name**: $X estimate — one sentence description.

# RISKS
- **HIGH**: one specific risk
- **MEDIUM**: one specific risk
- **LOW**: one specific risk

# STRATEGIC RECOMMENDATIONS
3-5 specific, immediately actionable recommendations.

Use real-feeling data throughout. No preamble. No extra sections.`,
        }],
      }),
    });

    const data = await response.json();
    if (data.error) return res.status(400).json({ error: data.error.message });
    return res.status(200).json({ report: data.content?.[0]?.text || '' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
