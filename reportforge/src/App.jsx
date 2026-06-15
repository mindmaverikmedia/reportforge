import { useState, useEffect } from "react";
import EmailCapture from "./EmailCapture.jsx";

function parseReport(md) {
  if (!md) return [];
  const sections = [];
  let current = null;
  for (const line of md.split("\n")) {
    if (line.startsWith("# ")) {
      if (current) sections.push(current);
      current = { title: line.slice(2).trim(), lines: [] };
    } else if (current) {
      current.lines.push(line);
    }
  }
  if (current) sections.push(current);
  return sections;
}

function RichText({ text }) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return <>{parts.map((p, i) => i % 2 === 1 ? <strong key={i} style={{ color: "#F8FAFC", fontWeight: 600 }}>{p}</strong> : p)}</>;
}

const PLANS = [
  { name: "ANALYST", price: "$29", per: "/mo", tagline: "For individual strategists", items: ["5 reports per month", "Copy & export", "6-month archive", "Email support"], cta: "Start Free Trial", hot: false },
  { name: "INTELLIGENCE", price: "$79", per: "/mo", tagline: "For teams & operators", items: ["Unlimited reports", "API access", "Custom branding", "Priority generation", "Team dashboard"], cta: "Go Intelligence →", hot: true },
  { name: "ENTERPRISE", price: "$249", per: "/mo", tagline: "For agencies & funds", items: ["Unlimited everything", "White-label output", "10 team seats", "Webhook delivery", "Dedicated support"], cta: "Contact Sales", hot: false },
];

const LOAD_MSGS = ["Scanning industry databases...","Mapping competitive dynamics...","Quantifying opportunity segments...","Stress-testing risk scenarios...","Synthesizing strategic insights...","Formatting your intelligence brief..."];
const GEO_OPTIONS = ["Global","North America","Europe","Asia-Pacific","United States","United Kingdom","Latin America","Middle East & Africa","Southeast Asia"];
const SAMPLE_BULLETS = [
  "The global EV charging infrastructure market is valued at $28.4B (2024), projected to reach $103B by 2029 at a 29.4% CAGR, driven by government mandates across 48 countries.",
  "DC fast-charging networks represent the highest-margin segment (~68% gross margin) but require $80K–$150K per unit in capital deployment.",
  "The top 5 players control only 38% of installed capacity — a fragmented market ripe for consolidation or niche positioning.",
];

const CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .rf { font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; background: #07111F; min-height: 100vh; color: #F1F5F9; overflow-x: hidden; }
  .rf-nav { position: sticky; top: 0; z-index: 99; display: flex; align-items: center; justify-content: space-between; padding: 18px 44px; background: rgba(7,17,31,0.92); backdrop-filter: blur(14px); border-bottom: 1px solid rgba(255,255,255,0.06); }
  .rf-logo { font-family: 'Space Grotesk', sans-serif; font-size: 17px; font-weight: 700; letter-spacing: -0.5px; cursor: pointer; display: flex; align-items: center; gap: 9px; user-select: none; }
  .rf-pip { width: 8px; height: 8px; background: #F59E0B; border-radius: 50%; }
  .rf-nav-right { display: flex; align-items: center; gap: 26px; }
  .rf-nav-link { font-size: 13px; color: #334155; cursor: pointer; transition: color 0.15s; }
  .rf-nav-link:hover { color: #64748B; }
  .rf-nav-btn { background: #F59E0B; color: #07111F; border: none; padding: 9px 20px; border-radius: 7px; font-family: 'Space Grotesk', sans-serif; font-size: 13px; font-weight: 700; cursor: pointer; transition: opacity 0.15s; letter-spacing: -0.2px; }
  .rf-nav-btn:hover { opacity: 0.85; }
  .rf-hero { text-align: center; padding: 96px 40px 72px; max-width: 860px; margin: 0 auto; }
  .rf-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #F59E0B; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 28px; display: flex; align-items: center; justify-content: center; gap: 14px; }
  .rf-eline { width: 36px; height: 1px; background: #F59E0B; opacity: 0.4; }
  .rf-h1 { font-family: 'Space Grotesk', sans-serif; font-size: clamp(36px, 6.5vw, 68px); font-weight: 700; line-height: 1.04; letter-spacing: -2.5px; color: #F8FAFC; margin-bottom: 22px; }
  .rf-h1-gold { color: #F59E0B; }
  .rf-hero-sub { font-size: 17px; color: #475569; line-height: 1.65; max-width: 530px; margin: 0 auto 44px; font-weight: 400; }
  .rf-cta-row { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
  .rf-btn-gold { background: #F59E0B; color: #07111F; border: none; padding: 15px 30px; border-radius: 9px; font-family: 'Space Grotesk', sans-serif; font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.15s; letter-spacing: -0.3px; }
  .rf-btn-gold:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 8px 28px rgba(245,158,11,0.28); }
  .rf-btn-ghost { background: transparent; color: #475569; border: 1px solid rgba(255,255,255,0.1); padding: 15px 24px; border-radius: 9px; font-size: 14px; cursor: pointer; transition: all 0.15s; }
  .rf-btn-ghost:hover { border-color: rgba(255,255,255,0.2); color: #94A3B8; }
  .rf-stats { display: flex; justify-content: center; flex-wrap: wrap; border-top: 1px solid rgba(255,255,255,0.06); border-bottom: 1px solid rgba(255,255,255,0.06); }
  .rf-stat { padding: 30px 52px; text-align: center; border-right: 1px solid rgba(255,255,255,0.06); flex: 1; min-width: 130px; }
  .rf-stat:last-child { border-right: none; }
  .rf-stat-num { font-family: 'Space Grotesk', sans-serif; font-size: 32px; font-weight: 700; letter-spacing: -1.5px; color: #F59E0B; }
  .rf-stat-lbl { font-size: 11px; color: #334155; letter-spacing: 0.5px; margin-top: 4px; }
  .rf-sec { max-width: 1020px; margin: 0 auto; padding: 80px 40px; }
  .rf-sec-eye { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #F59E0B; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 12px; }
  .rf-sec-h2 { font-family: 'Space Grotesk', sans-serif; font-size: clamp(24px, 3.5vw, 38px); font-weight: 700; letter-spacing: -1px; color: #F1F5F9; margin-bottom: 44px; line-height: 1.1; }
  .rf-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
  .rf-step { background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.07); border-radius: 13px; padding: 28px; }
  .rf-step-num { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #F59E0B; letter-spacing: 1.5px; margin-bottom: 16px; }
  .rf-step-emoji { font-size: 26px; margin-bottom: 10px; display: block; }
  .rf-step-title { font-family: 'Space Grotesk', sans-serif; font-size: 16px; font-weight: 600; color: #F1F5F9; margin-bottom: 7px; }
  .rf-step-body { font-size: 13px; color: #334155; line-height: 1.6; }
  .rf-sample { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 26px 32px; margin-top: 44px; position: relative; overflow: hidden; }
  .rf-sample-blur { position: absolute; bottom: 0; left: 0; right: 0; height: 90px; background: linear-gradient(transparent, #07111F); pointer-events: none; }
  .rf-sample-tag { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #F59E0B; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px; }
  .rf-sample-title { font-family: 'Space Grotesk', sans-serif; font-size: 18px; font-weight: 700; letter-spacing: -0.3px; color: #F1F5F9; margin-bottom: 14px; }
  .rf-plans { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
  .rf-plan { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 30px 26px; position: relative; transition: border-color 0.2s; }
  .rf-plan:hover { border-color: rgba(255,255,255,0.13); }
  .rf-plan.hot { background: rgba(245,158,11,0.05); border-color: rgba(245,158,11,0.28); }
  .rf-plan-badge { position: absolute; top: -11px; left: 50%; transform: translateX(-50%); background: #F59E0B; color: #07111F; font-family: 'Space Grotesk', sans-serif; font-size: 9px; font-weight: 800; letter-spacing: 1px; padding: 3px 14px; border-radius: 20px; white-space: nowrap; }
  .rf-plan-name { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #475569; letter-spacing: 2.5px; margin-bottom: 10px; }
  .rf-plan-price { font-family: 'Space Grotesk', sans-serif; font-size: 42px; font-weight: 700; letter-spacing: -2.5px; color: #F1F5F9; line-height: 1; }
  .rf-plan-per { font-size: 14px; font-weight: 400; letter-spacing: 0; color: #334155; }
  .rf-plan-tagline { font-size: 12px; color: #1E293B; margin: 8px 0 22px; }
  .rf-plan-items { list-style: none; margin-bottom: 26px; }
  .rf-plan-items li { font-size: 13px; color: #64748B; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.04); display: flex; align-items: center; gap: 8px; }
  .rf-plan-items li::before { content: '✓'; color: #F59E0B; font-size: 11px; flex-shrink: 0; }
  .rf-plan-btn { width: 100%; padding: 12px; border-radius: 8px; border: none; font-family: 'Space Grotesk', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; transition: opacity 0.15s; letter-spacing: -0.2px; }
  .rf-plan.hot .rf-plan-btn { background: #F59E0B; color: #07111F; }
  .rf-plan:not(.hot) .rf-plan-btn { background: rgba(255,255,255,0.05); color: #64748B; border: 1px solid rgba(255,255,255,0.08); }
  .rf-plan-btn:hover { opacity: 0.82; }
  .rf-form-wrap { max-width: 620px; margin: 0 auto; padding: 72px 40px; }
  .rf-back { background: none; border: none; color: #334155; font-size: 13px; cursor: pointer; margin-bottom: 44px; display: flex; align-items: center; gap: 6px; transition: color 0.15s; font-family: 'Inter', sans-serif; padding: 0; }
  .rf-back:hover { color: #64748B; }
  .rf-form-h { font-family: 'Space Grotesk', sans-serif; font-size: 30px; font-weight: 700; letter-spacing: -0.8px; color: #F1F5F9; margin-bottom: 8px; line-height: 1.1; }
  .rf-form-sub { font-size: 14px; color: #334155; margin-bottom: 36px; line-height: 1.6; }
  .rf-field { margin-bottom: 22px; }
  .rf-lbl { display: block; font-family: 'Space Grotesk', sans-serif; font-size: 10px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: #334155; margin-bottom: 8px; }
  .rf-textarea, .rf-select { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09); border-radius: 10px; color: #F1F5F9; font-family: 'Inter', sans-serif; font-size: 14px; outline: none; transition: border-color 0.15s; }
  .rf-textarea { padding: 13px 16px; resize: vertical; min-height: 96px; }
  .rf-select { padding: 13px 16px; cursor: pointer; }
  .rf-textarea:focus { border-color: rgba(245,158,11,0.4); }
  .rf-textarea::placeholder { color: #1E293B; }
  option { background: #111827; color: #F1F5F9; }
  .rf-note { background: rgba(245,158,11,0.05); border: 1px solid rgba(245,158,11,0.14); border-radius: 8px; padding: 13px 16px; font-size: 12px; color: #475569; line-height: 1.55; margin-bottom: 22px; }
  .rf-note strong { color: #F59E0B; }
  .rf-gen-btn { width: 100%; padding: 16px; background: #F59E0B; color: #07111F; border: none; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.15s; letter-spacing: -0.3px; }
  .rf-gen-btn:hover { opacity: 0.9; transform: translateY(-1px); }
  .rf-gen-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
  .rf-error-box { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); color: #FCA5A5; padding: 13px 16px; border-radius: 8px; font-size: 13px; margin-bottom: 20px; line-height: 1.5; }
  .rf-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 70vh; padding: 40px; text-align: center; }
  .rf-spin { width: 52px; height: 52px; border: 2px solid rgba(245,158,11,0.1); border-top-color: #F59E0B; border-radius: 50%; animation: rf-spin 0.85s linear infinite; margin-bottom: 32px; }
  @keyframes rf-spin { to { transform: rotate(360deg); } }
  .rf-load-topic { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #F59E0B; letter-spacing: 2px; margin-bottom: 12px; }
  .rf-load-h { font-family: 'Space Grotesk', sans-serif; font-size: 26px; font-weight: 700; letter-spacing: -0.8px; color: #F1F5F9; margin-bottom: 18px; }
  .rf-load-msg { font-size: 13px; color: #334155; }
  .rf-load-bar { width: 220px; height: 2px; background: rgba(255,255,255,0.06); border-radius: 2px; margin-top: 32px; overflow: hidden; }
  .rf-load-fill { height: 100%; background: #F59E0B; border-radius: 2px; animation: rf-fill 2.2s ease-in-out infinite; }
  @keyframes rf-fill { 0%,100%{width:12%} 50%{width:88%} }
  .rf-rep-wrap { max-width: 840px; margin: 0 auto; padding: 56px 40px; }
  .rf-rep-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; flex-wrap: wrap; padding-bottom: 28px; margin-bottom: 32px; border-bottom: 1px solid rgba(255,255,255,0.07); }
  .rf-rep-meta { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #F59E0B; letter-spacing: 2px; margin-bottom: 10px; }
  .rf-rep-title { font-family: 'Space Grotesk', sans-serif; font-size: clamp(20px, 3vw, 30px); font-weight: 700; letter-spacing: -0.8px; color: #F8FAFC; line-height: 1.15; max-width: 560px; }
  .rf-rep-actions { display: flex; gap: 8px; flex-shrink: 0; flex-wrap: wrap; }
  .rf-act-btn { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09); color: #475569; padding: 9px 15px; border-radius: 7px; font-size: 12px; cursor: pointer; transition: all 0.15s; font-family: 'Inter', sans-serif; }
  .rf-act-btn:hover { background: rgba(255,255,255,0.08); color: #94A3B8; }
  .rf-rep-sec { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 24px 28px; margin-bottom: 14px; position: relative; overflow: hidden; }
  .rf-rep-sec::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: linear-gradient(180deg, #F59E0B, rgba(245,158,11,0.15)); }
  .rf-rep-sec-eye { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #F59E0B; letter-spacing: 3px; margin-bottom: 9px; opacity: 0.7; }
  .rf-rep-sec-h { font-family: 'Space Grotesk', sans-serif; font-size: 17px; font-weight: 600; color: #F1F5F9; margin-bottom: 13px; letter-spacing: -0.3px; }
  .rf-rep-body { font-size: 13.5px; color: #94A3B8; line-height: 1.7; }
  .rf-rep-body ul { list-style: none; padding: 0; }
  .rf-rep-body li { display: flex; gap: 10px; margin-bottom: 9px; font-size: 13.5px; color: #94A3B8; line-height: 1.55; align-items: flex-start; }
  .rf-rep-body li::before { content: '◦'; color: #F59E0B; flex-shrink: 0; margin-top: 2px; }
  .rf-upsell { background: linear-gradient(135deg, rgba(245,158,11,0.07), rgba(245,158,11,0.02)); border: 1px solid rgba(245,158,11,0.22); border-radius: 14px; padding: 32px; text-align: center; margin-top: 32px; }
  .rf-upsell-h { font-family: 'Space Grotesk', sans-serif; font-size: 20px; font-weight: 700; letter-spacing: -0.4px; color: #F1F5F9; margin-bottom: 7px; }
  .rf-upsell-sub { font-size: 13px; color: #334155; margin-bottom: 22px; }
  .rf-footer { text-align: center; padding: 32px 40px; border-top: 1px solid rgba(255,255,255,0.05); font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #1E293B; letter-spacing: 2px; }
  @media (max-width: 720px) {
    .rf-nav { padding: 16px 20px; }
    .rf-nav-link { display: none; }
    .rf-hero { padding: 60px 20px 60px; }
    .rf-stat { padding: 22px 16px; border-right: none; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .rf-stat:last-child { border-bottom: none; }
    .rf-sec { padding: 60px 20px; }
    .rf-steps { grid-template-columns: 1fr; }
    .rf-plans { grid-template-columns: 1fr; }
    .rf-form-wrap { padding: 56px 20px; }
    .rf-rep-wrap { padding: 40px 20px; }
    .rf-rep-header { flex-direction: column; }
  }
  @media print {
    .rf-nav, .rf-rep-actions, .rf-upsell, .rf-back { display: none !important; }
    .rf { background: white; }
    .rf-rep-title, .rf-rep-sec-h, .rf-rep-body li { color: #111; }
    .rf-rep-body { color: #374151; }
    .rf-rep-meta, .rf-rep-sec-eye { color: #F59E0B; }
    .rf-rep-sec { border-color: #e5e7eb; break-inside: avoid; }
  }
`;

export default function ReportForge() {
  const [page, setPage] = useState("home");
  const [topic, setTopic] = useState("");
  const [geo, setGeo] = useState("Global");
  const [sections, setSections] = useState([]);
  const [rawReport, setRawReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [msgIdx, setMsgIdx] = useState(0);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showCapture, setShowCapture] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    if (!loading) return;
    const t = setInterval(() => setMsgIdx(i => (i + 1) % LOAD_MSGS.length), 1900);
    return () => clearInterval(t);
  }, [loading]);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [page]);

  const generate = async () => {
    if (!topic.trim() || loading) return;
    setLoading(true); setError(""); setPage("loading");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, geo }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const text = data.report || "";
      setRawReport(text);
      setSections(parseReport(text));
      setPage("report");
      if (!userEmail) setShowCapture(true);
    } catch (e) {
      setError(e.message || "Generation failed — please try again.");
      setPage("form");
    } finally { setLoading(false); }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(rawReport).catch(() => {});
    setCopied(true); setTimeout(() => setCopied(false), 2200);
  };

  function renderLines(lines) {
    const els = []; let buf = [];
    const flush = () => {
      if (!buf.length) return;
      els.push(<ul key={`ul-${els.length}`}>{buf.map((item, i) => <li key={i}><RichText text={item} /></li>)}</ul>);
      buf = [];
    };
    lines.forEach((line, i) => {
      const t = line.trim(); if (!t) return;
      if (/^[-•*]\s/.test(t)) { buf.push(t.slice(2).trim()); }
      else { flush(); els.push(<p key={i} style={{ marginBottom: 8 }}><RichText text={t} /></p>); }
    });
    flush(); return els;
  }

  const renderHome = () => (
    <>
      <div className="rf-hero">
        <div className="rf-eyebrow"><span className="rf-eline" />AI MARKET INTELLIGENCE<span className="rf-eline" /></div>
        <h1 className="rf-h1">Research reports in<br /><span className="rf-h1-gold">60 seconds,</span><br />not 60 days.</h1>
        <p className="rf-hero-sub">ReportForge AI delivers institutional-grade market intelligence briefs. What consultants charge $5,000 for — yours in under a minute.</p>
        <div className="rf-cta-row">
          <button className="rf-btn-gold" onClick={() => setPage("form")}>Generate Free Report →</button>
          <button className="rf-btn-ghost" onClick={() => setPage("form")}>See a sample</button>
        </div>
      </div>
      <div className="rf-stats">
        {[["<60s","Report generation time"],["$4,200","Traditional report cost"],["6","Structured report sections"],["95%+","Gross margin per report"]].map(([n,l]) => (
          <div key={l} className="rf-stat"><div className="rf-stat-num">{n}</div><div className="rf-stat-lbl">{l}</div></div>
        ))}
      </div>
      <div className="rf-sec">
        <div className="rf-sec-eye">HOW IT WORKS</div>
        <h2 className="rf-sec-h2">From brief to intelligence<br />in three steps</h2>
        <div className="rf-steps">
          {[{n:"01",e:"✏️",t:"Name your market",b:"Enter any industry, niche, or emerging sector — broad or hyper-specific. Our AI calibrates the depth automatically."},{n:"02",e:"⚡",t:"AI analyzes the space",b:"Claude AI synthesizes market sizing, competitive dynamics, growth opportunities, and risk factors into a structured brief."},{n:"03",e:"📋",t:"Copy, export, deploy",b:"Use the report directly, copy it into your deck, or export as PDF. Stakeholder-ready in under a minute."}].map(s => (
            <div key={s.n} className="rf-step"><div className="rf-step-num">STEP {s.n}</div><span className="rf-step-emoji">{s.e}</span><div className="rf-step-title">{s.t}</div><p className="rf-step-body">{s.b}</p></div>
          ))}
        </div>
        <div className="rf-sample">
          <div className="rf-sample-tag">SAMPLE // EV CHARGING INFRASTRUCTURE · GLOBAL</div>
          <div className="rf-sample-title">Executive Summary</div>
          <ul style={{ listStyle:"none", padding:0 }}>
            {SAMPLE_BULLETS.map((txt,i) => (
              <li key={i} style={{display:"flex",gap:10,marginBottom:10,fontSize:13,color:"#475569",lineHeight:1.6,alignItems:"flex-start"}}>
                <span style={{color:"#F59E0B",flexShrink:0}}>◦</span><span>{txt}</span>
              </li>
            ))}
          </ul>
          <div className="rf-sample-blur" />
        </div>
      </div>
      <div className="rf-sec" style={{paddingTop:0}}>
        <div className="rf-sec-eye">PRICING</div>
        <h2 className="rf-sec-h2">Intelligence that pays for itself<br />on the first report</h2>
        <div className="rf-plans">
          {PLANS.map(p => (
            <div key={p.name} className={`rf-plan${p.hot?" hot":""}`}>
              {p.hot && <div className="rf-plan-badge">⭐ MOST POPULAR</div>}
              <div className="rf-plan-name">{p.name}</div>
              <div className="rf-plan-price">{p.price}<span className="rf-plan-per">{p.per}</span></div>
              <div className="rf-plan-tagline">{p.tagline}</div>
              <ul className="rf-plan-items">{p.items.map(item => <li key={item}>{item}</li>)}</ul>
              <button className="rf-plan-btn" onClick={() => setPage("form")}>{p.cta}</button>
            </div>
          ))}
        </div>
      </div>
      <div className="rf-footer">REPORTFORGE AI · MARKET INTELLIGENCE ON DEMAND · BUILT ON CLAUDE</div>
    </>
  );

  const renderForm = () => (
    <div className="rf-form-wrap">
      <button className="rf-back" onClick={() => setPage("home")}>← Back to home</button>
      <h2 className="rf-form-h">Generate your<br />intelligence brief</h2>
      <p className="rf-form-sub">Describe the market you want analyzed. Specific inputs yield sharper reports — try <em style={{color:"#475569"}}>"B2B SaaS for construction project management in North America"</em>.</p>
      {error && <div className="rf-error-box">⚠ {error}</div>}
      <div className="rf-field">
        <label className="rf-lbl">Market or Topic</label>
        <textarea className="rf-textarea" rows={3} placeholder={`"AI-powered diagnostics in veterinary medicine"\n"Luxury electric motorcycles in Europe"\n"Subscription grocery boxes in Southeast Asia"`} value={topic} onChange={e => setTopic(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) generate(); }} />
      </div>
      <div className="rf-field">
        <label className="rf-lbl">Geographic Focus</label>
        <select className="rf-select" value={geo} onChange={e => setGeo(e.target.value)}>
          {GEO_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>
      <div className="rf-note"><strong>🎁 Free trial</strong> — One complimentary intelligence brief. Subscribe for unlimited access, PDF export, and API integration.</div>
      <button className="rf-gen-btn" onClick={generate} disabled={!topic.trim() || loading}>{loading ? "Generating..." : "Generate Intelligence Brief →"}</button>
    </div>
  );

  const renderLoading = () => (
    <div className="rf-loading">
      <div className="rf-spin" />
      <div className="rf-load-topic">ANALYZING // {topic.slice(0,42).toUpperCase()}{topic.length>42?"…":""}</div>
      <h2 className="rf-load-h">Building your report...</h2>
      <div className="rf-load-msg">{LOAD_MSGS[msgIdx]}</div>
      <div className="rf-load-bar"><div className="rf-load-fill" /></div>
    </div>
  );

  const renderReport = () => {
    const date = new Date().toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" });
    return (
      <div className="rf-rep-wrap">
        <div className="rf-rep-header">
          <div>
            <div className="rf-rep-meta">INTELLIGENCE BRIEF · {date} · {geo.toUpperCase()}</div>
            <div className="rf-rep-title">{topic}</div>
          </div>
          <div className="rf-rep-actions">
            <button className="rf-act-btn" onClick={handleCopy}>{copied ? "✓ Copied!" : "⎘ Copy"}</button>
            <button className="rf-act-btn" onClick={() => window.print()}>↓ Print PDF</button>
            <button className="rf-act-btn" onClick={() => { setTopic(""); setPage("form"); }}>+ New</button>
          </div>
        </div>
        {sections.map((sec, i) => (
          <div key={i} className="rf-rep-sec">
            <div className="rf-rep-sec-eye">SECTION {String(i+1).padStart(2,"0")}</div>
            <div className="rf-rep-sec-h">{sec.title}</div>
            <div className="rf-rep-body">{renderLines(sec.lines)}</div>
          </div>
        ))}
        <div className="rf-upsell">
          <div className="rf-upsell-h">Unlock unlimited reports for $79/month</div>
          <div className="rf-upsell-sub">PDF export · API access · Custom branding · Priority generation</div>
          <button className="rf-btn-gold" style={{margin:"0 auto"}} onClick={() => setPage("home")}>View All Plans →</button>
        </div>
        <button className="rf-back" style={{marginTop:36}} onClick={() => setPage("home")}>← Back to home</button>
      </div>
    );
  };

  return (
    <div className="rf">
      <style>{CSS}</style>
      <nav className="rf-nav">
        <div className="rf-logo" onClick={() => setPage("home")}><span className="rf-pip" />ReportForge AI</div>
        <div className="rf-nav-right">
          <span className="rf-nav-link" onClick={() => setPage("home")}>Features</span>
          <span className="rf-nav-link" onClick={() => setPage("home")}>Pricing</span>
          <button className="rf-nav-btn" onClick={() => setPage("form")}>Try Free →</button>
        </div>
      </nav>
      {page === "home" && renderHome()}
      {page === "form" && renderForm()}
      {page === "loading" && renderLoading()}
      {page === "report" && renderReport()}
    </div>
  );
}
