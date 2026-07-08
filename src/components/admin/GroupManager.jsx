import { useState, useEffect, useRef } from "react";
import { fsGet, fsSet, fsWhere, fsDel, rtSend, rtListen } from "../../utils/store";
import { S } from "../../data/questions";
import { Btn, TopBar, Field, Msg, Card } from "../shared/UI";

export default function GroupManager({ onBack, adminProfile }) {

  const [screen, setScreen] = useState("list");
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);

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
    if(screen === "list") loadGroups();
  }, [screen]);


  useEffect(() => {
    if(chatRef.current)
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);


  useEffect(() => {
    return () => {
      if(unsubRef.current)
        unsubRef.current();
    };
  }, []);



  async function loadGroups(){

    setLoading(true);

    const data = await fsGet(
      "groups",
      storeKey
    );

    const list = data?.list || [];

    setGroups(list);



    const requests = await fsWhere(
      "joinRequests",
      "status",
      "==",
      "pending"
    );


    setPendingRequests(
      requests.filter(r =>
        list.some(g => g.id === r.groupId)
      )
    );


    setLoading(false);
  }



  async function createGroup(){

    if(!groupName || !batch){
      setError("Enter group name and batch.");
      return;
    }


    setSaving(true);


    const newGroup = {
      id:`g_${Date.now()}`,
      name:groupName,
      batch,
      adminId,
      createdAt:Date.now(),
      members:[],
      blocked:[]
    };


    const updated = [
      ...groups,
      newGroup
    ];


    await fsSet(
      "groups",
      storeKey,
      {
        list:updated
      }
    );


    setGroups(updated);
    setGroupName("");
    setBatch("");
    setSaving(false);
    setScreen("list");

  }



  async function deleteGroup(id){

    const updated =
      groups.filter(
        g => g.id !== id
      );


    await fsSet(
      "groups",
      storeKey,
      {
        list:updated
      }
    );


    setGroups(updated);
  }
  async function acceptRequest(request){

    const data = await fsGet(
      "groups",
      storeKey
    );


    const updatedGroups =
      (data?.list || []).map(g => {

        if(g.id === request.groupId){

          const members = g.members || [];

          return {
            ...g,
            members: members.includes(request.studentId)
              ? members
              : [
                  ...members,
                  request.studentId
                ]
          };
        }

        return g;
      });



    await fsSet(
      "groups",
      storeKey,
      {
        list:updatedGroups
      }
    );



    await fsDel(
      "joinRequests",
      request.id
    );


    setGroups(updatedGroups);


    setPendingRequests(
      prev =>
      prev.filter(
        r => r.id !== request.id
      )
    );

  }





  async function rejectRequest(request){

    await fsDel(
      "joinRequests",
      request.id
    );


    setPendingRequests(
      prev =>
      prev.filter(
        r => r.id !== request.id
      )
    );

  }





  function openChat(group){

    setActiveGroup(group);
    setScreen("chat");


    if(unsubRef.current)
      unsubRef.current();


    unsubRef.current =
      rtListen(
        group.id,
        msgs => setMessages(msgs)
      );

  }




  async function sendMessage(){

    if(!msgText.trim() || !activeGroup)
      return;


    await rtSend(
      activeGroup.id,
      {
        text:msgText.trim(),
        senderName:adminProfile.fullName,
        senderId:adminProfile.uid,
        role:"admin"
      }
    );


    setMsgText("");

  }




  async function removeMember(groupId, uid){

    const updated =
      groups.map(g =>
        g.id === groupId
        ? {
            ...g,
            members:
              (g.members || [])
              .filter(
                m => m !== uid
              )
          }
        : g
      );


    await fsSet(
      "groups",
      storeKey,
      {
        list:updated
      }
    );


    setGroups(updated);


    setActiveGroup(prev => ({
      ...prev,
      members:
        (prev.members || [])
        .filter(
          m => m !== uid
        )
    }));

  }




  if(screen === "list")

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

          <div style={{
            ...S.card,
            borderColor:"#F59E0B"
          }}>

            <div style={{
              fontWeight:800,
              marginBottom:10
            }}>
              🔔 Pending Join Requests
            </div>



            {pendingRequests.map(r => (

              <div
                key={r.id}
                style={{
                  display:"flex",
                  justifyContent:"space-between",
                  alignItems:"center",
                  gap:10,
                  marginBottom:8
                }}
              >

                <div>
                  <div style={{
                    fontWeight:700,
                    fontSize:14
                  }}>
                    {r.studentName}
                  </div>

                  <div style={{
                    color:"#64748B",
                    fontSize:12
                  }}>
                    {r.groupName}
                  </div>
                </div>



                <div style={{
                  display:"flex",
                  gap:6
                }}>

                  <Btn
                    onClick={() => acceptRequest(r)}
                    color="#22C55E"
                    sm
                  >
                    Accept
                  </Btn>


                  <Btn
                    onClick={() => rejectRequest(r)}
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
          <div style={{
            textAlign:"center",
            padding:"40px 0",
            color:"#64748B"
          }}>
            Loading groups…
          </div>
        )}



        {groups.map(g => (

          <div
            key={g.id}
            style={{
              ...S.card,
              display:"flex",
              alignItems:"center",
              gap:12,
              flexWrap:"wrap"
            }}
          >

            <div style={{fontSize:28}}>
              👥
            </div>


            <div style={{flex:1}}>

              <div style={{
                fontWeight:800,
                fontSize:15
              }}>
                {g.name}
              </div>


              <div style={{
                color:"#64748B",
                fontSize:12
              }}>
                Batch: {g.batch} · {g.members?.length || 0} members
              </div>

            </div>



            <div style={{
              display:"flex",
              gap:8
            }}>

              <Btn
                onClick={() => openChat(g)}
                color="#6366F1"
                sm
              >
                Open Chat
              </Btn>


              <Btn
                onClick={() => deleteGroup(g.id)}
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




  if(screen === "create")

  return (

    <div style={S.pg}>
      <div style={S.wrap}>


        <TopBar
          onBack={() => setScreen("list")}
          title="➕ Create Group"
        />


        <Msg
          type="error"
          text={error}
        />


        <Card>

          <Field
            label="Group Name *"
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
            placeholder="e.g. Batch A - Morning"
          />


          <Field
            label="Batch *"
            value={batch}
            onChange={e => setBatch(e.target.value)}
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





  if(screen === "chat" && activeGroup)

  return (

    <div style={{
      ...S.pg,
      display:"flex",
      flexDirection:"column",
      height:"100vh"
    }}>


      <div style={{
        background:"#1E293B",
        padding:"14px 16px",
        display:"flex",
        gap:12
      }}>


        <button
          onClick={() => {
            setScreen("list");
            if(unsubRef.current)
              unsubRef.current();
          }}
          style={{
            background:"none",
            border:"none",
            color:"#64748B",
            fontSize:20
          }}
        >
          ←
        </button>


        <div>

          <div style={{
            fontWeight:800
          }}>
            {activeGroup.name}
          </div>


          <div style={{
            color:"#64748B",
            fontSize:12
          }}>
            Batch: {activeGroup.batch}
          </div>


        </div>


      </div>





      <div
        ref={chatRef}
        style={{
          flex:1,
          overflowY:"auto",
          padding:16
        }}
      >


        {messages.map(m => (

          <div
            key={m.id}
            style={{
              marginBottom:10
            }}
          >

            <b>
              {m.senderName}
            </b>

            <div>
              {m.text}
            </div>

          </div>

        ))}


      </div>





      <div style={{
        display:"flex",
        gap:10,
        padding:12
      }}>


        <input
          value={msgText}
          onChange={e => setMsgText(e.target.value)}
          placeholder="Type message..."
          style={{
            flex:1,
            padding:10
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


  return null;

}