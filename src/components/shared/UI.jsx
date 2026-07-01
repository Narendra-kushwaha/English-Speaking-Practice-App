import { LEVELS, LC } from "../../data/questions";

export function Btn({ children, onClick, disabled, color="#6366F1", full, sm, style={} }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding:sm?"8px 14px":"13px 20px", borderRadius:11, border:"none",
      background:disabled?"#1E293B":color, color:disabled?"#475569":"white",
      fontWeight:800, fontSize:sm?12:14, cursor:disabled?"not-allowed":"pointer",
      width:full?"100%":"auto", transition:"opacity 0.15s", ...style,
    }}>{children}</button>
  );
}

export function Badge({ children, color }) {
  return <span style={{ background:`${color}22`, border:`1.5px solid ${color}55`, borderRadius:20, padding:"4px 12px", fontSize:11, fontWeight:700, color, flexShrink:0 }}>{children}</span>;
}

export function TopBar({ onBack, title, right }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:22, flexWrap:"wrap" }}>
      <button onClick={onBack} style={{ background:"none", border:"none", color:"#64748B", cursor:"pointer", fontSize:22, padding:"2px 8px", lineHeight:1 }}>←</button>
      <div style={{ flex:1, fontWeight:800, fontSize:17 }}>{title}</div>
      {right}
    </div>
  );
}

export function LevelTabs({ level, setLevel }) {
  return (
    <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" }}>
      {LEVELS.map(lv => (
        <button key={lv} onClick={() => setLevel(lv)} style={{
          flex:"1 1 80px", padding:"10px 8px", borderRadius:10,
          border:`2px solid ${level===lv?LC[lv].accent:"#334155"}`,
          background:level===lv?`${LC[lv].accent}22`:"#1E293B",
          color:level===lv?LC[lv].accent:"#64748B",
          cursor:"pointer", fontWeight:800, fontSize:13,
        }}>{LC[lv].emoji} {lv}</button>
      ))}
    </div>
  );
}

export function ProgressBar({ current, total, correct, color }) {
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
        <span style={{ color:"#64748B", fontSize:12 }}>Question {current} of {total}</span>
        <span style={{ color:"#22C55E", fontSize:12, fontWeight:700 }}>✅ {correct} correct</span>
      </div>
      <div style={{ height:4, background:"#1E293B", borderRadius:4 }}>
        <div style={{ width:`${((current-1)/Math.max(total,1))*100}%`, height:"100%", background:color, borderRadius:4, transition:"width 0.3s" }} />
      </div>
    </div>
  );
}

export function Field({ label, type="text", value, onChange, placeholder, multiline }) {
  const base = { width:"100%", padding:"12px 14px", borderRadius:10, boxSizing:"border-box", background:"#0F172A", border:"1.5px solid #334155", color:"#F8FAFC", fontSize:14, outline:"none", marginBottom:12, fontFamily:"inherit" };
  return (
    <div>
      {label && <div style={{ fontSize:11, color:"#64748B", fontWeight:600, marginBottom:5, letterSpacing:1 }}>{label}</div>}
      {multiline
        ? <textarea value={value} onChange={onChange} placeholder={placeholder} style={{ ...base, minHeight:90, resize:"vertical" }} />
        : <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={base} />
      }
    </div>
  );
}

export function Msg({ type, text }) {
  if (!text) return null;
  const c = { error:"#EF4444", success:"#22C55E", info:"#6366F1" };
  const b = { error:"#450A0A", success:"#14532D", info:"#1E293B" };
  return <div style={{ background:b[type], border:`1.5px solid ${c[type]}44`, borderRadius:10, padding:"12px 16px", marginBottom:14, color:c[type], fontSize:13 }}>{text}</div>;
}

export function Card({ children, style={} }) {
  return <div style={{ background:"#1E293B", borderRadius:14, padding:"18px", marginBottom:14, border:"1.5px solid #334155", boxSizing:"border-box", ...style }}>{children}</div>;
}
