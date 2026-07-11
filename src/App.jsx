import { useState } from "react";
import { useAuth }       from "./hooks/useAuth";
import LoginScreen       from "./components/auth/LoginScreen";
import RegisterScreen    from "./components/auth/RegisterScreen";
import DeveloperAuth     from "./components/developer/DeveloperAuth";
import StudentHome       from "./components/student/StudentHome";
import AdminPanel        from "./components/admin/AdminPanel";
import DeveloperPanel    from "./components/developer/DeveloperPanel";
import { S } from "./data/questions";
import VerifyCertificate from "./components/shared/VerifyCertificate";

export default function App() {
  const { user, profile, loading } = useAuth();
  const params = new URLSearchParams(window.location.search);
  const verifyCertificateId = params.get("verify");
  const [authScreen, setAuthScreen]     = useState("login");
  const [registerRole, setRegisterRole] = useState("student");
  if (verifyCertificateId) {
    return <VerifyCertificate certificateId={verifyCertificateId} />;
  }

  if (loading) return (
    <div style={{ ...S.pg, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>📚</div>
        <div style={{ color:"#64748B", fontSize:14 }}>Loading…</div>
      </div>
    </div>
  );

  if (user && profile) {
    if (profile.role === "developer") return <DeveloperPanel profile={profile} />;
    if (profile.role === "admin")     return <AdminPanel     profile={profile} />;
    if (profile.role === "student")   return <StudentHome    profile={profile} />;
  }

  if (authScreen === "developerAuth") return <DeveloperAuth onBack={() => setAuthScreen("login")} />;

  if (authScreen === "register") return (
    <RegisterScreen role={registerRole} onBack={() => setAuthScreen("login")} />
  );

  return (
    <LoginScreen
      onGoRegister={(role) => { setRegisterRole(role); setAuthScreen("register"); }}
      onGoDeveloper={() => setAuthScreen("developerAuth")}
    />
  );
}
