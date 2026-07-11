function formatRelativeTime(value) {
  if (!value) return "";

  try {
    if (value?.toDate) {
      value = value.toDate();
    }

    const time = new Date(value).getTime();

    if (Number.isNaN(time)) {
      return "";
    }

    const difference = Date.now() - time;
    const seconds = Math.floor(difference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 30) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes} min ago`;
    }

    if (hours < 24) {
      return `${hours} hr ago`;
    }

    if (days === 1) {
      return "Yesterday";
    }

    if (days < 7) {
      return `${days} days ago`;
    }

    return new Date(time).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function getTypeStyle(type) {
  const styles = {
    certificate: {
      border: "#F59E0B",
      background: "#451A0322",
      iconBackground: "#78350F",
      iconColor: "#FCD34D",
    },

    group: {
      border: "#6366F1",
      background: "#312E8122",
      iconBackground: "#3730A3",
      iconColor: "#C7D2FE",
    },

    practice: {
      border: "#22C55E",
      background: "#14532D22",
      iconBackground: "#166534",
      iconColor: "#BBF7D0",
    },

    system: {
      border: "#3B82F6",
      background: "#1E3A8A22",
      iconBackground: "#1D4ED8",
      iconColor: "#DBEAFE",
    },
  };

  return styles[type] || styles.system;
}

export default function NotificationItem({
  notification,
  onRead,
  onDelete,
  onAction,
  busy = false,
}) {
  if (!notification) {
    return null;
  }

  const typeStyle = getTypeStyle(notification.type);
  const isRead = Boolean(notification.isRead);

  async function handleOpen() {
    if (busy) return;

    if (!isRead && onRead) {
      await onRead(notification);
    }

    if (notification.action && onAction) {
      onAction(notification.action, notification);
    }
  }

  async function handleDelete(event) {
    event.stopPropagation();

    if (busy || !onDelete) {
      return;
    }

    await onDelete(notification);
  }

  return (
    <div
      onClick={handleOpen}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "14px",
        marginBottom: 10,
        borderRadius: 13,
        border: `1px solid ${isRead ? "#334155" : typeStyle.border}`,
        background: isRead ? "#0F172A" : typeStyle.background,
        cursor: busy ? "wait" : "pointer",
        opacity: busy ? 0.7 : 1,
        transition:
          "border-color 0.2s ease, background 0.2s ease",
      }}
    >
      {!isRead && (
        <div
          style={{
            position: "absolute",
            top: 9,
            right: 9,
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: typeStyle.border,
            boxShadow: `0 0 10px ${typeStyle.border}`,
          }}
        />
      )}

      <div
        style={{
          width: 42,
          height: 42,
          flexShrink: 0,
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: typeStyle.iconBackground,
          color: typeStyle.iconColor,
          fontSize: 20,
          border: `1px solid ${typeStyle.border}66`,
        }}
      >
        {notification.icon || "🔔"}
      </div>

      <div
        style={{
          flex: 1,
          minWidth: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 10,
            paddingRight: 8,
          }}
        >
          <div
            style={{
              color: isRead ? "#CBD5E1" : "#F8FAFC",
              fontSize: 14,
              fontWeight: isRead ? 700 : 900,
              lineHeight: 1.35,
            }}
          >
            {notification.title}
          </div>

          <div
            style={{
              color: "#64748B",
              fontSize: 10,
              whiteSpace: "nowrap",
              marginTop: 2,
            }}
          >
            {formatRelativeTime(
              notification.createdAt || notification._at,
            )}
          </div>
        </div>

        <div
          style={{
            color: isRead ? "#64748B" : "#94A3B8",
            fontSize: 12,
            lineHeight: 1.6,
            marginTop: 5,
            paddingRight: 8,
          }}
        >
          {notification.message}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            marginTop: 10,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                borderRadius: 999,
                padding: "3px 8px",
                color: typeStyle.iconColor,
                background: typeStyle.iconBackground,
                border: `1px solid ${typeStyle.border}66`,
                fontSize: 9,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {notification.type || "system"}
            </span>

            {!isRead && (
              <span
                style={{
                  color: typeStyle.border,
                  fontSize: 10,
                  fontWeight: 800,
                }}
              >
                New
              </span>
            )}

            {notification.actionLabel && (
              <span
                style={{
                  color: "#60A5FA",
                  fontSize: 10,
                  fontWeight: 800,
                }}
              >
                {notification.actionLabel} →
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleDelete}
            disabled={busy}
            title="Delete notification"
            style={{
              border: "none",
              background: "transparent",
              color: "#64748B",
              cursor: busy ? "wait" : "pointer",
              padding: "3px 5px",
              borderRadius: 6,
              fontSize: 14,
              lineHeight: 1,
            }}
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}