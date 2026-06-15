#!/usr/bin/env node
/**
 * Creates the ReportForge onboarding sequence in ConvertKit
 * Run: node upload-sequence.js
 * 
 * NOTE: ConvertKit v3 API cannot create sequence CONTENT via API.
 * This script creates the subscriber tags and form, then prints
 * instructions for adding email content in the ConvertKit UI.
 */

import { readFileSync } from "fs";

const API_SECRET = "j-5dERejrhiYHEKJmL05QQ";
const API_KEY    = "j-5dERejrhiYHEKJmL05QQ";
const BASE       = "https://api.convertkit.com/v3";

const seq = JSON.parse(readFileSync("./convertkit-sequence-content.json", "utf8"));

async function post(path, body) {
  const r = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_secret: API_SECRET, ...body }),
  });
  const text = await r.text();
  try { return JSON.parse(text); } catch { return { raw: text }; }
}

async function get(path) {
  const r = await fetch(`${BASE}${path}?api_key=${API_KEY}`);
  return r.json();
}

async function run() {
  console.log("\n🚀 ReportForge AI — ConvertKit Setup\n");

  // 1. Verify account
  const account = await get("/account");
  if (!account.name) { console.error("❌ API key invalid. Check the key and retry."); process.exit(1); }
  console.log(`✅ Account: ${account.name} (${account.email})`);

  // 2. Create tags
  const tagDefs = [
    { name: "ReportForge Trial",      env: "CONVERTKIT_TAG_TRIAL" },
    { name: "ReportForge Paid",       env: "CONVERTKIT_TAG_PAID" },
    { name: "ReportForge Pro",        env: "CONVERTKIT_TAG_PRO" },
    { name: "ReportForge Enterprise", env: "CONVERTKIT_TAG_ENTERPRISE" },
  ];
  const tagIds = {};
  console.log("\n🏷  Creating tags...");
  for (const t of tagDefs) {
    const res = await post("/tags", { tag: { name: t.name } });
    const id = res.id || res.tag?.id || res[0]?.id;
    if (id) { tagIds[t.env] = id; console.log(`   ✅ "${t.name}" → ${id}`); }
    else     { console.log(`   ⚠️  "${t.name}" failed:`, JSON.stringify(res).slice(0,80)); }
  }

  // 3. Get existing sequences
  const seqData = await get("/sequences");
  const sequences = seqData.courses || [];
  console.log(`\n📋 Found ${sequences.length} sequence(s):`);
  sequences.forEach(s => console.log(`   → "${s.name}" (ID: ${s.id})`));

  // 4. Print .env for Vercel
  console.log("\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📋 PASTE THESE INTO VERCEL → SETTINGS → ENV VARIABLES:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`CONVERTKIT_API_KEY      ${API_KEY}`);
  console.log(`CONVERTKIT_API_SECRET   ${API_SECRET}`);
  Object.entries(tagIds).forEach(([k, v]) => console.log(`${k.padEnd(26)}${v}`));
  if (sequences.length > 0) {
    console.log(`CONVERTKIT_SEQUENCE_ID  ${sequences[0].id}`);
  } else {
    console.log(`CONVERTKIT_SEQUENCE_ID  (create sequence first — see step below)`);
  }
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // 5. Print ConvertKit UI instructions
  console.log("📝 NEXT: Create the email sequence in ConvertKit UI");
  console.log("   1. Go to: https://app.convertkit.com/sequences");
  console.log("   2. Click 'New Sequence' → Name: 'ReportForge AI Onboarding'");
  console.log("   3. Add 5 emails with the content from convertkit-sequence-content.json");
  console.log("      Delays: Day 0, Day 3, Day 6, Day 10, Day 14");
  console.log("   4. Copy the sequence ID from the URL and add to Vercel env vars\n");

  console.log("✅ Setup done! Your app will auto-subscribe every new trial user.\n");
}

run().catch(e => { console.error("Error:", e.message); process.exit(1); });
