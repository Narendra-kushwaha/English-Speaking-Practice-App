import { useState } from "react";
import { loginUser, registerDeveloper, resetPassword } from "../../utils/auth";
import { fsGet } from "../../utils/store";
import { DEV_SECRET } from "../../keys";
import { Btn, Field, Msg, Card } from "../shared/UI";
import { S } from "../../data/questions";

export default function DeveloperAuth({ onBack }) {
  const [mode, setMode]         = useState("login");
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [mobile, setMobile]     = useState("");
  const [pass, setPass]         = useState("");
  const [conf, setConf]         = useState("");
  const [devKey, setDevKey]     = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");

  function reset() { setError(""); setSuccess(""); }

  async function doLogin() {
    reset();
    if (!email||!pass) { setError("Fill all fields."); return; }
    setLoading(true);
    try {
      const u = await loginUser(email, pass);
      const p = await fsGet("users", u.uid);
      if (!p)                    { setError("Account not found."); setLoading(false); return; }
      if (p.role!=="developer")  { setError("This is not a developer account."); setLoading(false); return; }
      if (p.blocked)             { setError("Your account is blocked."); setLoading(false); return; }
    } catch(e) {
      setError(e.message.includes("wrong-password")||e.message.includes("user-not-found")?"Invalid email or password.":e.message);
    }
    setLoading(false);
  }

  async function doRegister() {
    reset();
    if (!name||!email||!mobile||!pass||!conf||!devKey) { setError("All fields required."); return; }
    if (pass!==conf)     { setError("Passwords do not match."); return; }
    if (pass.length<6)   { setError("Password min 6 characters."); return; }
    if (mobile.length<10){ setError("Enter valid mobile number."); return; }
    if (devKey!==DEV_SECRET) { setError("Invalid Developer Secret Key."); return; }
    setLoading(true);
    try {
      await registerDeveloper(email, pass, { fullName:name, mobile });
      setSuccess("✅ Account created! Verify your email then login.");
      setMode("login"); setName(""); setMobile(""); setPass(""); setConf(""); setDevKey("");
    } catch(e) {
      setError(e.message.includes("email-already-in-use")?"Email already registered.":e.message);
    }
    setLoading(false);
  }

  async function doReset() {
    reset();
    if (!resetEmail) { setError("Enter your email."); return; }
    setLoading(true);
    try { await resetPassword(resetEmail); setSuccess("✅ Reset link sent! Check your email."); }
    catch { setError("Could not send reset email."); }
    setLoading(false);
  }

  return (
    <div style={{ ...S.pg, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ width:"100%", maxWidth:400 }}>
        <button onClick={onBack} style={{ background:"none",border:"none",color:"#64748B",cursor:"pointer",fontSize:13,marginBottom:16 }}>← Back</button>
        <div style={{ textAlign:"center", marginBottom:20 }}>
          <div style={{ fontSize:48, marginBottom:8 }}>👨‍💻</div>
          <h2 style={{ fontWeight:900, fontSize:22, margin:0 }}>Developer Panel</h2>
          <p style={{ color:"#8B5CF6", fontSize:12, marginTop:6, fontWeight:600 }}>
            {mode==="login"?"Login to developer account":mode==="register"?"Create developer account":"Reset password"}
          </p>
        </div>

        {mode!=="forgot"&&(
          <div style={{ display:"flex", background:"#1E293B", borderRadius:12, padding:4, marginBottom:20, border:"1.5px solid #334155" }}>
            {[["login","Login"],["register","Register"]].map(([m,l])=>(
              <button key={m} onClick={()=>{setMode(m);reset();}} style={{ flex:1, padding:"9px", borderRadius:9, border:"none", background:mode===m?"#8B5CF6":"transparent", color:mode===m?"white":"#64748B", fontWeight:800, fontSize:13, cursor:"pointer" }}>{l}</button>
            ))}
          </div>
        )}

        <Card>
          <Msg type="error"   text={error} />
          <Msg type="success" text={success} />

          {mode==="login"&&<>
            <Field label="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="dev@email.com" />
            <Field label="Password" type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Your password" />
            <Btn onClick={doLogin} disabled={loading} color="#8B5CF6" full style={{ marginBottom:10 }}>{loading?"Logging in…":"Login →"}</Btn>
            <button onClick={()=>{setMode("forgot");reset();}} style={{ background:"none",border:"none",color:"#64748B",cursor:"pointer",fontSize:12,width:"100%",textAlign:"center" }}>Forgot password?</button>
          </>}

          {mode==="register"&&<>
            <Field label="Full Name *"             value={name}   onChange={e=>setName(e.target.value)}   placeholder="Your name" />
            <Field label="Email *"       type="email"    value={email}  onChange={e=>setEmail(e.target.value)}  placeholder="dev@email.com" />
            <Field label="Mobile *"      type="tel"      value={mobile} onChange={e=>setMobile(e.target.value)} placeholder="9876543210" />
            <Field label="Password *"    type="password" value={pass}   onChange={e=>setPass(e.target.value)}   placeholder="Min 6 characters" />
            <Field label="Confirm Password *" type="password" value={conf} onChange={e=>setConf(e.target.value)} placeholder="Repeat password" />
            <Field label="Developer Secret Key *" type="password" value={devKey} onChange={e=>setDevKey(e.target.value)} placeholder="Secret key" />
            <Btn onClick={doRegister} disabled={loading} color="#8B5CF6" full>{loading?"Creating…":"Create Developer Account 🚀"}</Btn>
          </>}

          {mode==="forgot"&&<>
            <div style={{ fontSize:13, color:"#94A3B8", lineHeight:1.7, marginBottom:14 }}>Enter your registered email to receive a reset link.</div>
            <Field label="Email" type="email" value={resetEmail} onChange={e=>setResetEmail(e.target.value)} placeholder="dev@email.com" />
            <Btn onClick={doReset} disabled={loading} color="#8B5CF6" full style={{ marginBottom:10 }}>{loading?"Sending…":"Send Reset Link 📧"}</Btn>
            <button onClick={()=>{setMode("login");reset();}} style={{ background:"none",border:"none",color:"#64748B",cursor:"pointer",fontSize:12,width:"100%",textAlign:"center" }}>← Back to Login</button>
          </>}
        </Card>
      </div>
    </div>
  );
}
