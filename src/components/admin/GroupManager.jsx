import { useState, useEffect, useRef } from "react";
import { fsGet, fsSet, fsWhere, rtSend, rtListen } from "../../utils/store";
import { S } from "../../data/questions";
import { Btn, TopBar, Field, Msg, Card } from "../shared/UI";

export default function GroupManager({ onBack, adminProfile }) {
  const [screen, setScreen]   = useState("list");
  const [groups, setGroups]   = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  const [groupName, setGroupName] = useState("");
  const [batch, setBatch]         = useState("");
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");

  const [messages, setMessages] = useState([]);
  const [msgText, setMsgText]   = useState("");
  const chatRef  = useRef(null);
  const unsubRef = useRef(null);

  const adminId = adminProfile.adminId;
  const storeKey = `groups_${adminId}`;

  useEffect(() => { if (screen === "list") loadGroups(); }, [screen]);
  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [messages]);
  useEffect(() => { return () => { if (unsubRef.current) unsubRef.current(); }; }, []);

  async function loadGroups() {
    setLoading(true);
    const data = await fsGet("groups", storeKey);
    setGroups(data?.list || []);
    setLoading(false);
  }

  async function createGroup() {
    if (!groupName || !batch) { setError("Enter group name and batch."); return; }
    setSaving(true);
    const newGroup = { id: `g_${Date.now()}`, name: groupName, batch, adminId, createdAt: Date.now(), members: [], blocked: [] };
    const updated  = [...groups, newGroup];
    await fsSet("groups", storeKey, { list: updated });
    setGroups(updated); setGroupName(""); setBatch(""); setSaving(false); setScreen("list");
  }

  async function deleteGroup(id) {
    const updated = groups.filter(g => g.id !== id);
    await fsSet("groups", storeKey, { list: updated });
    setGroups(updated);
  }

  function openChat(group) {
    setActiveGroup(group); setScreen("chat");
    if (unsubRef.current) unsubRef.current();
    unsubRef.current = rtListen(group.id, msgs => setMessages(msgs));
  }

  async function sendMessage() {
    if (!msgText.trim() || !activeGroup) return;
    await rtSend(activeGroup.id, {
      text: msgText.trim(), senderName: adminProfile.fullName, senderId: adminProfile.uid, role: "admin",
    });
    setMsgText("");
  }

  async function removeMember(groupId, uid) {
    const updated = groups.map(g => g.id === groupId ? { ...g, members: g.members.filter(m => m !== uid) } : g);
    await fsSet("groups", storeKey, { list: updated });
    setGroups(updated);
    setActiveGroup(prev => ({ ...prev, members: prev.members.filter(m => m !== uid) }));
  }

  if (screen === "list") return (
    <div style={S.pg}><div style={S.wrap}>
      <TopBar onBack={onBack} title="💬 Group Discussion" right={<Btn onClick={() => setScreen("create")} color="#22C55E" sm>+ New Group</Btn>} />
      {loading && <div style={{ textAlign:"center", padding:"40px 0", color:"#64748B" }}>Loading groups…</div>}
      {!loading && groups.length === 0 && (
        <div style={{ textAlign:"center", padding:"40px 0", color:"#475569" }}>
          <div style={{ fontSize:40, marginBottom:12 }}>💬</div>
          <div style={{ fontWeight:700, marginBottom:6 }}>No groups yet</div>
          <Btn onClick={() => setScreen("create")} color="#22C55E">+ Create Group</Btn>
        </div>
      )}
      {groups.map(g => (
        <div key={g.id} style={{ ...S.card, display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
          <div style={{ fontSize:28 }}>👥</div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:800, fontSize:15 }}>{g.name}</div>
            <div style={{ color:"#64748B", fontSize:12 }}>Batch: {g.batch} · {g.members?.length||0} members</div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <Btn onClick={() => openChat(g)} color="#6366F1" sm>Open Chat</Btn>
            <Btn onClick={() => deleteGroup(g.id)} color="#EF4444" sm>Delete</Btn>
          </div>
        </div>
      ))}
    </div></div>
  );

  if (screen === "create") return (
    <div style={S.pg}><div style={S.wrap}>
      <TopBar onBack={() => setScreen("list")} title="➕ Create Group" />
      <Msg type="error" text={error} />
      <Card>
        <Field label="Group Name *" value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="e.g. Batch A - Morning" />
        <Field label="Batch *" value={batch} onChange={e => setBatch(e.target.value)} placeholder="e.g. Batch A, 2024" />
        <Btn onClick={createGroup} disabled={saving} color="#22C55E" full>{saving ? "Creating…" : "Create Group ✓"}</Btn>
      </Card>
    </div></div>
  );

  if (screen === "chat" && activeGroup) return (
    <div style={{ ...S.pg, display:"flex", flexDirection:"column", height:"100vh" }}>
      <div style={{ background:"#1E293B", borderBottom:"1.5px solid #334155", padding:"14px 16px", display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
        <button onClick={() => { setScreen("list"); if (unsubRef.current) unsubRef.current(); }} style={{ background:"none", border:"none", color:"#64748B", cursor:"pointer", fontSize:20 }}>←</button>
        <div>
          <div style={{ fontWeight:800, fontSize:15 }}>{activeGroup.name}</div>
          <div style={{ color:"#64748B", fontSize:11 }}>Batch: {activeGroup.batch} · {activeGroup.members?.length||0} members</div>
        </div>
      </div>

      {activeGroup.members?.length > 0 && (
        <div style={{ background:"#0F172A", padding:"10px 16px", borderBottom:"1px solid #1E293B", display:"flex", gap:8, overflowX:"auto", flexShrink:0 }}>
          {activeGroup.members.map(uid => (
            <div key={uid} style={{ background:"#1E293B", borderRadius:20, padding:"4px 12px", fontSize:12, color:"#94A3B8", flexShrink:0, display:"flex", alignItems:"center", gap:6 }}>
              👨‍🎓 Member
              <button onClick={() => removeMember(activeGroup.id, uid)} style={{ background:"none", border:"none", color:"#EF4444", cursor:"pointer", fontSize:10, fontWeight:700 }}>✕</button>
            </div>
          ))}
        </div>
      )}

      <div ref={chatRef} style={{ flex:1, overflowY:"auto", padding:"16px", display:"flex", flexDirection:"column", gap:10, minHeight:0 }}>
        {messages.length === 0 && <div style={{ textAlign:"center", color:"#475569", padding:"40px 0", fontSize:13 }}>No messages yet. Start the discussion!</div>}
        {messages.map(m => {
          const isAdmin = m.role === "admin" || m.role === "developer";
          return (
            <div key={m.id} style={{ display:"flex", justifyContent:isAdmin?"flex-end":"flex-start" }}>
              <div style={{ maxWidth:"75%", padding:"10px 14px", borderRadius:12, background:isAdmin?"#6366F1":"#1E293B", border:`1px solid ${isAdmin?"#6366F144":"#334155"}` }}>
                {!isAdmin && <div style={{ fontSize:11, color:"#94A3B8", marginBottom:4, fontWeight:600 }}>👨‍🎓 {m.senderName}</div>}
                {isAdmin && <div style={{ fontSize:10, color:"#A5B4FC", marginBottom:4 }}>👨‍🏫 {m.senderName}</div>}
                <div style={{ fontSize:14, color:"#F8FAFC", lineHeight:1.5 }}>{m.text}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ background:"#1E293B", borderTop:"1.5px solid #334155", padding:"12px 16px", display:"flex", gap:10, flexShrink:0 }}>
        <input value={msgText} onChange={e => setMsgText(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder="Type a message…" style={{ flex:1, padding:"11px 14px", borderRadius:10, background:"#0F172A", border:"1.5px solid #334155", color:"#F8FAFC", fontSize:14, outline:"none" }} />
        <Btn onClick={sendMessage} disabled={!msgText.trim()} color="#6366F1">Send →</Btn>
      </div>
    </div>
  );

  return null;
}
