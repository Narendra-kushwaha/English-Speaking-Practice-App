import { useEffect, useState } from "react";
import { fsWhere, fsGet, fsSet } from "../../utils/store";
import { S } from "../../data/questions";
import { Btn, TopBar, Msg, Card } from "../shared/UI";

export default function CertificateManager({ onBack, adminProfile }) {
  const [students, setStudents] = useState([]);
  const [certificates, setCertificates] = useState({});
  const [progressMap, setProgressMap] = useState({});
  const [settings, setSettings] = useState(null);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState("");

  const adminId = adminProfile?.adminId;

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    const all = await fsWhere("users", "adminId", "==", adminId);
    const list = all.filter((u) => u.role === "student");

    const certMap = {};
    const progMap = {};

    await Promise.all(
      list.map(async (student) => {
        const cert = await fsGet("certificates", student.uid);
        const progress = await fsGet("progress", student.uid);

        certMap[student.uid] = cert || {
          adminId,
          studentId: student.uid,
          studentName: student.fullName,
          studentEmail: student.email,
          allowed: false,
          allowDownload: false,
          endDate: "",
        };

        progMap[student.uid] = progress || {
          totalScore: 0,
          totalCorrect: 0,
          totalWrong: 0,
          totalAttempted: 0,
        };
      })
    );

    const certSettings = await fsGet("certificateSettings", adminId);

    setStudents(list);
    setCertificates(certMap);
    setProgressMap(progMap);
    setSettings(certSettings || null);
    setLoading(false);
  }

  function setEndDate(uid, endDate) {
    setCertificates((prev) => ({
      ...prev,
      [uid]: {
        ...(prev[uid] || {}),
        endDate,
      },
    }));
  }

  async function toggleCertificate(student) {
    const current = certificates[student.uid] || {};
    const progress = progressMap[student.uid] || {};
    const nextAllowed = !current.allowed;

    if (nextAllowed && !current.endDate) {
      setMsg("Please select end date before allowing certificate.");
      setTimeout(() => setMsg(""), 2500);
      return;
    }

    const totalCorrect = progress.totalCorrect || 0;
    const totalWrong = progress.totalWrong || 0;
    const completed = totalCorrect + totalWrong;
    const accuracy =
      completed > 0 ? Math.round((totalCorrect / completed) * 100) : 0;

    const payload = {
      adminId,
      studentId: student.uid,
      studentName: student.fullName || "",
      studentEmail: student.email || "",
      allowed: nextAllowed,
      allowDownload: nextAllowed,
      endDate: current.endDate || "",
      allowedAt: nextAllowed ? Date.now() : current.allowedAt || null,
      disabledAt: nextAllowed ? null : Date.now(),
      totalScore: progress.totalScore || 0,
      totalCorrect,
      totalWrong,
      totalCompleted: completed,
      accuracy,
      instituteName:
        settings?.instituteName ||
        adminProfile?.instituteName ||
        adminProfile?.fullName ||
        "Institute",
      courseName: settings?.courseName || "English Practice Course",
      adminName: settings?.adminName || adminProfile?.fullName || "Admin",
    };

    await fsSet("certificates", student.uid, payload);

    setCertificates((prev) => ({
      ...prev,
      [student.uid]: {
        id: student.uid,
        ...payload,
      },
    }));

    setMsg(
      `${student.fullName}'s certificate has been ${
        nextAllowed ? "allowed" : "disabled"
      }.`
    );

    setTimeout(() => setMsg(""), 2500);
  }

  function getStats(uid) {
    const p = progressMap[uid] || {};
    const totalCorrect = p.totalCorrect || 0;
    const totalWrong = p.totalWrong || 0;
    const completed = totalCorrect + totalWrong;
    const accuracy =
      completed > 0 ? Math.round((totalCorrect / completed) * 100) : 0;

    return {
      totalScore: p.totalScore || 0,
      totalCorrect,
      totalWrong,
      completed,
      accuracy,
    };
  }

  const filtered = students.filter(
    (s) =>
      s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={S.pg}>
      <div style={S.wrap}>
        <TopBar
          onBack={onBack}
          title="🎓 Certificate Manager"
          right={
            <button
              onClick={loadData}
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

        <Msg type={msg.includes("Please") ? "error" : "success"} text={msg} />

        {!settings && (
          <div
            style={{
              ...S.card,
              borderColor: "#F59E0B55",
              background: "#451A0322",
              color: "#FDE68A",
              fontSize: 13,
              lineHeight: 1.7,
            }}
          >
            ⚠️ Certificate settings are not completed yet. Please open
            Certificate Settings and save institute name, signature and seal.
          </div>
        )}

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Search student by name or email..."
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
            Loading students...
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
            <div style={{ fontSize: 42, marginBottom: 12 }}>🎓</div>
            <div>No students found.</div>
          </div>
        )}

        {!loading &&
          filtered.map((student) => {
            const cert = certificates[student.uid] || {};
            const stats = getStats(student.uid);

            return (
              <Card key={student.uid}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    flexWrap: "wrap",
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: cert.allowed ? "#14532D" : "#1E293B",
                      border: `2px solid ${
                        cert.allowed ? "#22C55E" : "#334155"
                      }`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                    }}
                  >
                    🎓
                  </div>

                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ fontWeight: 800, fontSize: 15 }}>
                      {student.fullName}
                    </div>
                    <div style={{ color: "#64748B", fontSize: 12 }}>
                      {student.email}
                    </div>

                    <div style={{ marginTop: 6 }}>
                      {cert.allowed ? (
                        <span
                          style={{
                            background: "#14532D",
                            border: "1px solid #22C55E",
                            color: "#86EFAC",
                            borderRadius: 6,
                            padding: "2px 8px",
                            fontSize: 11,
                            fontWeight: 800,
                          }}
                        >
                          CERTIFICATE ALLOWED
                        </span>
                      ) : (
                        <span
                          style={{
                            background: "#1E293B",
                            border: "1px solid #334155",
                            color: "#94A3B8",
                            borderRadius: 6,
                            padding: "2px 8px",
                            fontSize: 11,
                            fontWeight: 800,
                          }}
                        >
                          LOCKED
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4,1fr)",
                    gap: 8,
                    padding: "10px 0",
                    borderTop: "1px solid #334155",
                    borderBottom: "1px solid #334155",
                    marginBottom: 12,
                  }}
                >
                  <MiniStat label="Score" value={stats.totalScore} color="#FCD34D" />
                  <MiniStat label="Correct" value={stats.totalCorrect} color="#22C55E" />
                  <MiniStat label="Completed" value={stats.completed} color="#60A5FA" />
                  <MiniStat label="Accuracy" value={`${stats.accuracy}%`} color="#F59E0B" />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 10,
                    alignItems: "end",
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
                      Course End Date
                    </div>

                    <input
                      type="date"
                      value={cert.endDate || ""}
                      onChange={(e) => setEndDate(student.uid, e.target.value)}
                      style={{
                        ...S.inp,
                        colorScheme: "dark",
                        padding: "10px 12px",
                        fontSize: 13,
                      }}
                    />
                  </div>

                  <Btn
                    onClick={() => toggleCertificate(student)}
                    color={cert.allowed ? "#EF4444" : "#22C55E"}
                    sm
                  >
                    {cert.allowed ? "Disable" : "Allow Download"}
                  </Btn>
                </div>

                {cert.allowed && (
                  <div
                    style={{
                      color: "#86EFAC",
                      fontSize: 12,
                      marginTop: 10,
                      lineHeight: 1.6,
                    }}
                  >
                    ✅ Student can now download certificate from dashboard.
                  </div>
                )}
              </Card>
            );
          })}
      </div>
    </div>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ color, fontWeight: 900, fontSize: 16 }}>{value}</div>
      <div style={{ color: "#475569", fontSize: 10 }}>{label}</div>
    </div>
  );
}
