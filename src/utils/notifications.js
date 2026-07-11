import { fsDel, fsUpdate, fsWhere, fsSet } from "./store";

const NOTIFICATION_COLLECTION = "notifications";

function createNotificationId(studentId = "student") {
  const randomPart = Math.random().toString(36).slice(2, 9);

  return `${studentId}_${Date.now()}_${randomPart}`;
}

function normalizeTime(value) {
  if (!value) return 0;

  try {
    if (value?.toDate) {
      return value.toDate().getTime();
    }

    const time = new Date(value).getTime();

    return Number.isNaN(time) ? 0 : time;
  } catch {
    return 0;
  }
}

export async function sendNotification({
  studentId,
  adminId = "",
  title,
  message,
  type = "system",
  icon = "🔔",
  action = "",
  actionLabel = "",
  metadata = {},
}) {
  if (!studentId) {
    console.error(
      "Notification could not be sent: studentId is missing.",
    );

    return null;
  }

  if (!title?.trim()) {
    console.error(
      "Notification could not be sent: title is missing.",
    );

    return null;
  }

  if (!message?.trim()) {
    console.error(
      "Notification could not be sent: message is missing.",
    );

    return null;
  }

  const notificationId = createNotificationId(studentId);
  const now = Date.now();

  const notification = {
    notificationId,
    studentId,
    adminId,

    title: title.trim(),
    message: message.trim(),

    type,
    icon,

    action,
    actionLabel,

    metadata,

    isRead: false,
    readAt: null,

    createdAt: now,
    updatedAt: now,
  };

  const saved = await fsSet(
    NOTIFICATION_COLLECTION,
    notificationId,
    notification,
  );

  if (!saved) {
    console.error("Notification could not be saved.");

    return null;
  }

  return {
    id: notificationId,
    ...notification,
  };
}

export async function getNotifications(studentId) {
  if (!studentId) return [];

  const notifications = await fsWhere(
    NOTIFICATION_COLLECTION,
    "studentId",
    "==",
    studentId,
  );

  return notifications.sort(
    (first, second) =>
      normalizeTime(second.createdAt) - normalizeTime(first.createdAt),
  );
}

export async function getUnreadNotifications(studentId) {
  const notifications = await getNotifications(studentId);

  return notifications.filter((notification) => !notification.isRead);
}

export async function getUnreadCount(studentId) {
  const unreadNotifications = await getUnreadNotifications(studentId);

  return unreadNotifications.length;
}

export async function markNotificationAsRead(notificationId) {
  if (!notificationId) return false;

  return fsUpdate(NOTIFICATION_COLLECTION, notificationId, {
    isRead: true,
    readAt: Date.now(),
    updatedAt: Date.now(),
  });
}

export async function markNotificationAsUnread(notificationId) {
  if (!notificationId) return false;

  return fsUpdate(NOTIFICATION_COLLECTION, notificationId, {
    isRead: false,
    readAt: null,
    updatedAt: Date.now(),
  });
}

export async function markAllNotificationsAsRead(studentId) {
  if (!studentId) return false;

  const notifications = await getNotifications(studentId);

  const unreadNotifications = notifications.filter(
    (notification) => !notification.isRead,
  );

  if (unreadNotifications.length === 0) {
    return true;
  }

  const now = Date.now();

  const results = await Promise.all(
    unreadNotifications.map((notification) =>
      fsUpdate(NOTIFICATION_COLLECTION, notification.id, {
        isRead: true,
        readAt: now,
        updatedAt: now,
      }),
    ),
  );

  return results.every(Boolean);
}

export async function deleteNotification(notificationId) {
  if (!notificationId) return false;

  return fsDel(NOTIFICATION_COLLECTION, notificationId);
}

export async function clearAllNotifications(studentId) {
  if (!studentId) return false;

  const notifications = await getNotifications(studentId);

  if (notifications.length === 0) {
    return true;
  }

  const results = await Promise.all(
    notifications.map((notification) =>
      fsDel(NOTIFICATION_COLLECTION, notification.id),
    ),
  );

  return results.every(Boolean);
}

export async function sendCertificateApprovedNotification({
  studentId,
  adminId = "",
  certificateId = "",
}) {
  return sendNotification({
    studentId,
    adminId,
    title: "Certificate Approved",
    message:
      "Your certificate is ready. You can now download it from your dashboard.",
    type: "certificate",
    icon: "🎓",
    action: "certificate",
    actionLabel: "View Certificate",
    metadata: {
      certificateId,
      status: "active",
    },
  });
}

export async function sendCertificateRevokedNotification({
  studentId,
  adminId = "",
  certificateId = "",
}) {
  return sendNotification({
    studentId,
    adminId,
    title: "Certificate Revoked",
    message:
      "Your certificate has been disabled by the admin and is no longer available for download.",
    type: "certificate",
    icon: "❌",
    action: "certificate",
    actionLabel: "View Status",
    metadata: {
      certificateId,
      status: "revoked",
    },
  });
}

export async function sendGroupAcceptedNotification({
  studentId,
  adminId = "",
  groupId = "",
  groupName = "the group",
}) {
  return sendNotification({
    studentId,
    adminId,
    title: "Join Request Accepted",
    message: `Your request to join ${groupName} has been accepted.`,
    type: "group",
    icon: "✅",
    action: "groups",
    actionLabel: "Open Group",
    metadata: {
      groupId,
      groupName,
      status: "accepted",
    },
  });
}

export async function sendGroupRejectedNotification({
  studentId,
  adminId = "",
  groupId = "",
  groupName = "the group",
}) {
  return sendNotification({
    studentId,
    adminId,
    title: "Join Request Rejected",
    message: `Your request to join ${groupName} was not accepted.`,
    type: "group",
    icon: "❌",
    action: "groups",
    actionLabel: "View Groups",
    metadata: {
      groupId,
      groupName,
      status: "rejected",
    },
  });
}

export async function sendGroupRemovedNotification({
  studentId,
  adminId = "",
  groupId = "",
  groupName = "the group",
}) {
  return sendNotification({
    studentId,
    adminId,
    title: "Removed From Group",
    message: `You have been removed from ${groupName} by the admin.`,
    type: "group",
    icon: "🚫",
    action: "groups",
    actionLabel: "View Groups",
    metadata: {
      groupId,
      groupName,
      status: "removed",
    },
  });
}