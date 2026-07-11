import { useEffect, useState } from "react";

import { fsWhere, fsGet, fsSet } from "../../utils/store";

import { createCertificateId } from "../../utils/certificatePdf";

import {
  sendCertificateApprovedNotification,
  sendCertificateRevokedNotification,
} from "../../utils/notifications";

import { S } from "../../data/questions";

import { Btn, TopBar, Msg, Card } from "../shared/UI";

export default function CertificateManager({ onBack, adminProfile }) {
  const [students, setStudents] = useState([]);

  const [certificates, setCertificates] = useState({});

  const [progressMap, setProgressMap] = useState({});

  const [settings, setSettings] = useState(null);

  const [loading, setLoading] = useState(true);

  const [processingUid, setProcessingUid] = useState("");

  const [search, setSearch] = useState("");

  const [msg, setMsg] = useState("");

  const adminId = adminProfile?.adminId;

  useEffect(() => {
    loadData();
  }, []);

  function showMessage(message) {
    setMsg(message);

    setTimeout(() => {
      setMsg("");
    }, 3000);
  }

  async function loadData() {
    setLoading(true);

    try {
      const all = await fsWhere("users", "adminId", "==", adminId);

      const list = all.filter((user) => user.role === "student");

      const certificateMap = {};
      const studentProgressMap = {};

      await Promise.all(
        list.map(async (student) => {
          const certificate = await fsGet("certificates", student.uid);

          const progress = await fsGet("progress", student.uid);

          certificateMap[student.uid] = certificate || {
            adminId,
            studentId: student.uid,

            studentName: student.fullName || "",

            studentEmail: student.email || "",

            certificateId: createCertificateId(student.uid),

            allowed: false,
            allowDownload: false,
            status: "locked",
            endDate: "",
          };

          studentProgressMap[student.uid] = progress || {
            totalScore: 0,
            totalCorrect: 0,
            totalWrong: 0,
            totalAttempted: 0,
            currentLevel: "Advanced",
          };
        }),
      );

      const certificateSettings = await fsGet("certificateSettings", adminId);

      setStudents(list);

      setCertificates(certificateMap);

      setProgressMap(studentProgressMap);

      setSettings(certificateSettings || null);
    } catch (error) {
      console.error("Certificate data load failed:", error);

      showMessage("Certificate data could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  function setEndDate(uid, endDate) {
    setCertificates((previous) => ({
      ...previous,

      [uid]: {
        ...(previous[uid] || {}),
        endDate,
      },
    }));
  }

  function getStats(uid) {
    const progress = progressMap[uid] || {};

    const totalCorrect = Number(progress.totalCorrect) || 0;

    const totalWrong = Number(progress.totalWrong) || 0;

    const completed = totalCorrect + totalWrong;

    const accuracy =
      completed > 0 ? Number(((totalCorrect / completed) * 100).toFixed(1)) : 0;

    return {
      totalScore: Number(progress.totalScore) || 0,

      totalCorrect,
      totalWrong,
      completed,
      accuracy,

      level: progress.currentLevel || settings?.defaultLevel || "Advanced",
    };
  }

  async function toggleCertificate(student) {
    const current = certificates[student.uid] || {};

    const nextAllowed = !Boolean(current.allowed);

    if (nextAllowed && !current.endDate) {
      showMessage("Please select end date before allowing certificate.");

      return;
    }

    setProcessingUid(student.uid);

    try {
      const stats = getStats(student.uid);

      const certificateId =
        current.certificateId || createCertificateId(student.uid);

      const now = Date.now();

      const issuedAt = nextAllowed
        ? current.issuedAt || current.allowedAt || now
        : current.issuedAt || current.allowedAt || null;

      const instituteName =
        settings?.instituteName ||
        adminProfile?.instituteName ||
        adminProfile?.fullName ||
        "Institute";

      const academyTitle =
        settings?.academyTitle ||
        settings?.courseTitle ||
        "English Learning Academy";

      const courseName = settings?.courseName || "English Practice Course";

      const adminName =
        settings?.adminName || adminProfile?.fullName || "Admin";

      const startDate =
        current.startDate ||
        student.joiningDate ||
        student.createdAt ||
        student._at ||
        null;

      const studentCertificatePayload = {
        adminId,
        studentId: student.uid,

        studentName: student.fullName || "",

        studentEmail: student.email || "",

        certificateId,

        allowed: nextAllowed,

        allowDownload: nextAllowed,

        status: nextAllowed ? "active" : "revoked",

        verified: nextAllowed,

        startDate,

        endDate: current.endDate || "",

        allowedAt: nextAllowed
          ? current.allowedAt || now
          : current.allowedAt || null,

        issuedAt,

        disabledAt: nextAllowed ? null : now,

        revokedAt: nextAllowed ? null : now,

        totalScore: stats.totalScore,

        totalCorrect: stats.totalCorrect,

        totalWrong: stats.totalWrong,

        totalCompleted: stats.completed,

        totalAttempted: stats.completed,

        accuracy: stats.accuracy,

        level: stats.level,

        instituteName,
        academyTitle,
        courseName,
        adminName,

        updatedAt: now,
      };

      const verificationPayload = {
        certificateId,

        status: nextAllowed ? "active" : "revoked",

        verified: nextAllowed,

        active: nextAllowed,

        studentId: student.uid,

        studentName: student.fullName || "",

        instituteName,
        academyTitle,
        courseName,
        adminName,

        startDate,

        endDate: current.endDate || "",

        issueDate: issuedAt,

        issuedAt,

        revokedAt: nextAllowed ? null : now,

        totalScore: stats.totalScore,

        totalCorrect: stats.totalCorrect,

        totalWrong: stats.totalWrong,

        totalCompleted: stats.completed,

        totalAttempted: stats.completed,

        accuracy: stats.accuracy,

        level: stats.level,

        adminId,

        createdAt: current.createdAt || issuedAt || now,

        updatedAt: now,
      };

      const [studentRecordSaved, verificationRecordSaved] = await Promise.all([
        fsSet("certificates", student.uid, studentCertificatePayload),

        fsSet("certificateVerifications", certificateId, verificationPayload),
      ]);

      if (!studentRecordSaved || !verificationRecordSaved) {
        throw new Error("Certificate records could not be saved.");
      }

      if (nextAllowed) {
        await sendCertificateApprovedNotification({
          studentId: student.uid,

          adminId,
          certificateId,
        });
      } else {
        await sendCertificateRevokedNotification({
          studentId: student.uid,

          adminId,
          certificateId,
        });
      }

      setCertificates((previous) => ({
        ...previous,

        [student.uid]: {
          id: student.uid,
          ...studentCertificatePayload,
        },
      }));

      showMessage(
        nextAllowed
          ? `${student.fullName}'s certificate has been allowed and activated for QR verification.`
          : `${student.fullName}'s certificate has been disabled and marked as revoked.`,
      );
    } catch (error) {
      console.error("Certificate update failed:", error);

      showMessage("Certificate update failed. Please try again.");
    } finally {
      setProcessingUid("");
    }
  }

  const filtered = students.filter(
    (student) =>
      student.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      student.email?.toLowerCase().includes(search.toLowerCase()),
  );

  const messageType =
    msg.includes("Please") ||
    msg.includes("failed") ||
    msg.includes("could not")
      ? "error"
      : "success";

  return (
    <div style={S.pg}>
      <div style={S.wrap}>
        <TopBar
          onBack={onBack}
          title="🎓 Certificate Manager"
          right={
            <button
              onClick={loadData}
              disabled={loading}
              style={{
                background: "#1E293B",

                border: "1.5px solid #334155",

                color: "#94A3B8",
                borderRadius: 8,
                padding: "7px 12px",

                cursor: loading ? "not-allowed" : "pointer",

                fontSize: 12,
                fontWeight: 600,

                opacity: loading ? 0.6 : 1,
              }}
            >
              ↻
            </button>
          }
        />

        <Msg type={messageType} text={msg} />

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
          onChange={(event) => setSearch(event.target.value)}
          placeholder="🔍 Search student by name or email..."
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
            <div
              style={{
                fontSize: 42,
                marginBottom: 12,
              }}
            >
              🎓
            </div>

            <div>No students found.</div>
          </div>
        )}

        {!loading &&
          filtered.map((student) => {
            const certificate = certificates[student.uid] || {};

            const stats = getStats(student.uid);

            const isProcessing = processingUid === student.uid;

            const isAllowed = Boolean(certificate.allowed);

            const certificateStatus =
              certificate.status || (isAllowed ? "active" : "locked");

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

                      background: isAllowed ? "#14532D" : "#1E293B",

                      border: `2px solid ${isAllowed ? "#22C55E" : "#334155"}`,

                      display: "flex",

                      alignItems: "center",

                      justifyContent: "center",

                      fontSize: 20,
                    }}
                  >
                    🎓
                  </div>

                  <div
                    style={{
                      flex: 1,
                      minWidth: 160,
                    }}
                  >
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

                    {certificate.certificateId && (
                      <div
                        style={{
                          color: "#94A3B8",

                          fontSize: 10,

                          marginTop: 4,

                          wordBreak: "break-all",
                        }}
                      >
                        ID: {certificate.certificateId}
                      </div>
                    )}

                    <div
                      style={{
                        marginTop: 7,
                        display: "flex",
                        gap: 6,

                        flexWrap: "wrap",
                      }}
                    >
                      {isAllowed ? (
                        <>
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

                          <span
                            style={{
                              background: "#052E16",

                              border: "1px solid #16A34A",

                              color: "#BBF7D0",

                              borderRadius: 6,

                              padding: "2px 8px",

                              fontSize: 11,

                              fontWeight: 800,
                            }}
                          >
                            QR ACTIVE
                          </span>
                        </>
                      ) : (
                        <span
                          style={{
                            background:
                              certificateStatus === "revoked"
                                ? "#450A0A"
                                : "#1E293B",

                            border: `1px solid ${
                              certificateStatus === "revoked"
                                ? "#EF4444"
                                : "#334155"
                            }`,

                            color:
                              certificateStatus === "revoked"
                                ? "#FCA5A5"
                                : "#94A3B8",

                            borderRadius: 6,

                            padding: "2px 8px",

                            fontSize: 11,

                            fontWeight: 800,
                          }}
                        >
                          {certificateStatus === "revoked"
                            ? "CERTIFICATE REVOKED"
                            : "LOCKED"}
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
                  <MiniStat
                    label="Score"
                    value={stats.totalScore}
                    color="#FCD34D"
                  />

                  <MiniStat
                    label="Correct"
                    value={stats.totalCorrect}
                    color="#22C55E"
                  />

                  <MiniStat
                    label="Completed"
                    value={stats.completed}
                    color="#60A5FA"
                  />

                  <MiniStat
                    label="Accuracy"
                    value={`${stats.accuracy}%`}
                    color="#F59E0B"
                  />
                </div>

                <div
                  style={{
                    display: "grid",

                    gridTemplateColumns: "minmax(0,1fr) auto",

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
                      value={certificate.endDate || ""}
                      onChange={(event) =>
                        setEndDate(student.uid, event.target.value)
                      }
                      disabled={isProcessing}
                      style={{
                        ...S.inp,

                        colorScheme: "dark",

                        padding: "10px 12px",

                        fontSize: 13,

                        opacity: isProcessing ? 0.7 : 1,
                      }}
                    />
                  </div>

                  <Btn
                    onClick={() => toggleCertificate(student)}
                    disabled={isProcessing}
                    color={isAllowed ? "#EF4444" : "#22C55E"}
                    sm
                  >
                    {isProcessing
                      ? "Updating..."
                      : isAllowed
                        ? "Disable"
                        : "Allow Download"}
                  </Btn>
                </div>

                {isAllowed && (
                  <div
                    style={{
                      color: "#86EFAC",

                      fontSize: 12,
                      marginTop: 10,
                      lineHeight: 1.6,
                    }}
                  >
                    ✅ Student can download the certificate and QR verification
                    is active.
                  </div>
                )}

                {certificateStatus === "revoked" && !isAllowed && (
                  <div
                    style={{
                      color: "#FCA5A5",

                      fontSize: 12,

                      marginTop: 10,

                      lineHeight: 1.6,
                    }}
                  >
                    ❌ Certificate is revoked. QR scan will show the revoked
                    status.
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
    <div
      style={{
        textAlign: "center",
      }}
    >
      <div
        style={{
          color,
          fontWeight: 900,
          fontSize: 16,
        }}
      >
        {value}
      </div>

      <div
        style={{
          color: "#475569",
          fontSize: 10,
        }}
      >
        {label}
      </div>
    </div>
  );
}
