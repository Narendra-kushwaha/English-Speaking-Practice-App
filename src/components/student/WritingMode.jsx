import { useState, useEffect, useRef } from "react";
import { LC, S } from "../../data/questions";
import { fsGet } from "../../utils/store";
import { askAI, parseJSON } from "../../utils/ai";
import { recordWritingSubmission, getProgress, isModeBlockedToday, blockModeForToday } from "../../utils/progress";
import { Btn, Badge, TopBar } from "../shared/UI";

export default function WritingMode({ level, onBack, uid, adminId }) {
  const lc = LC[level];
  const [prompts, setPrompts]     = useState([]);
  const [idx, setIdx]             = useState(0);
  const [essay, setEssay]         = useState("");
  const [feedback, setFeedback]   = useState(null);
  const [loading, setLoading]     = useState(false);
  const [tab, setTab]             = useState("write");
  const [timer, setTimer]         = useState(0);
  const [timerOn, setTimerOn]     = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [modeBlocked, setModeBlocked] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    (async () => {
      const data  = await fsGet("questions", `q_${adminId}_writing_${level}`);
      const extra = data?.list || [];
      const all   = [...extra].sort(() => Math.random() - 0.5);
      setPrompts(all);
      setIdx(0);
      const prog = await getProgress(uid);
      if (isModeBlockedToday(prog, "writing")) {
        setModeBlocked(true);
        return;
      }
      checkSubmitted(prog, all[0]);
    })();
  }, [level, adminId]);

  useEffect(() => {
    if (timerOn) timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [timerOn]);

  // Tab switch detection
  useEffect(() => {
    async function handleVisibilityChange() {
      if (document.hidden && !modeBlocked && !submitted) {
        await blockModeForToday(uid, "writing");
        setModeBlocked(true);
        setTimerOn(false);
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [uid, modeBlocked, submitted]);

  function checkSubmitted(prog, prompt) {
    if (!prompt) return;
    const key = `writing_${level}_${prompt.id}`;
    const state = prog?.lockedQuestions?.[key];
    if (state?.locked) {
      setSubmitted(true);
      setTab("feedback");
    } else {
      setSubmitted(false);
      setTab("write");
      setEssay("");
      setFeedback(null);
      setTimer(0);
      setTimerOn(false);
    }
  }

  const p   = prompts[idx % Math.max(prompts.length, 1)];
  const wc  = t => t.trim() === "" ? 0 : t.trim().split(/\s+/).length;
  const fmt = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  async function next() {
    const newIdx = (idx + 1) % prompts.length;
    setIdx(newIdx);
    setEssay(""); setFeedback(null); setTab("write");
    setTimer(0); setTimerOn(false);
    const prog = await getProgress(uid);
    checkSubmitted(prog, prompts[newIdx]);
  }

  async function getFeedback() {
    if (wc(essay) < 20 || loading || submitted) return;
    setLoading(true); setFeedback(null); setTimerOn(false);
    try {
      const raw = await askAI(`You are an English writing coach for Hindi-medium students.
Hindi prompt: "${p?.hindi}"
Student English: "${essay}"
Level: ${level}
Give an overall quality score from 0 to 5 (5 = excellent, accurate translation with great grammar; 0 = very poor or no real attempt).
Respond ONLY with JSON: { "overall": "2-sentence feedback", "translation_accuracy": "1-2 sentences", "strengths": ["p1","p2"], "improve": ["s1","s2"], "better_version": "Original → Better", "overall_score": 0-5, "score": { "accuracy":1-5,"grammar":1-5,"vocabulary":1-5,"fluency":1-5 } }`);
      const fb = parseJSON(raw);
      if (fb) {
        setFeedback(fb); setTab("feedback");
        setSubmitted(true);
        const pts = Math.max(0, Math.min(5, Math.round(fb.overall_score ?? 0)));
        await recordWritingSubmission(uid, level, pts, p.id);
      }
    } catch { setFeedback({ error:true }); setTab("feedback"); }
    setLoading(false);
  }

  // Mode blocked screen
  if (modeBlocked) {
    return (
      <div style={{ ...S.pg, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ textAlign:"center", padding:24 }}>
          <div style={{ fontSize:48, marginBottom:16 }}>🚫</div>
          <div style={{ fontWeight:800, fontSize:18, color:"#EF4444", marginBottom:8 }}>Access Blocked!</div>
          <div style={{ color:"#94A3B8", fontSize:14, lineHeight:1.7, marginBottom:20 }}>
            You switched tabs during practice.<br/>
            Writing Practice is blocked for today.<br/>
            Come back tomorrow to continue.
          </div>
          <Btn onClick={onBack} color="#475569">← Go Back</Btn>
        </div>
      </div>
    );
  }

  if (prompts.length === 0) {
    return (
      <div style={{ ...S.pg, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ color:"#64748B", textAlign:"center" }}>
          <h3>No Writing questions available</h3>
          <p>Please ask the admin to add Writing questions for {level} level.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={S.pg}><div style={S.wrap}>
      <TopBar onBack={onBack} title="✍️ Writing Practice" right={<Badge color={lc.accent}>{lc.emoji} {level}</Badge>} />

      <div style={{ ...S.card, background:lc.light, borderColor:`${lc.accent}55`, borderLeft:`5px solid ${lc.accent}` }}>
        <div style={{ ...S.lbl, color:lc.badge }}>Hindi Paragraph — Write this in English</div>
        <div style={{ fontSize:17, color:"#1A202C", fontWeight:600, lineHeight:1.8 }}>{p.hindi}</div>
        {p.hint && <div style={{ fontSize:12, color:"#6B7280", marginTop:8 }}>💡 Tip: {p.hint}</div>}
      </div>

      <div style={{ display:"flex", borderBottom:"2px solid #1E293B", marginBottom:16 }}>
        {[["write","✏️ Write"],["feedback","💬 Feedback"]].map(([t,l]) => (
          <button key={t} onClick={() => setTab(t)} style={{ padding:"9px 18px", border:"none", borderBottom:tab===t?`2px solid ${lc.accent}`:"2px solid transparent", marginBottom:-2, background:"none", cursor:"pointer", fontSize:13, fontWeight:tab===t?800:400, color:tab===t?lc.accent:"#475569" }}>{l}</button>
        ))}
        <button onClick={next} style={{ marginLeft:"auto", background:"none", border:"none", color:"#475569", cursor:"pointer", fontSize:12, padding:"9px 10px" }}>↻ Next</button>
      </div>

      {tab === "write" && (
        <>
          {submitted ? (
            <div style={{ ...S.card, textAlign:"center", padding:"30px 20px" }}>
              <div style={{ fontSize:32, marginBottom:10 }}>✅</div>
              <div style={{ fontWeight:700, fontSize:15, marginBottom:6 }}>Already Submitted!</div>
              <div style={{ color:"#64748B", fontSize:13, marginBottom:16 }}>You have already submitted this prompt. View your feedback or try the next one.</div>
              <div style={{ display:"flex", gap:10 }}>
                <Btn onClick={() => setTab("feedback")} color="#6366F1" full>View Feedback →</Btn>
                <Btn onClick={next} color="#475569" full>Next Prompt →</Btn>
              </div>
            </div>
          ) : (
            <>
              <textarea value={essay} onChange={e => { setEssay(e.target.value); if (!timerOn && e.target.value.length > 0) setTimerOn(true); }}
                placeholder="Write the English version here… timer starts when you type."
                style={{ width:"100%", minHeight:180, padding:16, fontSize:15, lineHeight:1.8, fontFamily:"Georgia,serif", background:"#1E293B", color:"#E2E8F0", border:`1.5px solid ${essay.length>0?lc.accent+"66":"#334155"}`, borderRadius:12, resize:"vertical", outline:"none", boxSizing:"border-box" }} />
              <div style={{ display:"flex", gap:16, marginTop:10, color:"#475569", fontSize:12, flexWrap:"wrap" }}>
                <span>⏱ {fmt(timer)}</span><span>📝 {wc(essay)} words</span>
                <span style={{ color:wc(essay)>=20?"#22C55E":"#475569" }}>{wc(essay)>=20?"✓ Ready":`${20-wc(essay)} more words`}</span>
              </div>
              <div style={{ color:"#F59E0B", fontSize:11, marginTop:8 }}>
                ⚠️ You can only submit this prompt once — make it count!
              </div>
              <Btn onClick={getFeedback} disabled={wc(essay)<20||loading} color={lc.accent} full style={{ marginTop:10 }}>{loading?"AI is reviewing…":"Get AI Feedback →"}</Btn>
            </>
          )}
        </>
      )}

      {tab === "feedback" && (
        <div>
          {!feedback && !loading && <div style={{ textAlign:"center", padding:"40px 0", color:"#475569" }}>Write first, then get feedback.</div>}
          {loading && <div style={{ textAlign:"center", padding:"40px 0", color:"#64748B" }}><div style={{ fontSize:28, marginBottom:10 }}>✦</div>Reading your writing…</div>}
          {feedback?.error && <div style={{ color:"#EF4444" }}>Something went wrong. Try again.</div>}
          {feedback && !feedback.error && (() => {
            const sc = feedback.score;
            return (
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                <div style={{ ...S.card, background:"linear-gradient(135deg,#F59E0B22,#FCD34D11)", borderColor:"#F59E0B44", textAlign:"center" }}>
                  <div style={{ ...S.lbl, color:"#F59E0B" }}>Points Earned</div>
                  <div style={{ fontSize:32, fontWeight:900, color:"#FCD34D" }}>+{Math.max(0, Math.min(5, Math.round(feedback.overall_score ?? 0)))} ⭐</div>
                </div>
                <div style={S.card}>
                  <div style={S.lbl}>Score</div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
                    {Object.entries(sc).map(([k,v]) => (
                      <div key={k} style={{ textAlign:"center" }}>
                        <div style={{ fontSize:22, fontWeight:800, color:v>=4?"#22C55E":v>=3?"#F59E0B":"#EF4444" }}>{v}<span style={{ fontSize:10, color:"#475569" }}>/5</span></div>
                        <div style={{ fontSize:10, color:"#64748B", textTransform:"capitalize", marginTop:2 }}>{k}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ ...S.card, background:"#1E3A5F", borderColor:"#1E40AF44" }}><div style={{ ...S.lbl, color:"#60A5FA" }}>Overall Feedback</div><p style={{ margin:0, color:"#BFDBFE", fontSize:14, lineHeight:1.7 }}>{feedback.overall}</p></div>
                <div style={S.card}><div style={{ ...S.lbl, color:"#A78BFA" }}>Translation Accuracy</div><p style={{ margin:0, color:"#C4B5FD", fontSize:14, lineHeight:1.7 }}>{feedback.translation_accuracy}</p></div>
                <div style={{ ...S.card, background:"#14532D22", borderColor:"#22C55E44" }}><div style={{ ...S.lbl, color:"#22C55E" }}>✅ What's Working</div>{feedback.strengths.map((s,i) => <div key={i} style={{ color:"#86EFAC", fontSize:13, lineHeight:1.7, marginBottom:4 }}>• {s}</div>)}</div>
                <div style={{ ...S.card, background:"#78350F22", borderColor:"#F59E0B44" }}><div style={{ ...S.lbl, color:"#F59E0B" }}>🔧 Areas to Improve</div>{feedback.improve.map((s,i) => <div key={i} style={{ color:"#FCD34D", fontSize:13, lineHeight:1.7, marginBottom:4 }}>• {s}</div>)}</div>
                <div style={S.card}><div style={S.lbl}>✨ Better Version</div><p style={{ margin:0, color:"#94A3B8", fontSize:13, lineHeight:1.8, fontStyle:"italic" }}>{feedback.better_version}</p></div>
                <Btn onClick={next} color={lc.accent} full>Try Next Prompt →</Btn>
              </div>
            );
          })()}
        </div>
      )}
    </div></div>
  );
}