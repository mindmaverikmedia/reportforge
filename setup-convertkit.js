#!/usr/bin/env node
/**
 * ReportForge AI — ConvertKit Setup Script
 * Run: node setup-convertkit.js
 * This creates all required tags, sequence, and outputs IDs for the .env file
 */

const API_KEY    = "j-5dERejrhiYHEKJmL05QQ";
const API_SECRET = "j-5dERejrhiYHEKJmL05QQ"; // Update if you have a separate secret
const BASE       = "https://api.convertkit.com/v3";

async function get(path) {
  const r = await fetch(`${BASE}${path}?api_key=${API_KEY}`);
  return r.json();
}

async function post(path, body) {
  const r = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_secret: API_SECRET, ...body }),
  });
  return r.json();
}

async function run() {
  console.log("\n🔑 Verifying ConvertKit account...");
  const account = await get("/account");
  if (account.error) { console.error("❌ Auth failed:", account.error); process.exit(1); }
  console.log(`✅ Connected: ${account.name} (${account.email})\n`);

  // ── Create Tags ───────────────────────────────────────────────────────────
  console.log("🏷  Creating subscriber tags...");
  const tagNames = ["ReportForge Trial", "ReportForge Paid", "ReportForge Pro", "ReportForge Enterprise"];
  const tagIds = {};
  for (const name of tagNames) {
    const res = await post("/tags", { tag: { name } });
    const id = res.id || res.tag?.id;
    if (id) { tagIds[name] = id; console.log(`   ✅ Tag "${name}" → ID: ${id}`); }
    else     { console.log(`   ⚠️  Tag "${name}" result:`, JSON.stringify(res).slice(0,100)); }
  }

  // ── Check for existing sequences ─────────────────────────────────────────
  console.log("\n📋 Checking existing sequences...");
  const seqRes = await get("/sequences");
  const sequences = seqRes.courses || [];
  if (sequences.length > 0) {
    console.log("   Existing sequences:");
    sequences.forEach(s => console.log(`   → "${s.name}" (ID: ${s.id})`));
  } else {
    console.log("   No sequences found — you'll create one in the ConvertKit UI.");
  }

  // ── Check for existing forms ──────────────────────────────────────────────
  console.log("\n📝 Checking existing forms...");
  const formRes = await get("/forms");
  const forms = formRes.forms || [];
  if (forms.length > 0) {
    console.log("   Existing forms:");
    forms.forEach(f => console.log(`   → "${f.name}" (ID: ${f.id})`));
  } else {
    console.log("   No forms found — creating a signup form...");
    const newForm = await post("/forms", { name: "ReportForge AI Signup", type: "embed" });
    console.log("   Form result:", JSON.stringify(newForm).slice(0, 200));
  }

  // ── Output env vars ───────────────────────────────────────────────────────
  console.log("\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📋 ADD THESE TO VERCEL ENVIRONMENT VARIABLES:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`CONVERTKIT_API_KEY    = ${API_KEY}`);
  console.log(`CONVERTKIT_API_SECRET = ${API_SECRET}`);
  Object.entries(tagIds).forEach(([name, id]) => {
    const envName = `CONVERTKIT_TAG_${name.replace("ReportForge ", "").toUpperCase().replace(" ", "_")}`;
    console.log(`${envName.padEnd(30)} = ${id}`);
  });
  if (sequences.length > 0) {
    console.log(`CONVERTKIT_SEQUENCE_ID          = ${sequences[0].id}  ← use your onboarding sequence`);
  }
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("✅ Setup complete! Next step: create the email sequence in ConvertKit UI.");
  console.log("   → https://app.convertkit.com/sequences\n");
}

run().catch(console.error);
