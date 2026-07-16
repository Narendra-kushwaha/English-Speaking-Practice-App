import { S } from "../../data/questions";

function formatTime(time) {
  if (!time) return "";

  const [hours, minutes] = time.split(":");
  const date = new Date();

  date.setHours(Number(hours));
  date.setMinutes(Number(minutes));

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MaintenanceNotice({ notice }) {
  return (
    <div
      style={{
        ...S.pg,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 560,
          background: "#1E293B",
          border: "1.5px solid #F59E0B",
          borderRadius: 18,
          padding: "32px 24px",
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
        }}
      >
        <div
          style={{
            fontSize: 56,
            marginBottom: 16,
          }}
        >
          🛠️
        </div>

        <div
          style={{
            color: "#F59E0B",
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 1.5,
            marginBottom: 8,
          }}
        >
          WEBSITE MAINTENANCE
        </div>

        <h1
          style={{
            color: "#F8FAFC",
            fontSize: 24,
            margin: "0 0 14px",
          }}
        >
          Development Work in Progress
        </h1>

        <div
          style={{
            color: "#CBD5E1",
            fontSize: 15,
            lineHeight: 1.8,
            whiteSpace: "pre-wrap",
            marginBottom: 22,
          }}
        >
          {notice?.message ||
            "The developer is currently working on the website."}
        </div>

        {(notice?.startTime || notice?.endTime) && (
          <div
            style={{
              background: "#0F172A",
              border: "1px solid #334155",
              borderRadius: 12,
              padding: "13px 16px",
              marginBottom: 12,
            }}
          >
            <div
              style={{
                color: "#64748B",
                fontSize: 11,
                fontWeight: 700,
                marginBottom: 5,
              }}
            >
              EXPECTED WORKING TIME
            </div>

            <div
              style={{
                color: "#E2E8F0",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              🕒 {formatTime(notice.startTime) || "Not specified"}
              {" — "}
              {formatTime(notice.endTime) || "Not specified"}
            </div>
          </div>
        )}

        {notice?.contactNumber && (
          <div
            style={{
              background: "#0F172A",
              border: "1px solid #334155",
              borderRadius: 12,
              padding: "13px 16px",
            }}
          >
            <div
              style={{
                color: "#64748B",
                fontSize: 11,
                fontWeight: 700,
                marginBottom: 5,
              }}
            >
              DEVELOPER CONTACT
            </div>

            <div
              style={{
                color: "#60A5FA",
                fontWeight: 800,
                fontSize: 15,
              }}
            >
              📱 {notice.contactNumber}
            </div>
          </div>
        )}

        <div
          style={{
            color: "#64748B",
            fontSize: 12,
            marginTop: 20,
            lineHeight: 1.6,
          }}
        >
          The website will become available after the developer completes the
          work.
        </div>
      </div>
    </div>
  );
}