# ReportForge AI — Deployment Guide

## 30-Second Deploy to Vercel (Recommended)

### Option A: GitHub + Vercel (auto-deploy on every push)

```bash
# 1. Create GitHub repo at: https://github.com/new
#    Name it: reportforge-ai  (make it public or private, both work)

# 2. Push this code to GitHub:
git init
git add .
git commit -m "ReportForge AI v1"
git remote add origin https://github.com/YOUR_USERNAME/reportforge-ai.git
git push -u origin main

# 3. Import to Vercel:
#    Go to: https://vercel.com/new
#    Click "Import" next to your reportforge-ai repo
#    Click "Deploy" (no settings needed)
```

### Option B: Vercel CLI (no GitHub needed)

```bash
npm install -g vercel
vercel --prod
# Follow the login prompts
```

## CRITICAL: Add Your Anthropic API Key

After deploying, go to your Vercel project dashboard:
1. Settings → Environment Variables
2. Add: ANTHROPIC_API_KEY = your-key-here
3. Redeploy (Vercel > Deployments > ... > Redeploy)

Get your API key at: https://console.anthropic.com/settings/api-keys

## Vercel Environment Variable Setup
- Key: ANTHROPIC_API_KEY
- Value: sk-ant-...
- Environments: Production, Preview, Development (check all three)

## File Structure
```
reportforge/
├── api/
│   └── generate.js     ← Secure Claude API proxy (uses your API key)
├── src/
│   ├── App.jsx         ← Full ReportForge UI
│   └── main.jsx        ← React entry point
├── index.html          ← HTML shell with SEO meta tags
├── package.json        ← React + Vite dependencies
├── vite.config.js      ← Build configuration
└── vercel.json         ← Serverless function routing
```

## Payment Setup (Step 2 — Do after deploy)

### Lemon Squeezy (recommended)
1. Sign up: https://www.lemonsqueezy.com/
2. Create a store → Add product "ReportForge AI"
3. Set up 3 variants: Analyst $29/mo, Intelligence $79/mo, Enterprise $249/mo
4. Add your Vercel URL as the redirect after payment

### Gumroad (fastest to first dollar)
1. Sign up: https://gumroad.com/
2. Create product → "ReportForge AI Access"
3. Set price: $29+
4. Product URL goes to your Vercel deployment
