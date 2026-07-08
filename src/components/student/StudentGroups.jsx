import { useState, useEffect, useRef } from "react";

import {
  fsGet,
  fsSet,
  fsAll,
  rtSend,
  rtListen
} from "../../utils/store";

import { S } from "../../data/questions";
import { Btn, TopBar } from "../shared/UI";


export default function StudentGroups({
  profile,
  onBack
}) {
  const [screen, setScreen] = useState("list");

  const [groups, setGroups] = useState([]);

  const [activeGroup, setActiveGroup] = useState(null);

  const [messages, setMessages] = useState([]);

  const [msgText, setMsgText] = useState("");

  const [loading, setLoading] = useState(true);

  const [requests, setRequests] = useState([]);


  const chatRef = useRef(null);

  const unsubRef = useRef(null);


  const storeKey = `groups_${profile.adminId}`;



  useEffect(() => {
    loadGroups();
  }, []);



  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop =
        chatRef.current.scrollHeight;
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


    const data = await fsGet(
      "groups",
      storeKey
    );


    const all = data?.list || [];


    setGroups(
      all.filter(
        g =>
          !g.blocked?.includes(profile.uid)
      )
    );



    const req = await fsAll(
      "joinRequests"
    );


    setRequests(
      req.filter(
        r =>
          r.studentId === profile.uid
      )
    );


    setLoading(false);
  }
    async function requestJoin(group) {
    const requestId =
      `${profile.uid}_${group.id}`;


    const existing = await fsGet(
      "joinRequests",
      requestId
    );


    if (existing) {
      return;
    }


    await fsSet(
      "joinRequests",
      requestId,
      {
        studentId: profile.uid,

        studentName: profile.fullName,

        groupId: group.id,

        groupName: group.name,

        status: "pending"
      }
    );


    setRequests(
      prev => [
        ...prev,

        {
          id: requestId,
          studentId: profile.uid,
          groupId: group.id,
          status: "pending"
        }
      ]
    );
  }





  async function joinGroup(group) {
    const isMember =
      group.members?.some(
        m =>
          typeof m === "object"
            ? m.uid === profile.uid
            : m === profile.uid
      );


    if (!isMember) {
      return;
    }


    setActiveGroup(group);


    if (unsubRef.current) {
      unsubRef.current();
    }


    unsubRef.current =
      rtListen(
        group.id,
        msgs => setMessages(msgs)
      );


    setScreen("chat");
  }





  async function sendMessage() {
    if (!msgText.trim() || !activeGroup) {
      return;
    }


    await rtSend(
      activeGroup.id,
      {
        text: msgText.trim(),

        senderName: profile.fullName,

        senderId: profile.uid,

        role: "student"
      }
    );


    setMsgText("");
  }
    if (screen === "list") {
    return (
      <div style={S.pg}>
        <div style={S.wrap}>

          <TopBar
            onBack={onBack}
            title="💬 Group Discussion"
            right={
              <button
                onClick={loadGroups}
                style={{
                  background: "#1E293B",
                  border: "1.5px solid #334155",
                  color: "#94A3B8",
                  borderRadius: 8,
                  padding: "7px 12px",
                  cursor: "pointer"
                }}
              >
                ↻
              </button>
            }
          />


          {loading && (
            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
                color: "#64748B"
              }}
            >
              Loading groups…
            </div>
          )}



          {groups.map(g => {
            const isMember =
              g.members?.some(
                m =>
                  typeof m === "object"
                    ? m.uid === profile.uid
                    : m === profile.uid
              );


            const isPending =
              requests.some(
                r =>
                  r.groupId === g.id &&
                  r.status === "pending"
              );


            return (
              <div
                key={g.id}
                style={{
                  ...S.card,
                  display: "flex",
                  alignItems: "center",
                  gap: 12
                }}
              >

                <div
                  style={{
                    fontSize: 28
                  }}
                >
                  👥
                </div>



                <div
                  style={{
                    flex: 1
                  }}
                >

                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: 15
                    }}
                  >
                    {g.name}
                  </div>


                  <div
                    style={{
                      color: "#64748B",
                      fontSize: 12
                    }}
                  >
                    Batch: {g.batch} · {g.members?.length || 0} members
                  </div>



                  {isMember && (
                    <span
                      style={{
                        background: "#14532D",
                        color: "#86EFAC",
                        border: "1px solid #22C55E",
                        borderRadius: 6,
                        padding: "1px 8px",
                        fontSize: 11
                      }}
                    >
                      ✓ Joined
                    </span>
                  )}



                  {isPending && (
                    <span
                      style={{
                        background: "#78350F",
                        color: "#FCD34D",
                        border: "1px solid #F59E0B",
                        borderRadius: 6,
                        padding: "1px 8px",
                        fontSize: 11,
                        marginLeft: 6
                      }}
                    >
                      ⏳ Request Pending
                    </span>
                  )}

                </div>



                <Btn
                  onClick={() => {
                    if (isMember) {
                      joinGroup(g);
                    } else if (!isPending) {
                      requestJoin(g);
                    }
                  }}
                  color={
                    isMember
                      ? "#6366F1"
                      : "#22C55E"
                  }
                  sm
                >
                  {
                    isMember
                      ? "Open Chat"
                      : isPending
                        ? "Request Pending"
                        : "Request to Join"
                  }
                </Btn>


              </div>
            );
          })}

        </div>
      </div>
    );
  }

    return (
    <div
      style={{
        ...S.pg,
        display: "flex",
        flexDirection: "column",
        height: "100vh"
      }}
    >

      <div
        style={{
          background: "#1E293B",
          padding: "14px 16px"
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
            fontSize: 20
          }}
        >
          ←
        </button>


        <b>
          {activeGroup?.name}
        </b>

      </div>



      <div
        ref={chatRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 16
        }}
      >

        {messages.map(m => (
          <div
            key={m.id}
            style={{
              marginBottom: 12
            }}
          >

            <div
              style={{
                fontWeight: 700,
                fontSize: 12
              }}
            >
              {m.senderName}
            </div>


            <div>
              {m.text}
            </div>

          </div>
        ))}

      </div>




      <div
        style={{
          display: "flex",
          gap: 10,
          padding: 12
        }}
      >

        <input
          value={msgText}
          onChange={e =>
            setMsgText(e.target.value)
          }
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: 10
          }}
        />


        <Btn
          onClick={sendMessage}
          color="#6366F1"
        >
          Send →
        </Btn>

      </div>


    </div>
  );


}