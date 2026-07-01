import { useState } from "react";
import { changeUserPassword, changeUserEmail, updateUserProfile } from "../../utils/auth";
import { auth } from "../../utils/setup";
import { Btn, Field, Msg, Card, TopBar } from "../shared/UI";
import { S } from "../../data/questions";

export default function AccountSettings({ profile, onBack }) {

  const [tab, setTab] = useState("password");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const [emailPass, setEmailPass] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const [newMobile, setNewMobile] = useState("");


  function reset(){
    setError("");
    setSuccess("");
  }


  async function doPasswordChange(){

    reset();

    if(!currentPass || !newPass || !confirmPass){
      setError("Please fill all fields.");
      return;
    }

    if(newPass !== confirmPass){
      setError("New passwords do not match.");
      return;
    }

    if(newPass.length < 6){
      setError("Password must be at least 6 characters.");
      return;
    }


    setLoading(true);

    try{

      await changeUserPassword(currentPass,newPass);

      setSuccess("✅ Password changed successfully!");

      setCurrentPass("");
      setNewPass("");
      setConfirmPass("");

    }catch(e){

      if(
        e.message.includes("wrong-password") ||
        e.message.includes("invalid-credential")
      ){
        setError("Current password is incorrect.");
      }
      else{
        setError(e.message);
      }

    }

    setLoading(false);
  }



  async function doEmailChange(){

    reset();

    if(!emailPass || !newEmail){
      setError("Please fill all fields.");
      return;
    }


    setLoading(true);


    try{

      await changeUserEmail(emailPass,newEmail);

      setSuccess("✅ Email updated successfully!");

      setEmailPass("");
      setNewEmail("");

    }catch(e){

      if(
        e.message.includes("wrong-password") ||
        e.message.includes("invalid-credential")
      ){
        setError("Password is incorrect.");
      }
      else{
        setError(e.message);
      }

    }


    setLoading(false);
  }




  async function doMobileChange(){

    reset();

    if(!newMobile || newMobile.length < 10){
      setError("Enter valid mobile number.");
      return;
    }


    setLoading(true);


    try{

      await updateUserProfile(
        auth.currentUser.uid,
        {mobile:newMobile}
      );


      setSuccess("✅ Mobile updated successfully!");

      setNewMobile("");


    }catch{

      setError("Could not update mobile.");

    }


    setLoading(false);
  }




  return (

    <div style={S.pg}>
    <div style={S.wrap}>


      <TopBar 
        onBack={onBack}
        title="⚙️ Account Settings"
      />



      {/* Profile */}

      <Card>

        <div style={{
          display:"flex",
          alignItems:"center",
          gap:14
        }}>


          <div style={{
            width:48,
            height:48,
            borderRadius:"50%",
            background:"#6366F122",
            border:"2px solid #6366F1",
            display:"flex",
            alignItems:"center",
            justifyContent:"center",
            fontSize:22
          }}>

          {
            profile?.role==="developer"
            ?"👨‍💻"
            :
            profile?.role==="admin"
            ?"👨‍🏫"
            :
            "👨‍🎓"
          }

          </div>



          <div>

            <div style={{
              fontWeight:800,
              fontSize:16
            }}>
              {profile?.fullName}
            </div>


            <div style={{
              color:"#64748B",
              fontSize:12
            }}>
              {profile?.email}
            </div>


            <div style={{
              color:"#64748B",
              fontSize:12
            }}>
              📱 {profile?.mobile}
            </div>


          </div>


        </div>


      </Card>




      <div style={{
        display:"flex",
        borderBottom:"2px solid #1E293B",
        marginBottom:20
      }}>


      {
        [
          ["password","🔑 Password"],
          ["email","📧 Email"],
          ["mobile","📱 Mobile"]

        ].map(([t,l])=>(


        <button
        key={t}
        onClick={()=>{
          setTab(t);
          reset();
        }}
        style={{
          padding:"9px 16px",
          border:"none",
          background:"none",
          cursor:"pointer",
          borderBottom:
          tab===t
          ?"2px solid #6366F1"
          :"2px solid transparent",
          color:
          tab===t
          ?"#818CF8"
          :"#475569",
          fontWeight:800
        }}
        >

        {l}

        </button>


        ))
      }

      </div>



      <Msg type="error" text={error}/>
      <Msg type="success" text={success}/>




      {
      tab==="password" &&

      <Card>

        <Field
        label="Current Password"
        type="password"
        value={currentPass}
        onChange={e=>setCurrentPass(e.target.value)}
        />

        <Field
        label="New Password"
        type="password"
        value={newPass}
        onChange={e=>setNewPass(e.target.value)}
        />

        <Field
        label="Confirm Password"
        type="password"
        value={confirmPass}
        onChange={e=>setConfirmPass(e.target.value)}
        />


        <Btn
        onClick={doPasswordChange}
        disabled={loading}
        color="#6366F1"
        full
        >
        Change Password
        </Btn>


      </Card>
      }





      {
      tab==="email" &&

      <Card>


        <div style={{
          color:"#94A3B8",
          marginBottom:14
        }}>
        Current Email: {profile?.email}
        </div>


        <Field
        label="Current Password"
        type="password"
        value={emailPass}
        onChange={e=>setEmailPass(e.target.value)}
        />


        <Field
        label="New Email"
        type="email"
        value={newEmail}
        onChange={e=>setNewEmail(e.target.value)}
        />


        <Btn
        onClick={doEmailChange}
        disabled={loading}
        color="#6366F1"
        full
        >
        Update Email
        </Btn>


      </Card>
      }





      {
      tab==="mobile" &&

      <Card>


        <div style={{
          color:"#94A3B8",
          marginBottom:14
        }}>
        Current Mobile: {profile?.mobile}
        </div>


        <Field
        label="New Mobile"
        value={newMobile}
        onChange={e=>setNewMobile(e.target.value)}
        />


        <Btn
        onClick={doMobileChange}
        disabled={loading}
        color="#6366F1"
        full
        >
        Update Mobile
        </Btn>


      </Card>

      }



    </div>
    </div>

  );

}