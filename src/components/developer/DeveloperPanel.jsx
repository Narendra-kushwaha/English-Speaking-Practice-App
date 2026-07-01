import { useState, useEffect } from "react";
import { fsAll, fsUpdate } from "../../utils/store";
import { logoutUser } from "../../utils/auth";
import AccountSettings from "../auth/AccountSettings";
import { Btn, TopBar, Msg } from "../shared/UI";
import { S } from "../../data/questions";

export default function DeveloperPanel({ profile }) {
  const [screen, setScreen] = useState("home");
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (screen === "admins") loadAdmins();
  }, [screen]);

  async function loadAdmins() {
    setLoading(true);

    const all = await fsAll("users");

    setAdmins(all.filter((u) => u.role === "admin"));

    setLoading(false);
  }

  async function toggleBlock(a) {
    const nb = !a.blocked;

    await fsUpdate("users", a.uid, {
      blocked: nb,
    });

    setAdmins((prev) =>
      prev.map((x) =>
        x.uid === a.uid ? { ...x, blocked: nb } : x
      )
    );

    setMsg(
      `${a.fullName} has been ${nb ? "blocked" : "unblocked"}.`
    );

    setTimeout(() => setMsg(""), 3000);
  }

  const filtered = admins.filter(
    (a) =>
      a.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      a.email?.toLowerCase().includes(search.toLowerCase()) ||
      a.adminId?.includes(search)
  );

  // SETTINGS PAGE
  if (screen === "settings") {
    return (
      <AccountSettings
        profile={profile}
        onBack={() => setScreen("home")}
      />
    );
  }

  // HOME
  if (screen === "home") {
    return (
      <div style={S.pg}>
        <div style={S.wrap}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24,
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <div>
              <div
                style={{
                  color: "#8B5CF6",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                👨‍💻 DEVELOPER PANEL
              </div>

              <div style={{ fontWeight: 800, fontSize: 20 }}>
                {profile?.fullName}
              </div>

              <div style={{ color: "#64748B", fontSize: 12 }}>
                {profile?.email}
              </div>
            </div>

            <Btn onClick={logoutUser} color="#EF4444" sm>
              Logout
            </Btn>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(200px,1fr))",
              gap: 14,
            }}
          >
            {[
              {
                key: "admins",
                icon: "👨‍🏫",
                t: "All Admins",
                d: "View and manage admin accounts",
              },
              {
                key: "settings",
                icon: "⚙️",
                t: "Account Settings",
                d: "Change password, email or mobile",
              },
            ].map((m) => (
              <button
                key={m.key}
                onClick={() => setScreen(m.key)}
                style={{
                  padding: "22px 18px",
                  borderRadius: 14,
                  border: "1.5px solid #8B5CF644",
                  background: "#1E293B",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div style={{ fontSize: 28 }}>{m.icon}</div>

                <div style={{ fontWeight: 800, fontSize: 15 }}>
                  {m.t}
                </div>

                <div style={{ color: "#475569", fontSize: 12, marginTop: 6 }}>
                  {m.d}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ADMINS
  return (
    <div style={S.pg}>
      <div style={S.wrap}>
        <TopBar
          onBack={() => setScreen("home")}
          title="👨‍🏫 All Admins"
          right={
            <button
              onClick={loadAdmins}
              style={{
                background: "#1E293B",
                border: "1.5px solid #334155",
                color: "#94A3B8",
                borderRadius: 8,
                padding: "7px 12px",
                cursor: "pointer",
              }}
            >
              ↻
            </button>
          }
        />

        <Msg type="success" text={msg} />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Search name, email or Admin ID…"
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: 10,
            background: "#1E293B",
            border: "1.5px solid #334155",
            color: "#fff",
            marginBottom: 16,
          }}
        />

        {loading && (
          <div style={{ textAlign: "center", padding: 40 }}>
            Loading...
          </div>
        )}

        {filtered.map((a) => (
          <div
            key={a.uid}
            style={{
              ...S.card,
              display: "flex",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div style={{ fontSize: 24 }}>👨‍🏫</div>

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>{a.fullName}</div>

              <div style={{ color: "#64748B", fontSize: 12 }}>
                {a.email} 📱 {a.mobile}
              </div>

              <div style={{ color: "#FCD34D", fontSize: 12 }}>
                🔑 Admin ID: {a.adminId}
              </div>
            </div>

            <Btn
              onClick={() => toggleBlock(a)}
              color={a.blocked ? "#22C55E" : "#EF4444"}
              sm
            >
              {a.blocked ? "Unblock" : "Block"}
            </Btn>
          </div>
        ))}
      </div>
    </div>
  );
}