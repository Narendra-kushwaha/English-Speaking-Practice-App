import { useState, useEffect, useRef } from "react";

import {
  fsGet,
  fsSet,
  fsWhere,
  fsDel,
  rtSend,
  rtListen,
} from "../../utils/store";

import {
  sendGroupAcceptedNotification,
  sendGroupRejectedNotification,
  sendGroupRemovedNotification,
} from "../../utils/notifications";

import { S } from "../../data/questions";

import { Btn, TopBar, Field, Msg, Card } from "../shared/UI";

export default function GroupManager({ onBack, adminProfile }) {
  const [screen, setScreen] = useState("list");
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupName, setGroupName] = useState("");
  const [batch, setBatch] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([]);
  const [msgText, setMsgText] = useState("");

  const chatRef = useRef(null);
  const unsubRef = useRef(null);

  const adminId = adminProfile.adminId;
  const storeKey = `groups_${adminId}`;

  useEffect(() => {
    if (screen === "list") {
      loadGroups();
    }
  }, [screen]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      if (unsubRef.current) {
        unsubRef.current();
      }
    };
  }, []);

  async function loadGroups() {
    setLoading(true);

    const data = await fsGet("groups", storeKey);
    const list = data?.list || [];

    setGroups(list);

    const requests = await fsWhere(
      "joinRequests",
      "status",
      "==",
      "pending",
    );

    setPendingRequests(
      requests.filter((request) =>
        list.some((group) => group.id === request.groupId),
      ),
    );

    setLoading(false);
  }

  async function createGroup() {
    if (!groupName || !batch) {
      setError("Enter group name and batch.");
      return;
    }

    setSaving(true);

    const newGroup = {
      id: `g_${Date.now()}`,
      name: groupName,
      batch,
      adminId,
      createdAt: Date.now(),
      members: [],
      blocked: [],
    };

    const updated = [...groups, newGroup];

    await fsSet("groups", storeKey, {
      list: updated,
    });

    setGroups(updated);
    setGroupName("");
    setBatch("");
    setSaving(false);
    setScreen("list");
  }

  async function deleteGroup(id) {
    const updated = groups.filter((group) => group.id !== id);

    await fsSet("groups", storeKey, {
      list: updated,
    });

    setGroups(updated);
  }

  async function acceptRequest(request) {
    const data = await fsGet("groups", storeKey);

    const updatedGroups = (data?.list || []).map((group) => {
      if (group.id === request.groupId) {
        const groupMembers = group.members || [];

        const alreadyExists = groupMembers.some((member) =>
          typeof member === "object"
            ? member.uid === request.studentId
            : member === request.studentId,
        );

        return {
          ...group,
          members: alreadyExists
            ? groupMembers
            : [
                ...groupMembers,
                {
                  uid: request.studentId,
                  name: request.studentName,
                },
              ],
        };
      }

      return group;
    });

    await fsSet("groups", storeKey, {
      list: updatedGroups,
    });

    await fsDel("joinRequests", request.id);

    await sendGroupAcceptedNotification({
      studentId: request.studentId,
      adminId,
      groupId: request.groupId,
      groupName: request.groupName || "the group",
    });

    setGroups(updatedGroups);

    setPendingRequests((previous) =>
      previous.filter((item) => item.id !== request.id),
    );
  }

  async function rejectRequest(request) {
    await fsDel("joinRequests", request.id);

    await sendGroupRejectedNotification({
      studentId: request.studentId,
      adminId,
      groupId: request.groupId,
      groupName: request.groupName || "the group",
    });

    setPendingRequests((previous) =>
      previous.filter((item) => item.id !== request.id),
    );
  }

  function openChat(group) {
    setActiveGroup(group);
    setScreen("chat");

    if (unsubRef.current) {
      unsubRef.current();
    }

    unsubRef.current = rtListen(group.id, (chatMessages) =>
      setMessages(chatMessages),
    );
  }

  async function sendMessage() {
    if (!msgText.trim() || !activeGroup) {
      return;
    }

    await rtSend(activeGroup.id, {
      text: msgText.trim(),
      senderName: adminProfile.fullName,
      senderId: adminProfile.uid,
      role: "admin",
    });

    setMsgText("");
  }

  function openMembers(group) {
    setActiveGroup(group);

    const list = (group.members || []).map((member) => {
      if (typeof member === "object") {
        return member;
      }

      return {
        uid: member,
        name: "Unknown Member",
      };
    });

    setMembers(list);
    setScreen("members");
  }

  async function removeMember(groupId, uid) {
    const groupBeforeUpdate = groups.find(
      (group) => group.id === groupId,
    );

    const updated = groups.map((group) =>
      group.id === groupId
        ? {
            ...group,
            members: (group.members || []).filter((member) =>
              typeof member === "object"
                ? member.uid !== uid
                : member !== uid,
            ),
          }
        : group,
    );

    await fsSet("groups", storeKey, {
      list: updated,
    });

    await sendGroupRemovedNotification({
      studentId: uid,
      adminId,
      groupId,
      groupName:
        groupBeforeUpdate?.name || activeGroup?.name || "the group",
    });

    setGroups(updated);

    const updatedActive = updated.find(
      (group) => group.id === groupId,
    );

    if (updatedActive) {
      setActiveGroup(updatedActive);
      openMembers(updatedActive);
    }
  }

  if (screen === "list") {
    return (
      <div style={S.pg}>
        <div style={S.wrap}>
          <TopBar
            onBack={onBack}
            title="💬 Group Discussion"
            right={
              <Btn
                onClick={() => setScreen("create")}
                color="#22C55E"
                sm
              >
                + New Group
              </Btn>
            }
          />

          {pendingRequests.length > 0 && (
            <div
              style={{
                ...S.card,
                borderColor: "#F59E0B",
              }}
            >
              <div
                style={{
                  fontWeight: 800,
                  marginBottom: 10,
                }}
              >
                🔔 Pending Join Requests
              </div>

              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 8,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      {request.studentName}
                    </div>

                    <div
                      style={{
                        color: "#64748B",
                        fontSize: 12,
                      }}
                    >
                      {request.groupName}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                    }}
                  >
                    <Btn
                      onClick={() => acceptRequest(request)}
                      color="#22C55E"
                      sm
                    >
                      Accept
                    </Btn>

                    <Btn
                      onClick={() => rejectRequest(request)}
                      color="#EF4444"
                      sm
                    >
                      Reject
                    </Btn>
                  </div>
                </div>
              ))}
            </div>
          )}

          {loading && (
            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
                color: "#64748B",
              }}
            >
              Loading groups…
            </div>
          )}

          {groups.map((group) => (
            <div
              key={group.id}
              style={{
                ...S.card,
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  fontSize: 28,
                }}
              >
                👥
              </div>

              <div
                style={{
                  flex: 1,
                }}
              >
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 15,
                  }}
                >
                  {group.name}
                </div>

                <div
                  style={{
                    color: "#64748B",
                    fontSize: 12,
                  }}
                >
                  Batch: {group.batch} · {group.members?.length || 0}{" "}
                  members
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <Btn
                  onClick={() => openMembers(group)}
                  color="#22C55E"
                  sm
                >
                  👥 Members
                </Btn>

                <Btn
                  onClick={() => openChat(group)}
                  color="#6366F1"
                  sm
                >
                  Open Chat
                </Btn>

                <Btn
                  onClick={() => deleteGroup(group.id)}
                  color="#EF4444"
                  sm
                >
                  Delete
                </Btn>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (screen === "members") {
    return (
      <div style={S.pg}>
        <div style={S.wrap}>
          <TopBar
            onBack={() => setScreen("list")}
            title="👥 Group Members"
          />

          <Card>
            {members.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  color: "#64748B",
                  padding: "30px 0",
                }}
              >
                No members yet
              </div>
            )}

            {members.map((member) => (
              <div
                key={member.uid}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "#1E293B",
                  padding: "10px 12px",
                  borderRadius: 10,
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <div>👨‍🎓</div>

                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      {member.name}
                    </div>

                    <div
                      style={{
                        color: "#64748B",
                        fontSize: 11,
                      }}
                    >
                      Student
                    </div>
                  </div>
                </div>

                <Btn
                  onClick={() =>
                    removeMember(activeGroup.id, member.uid)
                  }
                  color="#EF4444"
                  sm
                >
                  Remove
                </Btn>
              </div>
            ))}
          </Card>
        </div>
      </div>
    );
  }

  if (screen === "create") {
    return (
      <div style={S.pg}>
        <div style={S.wrap}>
          <TopBar
            onBack={() => setScreen("list")}
            title="➕ Create Group"
          />

          <Msg type="error" text={error} />

          <Card>
            <Field
              label="Group Name *"
              value={groupName}
              onChange={(event) => setGroupName(event.target.value)}
              placeholder="e.g. Batch A - Morning"
            />

            <Field
              label="Batch *"
              value={batch}
              onChange={(event) => setBatch(event.target.value)}
              placeholder="e.g. Batch A, 2024"
            />

            <Btn
              onClick={createGroup}
              disabled={saving}
              color="#22C55E"
              full
            >
              {saving ? "Creating…" : "Create Group ✓"}
            </Btn>
          </Card>
        </div>
      </div>
    );
  }

  if (screen === "chat" && activeGroup) {
    return (
      <div
        style={{
          ...S.pg,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
        }}
      >
        <div
          style={{
            background: "#1E293B",
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <button
            onClick={() => {
              setScreen("list");

              if (unsubRef.current) {
                unsubRef.current();
              }
            }}
            style={{
              background: "none",
              border: "none",
              color: "#64748B",
              fontSize: 20,
              cursor: "pointer",
            }}
          >
            ←
          </button>

          <div>
            <div
              style={{
                fontWeight: 800,
              }}
            >
              {activeGroup.name}
            </div>

            <div
              style={{
                color: "#64748B",
                fontSize: 12,
              }}
            >
              Batch: {activeGroup.batch}
            </div>
          </div>
        </div>

        <div
          ref={chatRef}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 16,
          }}
        >
          {messages.length === 0 && (
            <div
              style={{
                textAlign: "center",
                color: "#64748B",
                padding: "40px 0",
              }}
            >
              No messages yet. Start discussion!
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  color:
                    message.role === "admin"
                      ? "#A5B4FC"
                      : "#94A3B8",
                  fontSize: 12,
                }}
              >
                {message.senderName}
              </div>

              <div
                style={{
                  background:
                    message.role === "admin"
                      ? "#6366F1"
                      : "#1E293B",
                  padding: "10px 14px",
                  borderRadius: 12,
                  marginTop: 4,
                  color: "#F8FAFC",
                }}
              >
                {message.text}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            padding: 12,
            background: "#1E293B",
            borderTop: "1px solid #334155",
          }}
        >
          <input
            value={msgText}
            onChange={(event) => setMsgText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                sendMessage();
              }
            }}
            placeholder="Type message..."
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: 10,
              background: "#0F172A",
              border: "1px solid #334155",
              color: "#F8FAFC",
              outline: "none",
            }}
          />

          <Btn
            onClick={sendMessage}
            disabled={!msgText.trim()}
            color="#6366F1"
          >
            Send →
          </Btn>
        </div>
      </div>
    );
  }

  return null;
}