import { useState, useEffect } from "react";
import { fsWhere, fsUpdate, fsGet } from "../../utils/store";
import { S, LEVELS, LC } from "../../data/questions";
import { Btn, TopBar, Msg } from "../shared/UI";

const today = () => new Date().toISOString().slice(0, 10);

export default function UserManager({ onBack, adminId }) {
  const [students, setStudents] = useState([]);
  const [scores, setScores] = useState({}); // uid -> progress data
  const [questionCount, setQuestionCount] = useState({});

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState("");
  const [view, setView] = useState("list"); // list | leaderboard

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    setLoading(true);

    const all = await fsWhere("users", "adminId", "==", adminId);
    const list = all.filter((u) => u.role === "student");
    setStudents(list);

    const progMap = {};

    await Promise.all(
      list.map(async (s) => {
        const p = await fsGet("progress", s.uid);

        progMap[s.uid] = p || {
          totalAttempted: 0,
          totalCorrect: 0,
          dailyStats: {},
          levelStats: {},
        };
      })
    );

    setScores(progMap);

    const counts = {};

    for (const lv of LEVELS) {
      const fill = await fsGet("questions", `q_${adminId}_fill_${lv}`);
      const hindi = await fsGet("questions", `q_${adminId}_hindi_${lv}`);
      const writing = await fsGet("questions", `q_${adminId}_writing_${lv}`);

      counts[lv] =
        (fill?.list?.length || 0) +
        (hindi?.list?.length || 0) +
        (writing?.list?.length || 0);
    }

    setQuestionCount(counts);
    setLoading(false);
  }

  async function toggleBlock(stu) {
    const nb = !stu.blocked;

    await fsUpdate("users", stu.uid, { blocked: nb });

    setStudents((prev) =>
      prev.map((s) =>
        s.uid === stu.uid ? { ...s, blocked: nb } : s
      )
    );

    setMsg(
      `${stu.fullName} has been ${nb ? "blocked" : "unblocked"}.`
    );

    setTimeout(() => setMsg(""), 3000);
  }

  const filtered = students.filter(
    (s) =>
      s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase())
  );

  function todayPoints(uid) {
  const p = scores[uid];

  if (!p) return 0;

  const d = p.dailyStats?.[today()];

  return d?.points || 0;
}

  // function todayPoints(uid) {
  //   const p = scores[uid];
  //   if (!p) return 0;

  //   const d = p.dailyStats?.[today()];
  //   return d ? d.correct || 0 : 0;
  // }

  const top3 = [...students]
    .sort((a, b) => todayPoints(b.uid) - todayPoints(a.uid))
    .slice(0, 3);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div style={S.pg}>
      <div style={S.wrap}>
        <TopBar
          onBack={onBack}
          title="👥 Student Manager"
          right={
            <button
              onClick={loadStudents}
              style={{
                background: "#1E293B",
                border: "1.5px solid #334155",
                color: "#94A3B8",
                borderRadius: 8,
                padding: "7px 12px",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              ↻
            </button>
          }
        />

        <Msg type="success" text={msg} />

        {/* VIEW SWITCH */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {[
            ["list", "📋 All Students"],
            ["leaderboard", "🏆 Top 3 Today"],
          ].map(([v, l]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                flex: 1,
                padding: "10px 8px",
                borderRadius: 10,
                border: `2px solid ${
                  view === v ? "#6366F1" : "#334155"
                }`,
                background: view === v ? "#6366F122" : "#1E293B",
                color: view === v ? "#818CF8" : "#64748B",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              {l}
            </button>
          ))}
        </div>

        {/* LEADERBOARD */}
        {view === "leaderboard" && (
          <>
            {top3.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 0",
                  color: "#475569",
                }}
              >
                No activity yet today.
              </div>
            )}

            {top3.map((s, i) => (
              <div
                key={s.uid}
                style={{
                  ...S.card,
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  background:
                    i === 0
                      ? "linear-gradient(135deg,#F59E0B22,#FCD34D11)"
                      : "#1E293B",
                  borderColor: i === 0 ? "#F59E0B" : "#334155",
                }}
              >
                <div style={{ fontSize: 32 }}>{medals[i]}</div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>
                    {s.fullName}
                  </div>
                  <div style={{ color: "#64748B", fontSize: 12 }}>
                    {s.email}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      color: "#FCD34D",
                      fontWeight: 900,
                      fontSize: 20,
                    }}
                  >
                    {todayPoints(s.uid)}
                  </div>
                  <div style={{ color: "#475569", fontSize: 10 }}>
                      points today
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* LIST */}
        {view === "list" && (
          <>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Search by name or email…"
              style={{ ...S.inp, marginBottom: 16 }}
            />

            {loading && (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 0",
                  color: "#64748B",
                }}
              >
                Loading students…
              </div>
            )}

            {!loading && filtered.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 0",
                  color: "#475569",
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
                <div>
                  No students found. Share your Admin ID with students to let them join.
                </div>
              </div>
            )}

            {filtered.map((s) => {
              const p = scores[s.uid] || {};

              const completed =
                (p.totalCorrect || 0) + (p.totalWrong || 0);

              const totalCorrect = p.totalCorrect || 0;
              const totalWrong = p.totalWrong || 0;

              const accuracy =
                completed > 0
                  ? Math.round((totalCorrect / completed) * 100)
                  : 0;

              return (
                <div key={s.uid} style={{ ...S.card }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      flexWrap: "wrap",
                      marginBottom: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: s.blocked ? "#450A0A" : "#14532D",
                        border: `2px solid ${
                          s.blocked ? "#EF4444" : "#22C55E"
                        }`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 18,
                      }}
                    >
                      👨‍🎓
                    </div>

                    <div style={{ flex: 1, minWidth: 120 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>
                        {s.fullName}
                      </div>
                      <div style={{ color: "#64748B", fontSize: 12 }}>
                        {s.email} · 📱 {s.mobile}
                      </div>

                      {s.blocked && (
                        <span
                          style={{
                            background: "#450A0A",
                            border: "1px solid #EF4444",
                            borderRadius: 6,
                            padding: "2px 8px",
                            fontSize: 11,
                            color: "#FCA5A5",
                            fontWeight: 700,
                          }}
                        >
                          BLOCKED
                        </span>
                      )}
                    </div>

                    <Btn
                      onClick={() => toggleBlock(s)}
                      color={s.blocked ? "#22C55E" : "#EF4444"}
                      sm
                    >
                      {s.blocked ? "Unblock" : "Block"}
                    </Btn>
                  </div>

                  {/* STATS */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4,1fr)",
                      gap: 8,
                      paddingTop: 10,
                      borderTop: "1px solid #334155",
                    }}
                  >
                    <div style={{ textAlign: "center" }}>
                      <div style={{ color: "#60A5FA", fontWeight: 800, fontSize: 16 }}>
                        {completed}
                      </div>
                      <div style={{ color: "#475569", fontSize: 10 }}>
                        📚 Completed
                      </div>
                    </div>

                    <div style={{ textAlign: "center" }}>
                      <div style={{ color: "#22C55E", fontWeight: 800, fontSize: 16 }}>
                        {totalCorrect}
                      </div>
                      <div style={{ color: "#475569", fontSize: 10 }}>
                        ✅ Correct
                      </div>
                    </div>

                    <div style={{ textAlign: "center" }}>
                      <div style={{ color: "#EF4444", fontWeight: 800, fontSize: 16 }}>
                        {totalWrong}
                      </div>
                      <div style={{ color: "#475569", fontSize: 10 }}>
                        ❌ Wrong
                      </div>
                    </div>

                    <div style={{ textAlign: "center" }}>
                      <div style={{ color: "#F59E0B", fontWeight: 800, fontSize: 16 }}>
                        {accuracy}%
                      </div>
                      <div style={{ color: "#475569", fontSize: 10 }}>
                        🎯 Accuracy
                      </div>
                    </div>
                  </div>

                  {/* LEVEL STATS */}
                  {p.levelStats &&
                    Object.keys(p.levelStats).length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          marginTop: 10,
                          paddingTop: 10,
                          borderTop: "1px solid #334155",
                          flexWrap: "wrap",
                        }}
                      >
                        {LEVELS.map((lv) => {
                          const ls = p.levelStats?.[lv] || {
                            attempted: 0,
                            correct: 0,
                          };

                          const totalQuestions =
                            questionCount[lv] || 0;

                          return (
                            <span
                              key={lv}
                              style={{
                                fontSize: 11,
                                color: LC[lv].accent,
                                background: `${LC[lv].accent}15`,
                                padding: "4px 10px",
                                borderRadius: 6,
                              }}
                            >
                              {LC[lv].emoji} {lv} {ls.correct}/{totalQuestions}
                            </span>
                          );
                        })}
                      </div>
                    )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}