import { useEffect, useState } from "react";
import { fsGet } from "../../utils/store";

function formatDate(value) {
  if (!value) return "N/A";

  try {
    if (value?.toDate) {
      value = value.toDate();
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return String(value);
  }
}

function formatTime(value) {
  if (!value) return "N/A";

  try {
    if (value?.toDate) {
      value = value.toDate();
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(value);
  }
}

export default function VerifyCertificate({
  certificateId,
}) {
  const [certificate, setCertificate] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    verifyCertificate();
  }, [certificateId]);

  async function verifyCertificate() {
    setLoading(true);
    setError("");
    setCertificate(null);

    if (!certificateId) {
      setError(
        "Certificate ID is missing."
      );
      setLoading(false);
      return;
    }

    try {
      const data = await fsGet(
        "certificateVerifications",
        certificateId
      );

      if (!data) {
        setError(
          "This certificate ID is invalid or does not exist."
        );
        setLoading(false);
        return;
      }

      setCertificate(data);
    } catch (err) {
      console.error(
        "Certificate verification failed:",
        err
      );

      setError(
        "Certificate verification failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function goHome() {
    window.location.href =
      window.location.origin;
  }

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingCard}>
          <div style={styles.loadingIcon}>
            🔍
          </div>

          <div style={styles.loadingTitle}>
            Verifying Certificate
          </div>

          <div style={styles.loadingText}>
            Please wait while we verify
            this certificate.
          </div>

          <div style={styles.loader}>
            <div
              style={styles.loaderDot}
            />
            <div
              style={{
                ...styles.loaderDot,
                animationDelay: "0.15s",
              }}
            />
            <div
              style={{
                ...styles.loaderDot,
                animationDelay: "0.3s",
              }}
            />
          </div>
        </div>

        <style>{animationCss}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.resultCard}>
          <div
            style={{
              ...styles.statusCircle,
              background: "#450A0A",
              borderColor: "#EF4444",
            }}
          >
            ✕
          </div>

          <div
            style={{
              ...styles.statusBadge,
              background: "#450A0A",
              borderColor: "#EF4444",
              color: "#FCA5A5",
            }}
          >
            INVALID CERTIFICATE
          </div>

          <h1
            style={{
              ...styles.heading,
              color: "#FCA5A5",
            }}
          >
            Certificate Not Found
          </h1>

          <p style={styles.description}>
            {error}
          </p>

          <div style={styles.idBox}>
            <div style={styles.idLabel}>
              Certificate ID
            </div>

            <div style={styles.idValue}>
              {certificateId || "N/A"}
            </div>
          </div>

          <div style={styles.warningBox}>
            This certificate could not be
            verified. Please check the
            certificate ID or contact the
            issuing institute.
          </div>

          <button
            onClick={goHome}
            style={styles.homeButton}
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const status =
    certificate?.status || "";

  const isActive =
    status === "active" &&
    certificate?.verified !== false &&
    certificate?.active !== false;

  const isRevoked =
    status === "revoked" ||
    certificate?.verified === false ||
    certificate?.active === false;

  if (isRevoked) {
    return (
      <div style={styles.page}>
        <div style={styles.resultCard}>
          <div
            style={{
              ...styles.statusCircle,
              background: "#450A0A",
              borderColor: "#EF4444",
            }}
          >
            !
          </div>

          <div
            style={{
              ...styles.statusBadge,
              background: "#450A0A",
              borderColor: "#EF4444",
              color: "#FCA5A5",
            }}
          >
            CERTIFICATE REVOKED
          </div>

          <h1
            style={{
              ...styles.heading,
              color: "#FCA5A5",
            }}
          >
            This Certificate Is No Longer
            Valid
          </h1>

          <p style={styles.description}>
            The issuing institute has
            revoked or disabled this
            certificate.
          </p>

          <div style={styles.idBox}>
            <div style={styles.idLabel}>
              Certificate ID
            </div>

            <div style={styles.idValue}>
              {
                certificate.certificateId
              }
            </div>
          </div>

          <div style={styles.detailsGrid}>
            <Detail
              label="Student Name"
              value={
                certificate.studentName
              }
            />

            <Detail
              label="Institute"
              value={
                certificate.instituteName
              }
            />

            <Detail
              label="Course"
              value={
                certificate.courseName
              }
            />

            <Detail
              label="Revoked Date"
              value={formatDate(
                certificate.revokedAt
              )}
            />
          </div>

          <div style={styles.warningBox}>
            Please contact the issuing
            institute for more information.
          </div>

          <button
            onClick={goHome}
            style={styles.homeButton}
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (!isActive) {
    return (
      <div style={styles.page}>
        <div style={styles.resultCard}>
          <div
            style={{
              ...styles.statusCircle,
              background: "#451A03",
              borderColor: "#F59E0B",
            }}
          >
            ?
          </div>

          <div
            style={{
              ...styles.statusBadge,
              background: "#451A03",
              borderColor: "#F59E0B",
              color: "#FCD34D",
            }}
          >
            STATUS UNKNOWN
          </div>

          <h1
            style={{
              ...styles.heading,
              color: "#FCD34D",
            }}
          >
            Certificate Status Could Not Be
            Confirmed
          </h1>

          <p style={styles.description}>
            The certificate record exists,
            but its active status could not
            be confirmed.
          </p>

          <button
            onClick={goHome}
            style={styles.homeButton}
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.resultCard}>
        <div style={styles.statusCircle}>
          ✓
        </div>

        <div style={styles.statusBadge}>
          VERIFIED CERTIFICATE
        </div>

        <h1 style={styles.heading}>
          Certificate Successfully Verified
        </h1>

        <p style={styles.description}>
          This certificate is authentic and
          was issued by the institute shown
          below.
        </p>

        <div style={styles.studentSection}>
          <div style={styles.studentLabel}>
            Presented To
          </div>

          <div style={styles.studentName}>
            {
              certificate.studentName ||
              "Student Name"
            }
          </div>

          <div style={styles.courseText}>
            Successfully completed the{" "}
            <strong>
              {
                certificate.courseName ||
                "English Practice Course"
              }
            </strong>
          </div>
        </div>

        <div style={styles.detailsGrid}>
          <Detail
            label="Institute"
            value={
              certificate.instituteName
            }
          />

          <Detail
            label="Course"
            value={
              certificate.courseName
            }
          />

          <Detail
            label="Course Start Date"
            value={formatDate(
              certificate.startDate
            )}
          />

          <Detail
            label="Course End Date"
            value={formatDate(
              certificate.endDate
            )}
          />

          <Detail
            label="Issue Date"
            value={formatDate(
              certificate.issueDate ||
                certificate.issuedAt
            )}
          />

          <Detail
            label="Level"
            value={
              certificate.level ||
              "N/A"
            }
          />
        </div>

        <div style={styles.statsGrid}>
          <Stat
            label="Total Score"
            value={
              certificate.totalScore || 0
            }
          />

          <Stat
            label="Correct"
            value={
              certificate.totalCorrect || 0
            }
          />

          <Stat
            label="Completed"
            value={
              certificate.totalCompleted ||
              certificate.totalAttempted ||
              0
            }
          />

          <Stat
            label="Accuracy"
            value={`${
              certificate.accuracy || 0
            }%`}
          />
        </div>

        <div style={styles.idBox}>
          <div style={styles.idLabel}>
            Certificate ID
          </div>

          <div style={styles.idValue}>
            {
              certificate.certificateId ||
              certificateId
            }
          </div>
        </div>

        <div style={styles.verifiedInfo}>
          <div style={styles.verifiedIcon}>
            🛡️
          </div>

          <div>
            <div
              style={
                styles.verifiedInfoTitle
              }
            >
              Secure Digital Verification
            </div>

            <div
              style={
                styles.verifiedInfoText
              }
            >
              Verified on{" "}
              {formatTime(new Date())}
            </div>
          </div>
        </div>

        <div style={styles.footer}>
          <div>
            Issued by{" "}
            <strong>
              {
                certificate.instituteName ||
                "Institute"
              }
            </strong>
          </div>

          <div
            style={styles.footerStatus}
          >
            ● ACTIVE
          </div>
        </div>

        <button
          onClick={goHome}
          style={styles.homeButton}
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div style={styles.detailCard}>
      <div style={styles.detailLabel}>
        {label}
      </div>

      <div style={styles.detailValue}>
        {value || "N/A"}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statValue}>
        {value}
      </div>

      <div style={styles.statLabel}>
        {label}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "28px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "radial-gradient(circle at top,#1E3A5F 0%,#0F172A 42%,#020617 100%)",
    color: "#F8FAFC",
    fontFamily:
      "Inter, Arial, sans-serif",
    boxSizing: "border-box",
  },

  loadingCard: {
    width: "100%",
    maxWidth: 430,
    padding: "42px 28px",
    textAlign: "center",
    borderRadius: 22,
    background:
      "rgba(15,23,42,0.94)",
    border: "1px solid #334155",
    boxShadow:
      "0 24px 70px rgba(0,0,0,0.45)",
  },

  loadingIcon: {
    fontSize: 52,
    marginBottom: 18,
  },

  loadingTitle: {
    fontSize: 22,
    fontWeight: 900,
    marginBottom: 8,
  },

  loadingText: {
    color: "#94A3B8",
    fontSize: 14,
    lineHeight: 1.6,
  },

  loader: {
    display: "flex",
    justifyContent: "center",
    gap: 8,
    marginTop: 24,
  },

  loaderDot: {
    width: 9,
    height: 9,
    borderRadius: "50%",
    background: "#22C55E",
    animation:
      "verifyPulse 0.9s infinite alternate",
  },

  resultCard: {
    width: "100%",
    maxWidth: 850,
    padding: "34px",
    borderRadius: 24,
    background:
      "linear-gradient(145deg,rgba(15,23,42,0.97),rgba(30,41,59,0.95))",
    border: "1px solid #334155",
    boxShadow:
      "0 28px 90px rgba(0,0,0,0.52)",
    textAlign: "center",
  },

  statusCircle: {
    width: 74,
    height: 74,
    margin: "0 auto 16px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#14532D",
    border: "3px solid #22C55E",
    color: "#BBF7D0",
    fontSize: 38,
    fontWeight: 900,
    boxShadow:
      "0 0 35px rgba(34,197,94,0.28)",
  },

  statusBadge: {
    display: "inline-block",
    padding: "7px 14px",
    borderRadius: 999,
    background: "#14532D",
    border: "1px solid #22C55E",
    color: "#86EFAC",
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: 1.2,
  },

  heading: {
    color: "#F8FAFC",
    fontSize: "clamp(24px,5vw,36px)",
    fontWeight: 900,
    margin: "18px 0 8px",
  },

  description: {
    maxWidth: 620,
    margin: "0 auto",
    color: "#94A3B8",
    fontSize: 14,
    lineHeight: 1.7,
  },

  studentSection: {
    margin: "28px 0 20px",
    padding: "24px 18px",
    borderRadius: 18,
    background:
      "linear-gradient(135deg,#422006,#78350F)",
    border: "1px solid #D97706",
  },

  studentLabel: {
    color: "#FDE68A",
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },

  studentName: {
    color: "#FCD34D",
    fontSize: "clamp(27px,6vw,42px)",
    fontWeight: 900,
    margin: "8px 0",
  },

  courseText: {
    color: "#FEF3C7",
    fontSize: 14,
    lineHeight: 1.6,
  },

  detailsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(190px,1fr))",
    gap: 12,
    marginTop: 18,
  },

  detailCard: {
    padding: "15px",
    borderRadius: 13,
    background: "#0F172A",
    border: "1px solid #334155",
    textAlign: "left",
  },

  detailLabel: {
    color: "#64748B",
    fontSize: 10,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 6,
  },

  detailValue: {
    color: "#E2E8F0",
    fontSize: 14,
    fontWeight: 700,
    wordBreak: "break-word",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(120px,1fr))",
    gap: 10,
    marginTop: 18,
  },

  statCard: {
    padding: "16px 10px",
    borderRadius: 13,
    background:
      "linear-gradient(145deg,#172554,#1E3A8A)",
    border: "1px solid #3B82F6",
  },

  statValue: {
    color: "#BFDBFE",
    fontSize: 22,
    fontWeight: 900,
  },

  statLabel: {
    color: "#93C5FD",
    fontSize: 10,
    textTransform: "uppercase",
    fontWeight: 800,
    marginTop: 4,
  },

  idBox: {
    marginTop: 20,
    padding: "15px",
    borderRadius: 13,
    background: "#020617",
    border: "1px dashed #475569",
  },

  idLabel: {
    color: "#64748B",
    fontSize: 10,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  idValue: {
    color: "#F8FAFC",
    fontSize: 15,
    fontWeight: 900,
    letterSpacing: 0.7,
    marginTop: 6,
    wordBreak: "break-all",
  },

  verifiedInfo: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginTop: 18,
    padding: "14px",
    borderRadius: 13,
    textAlign: "left",
    background: "#052E16",
    border: "1px solid #16A34A",
  },

  verifiedIcon: {
    fontSize: 28,
  },

  verifiedInfoTitle: {
    color: "#BBF7D0",
    fontSize: 13,
    fontWeight: 900,
  },

  verifiedInfoText: {
    color: "#86EFAC",
    fontSize: 11,
    marginTop: 3,
  },

  warningBox: {
    marginTop: 18,
    padding: "14px",
    borderRadius: 13,
    background: "#451A03",
    border: "1px solid #F59E0B",
    color: "#FDE68A",
    fontSize: 13,
    lineHeight: 1.6,
  },

  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    marginTop: 20,
    paddingTop: 18,
    borderTop: "1px solid #334155",
    color: "#94A3B8",
    fontSize: 12,
    textAlign: "left",
  },

  footerStatus: {
    color: "#4ADE80",
    fontWeight: 900,
    letterSpacing: 0.8,
  },

  homeButton: {
    width: "100%",
    marginTop: 20,
    padding: "13px 18px",
    border: "none",
    borderRadius: 11,
    background: "#2563EB",
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: 900,
    cursor: "pointer",
  },
};

const animationCss = `
  @keyframes verifyPulse {
    from {
      transform: translateY(0);
      opacity: 0.45;
    }

    to {
      transform: translateY(-7px);
      opacity: 1;
    }
  }
`;