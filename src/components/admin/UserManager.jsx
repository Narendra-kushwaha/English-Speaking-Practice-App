import { useState, useEffect } from "react";
import {
  fsWhere,
  fsUpdate,
  fsGet,
  fsSet,
} from "../../utils/store";
import {
  unblockModeForToday,
} from "../../utils/progress";
import { S, LEVELS, LC } from "../../data/questions";
import { Btn, TopBar, Msg } from "../shared/UI";

const today = () => new Date().toISOString().slice(0, 10);

const MODE_NAMES = {
  fill: "Fill in the Blanks",
  hindi: "Hindi Practice",
  writing: "Writing Practice",
};

export default function UserManager({ onBack, adminId }) {
  const [students, setStudents] = useState([]);
  const [scores, setScores] = useState({});
  const [certificates, setCertificates] = useState({});
  const [questionCount, setQuestionCount] = useState({});

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState("");
  const [view, setView] = useState("list");
  const [unblocking, setUnblocking] = useState("");

  useEffect(() => {
    loadStudents();
  }, [adminId]);

  async function loadStudents() {
    try {
      setLoading(true);

      const all = await fsWhere(
        "users",
        "adminId",
        "==",
        adminId
      );

      const list = all.filter(
        (user) => user.role === "student"
      );

      setStudents(list);

      const progMap = {};
      const certMap = {};

      await Promise.all(
        list.map(async (student) => {
          const progress = await fsGet(
            "progress",
            student.uid
          );

          progMap[student.uid] = progress || {
            totalAttempted: 0,
            totalCorrect: 0,
            totalWrong: 0,
            totalScore: 0,
            dailyStats: {},
            levelStats: {},
            lockedQuestions: {},
            tabSwitchBlocked: {},
          };

          const cert = await fsGet(
            "certificates",
            student.uid
          );

          certMap[student.uid] = cert || {
            adminId,
            studentId: student.uid,
            studentName: student.fullName,
            studentEmail: student.email,
            allowed: false,
            endDate: "",
          };
        })
      );

      setScores(progMap);
      setCertificates(certMap);

      const counts = {};

      for (const level of LEVELS) {
        const fill = await fsGet(
          "questions",
          `q_${adminId}_fill_${level}`
        );

        const hindi = await fsGet(
          "questions",
          `q_${adminId}_hindi_${level}`
        );

        const writing = await fsGet(
          "questions",
          `q_${adminId}_writing_${level}`
        );

        counts[level] =
          (fill?.list?.length || 0) +
          (hindi?.list?.length || 0) +
          (writing?.list?.length || 0);
      }

      setQuestionCount(counts);
    } catch (error) {
      console.error("Student load error:", error);
      showMessage("Students could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  function showMessage(text) {
    setMsg(text);

    setTimeout(() => {
      setMsg("");
    }, 3000);
  }

  // Existing account/login block logic
  async function toggleBlock(student) {
    try {
      const newBlockedValue = !student.blocked;

      await fsUpdate("users", student.uid, {
        blocked: newBlockedValue,
      });

      setStudents((previousStudents) =>
        previousStudents.map((item) =>
          item.uid === student.uid
            ? {
                ...item,
                blocked: newBlockedValue,
              }
            : item
        )
      );

      showMessage(
        `${student.fullName} has been ${
          newBlockedValue ? "blocked" : "unblocked"
        }.`
      );
    } catch (error) {
      console.error("Account block error:", error);
      showMessage("Student account could not be updated.");
    }
  }

  // Get today's section-wise blocked modes
  function getBlockedModes(uid) {
    const progress = scores[uid];

    if (!progress) {
      return [];
    }

    const blockedToday =
      progress.tabSwitchBlocked?.[today()] || {};

    return Object.entries(blockedToday)
      .filter(([, isBlocked]) => isBlocked === true)
      .map(([mode]) => mode);
  }

  // Admin unblocks only the selected practice mode
  async function handleModeUnblock(student, mode) {
    const actionKey = `${student.uid}_${mode}`;

    try {
      setUnblocking(actionKey);

      const updatedProgress =
        await unblockModeForToday(student.uid, mode);

      setScores((previousScores) => ({
        ...previousScores,
        [student.uid]: updatedProgress,
      }));

      showMessage(
        `${student.fullName}'s ${
          MODE_NAMES[mode] || mode
        } has been unblocked.`
      );
    } catch (error) {
      console.error("Mode unblock error:", error);
      showMessage("Practice section could not be unblocked.");
    } finally {
      setUnblocking("");
    }
  }

  function updateCertificateEndDate(uid, endDate) {
    setCertificates((previousCertificates) => ({
      ...previousCertificates,
      [uid]: {
        ...(previousCertificates[uid] || {}),
        endDate,
      },
    }));
  }

  async function toggleCertificate(student) {
    try {
      const current = certificates[student.uid] || {};
      const nextAllowed = !current.allowed;

      if (nextAllowed && !current.endDate) {
        showMessage(
          "Please select certificate end date first."
        );
        return;
      }

      const progress = scores[student.uid] || {};

      const completed =
        (progress.totalCorrect || 0) +
        (progress.totalWrong || 0);

      const accuracy =
        completed > 0
          ? Math.round(
              ((progress.totalCorrect || 0) / completed) *
                100
            )
          : 0;

      const payload = {
        adminId,
        studentId: student.uid,
        studentName: student.fullName || "",
        studentEmail: student.email || "",
        allowed: nextAllowed,
        allowDownload: nextAllowed,
        endDate: current.endDate || "",
        allowedAt: nextAllowed ? Date.now() : null,
        disabledAt: nextAllowed ? null : Date.now(),
        totalScore: progress.totalScore || 0,
        totalCorrect: progress.totalCorrect || 0,
        totalWrong: progress.totalWrong || 0,
        totalCompleted: completed,
        accuracy,
      };

      await fsSet(
        "certificates",
        student.uid,
        payload
      );

      setCertificates((previousCertificates) => ({
        ...previousCertificates,
        [student.uid]: {
          id: student.uid,
          ...payload,
        },
      }));

      showMessage(
        `${student.fullName}'s certificate has been ${
          nextAllowed ? "unlocked" : "locked"
        }.`
      );
    } catch (error) {
      console.error("Certificate update error:", error);
      showMessage("Certificate could not be updated.");
    }
  }

  const filtered = students.filter((student) => {
    const searchValue = search.trim().toLowerCase();

    return (
      student.fullName
        ?.toLowerCase()
        .includes(searchValue) ||
      student.email
        ?.toLowerCase()
        .includes(searchValue)
    );
  });

  const tabBlockedStudents = filtered.filter(
    (student) =>
      getBlockedModes(student.uid).length > 0
  );

  const tabBlockedCount = students.filter(
    (student) =>
      getBlockedModes(student.uid).length > 0
  ).length;

  function todayPoints(uid) {
    const progress = scores[uid];

    if (!progress) {
      return 0;
    }

    const todayData =
      progress.dailyStats?.[today()];

    return todayData?.points || 0;
  }

  // Existing leaderboard logic remains unchanged
  const top3 = [...students]
    .sort(
      (first, second) =>
        todayPoints(second.uid) -
        todayPoints(first.uid)
    )
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
              type="button"
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

        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          {[
            [
              "list",
              `📋 All Students (${students.length})`,
            ],
            [
              "blockedModes",
              `🚫 Tab Blocked (${tabBlockedCount})`,
            ],
            [
              "leaderboard",
              "🏆 Top 3 Today",
            ],
          ].map(([value, label]) => (
            <button
              type="button"
              key={value}
              onClick={() => setView(value)}
              style={{
                flex: "1 1 130px",
                padding: "10px 8px",
                borderRadius: 10,
                border: `2px solid ${
                  view === value
                    ? "#6366F1"
                    : "#334155"
                }`,
                background:
                  view === value
                    ? "#6366F122"
                    : "#1E293B",
                color:
                  view === value
                    ? "#818CF8"
                    : "#64748B",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              {label}
            </button>
          ))}
        </div>

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

            {top3.map((student, index) => (
              <div
                key={student.uid}
                style={{
                  ...S.card,
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  background:
                    index === 0
                      ? "linear-gradient(135deg,#F59E0B22,#FCD34D11)"
                      : "#1E293B",
                  borderColor:
                    index === 0
                      ? "#F59E0B"
                      : "#334155",
                }}
              >
                <div style={{ fontSize: 32 }}>
                  {medals[index]}
                </div>

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: 15,
                    }}
                  >
                    {student.fullName}
                  </div>

                  <div
                    style={{
                      color: "#64748B",
                      fontSize: 12,
                    }}
                  >
                    {student.email}
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
                    {todayPoints(student.uid)}
                  </div>

                  <div
                    style={{
                      color: "#475569",
                      fontSize: 10,
                    }}
                  >
                    points today
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {view === "blockedModes" && (
          <>
            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="🔍 Search blocked student…"
              style={{
                ...S.inp,
                marginBottom: 16,
              }}
            />

            {loading && (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 0",
                  color: "#64748B",
                }}
              >
                Loading blocked students…
              </div>
            )}

            {!loading &&
              tabBlockedStudents.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 0",
                    color: "#475569",
                  }}
                >
                  <div
                    style={{
                      fontSize: 40,
                      marginBottom: 12,
                    }}
                  >
                    ✅
                  </div>

                  <div>
                    No students are blocked today.
                  </div>
                </div>
              )}

            {tabBlockedStudents.map((student) => {
              const blockedModes =
                getBlockedModes(student.uid);

              return (
                <div
                  key={student.uid}
                  style={{
                    ...S.card,
                    borderColor: "#7F1D1D",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 14,
                    }}
                  >
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: "50%",
                        background: "#450A0A",
                        border:
                          "2px solid #EF4444",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 18,
                      }}
                    >
                      👨‍🎓
                    </div>

                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 14,
                        }}
                      >
                        {student.fullName ||
                          "Unknown Student"}
                      </div>

                      <div
                        style={{
                          color: "#64748B",
                          fontSize: 12,
                          marginTop: 3,
                        }}
                      >
                        {student.email ||
                          "Email not available"}
                      </div>

                      {student.mobile && (
                        <div
                          style={{
                            color: "#64748B",
                            fontSize: 12,
                            marginTop: 3,
                          }}
                        >
                          📱 {student.mobile}
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    {blockedModes.map((mode) => {
                      const actionKey = `${student.uid}_${mode}`;
                      const isUnblocking =
                        unblocking === actionKey;

                      return (
                        <div
                          key={mode}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent:
                              "space-between",
                            gap: 10,
                            padding: "10px 12px",
                            background: "#450A0A",
                            border:
                              "1px solid #7F1D1D",
                            borderRadius: 10,
                            flexWrap: "wrap",
                          }}
                        >
                          <div>
                            <div
                              style={{
                                color: "#FCA5A5",
                                fontWeight: 700,
                                fontSize: 13,
                              }}
                            >
                              🚫{" "}
                              {MODE_NAMES[mode] ||
                                mode}
                            </div>

                            <div
                              style={{
                                color: "#94A3B8",
                                fontSize: 11,
                                marginTop: 3,
                              }}
                            >
                              Blocked due to tab
                              switching
                            </div>
                          </div>

                          <Btn
                            onClick={() =>
                              handleModeUnblock(
                                student,
                                mode
                              )
                            }
                            disabled={isUnblocking}
                            color="#22C55E"
                            sm
                          >
                            {isUnblocking
                              ? "Unblocking..."
                              : "Unblock"}
                          </Btn>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {view === "list" && (
          <>
            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="🔍 Search by name or email…"
              style={{
                ...S.inp,
                marginBottom: 16,
              }}
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
                <div
                  style={{
                    fontSize: 40,
                    marginBottom: 12,
                  }}
                >
                  👥
                </div>

                <div>
                  No students found. Share your Admin
                  ID with students to let them join.
                </div>
              </div>
            )}

            {filtered.map((student) => {
              const progress =
                scores[student.uid] || {};

              const certificate =
                certificates[student.uid] || {};

              const completed =
                (progress.totalCorrect || 0) +
                (progress.totalWrong || 0);

              const totalCorrect =
                progress.totalCorrect || 0;

              const totalWrong =
                progress.totalWrong || 0;

              const totalScore =
                progress.totalScore || 0;

              const accuracy =
                completed > 0
                  ? Math.round(
                      (totalCorrect / completed) *
                        100
                    )
                  : 0;

              const blockedModes =
                getBlockedModes(student.uid);

              return (
                <div
                  key={student.uid}
                  style={{ ...S.card }}
                >
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
                        background: student.blocked
                          ? "#450A0A"
                          : "#14532D",
                        border: `2px solid ${
                          student.blocked
                            ? "#EF4444"
                            : "#22C55E"
                        }`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 18,
                      }}
                    >
                      👨‍🎓
                    </div>

                    <div
                      style={{
                        flex: 1,
                        minWidth: 120,
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 14,
                        }}
                      >
                        {student.fullName}
                      </div>

                      <div
                        style={{
                          color: "#64748B",
                          fontSize: 12,
                        }}
                      >
                        {student.email}
                        {student.mobile
                          ? ` · 📱 ${student.mobile}`
                          : ""}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: 6,
                          flexWrap: "wrap",
                          marginTop: 6,
                        }}
                      >
                        {student.blocked && (
                          <span
                            style={{
                              background: "#450A0A",
                              border:
                                "1px solid #EF4444",
                              borderRadius: 6,
                              padding: "2px 8px",
                              fontSize: 11,
                              color: "#FCA5A5",
                              fontWeight: 700,
                            }}
                          >
                            LOGIN BLOCKED
                          </span>
                        )}

                        {blockedModes.length > 0 && (
                          <span
                            style={{
                              background: "#422006",
                              border:
                                "1px solid #F59E0B",
                              borderRadius: 6,
                              padding: "2px 8px",
                              fontSize: 11,
                              color: "#FCD34D",
                              fontWeight: 700,
                            }}
                          >
                            TAB BLOCKED:{" "}
                            {blockedModes.length}
                          </span>
                        )}

                        {certificate.allowed && (
                          <span
                            style={{
                              background: "#14532D",
                              border:
                                "1px solid #22C55E",
                              borderRadius: 6,
                              padding: "2px 8px",
                              fontSize: 11,
                              color: "#86EFAC",
                              fontWeight: 700,
                            }}
                          >
                            CERTIFICATE UNLOCKED
                          </span>
                        )}
                      </div>
                    </div>

                    <Btn
                      onClick={() =>
                        toggleBlock(student)
                      }
                      color={
                        student.blocked
                          ? "#22C55E"
                          : "#EF4444"
                      }
                      sm
                    >
                      {student.blocked
                        ? "Unblock Login"
                        : "Block Login"}
                    </Btn>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(5,1fr)",
                      gap: 8,
                      paddingTop: 10,
                      borderTop:
                        "1px solid #334155",
                    }}
                  >
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          color: "#60A5FA",
                          fontWeight: 800,
                          fontSize: 16,
                        }}
                      >
                        {completed}
                      </div>

                      <div
                        style={{
                          color: "#475569",
                          fontSize: 10,
                        }}
                      >
                        📚 Completed
                      </div>
                    </div>

                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          color: "#22C55E",
                          fontWeight: 800,
                          fontSize: 16,
                        }}
                      >
                        {totalCorrect}
                      </div>

                      <div
                        style={{
                          color: "#475569",
                          fontSize: 10,
                        }}
                      >
                        ✅ Correct
                      </div>
                    </div>

                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          color: "#EF4444",
                          fontWeight: 800,
                          fontSize: 16,
                        }}
                      >
                        {totalWrong}
                      </div>

                      <div
                        style={{
                          color: "#475569",
                          fontSize: 10,
                        }}
                      >
                        ❌ Wrong
                      </div>
                    </div>

                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          color: "#F59E0B",
                          fontWeight: 800,
                          fontSize: 16,
                        }}
                      >
                        {accuracy}%
                      </div>

                      <div
                        style={{
                          color: "#475569",
                          fontSize: 10,
                        }}
                      >
                        🎯 Accuracy
                      </div>
                    </div>

                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          color: "#FCD34D",
                          fontWeight: 800,
                          fontSize: 16,
                        }}
                      >
                        {totalScore}
                      </div>

                      <div
                        style={{
                          color: "#475569",
                          fontSize: 10,
                        }}
                      >
                        ⭐ Score
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: 12,
                      paddingTop: 12,
                      borderTop:
                        "1px solid #334155",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "1fr auto",
                        gap: 10,
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            color: "#94A3B8",
                            fontSize: 12,
                            fontWeight: 700,
                            marginBottom: 6,
                          }}
                        >
                          🎓 Certificate End Date
                        </div>

                        <input
                          type="date"
                          value={
                            certificate.endDate || ""
                          }
                          onChange={(event) =>
                            updateCertificateEndDate(
                              student.uid,
                              event.target.value
                            )
                          }
                          style={{
                            ...S.inp,
                            colorScheme: "dark",
                            padding: "9px 12px",
                            fontSize: 13,
                          }}
                        />
                      </div>

                      <Btn
                        onClick={() =>
                          toggleCertificate(student)
                        }
                        color={
                          certificate.allowed
                            ? "#EF4444"
                            : "#22C55E"
                        }
                        sm
                      >
                        {certificate.allowed
                          ? "Disable Certificate"
                          : "Allow Certificate"}
                      </Btn>
                    </div>

                    <div
                      style={{
                        color: "#64748B",
                        fontSize: 11,
                        marginTop: 8,
                      }}
                    >
                      {certificate.allowed
                        ? "Student can download certificate from dashboard."
                        : "Set end date and allow download when course is completed."}
                    </div>
                  </div>

                  {progress.levelStats &&
                    Object.keys(
                      progress.levelStats
                    ).length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          marginTop: 10,
                          paddingTop: 10,
                          borderTop:
                            "1px solid #334155",
                          flexWrap: "wrap",
                        }}
                      >
                        {LEVELS.map((level) => {
                          const levelStats =
                            progress.levelStats?.[
                              level
                            ] || {
                              attempted: 0,
                              correct: 0,
                            };

                          const totalQuestions =
                            questionCount[level] || 0;

                          return (
                            <span
                              key={level}
                              style={{
                                fontSize: 11,
                                color:
                                  LC[level].accent,
                                background: `${LC[level].accent}15`,
                                padding: "4px 10px",
                                borderRadius: 6,
                              }}
                            >
                              {LC[level].emoji}{" "}
                              {level}{" "}
                              {levelStats.correct}/
                              {totalQuestions}
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
