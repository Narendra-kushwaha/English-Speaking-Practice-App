import { useState } from "react";
import { logoutUser } from "../../utils/auth";
import QuestionManager from "./QuestionManager";
import UserManager from "./UserManager";
import GroupManager from "./GroupManager";
import AccountSettings from "../auth/AccountSettings";
import CertificateSettings from "./CertificateSettings";
import CertificateManager from "./CertificateManager";
import AnnouncementManager from "./AnnouncementManager";
import { Btn } from "../shared/UI";
import { S } from "../../data/questions";

export default function AdminPanel({ profile }) {
  const [screen, setScreen] = useState("home");

  if (profile?.blocked) {
    return (
      <div style={{ ...S.pg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: 24, maxWidth: 360 }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🚫</div>
          <div style={{ fontWeight: 900, fontSize: 20, color: "#EF4444", marginBottom: 8 }}>
            You Are Blocked
          </div>
          <div style={{ color: "#94A3B8", fontSize: 14, marginBottom: 24 }}>
            Contact Developer: 📱{" "}
            <strong style={{ color: "#F8FAFC" }}>{profile?.devMobile || "N/A"}</strong>
          </div>
          <Btn onClick={logoutUser} color="#EF4444" full>
            Logout
          </Btn>
        </div>
      </div>
    );
  }

  if (screen === "questions") return <QuestionManager onBack={() => setScreen("home")} adminId={profile.adminId} />;
  if (screen === "users") return <UserManager onBack={() => setScreen("home")} adminId={profile.adminId} />;
  if (screen === "groups") return <GroupManager onBack={() => setScreen("home")} adminProfile={profile} />;
  if (screen === "settings") return <AccountSettings profile={profile} onBack={() => setScreen("home")} />;
  if (screen === "certSettings") return <CertificateSettings onBack={() => setScreen("home")} adminProfile={profile} />;
  if (screen === "certManager") return <CertificateManager onBack={() => setScreen("home")} adminProfile={profile} />;
  if (screen === "announcement") return <AnnouncementManager onBack={() => setScreen("home")} adminProfile={profile} />;

  const menus = [
    { key: "questions", icon: "📝", t: "Question Manager", d: "Add or delete Fill Blanks, Hindi→English, Writing prompts" },
    { key: "users", icon: "👥", t: "Student Manager", d: "Track scores, daily/level progress, block or unblock" },
    { key: "groups", icon: "💬", t: "Group Discussion", d: "Create batch groups and manage chats" },
    { key: "announcement", icon: "📢", t: "Announcements", d: "Send announcements to all your students" },
    { key: "certSettings", icon: "🏛️", t: "Certificate Settings", d: "Upload logo, signature and seal for certificates" },
    { key: "certManager", icon: "🎓", t: "Certificate Manager", d: "Allow students to download their certificates" },
    { key: "settings", icon: "⚙️", t: "Account Settings", d: "Change password, email or mobile" },
  ];

  return (
    <div style={S.pg}>
      <div style={S.wrap}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ color: "#F59E0B", fontSize: 12, fontWeight: 700 }}>👨‍🏫 ADMIN PANEL</div>
            <div style={{ fontWeight: 800, fontSize: 20 }}>{profile?.fullName}</div>
            <div style={{ color: "#64748B", fontSize: 12 }}>{profile?.email}</div>
          </div>
          <Btn onClick={logoutUser} color="#EF4444" sm>
            Logout
          </Btn>
        </div>

        <div style={{ background: "linear-gradient(135deg,#F59E0B22,#FCD34D11)", border: "1.5px solid #F59E0B44", borderRadius: 14, padding: "16px 20px", marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: "#F59E0B", fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>
            🔑 YOUR PERMANENT ADMIN ID
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#FCD34D", letterSpacing: 3 }}>
              {profile?.adminId}
            </div>
            <span style={{ color: "#94A3B8", fontSize: 12 }}>
              Share this with students so they can register under you
            </span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
          {menus.map((m) => (
            <button
              key={m.key}
              onClick={() => setScreen(m.key)}
              style={{
                padding: "22px 18px",
                borderRadius: 14,
                border: "1.5px solid #F59E0B33",
                background: "#1E293B",
                cursor: "pointer",
                textAlign: "left",
                width: "100%",
                boxSizing: "border-box",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#F59E0B")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#F59E0B33")}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>{m.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 15 }}>{m.t}</div>
              <div style={{ color: "#475569", fontSize: 12, marginTop: 6, lineHeight: 1.5 }}>{m.d}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}