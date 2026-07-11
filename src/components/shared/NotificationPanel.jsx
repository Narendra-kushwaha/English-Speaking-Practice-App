import { useEffect, useState } from "react";

import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
} from "../../utils/notifications";

import NotificationItem from "./NotificationItem";

export default function NotificationPanel({ studentId, open, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [open]);

  async function loadNotifications() {
    if (!studentId) return;

    setLoading(true);

    const list = await getNotifications(studentId);

    setNotifications(list);
    setLoading(false);
  }

  async function handleRead(notification) {
    await markNotificationAsRead(notification.id);
    loadNotifications();
  }

  async function handleDelete(notification) {
    setBusy(true);

    await deleteNotification(notification.id);
    await loadNotifications();

    setBusy(false);
  }

  async function handleReadAll() {
    setBusy(true);

    await markAllNotificationsAsRead(studentId);
    await loadNotifications();

    setBusy(false);
  }

  async function handleClearAll() {
    if (!window.confirm("Delete all notifications?")) {
      return;
    }

    setBusy(true);

    await clearAllNotifications(studentId);
    await loadNotifications();

    setBusy(false);
  }

  if (!open) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.55)",
        zIndex: 9999,
        display: "flex",
        justifyContent: "flex-end",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 420,
          maxWidth: "100%",
          height: "100%",
          background: "#0F172A",
          display: "flex",
          flexDirection: "column",
          borderLeft: "1px solid #334155",
        }}
      >
        <div
          style={{
            padding: 18,
            borderBottom: "1px solid #334155",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontWeight: 900,
                  fontSize: 18,
                }}
              >
                🔔 Notifications
              </div>

              <div
                style={{
                  color: "#64748B",
                  fontSize: 12,
                  marginTop: 3,
                }}
              >
                {unreadCount} unread
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                color: "#94A3B8",
                fontSize: 22,
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 15,
            }}
          >
            <button
              onClick={handleReadAll}
              disabled={busy}
              style={{
                flex: 1,
                background: "#1E293B",
                color: "#F8FAFC",
                border: "1px solid #334155",
                padding: "9px",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Mark All Read
            </button>

            <button
              onClick={handleClearAll}
              disabled={busy}
              style={{
                flex: 1,
                background: "#450A0A",
                color: "#FCA5A5",
                border: "1px solid #EF4444",
                padding: "9px",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Clear All
            </button>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 14,
          }}
        >
          {loading && (
            <div
              style={{
                color: "#64748B",
                textAlign: "center",
                marginTop: 50,
              }}
            >
              Loading...
            </div>
          )}

          {!loading && notifications.length === 0 && (
            <div
              style={{
                textAlign: "center",
                marginTop: 80,
                color: "#64748B",
              }}
            >
              <div
                style={{
                  fontSize: 46,
                  marginBottom: 10,
                }}
              >
                🔔
              </div>

              No notifications
            </div>
          )}

          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRead={handleRead}
              onDelete={handleDelete}
              busy={busy}
            />
          ))}
        </div>
      </div>
    </div>
  );
}