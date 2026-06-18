/**
 * /api/linkedin-auth
 * Step 1 of OAuth — generates the LinkedIn authorization URL.
 * Visit this endpoint, it redirects you to LinkedIn to approve access.
 */
export default function handler(req, res) {
  const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
  const REDIRECT_URI = "https://reportforge-2ap7.vercel.app/api/linkedin-callback";

  if (!CLIENT_ID) {
    return res.status(500).json({ error: "LINKEDIN_CLIENT_ID not set in Vercel env vars" });
  }

  // Scopes needed:
  // openid + profile + email -> sign in / identify the user
  // w_member_social -> post to personal profile (needed for Thought Leader Ads)
  //
  // NOTE: w_organization_social (company page posting) requires LinkedIn's
  // separate "Community Management API" product, which needs manual approval.
  // Apply at: https://www.linkedin.com/developers/apps -> your app -> Products
  // Once approved, add "w_organization_social" back into the scopes list below.
  const scopes = [
    "openid",
    "profile",
    "email",
    "w_member_social",
  ].join(" ");

  const state = Math.random().toString(36).substring(2, 15);

  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
    `response_type=code` +
    `&client_id=${CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&state=${state}` +
    `&scope=${encodeURIComponent(scopes)}`;

  res.redirect(302, authUrl);
}
