/**
 * /api/linkedin-callback
 * Step 2 of OAuth — LinkedIn redirects here after you approve access.
 * Exchanges the auth code for an access token and shows it to you once
 * so you can copy it into Vercel env vars.
 */
export default async function handler(req, res) {
  const { code, error, error_description } = req.query;

  if (error) {
    return res.status(400).send(`
      <html><body style="font-family:monospace;background:#07111F;color:#FCA5A5;padding:40px;">
        <h2>LinkedIn authorization failed</h2>
        <p>${error}: ${error_description}</p>
      </body></html>
    `);
  }

  if (!code) {
    return res.status(400).send("Missing authorization code from LinkedIn.");
  }

  const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
  const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
  const REDIRECT_URI = "https://reportforge-2ap7.vercel.app/api/linkedin-callback";

  try {
    const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
      }),
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      return res.status(400).send(`
        <html><body style="font-family:monospace;background:#07111F;color:#FCA5A5;padding:40px;">
          <h2>Token exchange failed</h2>
          <pre>${JSON.stringify(tokenData, null, 2)}</pre>
        </body></html>
      `);
    }

    const accessToken = tokenData.access_token;
    const expiresIn = tokenData.expires_in;
    const refreshToken = tokenData.refresh_token || "(none returned — re-auth after 60 days)";

    // Get the member's LinkedIn URN (needed for personal posts)
    let memberUrn = "unknown";
    try {
      const meRes = await fetch("https://api.linkedin.com/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const me = await meRes.json();
      memberUrn = me.sub ? `urn:li:person:${me.sub}` : "unknown";
    } catch (_) {}

    return res.status(200).send(`
      <html>
      <body style="font-family:-apple-system,sans-serif;background:#07111F;color:#F1F5F9;padding:40px;max-width:700px;margin:0 auto;line-height:1.6;">
        <h2 style="color:#F59E0B;">✅ LinkedIn connected successfully</h2>
        <p>Copy these into Vercel → Settings → Environment Variables:</p>
        <div style="background:#0D1B2E;border:1px solid #F59E0B;border-radius:10px;padding:20px;margin:20px 0;font-family:monospace;font-size:13px;word-break:break-all;">
          <p><strong style="color:#F59E0B;">LINKEDIN_ACCESS_TOKEN</strong><br>${accessToken}</p>
          <p><strong style="color:#F59E0B;">LINKEDIN_REFRESH_TOKEN</strong><br>${refreshToken}</p>
          <p><strong style="color:#F59E0B;">LINKEDIN_MEMBER_URN</strong><br>${memberUrn}</p>
          <p><strong style="color:#F59E0B;">LINKEDIN_ORG_URN</strong><br>urn:li:organization:129994109</p>
        </div>
        <p style="color:#94A3B8;">Token expires in ${expiresIn ? Math.round(expiresIn/86400) : '60'} days.</p>
        <p style="color:#475569;font-size:13px;">⚠️ This page shows your token only once. Copy it now before closing.</p>
      </body>
      </html>
    `);

  } catch (err) {
    return res.status(500).send(`Error: ${err.message}`);
  }
}
