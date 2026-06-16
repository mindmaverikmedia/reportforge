/**
 * EmailCapture — shown after a free report is generated
 * Captures email, subscribes to ConvertKit sequence, gates further reports
 */
import { useState } from "react";

export default function EmailCapture({ topic, onSuccess, onSkip }) {
  const [email, setEmail]       = useState("");
  const [name, setName]         = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const submit = async () => {
    if (!email.includes("@")) { setError("Please enter a valid email."); return; }
    setLoading(true); setError("");
    try {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstName: name, plan: "trial" }),
      });
      onSuccess(email);
    } catch {
      // Non-blocking — let them through even if subscribe fails
      onSuccess(email);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(7,17,31,0.92)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 999, padding: 20,
    }}>
      <div style={{
        background: "#0D1B2E", border: "1px solid rgba(245,158,11,0.25)",
        borderRadius: 16, padding: "36px 32px", maxWidth: 460, width: "100%",
      }}>
        <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"#F59E0B", letterSpacing:"3px", marginBottom:12 }}>
          YOUR REPORT IS READY
        </div>
        <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:22, fontWeight:700, letterSpacing:"-0.5px", color:"#F8FAFC", marginBottom:8 }}>
          Where should we send follow-up intelligence?
        </div>
        <p style={{ fontSize:13, color:"#475569", marginBottom:24, lineHeight:1.6 }}>
          Enter your email to unlock your full report on <strong style={{color:"#94A3B8"}}>{topic.slice(0,50)}{topic.length>50?"…":""}</strong> and receive our 5-email market intelligence course — free.
        </p>

        {error && <div style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", color:"#FCA5A5", padding:"10px 14px", borderRadius:8, fontSize:12, marginBottom:16 }}>{error}</div>}

        <input
          placeholder="First name (optional)"
          value={name}
          onChange={e => setName(e.target.value)}
          style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:8, padding:"11px 14px", color:"#F1F5F9", fontFamily:"'Inter',sans-serif", fontSize:13, outline:"none", marginBottom:10 }}
        />
        <input
          placeholder="your@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()}
          style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:8, padding:"11px 14px", color:"#F1F5F9", fontFamily:"'Inter',sans-serif", fontSize:13, outline:"none", marginBottom:16 }}
        />

        <button
          onClick={submit}
          disabled={loading}
          style={{ width:"100%", background:"#F59E0B", color:"#07111F", border:"none", padding:"14px", borderRadius:9, fontFamily:"'Space Grotesk',sans-serif", fontSize:15, fontWeight:700, cursor:"pointer", marginBottom:12, opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Subscribing..." : "View My Full Report →"}
        </button>

        <button
          onClick={onSkip}
          style={{ width:"100%", background:"transparent", color:"#334155", border:"none", fontSize:12, cursor:"pointer", padding:8 }}
        >
          Skip — just show me the report
        </button>

        <p style={{ fontSize:11, color:"#1E293B", textAlign:"center", marginTop:12 }}>
          No spam. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );
}
