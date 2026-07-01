import { useState } from "react";
import { loginUser, resetPassword } from "../../utils/auth";
import { fsGet } from "../../utils/store";
import { Btn, Field, Msg, Card } from "../shared/UI";
import { S } from "../../data/questions";

export default function LoginScreen({ onGoRegister, onGoDeveloper }) {
  const [role, setRole]         = useState(null);
  const [email, setEmail]       = useState("");
  const [pass, setPass]         = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetOk, setResetOk]   = useState(false);

  async function doLogin() {
    if (!email||!pass) { setError("Please fill all fields."); return; }
    setLoading(true); setError("");
    try {
      const u = await loginUser(email, pass);
      const p = await fsGet("users", u.uid);
      if (!p)               { setError("Account not found."); setLoading(false); return; }
      if (p.role !== role)  { setError(`This is not a ${role} account.`); setLoading(false); return; }
      if (p.blocked)        { setError("Your account is blocked. Contact admin."); setLoading(false); return; }
    } catch (e) {
      setError(e.message.includes("wrong-password")||e.message.includes("user-not-found") ? "Invalid email or password." : e.message);
    }
    setLoading(false);
  }

  async function doReset() {
    if (!resetEmail) { setError("Enter your email."); return; }
    setLoading(true); setError("");
    try { await resetPassword(resetEmail); setResetOk(true); } catch { setError("Could not send email. Check the address."); }
    setLoading(false);
  }

  if (showReset) return (
    <div style={{ ...S.pg, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ width:"100%", maxWidth:380 }}>
        <button onClick={()=>{setShowReset(false);setResetOk(false);setError("");}} style={{ background:"none",border:"none",color:"#64748B",cursor:"pointer",fontSize:13,marginBottom:16 }}>← Back</button>
        <div style={{ textAlign:"center", marginBottom:20 }}>
          <div style={{ fontSize:40, marginBottom:8 }}>🔑</div>
          <h2 style={{ fontWeight:900 }}>Reset Password</h2>
        </div>
        <Card>
          {resetOk ? <Msg type="success" text="✅ Reset link sent! Check your email." /> : (
            <>
              <Msg type="error" text={error} />
              <Field label="Your Email" type="email" value={resetEmail} onChange={e=>setResetEmail(e.target.value)} placeholder="you@email.com" />
              <Btn onClick={doReset} disabled={loading} color="#6366F1" full>{loading?"Sending…":"Send Reset Link 📧"}</Btn>
            </>
          )}
        </Card>
      </div>
    </div>
  );

  if (!role) return (
    <div style={{ ...S.pg, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ width:"100%", maxWidth:400, textAlign:"center" }}>
        <div style={{ fontSize:52, marginBottom:10 }}>📚</div>
        <h1 style={{ fontSize:26, fontWeight:900, margin:"0 0 6px" }}>English Practice</h1>
        <p style={{ color:"#64748B", fontSize:13, marginBottom:32 }}>Select your role to continue</p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
          {[{r:"student",icon:"👨‍🎓",t:"Student",d:"Practice English"},{r:"admin",icon:"👨‍🏫",t:"Admin",d:"Manage students"}].map(x=>(
            <button key={x.r} onClick={()=>setRole(x.r)} style={{ padding:"24px 16px", borderRadius:14, border:"1.5px solid #334155", background:"#1E293B", cursor:"pointer", textAlign:"center" }}
              onMouseEnter={e=>e.currentTarget.style.borderColor="#6366F1"}
              onMouseLeave={e=>e.currentTarget.style.borderColor="#334155"}>
              <div style={{ fontSize:32, marginBottom:8 }}>{x.icon}</div>
              <div style={{ fontWeight:800, fontSize:15 }}>{x.t}</div>
              <div style={{ color:"#64748B", fontSize:12, marginTop:4 }}>{x.d}</div>
            </button>
          ))}
        </div>
        <button onClick={onGoDeveloper} style={{ background:"none",border:"none",color:"#475569",cursor:"pointer",fontSize:12,textDecoration:"underline" }}>👨‍💻 Developer Panel</button>
      </div>
    </div>
  );

  return (
    <div style={{ ...S.pg, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ width:"100%", maxWidth:380 }}>
        <button onClick={()=>{setRole(null);setError("");}} style={{ background:"none",border:"none",color:"#64748B",cursor:"pointer",fontSize:13,marginBottom:16 }}>← Back</button>
        <div style={{ textAlign:"center", marginBottom:20 }}>
          <div style={{ fontSize:40, marginBottom:8 }}>{role==="student"?"👨‍🎓":"👨‍🏫"}</div>
          <h2 style={{ fontWeight:900 }}>{role==="student"?"Student Login":"Admin Login"}</h2>
        </div>
        <Card>
          <Msg type="error" text={error} />
          <Field label="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@email.com" />
          <Field label="Password" type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Your password" />
          <Btn onClick={doLogin} disabled={loading} color="#6366F1" full style={{ marginBottom:10 }}>{loading?"Logging in…":"Login →"}</Btn>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
            <button onClick={()=>{setShowReset(true);setError("");}} style={{ background:"none",border:"none",color:"#64748B",cursor:"pointer",fontSize:12 }}>Forgot password?</button>
            <button onClick={()=>onGoRegister(role)} style={{ background:"none",border:"none",color:"#6366F1",cursor:"pointer",fontSize:12,fontWeight:700 }}>Create account →</button>
          </div>
        </Card>
      </div>
    </div>
  );
}
