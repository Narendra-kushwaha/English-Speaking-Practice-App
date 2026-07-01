import { useState, useEffect, useRef } from "react";
import { fsGet, fsSet, rtSend, rtListen } from "../../utils/store";
import { S } from "../../data/questions";
import { Btn, TopBar } from "../shared/UI";

export default function StudentGroups({ profile, onBack }) {
  const [screen, setScreen]           = useState("list");
  const [groups, setGroups]           = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [messages, setMessages]       = useState([]);
  const [msgText, setMsgText]         = useState("");
  const [loading, setLoading]         = useState(true);
  const chatRef  = useRef(null);
  const unsubRef = useRef(null);

  const storeKey = `groups_${profile.adminId}`;

  useEffect(() => { loadGroups(); }, []);
  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [messages]);
  useEffect(() => { return () => { if (unsubRef.current) unsubRef.current(); }; }, []);

  async function loadGroups() {
    setLoading(true);
    const data = await fsGet("groups", storeKey);
    const all  = data?.list || [];
    setGroups(all.filter(g => !g.blocked?.includes(profile.uid)));
    setLoading(false);
  }

  async function joinGroup(group) {
    if (!group.members?.includes(profile.uid)) {
      const updated = { ...group, members: [...(group.members || []), profile.uid] };
      const data    = await fsGet("groups", storeKey);
      const newList = (data?.list || []).map(g => g.id === group.id ? updated : g);
      await fsSet("groups", storeKey, { list: newList });
      group = updated;
    }
    setActiveGroup(group);
    if (unsubRef.current) unsubRef.current();
    unsubRef.current = rtListen(group.id, msgs => setMessages(msgs));
    setScreen("chat");
  }

  async function sendMessage() {
    if (!msgText.trim() || !activeGroup) return;
    await rtSend(activeGroup.id, {
      text: msgText.trim(), senderName: profile.fullName, senderId: profile.uid, role: "student",
    });
    setMsgText("");
  }

  if (screen === "list") return (
    <div style={S.pg}>
      <div style={S.wrap}>
        <TopBar onBack={onBack} title="💬 Group Discussion"
          right={<button onClick={loadGroups} style={{ background:"#1E293B", border:"1.5px solid #334155", color:"#94A3B8", borderRadius:8, padding:"7px 12px", cursor:"pointer", fontSize:12, fontWeight:600 }}>↻</button>} />

        {loading && <div style={{ textAlign:"center", padding:"40px 0", color:"#64748B" }}>Loading groups…</div>}
        {!loading && groups.length === 0 && (
          <div style={{ textAlign:"center", padding:"60px 0", color:"#475569" }}>
            <div style={{ fontSize:44, marginBottom:12 }}>💬</div>
            <div style={{ fontWeight:700, marginBottom:6 }}>No groups available</div>
            <div style={{ fontSize:13 }}>Your admin hasn't created any groups yet.</div>
          </div>
        )}

        {groups.map(g => {
          const isMember = g.members?.includes(profile.uid);
          return (
            <div key={g.id} style={{ ...S.card, display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
              <div style={{ fontSize:28 }}>👥</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:800, fontSize:15 }}>{g.name}</div>
                <div style={{ color:"#64748B", fontSize:12 }}>Batch: {g.batch} · {g.members?.length || 0} members</div>
                {isMember && <span style={{ background:"#14532D", border:"1px solid #22C55E", borderRadius:6, padding:"1px 8px", fontSize:11, color:"#86EFAC", fontWeight:700 }}>✓ Joined</span>}
              </div>
              <Btn onClick={() => joinGroup(g)} color={isMember ? "#6366F1" : "#22C55E"} sm>{isMember ? "Open Chat" : "Join & Chat"}</Btn>
            </div>
          );
        })}

        <div style={{ ...S.card, background:"#6366F111", borderColor:"#6366F133", fontSize:12, color:"#64748B", lineHeight:1.7 }}>
          💬 Your name is visible in group chats. Email, mobile and other details stay private.
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ ...S.pg, display:"flex", flexDirection:"column", height:"100vh" }}>
      <div style={{ background:"#1E293B", borderBottom:"1.5px solid #334155", padding:"14px 16px", display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
        <button onClick={() => { setScreen("list"); if (unsubRef.current) unsubRef.current(); }} style={{ background:"none", border:"none", color:"#64748B", cursor:"pointer", fontSize:20 }}>←</button>
        <div>
          <div style={{ fontWeight:800, fontSize:15 }}>{activeGroup?.name}</div>
          <div style={{ color:"#64748B", fontSize:11 }}>Batch: {activeGroup?.batch}</div>
        </div>
      </div>

      <div ref={chatRef} style={{ flex:1, overflowY:"auto", padding:"16px", display:"flex", flexDirection:"column", gap:10, minHeight:0 }}>
        {messages.length === 0 && <div style={{ textAlign:"center", color:"#475569", padding:"40px 0", fontSize:13 }}>No messages yet. Say hello! 👋</div>}
        {messages.map(m => {
          const isMe    = m.senderId === profile.uid;
          const isAdmin = m.role === "admin" || m.role === "developer";
          return (
            <div key={m.id} style={{ display:"flex", justifyContent:isMe ? "flex-end" : "flex-start" }}>
              <div style={{ maxWidth:"75%", padding:"10px 14px", borderRadius:12, background: isMe ? "#6366F1" : isAdmin ? "#78350F22" : "#1E293B", border:`1px solid ${isMe ? "#6366F144" : isAdmin ? "#F59E0B44" : "#334155"}` }}>
                {!isMe && <div style={{ fontSize:11, color:isAdmin ? "#FCD34D" : "#94A3B8", marginBottom:4, fontWeight:600 }}>{isAdmin ? `👨‍🏫 ${m.senderName}` : `👨‍🎓 ${m.senderName}`}</div>}
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
}
