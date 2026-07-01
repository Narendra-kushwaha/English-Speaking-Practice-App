import { useState } from "react";
import { registerAdmin, registerStudent } from "../../utils/auth";
import { DEV_SECRET } from "../../keys";
import { Btn, Field, Msg, Card } from "../shared/UI";
import { S } from "../../data/questions";

export default function RegisterScreen({ role, onBack }) {
  const [name, setName]     = useState("");
  const [email, setEmail]   = useState("");
  const [mobile, setMobile] = useState("");
  const [pass, setPass]     = useState("");
  const [conf, setConf]     = useState("");
  const [devKey, setDevKey] = useState("");
  const [adminId, setAdminId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [done, setDone]     = useState(false);
  const [generatedAdminId, setGeneratedAdminId] = useState("");

  async function doRegister() {
    setError("");
    if (!name||!email||!mobile||!pass||!conf) { setError("Please fill all fields."); return; }
    if (pass !== conf)      { setError("Passwords do not match."); return; }
    if (pass.length < 6)    { setError("Password must be at least 6 characters."); return; }
    if (mobile.length < 10) { setError("Enter a valid mobile number."); return; }

    if (role === "admin") {
      if (devKey !== DEV_SECRET) { setError("Invalid Developer Secret Key."); return; }
      setLoading(true);
      try {
        const { adminId: newId } = await registerAdmin(email, pass, { fullName: name, mobile });
        setGeneratedAdminId(newId);
        setDone(true);
      } catch(e) {
        setError(e.message.includes("email-already-in-use") ? "This email is already registered." : e.message);
      }
      setLoading(false);
    } else {
      if (!adminId || adminId.length !== 8) { setError("Enter the 8-digit Admin ID given by your admin/teacher."); return; }
      setLoading(true);
      try {
        await registerStudent(email, pass, { fullName: name, mobile }, adminId);
        setDone(true);
      } catch(e) {
        setError(e.message.includes("email-already-in-use") ? "This email is already registered." : e.message);
      }
      setLoading(false);
    }
  }

  if (done) return (
    <div style={{ ...S.pg, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ width:"100%", maxWidth:400, textAlign:"center" }}>
        <div style={{ fontSize:52, marginBottom:16 }}>✅</div>
        <h2 style={{ fontWeight:900, marginBottom:8 }}>Account Created!</h2>
        <p style={{ color:"#64748B", fontSize:13, marginBottom:20, lineHeight:1.6 }}>
          Verification email sent to <strong style={{ color:"#F8FAFC" }}>{email}</strong>. Verify it before logging in.
        </p>
        {role === "admin" && generatedAdminId && (
          <Card style={{ textAlign:"left", marginBottom:20 }}>
            <div style={{ fontSize:11, color:"#F59E0B", fontWeight:700, letterSpacing:1, marginBottom:8 }}>🔑 YOUR PERMANENT ADMIN ID</div>
            <div style={{ fontSize:28, fontWeight:900, color:"#FCD34D", textAlign:"center", letterSpacing:4, padding:"12px", background:"#0F172A", borderRadius:10 }}>
              {generatedAdminId}
            </div>
            <div style={{ fontSize:12, color:"#94A3B8", marginTop:10, lineHeight:1.6 }}>
              ⚠️ Save this ID! Give it to your students — they will need it to register under you. This ID never changes.
            </div>
          </Card>
        )}
        <Btn onClick={onBack} color="#6366F1" full>Go to Login →</Btn>
      </div>
    </div>
  );

  return (
    <div style={{ ...S.pg, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ width:"100%", maxWidth:400 }}>
        <button onClick={onBack} style={{ background:"none",border:"none",color:"#64748B",cursor:"pointer",fontSize:13,marginBottom:16 }}>← Back</button>
        <div style={{ textAlign:"center", marginBottom:20 }}>
          <div style={{ fontSize:40, marginBottom:8 }}>{role==="student"?"👨‍🎓":"👨‍🏫"}</div>
          <h2 style={{ fontWeight:900 }}>{role==="student"?"Student Registration":"Admin Registration"}</h2>
          {role==="admin" && <p style={{ color:"#F59E0B", fontSize:12, marginTop:6 }}>⚠️ Developer Secret Key required</p>}
          {role==="student" && <p style={{ color:"#6366F1", fontSize:12, marginTop:6 }}>📋 You'll need your Admin's 8-digit ID</p>}
        </div>
        <Card>
          <Msg type="error" text={error} />
          <Field label="Full Name *"        value={name}   onChange={e=>setName(e.target.value)}   placeholder="Rahul Sharma" />
          <Field label="Email *"   type="email" value={email}  onChange={e=>setEmail(e.target.value)}  placeholder="you@email.com" />
          <Field label="Mobile *"  type="tel"   value={mobile} onChange={e=>setMobile(e.target.value)} placeholder="9876543210" />
          <Field label="Password *" type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Min 6 characters" />
          <Field label="Confirm Password *" type="password" value={conf} onChange={e=>setConf(e.target.value)} placeholder="Repeat password" />
          {role==="admin" && (
            <Field label="Developer Secret Key *" type="password" value={devKey} onChange={e=>setDevKey(e.target.value)} placeholder="Secret key" />
          )}
          {role==="student" && (
            <Field label="Admin ID * (8 digits)" value={adminId} onChange={e=>setAdminId(e.target.value.replace(/\D/g,"").slice(0,8))} placeholder="12345678" />
          )}
          <Btn onClick={doRegister} disabled={loading} color="#6366F1" full>{loading?"Creating…":"Create Account 🚀"}</Btn>
        </Card>
      </div>
    </div>
  );
}
