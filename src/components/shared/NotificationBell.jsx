import { useEffect, useState } from "react";
import { getUnreadCount } from "../../utils/notifications";
import NotificationPanel from "./NotificationPanel";

export default function NotificationBell({ studentId }) {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUnreadCount();
  }, [studentId]);

  useEffect(() => {
    if (!open) {
      loadUnreadCount();
    }
  }, [open]);

  async function loadUnreadCount() {
    if (!studentId) {
      setUnreadCount(0);
      return;
    }

    setLoading(true);

    try {
      const count = await getUnreadCount(studentId);
      setUnreadCount(count);
    } catch (error) {
      console.error(
        "Unread notification count could not be loaded:",
        error,
      );

      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }

  function openPanel() {
    setOpen(true);
  }

  function closePanel() {
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={openPanel}
        title="Notifications"
        aria-label={`Notifications${
          unreadCount > 0 ? `, ${unreadCount} unread` : ""
        }`}
        style={{
          position: "relative",
          width: 40,
          height: 36,
          padding: 0,
          borderRadius: 9,
          border: `1.5px solid ${
            unreadCount > 0 ? "#F59E0B" : "#334155"
          }`,
          background: unreadCount > 0 ? "#451A0322" : "#1E293B",
          color: unreadCount > 0 ? "#FCD34D" : "#94A3B8",
          cursor: loading ? "wait" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          opacity: loading ? 0.75 : 1,
        }}
      >
        🔔

        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: -7,
              right: -7,
              minWidth: 19,
              height: 19,
              padding: "0 5px",
              borderRadius: 999,
              background: "#EF4444",
              border: "2px solid #0F172A",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              lineHeight: 1,
              fontWeight: 900,
              boxSizing: "border-box",
              boxShadow: "0 4px 12px rgba(239,68,68,0.35)",
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      <NotificationPanel
        studentId={studentId}
        open={open}
        onClose={closePanel}
      />
    </>
  );
}