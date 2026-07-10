import { useEffect, useState } from "react";
import { fsGet, fsSet, fsDel } from "../../utils/store";
import { S } from "../../data/questions";
import { Btn, TopBar, Msg, Card } from "../shared/UI";

export default function AnnouncementManager({ onBack, adminProfile }) {
  const [message, setMessage] = useState("");
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const adminId = adminProfile?.adminId;
  const docId = adminId;

  useEffect(() => {
    loadAnnouncement();
  }, []);

  async function loadAnnouncement() {
    setLoading(true);

    const data = await fsGet("announcements", docId);

    if (data) {
      setAnnouncement(data);
      setMessage(data.message || data.text || "");
    } else {
      setAnnouncement(null);
      setMessage("");
    }

    setLoading(false);
  }

  async function saveAnnouncement() {
    if (!message.trim()) {
      setMsg("Please write an announcement first.");
      setTimeout(() => setMsg(""), 2500);
      return;
    }

    setSaving(true);

    const payload = {
      adminId,
      adminName: adminProfile?.fullName || "Admin",
      message: message.trim(),
      text: message.trim(),
      createdAt: Date.now(),
      active: true,
    };

    const ok = await fsSet("announcements", docId, payload);

    if (ok) {
      setAnnouncement({ id: docId, ...payload });
      setMsg("Announcement saved successfully.");
    } else {
      setMsg("Something went wrong. Please try again.");
    }

    setSaving(false);
    setTimeout(() => setMsg(""), 2500);
  }

  async function deleteAnnouncement() {
    const ok = window.confirm("Delete this announcement?");
    if (!ok) return;

    setSaving(true);

    await fsDel("announcements", docId);

    setAnnouncement(null);
    setMessage("");
    setMsg("Announcement deleted.");

    setSaving(false);
    setTimeout(() => setMsg(""), 2500);
  }

  function formatDate(value) {
    if (!value) return "N/A";

    try {
      if (value?.toDate) {
        return value.toDate().toLocaleString();
      }

      return new Date(value).toLocaleString();
    } catch {
      return "N/A";
    }
  }

  return (
    <div style={S.pg}>
      <div style={S.wrap}>
        <TopBar onBack={onBack} title="📢 Announcements" />

        <Msg type={msg.includes("wrong") ? "error" : "success"} text={msg} />

        <Card>
          <div style={{ ...S.lbl, marginBottom: 8 }}>
            Write Announcement
          </div>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Example: Tomorrow class will start at 8:00 AM."
            rows={6}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "13px 14px",
              borderRadius: 12,
              background: "#0F172A",
              border: "1.5px solid #334155",
              color: "#F8FAFC",
              fontSize: 14,
              lineHeight: 1.6,
              outline: "none",
              resize: "vertical",
              marginBottom: 12,
            }}
          />

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <Btn
              onClick={saveAnnouncement}
              disabled={saving}
              color="#22C55E"
            >
              {saving ? "Saving..." : announcement ? "Update Announcement" : "Publish Announcement"}
            </Btn>

            {announcement && (
              <Btn
                onClick={deleteAnnouncement}
                disabled={saving}
                color="#EF4444"
              >
                Delete
              </Btn>
            )}

            <Btn
              onClick={loadAnnouncement}
              disabled={loading}
              color="#6366F1"
            >
              Refresh
            </Btn>
          </div>
        </Card>

        <Card>
          <div style={{ ...S.lbl, marginBottom: 12 }}>
            Current Announcement Preview
          </div>

          {loading && (
            <div style={{ color: "#64748B", textAlign: "center", padding: "30px 0" }}>
              Loading announcement...
            </div>
          )}

          {!loading && !announcement && (
            <div style={{ color: "#64748B", textAlign: "center", padding: "30px 0" }}>
              No announcement published yet.
            </div>
          )}

          {!loading && announcement && (
            <div
              style={{
                background: "linear-gradient(135deg,#1E3A8A,#1E40AF)",
                border: "1px solid #3B82F6",
                borderRadius: 14,
                padding: 16,
              }}
            >
              <div
                style={{
                  color: "#93C5FD",
                  fontSize: 12,
                  fontWeight: 800,
                  marginBottom: 6,
                }}
              >
                📢 ADMIN ANNOUNCEMENT
              </div>

              <div
                style={{
                  color: "#F8FAFC",
                  fontSize: 15,
                  lineHeight: 1.6,
                  fontWeight: 600,
                }}
              >
                {announcement.message || announcement.text}
              </div>

              <div
                style={{
                  marginTop: 8,
                  color: "#BFDBFE",
                  fontSize: 11,
                }}
              >
                Last updated: {formatDate(announcement.createdAt || announcement._at)}
              </div>
            </div>
          )}
        </Card>

        <div
          style={{
            ...S.card,
            background: "#6366F111",
            borderColor: "#6366F133",
            color: "#94A3B8",
            fontSize: 12,
            lineHeight: 1.7,
          }}
        >
          ℹ️ This announcement will be visible only to students registered under your Admin ID.
        </div>
      </div>
    </div>
  );
}
