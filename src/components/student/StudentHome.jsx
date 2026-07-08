import { useState, useEffect } from "react";
import { logoutUser } from "../../utils/auth";
import { getProgress, getTodayStats } from "../../utils/progress";
import FillMode from "./FillMode";
import HindiMode from "./HindiMode";
import WritingMode from "./WritingMode";
import StudentGroups from "./StudentGroups";
import AccountSettings from "../auth/AccountSettings";
import { Btn } from "../shared/UI";
import { LC, LEVELS, S } from "../../data/questions";

export default function StudentHome({ profile }) {
  const [screen, setScreen] = useState("home");
  const [level, setLevel] = useState("Beginner");
  const [progress, setProgress] = useState(null);

  const lc = LC[level];

  useEffect(() => {
    if (screen === "home") loadProgress();
  }, [screen]);

  async function loadProgress() {
    const p = await getProgress(profile.uid);
    setProgress(p);
  }

  // Blocked screen
if (profile?.blocked) {
  return (
    <div style={{ ...S.pg, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ textAlign:"center", padding:24, maxWidth:360 }}>
        <div style={{ fontSize:52, marginBottom:16 }}>🚫</div>
        <div style={{ fontWeight:900, fontSize:20, color:"#EF4444", marginBottom:8 }}>You Are Blocked</div>
        <div style={{ color:"#94A3B8", fontSize:14, marginBottom:24 }}>
          Contact Admin: 📱 <strong style={{ color:"#F8FAFC" }}>{profile?.adminMobile || "N/A"}</strong>
        </div>
        {/* <div style={{ color:"#94A3B8", fontSize:14, lineHeight:1.7, marginBottom:24 }}>
          Your account has been blocked by your Admin.<br/>
          Please contact your admin for further assistance.
        </div> */}
        <Btn onClick={logoutUser} color="#EF4444" full>Logout</Btn>
      </div>
    </div>
  );
}

  if (screen === "fill")
    return (
      <FillMode
        level={level}
        onBack={() => setScreen("home")}
        uid={profile.uid}
        adminId={profile.adminId}
      />
    );

  if (screen === "hindi")
    return (
      <HindiMode
        level={level}
        onBack={() => setScreen("home")}
        uid={profile.uid}
        adminId={profile.adminId}
      />
    );

  if (screen === "writing")
    return (
      <WritingMode
        level={level}
        onBack={() => setScreen("home")}
        uid={profile.uid}
        adminId={profile.adminId}
      />
    );

  if (screen === "groups")
    return <StudentGroups profile={profile} onBack={() => setScreen("home")} />;

  if (screen === "settings")
    return <AccountSettings profile={profile} onBack={() => setScreen("home")} />;

  const today = progress
    ? getTodayStats(progress)
    : { attempted: 0, correct: 0, wrong: 0 };

  const totalC = today.correct || 0;
  const totalW = today.wrong || 0;

  const completed = totalC + totalW;
  const totalQ = completed;

  const accuracy =
    completed > 0 ? ((totalC / completed) * 100).toFixed(1) : "0.0";

  const totalScore = progress?.totalScore || 0;

  return (
    <div style={S.pg}>
      <div style={S.wrap}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div>
            <div style={{ color: "#64748B", fontSize: 12 }}>
              Welcome back 👋
            </div>
            <div style={{ fontWeight: 800, fontSize: 20 }}>
              {profile?.fullName}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setScreen("settings")}
              style={{
                background: "#1E293B",
                border: "1.5px solid #334155",
                color: "#94A3B8",
                borderRadius: 9,
                padding: "8px 13px",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              ⚙️
            </button>

            <Btn onClick={logoutUser} color="#EF4444" sm>
              Logout
            </Btn>
          </div>
        </div>

        {/* ── MY PROGRESS ─────────────────────────────────────────────── */}
        {progress && (
          <>
            {/* Total Score */}
            <div
              style={{
                background:
                  "linear-gradient(135deg,#F59E0B22,#FCD34D11)",
                border: "1.5px solid #F59E0B44",
                borderRadius: 14,
                padding: "18px 20px",
                marginBottom: 14,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "#F59E0B",
                  fontWeight: 700,
                  letterSpacing: 1,
                  marginBottom: 4,
                }}
              >
                ⭐ TOTAL SCORE
              </div>

              <div style={{ fontSize: 36, fontWeight: 900, color: "#FCD34D" }}>
                {totalScore}{" "}
                <span style={{ fontSize: 16, color: "#94A3B8" }}>
                  Points
                </span>
              </div>
            </div>

            {/* Today Stats */}
            <div style={S.card}>
              <div style={{ ...S.lbl, marginBottom: 12 }}>📅 Today</div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <Stat label="Total Questions" value={totalQ} color="#60A5FA" />
                <Stat label="Correct" value={totalC} color="#22C55E" />
                <Stat label="Wrong" value={totalW} color="#EF4444" />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingTop: 10,
                  borderTop: "1px solid #334155",
                }}
              >
                <span style={{ color: "#94A3B8", fontSize: 13 }}>
                  Accuracy:{" "}
                  <strong style={{ color: "#F8FAFC" }}>{accuracy}%</strong>
                </span>

                <span style={{ color: "#94A3B8", fontSize: 13 }}>
                  Completed:{" "}
                  <strong style={{ color: "#F8FAFC" }}>
                    {completed}/{totalQ}
                  </strong>
                </span>
              </div>
            </div>

            {/* Level Progress */}
            <div style={S.card}>
              <div style={{ ...S.lbl, marginBottom: 12 }}>
                📈 Level Progress
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr 1fr",
                  gap: 6,
                  fontSize: 11,
                  color: "#64748B",
                  fontWeight: 700,
                  marginBottom: 8,
                  paddingBottom: 8,
                  borderBottom: "1px solid #334155",
                }}
              >
                <span>Level</span>
                <span style={{ textAlign: "center" }}>Attempted</span>
                <span style={{ textAlign: "center" }}>Correct</span>
                <span style={{ textAlign: "center" }}>Progress</span>
              </div>

              {LEVELS.map((lv) => {
                const ls = progress.levelStats?.[lv] || {
                  attempted: 0,
                  correct: 0,
                };

                const totalForLevel = ls.attempted;
                const pct =
                  totalForLevel > 0
                    ? Math.round((ls.correct / totalForLevel) * 100)
                    : 0;

                return (
                  <div
                    key={lv}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr 1fr",
                      gap: 6,
                      alignItems: "center",
                      padding: "8px 0",
                      fontSize: 13,
                    }}
                  >
                    <span style={{ color: LC[lv].accent, fontWeight: 700 }}>
                      {LC[lv].emoji} {lv}
                    </span>

                    <span style={{ textAlign: "center", color: "#94A3B8" }}>
                      {ls.attempted}
                    </span>

                    <span style={{ textAlign: "center", color: "#22C55E" }}>
                      {ls.correct}
                    </span>

                    <span style={{ textAlign: "center", fontWeight: 700 }}>
                      {pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Level selector */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 20,
            marginTop: 6,
            flexWrap: "wrap",
          }}
        >
          {LEVELS.map((lv) => (
            <button
              key={lv}
              onClick={() => setLevel(lv)}
              style={{
                flex: "1 1 80px",
                padding: "10px 8px",
                borderRadius: 10,
                border: `2px solid ${
                  level === lv ? LC[lv].accent : "#334155"
                }`,
                background:
                  level === lv ? `${LC[lv].accent}22` : "#1E293B",
                color: level === lv ? LC[lv].accent : "#64748B",
                cursor: "pointer",
                fontWeight: 800,
                fontSize: 13,
              }}
            >
              {LC[lv].emoji} {lv}
            </button>
          ))}
        </div>

        {/* Mode cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
            gap: 14,
            marginBottom: 14,
          }}
        >
          {[
            {
              key: "fill",
              icon: "🔤",
              title: "Fill in the Blanks",
              sub: "Choose the right word",
              desc: "English sentence with ___ — pick 1 of 4 options",
            },
            {
              key: "hindi",
              icon: "🔄",
              title: "Hindi → English",
              sub: "Type the translation",
              desc: "Hindi sentence given — type it in English",
            },
            {
              key: "writing",
              icon: "✍️",
              title: "Writing Practice",
              sub: "Write a paragraph",
              desc: "Hindi paragraph given — write it in English",
            },
          ].map((m) => (
            <button
              key={m.key}
              onClick={() => setScreen(m.key)}
              style={{
                padding: "20px 16px",
                borderRadius: 14,
                border: `1.5px solid ${lc.accent}33`,
                background: "#1E293B",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div style={{ fontSize: 28 }}>{m.icon}</div>
              <div style={{ fontWeight: 800 }}>{m.title}</div>
              <div style={{ color: lc.accent, fontSize: 11 }}>{m.sub}</div>
              <div style={{ color: "#475569", fontSize: 12 }}>{m.desc}</div>
            </button>
          ))}
        </div>

        {/* Groups */}
        <button
          onClick={() => setScreen("groups")}
          style={{
            width: "100%",
            padding: "18px",
            borderRadius: 14,
            border: "1.5px solid #6366F133",
            background: "#1E293B",
            cursor: "pointer",
          }}
        >
          💬 Group Discussion
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ color, fontWeight: 900, fontSize: 20 }}>{value}</div>
      <div style={{ color: "#475569", fontSize: 10 }}>{label}</div>
    </div>
  );
}