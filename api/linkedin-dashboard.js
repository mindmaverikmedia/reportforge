/**
 * /api/linkedin-dashboard
 * A simple HTML control panel for generating and publishing LinkedIn posts.
 * Visit this URL directly in your browser.
 */
export default function handler(req, res) {
  res.setHeader("Content-Type", "text/html");
  res.status(200).send(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ReportForge AI — LinkedIn Dashboard</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #07111F; color: #F1F5F9; font-family: -apple-system, sans-serif; padding: 40px 20px; max-width: 700px; margin: 0 auto; }
  h1 { font-size: 22px; margin-bottom: 6px; }
  .sub { color: #475569; font-size: 13px; margin-bottom: 30px; }
  label { display: block; font-size: 11px; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; margin-top: 18px; }
  input, select, textarea { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 12px 14px; color: #F1F5F9; font-size: 14px; font-family: inherit; }
  textarea { min-height: 200px; resize: vertical; white-space: pre-wrap; }
  button { background: #F59E0B; color: #07111F; border: none; padding: 13px 24px; border-radius: 8px; font-weight: 700; font-size: 14px; cursor: pointer; margin-top: 16px; margin-right: 10px; }
  button.secondary { background: rgba(255,255,255,0.06); color: #94A3B8; }
  button:disabled { opacity: 0.4; cursor: not-allowed; }
  .status { margin-top: 16px; padding: 12px 16px; border-radius: 8px; font-size: 13px; }
  .status.ok { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.25); color: #6EE7B7; }
  .status.err { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); color: #FCA5A5; }
  .status.info { background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.2); color: #F59E0B; }
</style>
</head>
<body>
  <h1>📝 ReportForge AI — LinkedIn Dashboard</h1>
  <div class="sub">Generate posts with Claude, review, then publish to your page or profile.</div>

  <label>Topic or angle</label>
  <input id="topic" placeholder="e.g. founder story about the $4,800 report, or leave blank for auto" />

  <label>Publish target</label>
  <select id="target">
    <option value="personal">Personal Profile (for Thought Leader Ads)</option>
    <option value="company">Company Page — requires Community Mgmt API approval</option>
  </select>

  <button onclick="generate()" id="genBtn">⚡ Generate Draft</button>

  <label>Draft (editable before publishing)</label>
  <textarea id="draft" placeholder="Your generated post will appear here..."></textarea>

  <button onclick="publish()" id="pubBtn" disabled>🚀 Publish to LinkedIn</button>
  <button class="secondary" onclick="generate()">↻ Regenerate</button>

  <div id="statusBox"></div>

<script>
async function generate() {
  const topic = document.getElementById('topic').value;
  const target = document.getElementById('target').value;
  const genBtn = document.getElementById('genBtn');
  genBtn.disabled = true; genBtn.textContent = "Generating...";
  setStatus("info", "Asking Claude to write your post...");

  try {
    const res = await fetch('/api/linkedin-post', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ topic, target, autoPublish: false })
    });
    const data = await res.json();
    if (data.error) { setStatus("err", data.error); return; }
    document.getElementById('draft').value = data.draft;
    document.getElementById('pubBtn').disabled = false;
    setStatus("ok", "Draft ready — review and edit before publishing.");
  } catch (e) {
    setStatus("err", "Request failed: " + e.message);
  } finally {
    genBtn.disabled = false; genBtn.textContent = "⚡ Generate Draft";
  }
}

async function publish() {
  const target = document.getElementById('target').value;
  const draftText = document.getElementById('draft').value;
  const pubBtn = document.getElementById('pubBtn');
  pubBtn.disabled = true; pubBtn.textContent = "Publishing...";
  setStatus("info", "Publishing to LinkedIn...");

  try {
    const res = await fetch('/api/linkedin-post', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ topic: draftText, target, autoPublish: true, useExactText: true })
    });
    const data = await res.json();
    if (data.published) {
      setStatus("ok", "✅ Published to LinkedIn! " + (target === "personal" ? "Go boost it as a Thought Leader Ad in Campaign Manager." : ""));
    } else {
      setStatus("err", data.error || data.note || "Publish did not complete — see console.");
    }
  } catch (e) {
    setStatus("err", "Request failed: " + e.message);
  } finally {
    pubBtn.disabled = false; pubBtn.textContent = "🚀 Publish to LinkedIn";
  }
}

function setStatus(type, msg) {
  const box = document.getElementById('statusBox');
  box.innerHTML = '<div class="status ' + type + '">' + msg + '</div>';
}
</script>
</body>
</html>
  `);
}
