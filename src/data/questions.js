export const LEVELS = ["Beginner", "Intermediate", "Advanced"];

export const LC = {
  Beginner:     { accent:"#22C55E", light:"#F0FDF4", badge:"#16A34A", emoji:"🌱" },
  Intermediate: { accent:"#F59E0B", light:"#FFFBEB", badge:"#D97706", emoji:"🔥" },
  Advanced:     { accent:"#8B5CF6", light:"#F5F3FF", badge:"#7C3AED", emoji:"⚡" },
};

// Shared styles
export const S = {
  pg:   { minHeight:"100vh", background:"#0F172A", fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", color:"#F8FAFC" },
  wrap: { maxWidth:700, margin:"0 auto", padding:"16px 16px 48px", boxSizing:"border-box", width:"100%" },
  card: { background:"#1E293B", borderRadius:14, padding:"18px", marginBottom:14, border:"1.5px solid #334155", boxSizing:"border-box" },
  lbl:  { fontSize:10, letterSpacing:2, textTransform:"uppercase", fontWeight:700, marginBottom:8, color:"#64748B" },
  inp:  { width:"100%", padding:"12px 14px", borderRadius:10, boxSizing:"border-box", background:"#0F172A", border:"1.5px solid #334155", color:"#F8FAFC", fontSize:14, outline:"none", marginBottom:12 },
};
