import { useState, useEffect } from "react";
import { LC, S } from "../../data/questions";
import { fsGet } from "../../utils/store";
import { recordAttempt, getQuestionState, getProgress, isModeBlockedToday, blockModeForToday } from "../../utils/progress";
import { Btn, Badge, TopBar, ProgressBar } from "../shared/UI";

export default function FillMode({ level, onBack, uid, adminId }) {
  const lc = LC[level];
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx]             = useState(0);
  const [selected, setSelected]   = useState(null);
  const [checked, setChecked]     = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [locked, setLocked]       = useState(false);
  const [showHint, setShowHint]   = useState(false);
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [score, setScore]         = useState(0);
  const [modeBlocked, setModeBlocked] = useState(false);

  useEffect(() => {
    (async () => {
      const data  = await fsGet("questions", `q_${adminId}_fill_${level}`);
      const extra = data?.list || [];
      const all   = [...extra].sort(() => Math.random() - 0.5);
      setQuestions(all);
      const p = await getProgress(uid);
      setScore(0);
      setIdx(0);
      // Check if mode is blocked today
      if (isModeBlockedToday(p, "fill")) {
        setModeBlocked(true);
        return;
      }
      loadQuestionState(p, all[0]);
    })();
  }, [level, adminId]);

  // Tab switch detection
  useEffect(() => {
    async function handleVisibilityChange() {
      if (document.hidden && !modeBlocked) {
        await blockModeForToday(uid, "fill");
        setModeBlocked(true);
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [uid, modeBlocked]);

  function loadQuestionState(p, q) {
    if (!q) return;
    const state = getQuestionState(p, "fill", level, q.id);
    if (state.locked) {
      setChecked(true);
      setLocked(true);
      setIsCorrect(state.correct);
      setAttemptsUsed(state.attempts);
      setShowHint(state.attempts >= 2 && !state.correct);
      setSelected(state.correct ? q.answer : null);
    } else {
      setChecked(false);
      setLocked(false);
      setIsCorrect(false);
      setAttemptsUsed(state.attempts || 0);
      setShowHint(false);
      setSelected(null);
    }
  }

  async function handleCheck() {
    if (!selected || locked || !q) return;
    const correct = selected?.trim().toLowerCase() === q.answer?.trim().toLowerCase();
    const result = await recordAttempt(uid, "fill", level, q.id, correct, 1);
    setChecked(true);
    setIsCorrect(correct);
    setLocked(result.locked);
    setShowHint(result.showHint);
    setAttemptsUsed(result.attemptsUsed);
    if (correct) setScore(s => s + 1);
  }

  function tryAgain() {
    setSelected(null);
    setChecked(false);
    setIsCorrect(false);
  }

  async function next() {
    const newIdx = (idx + 1) % questions.length;
    setIdx(newIdx);
    const p = await getProgress(uid);
    loadQuestionState(p, questions[newIdx]);
  }

  const q = questions[idx];

  // Mode blocked screen
  if (modeBlocked) {
    return (
      <div style={{ ...S.pg, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ textAlign:"center", padding:24 }}>
          <div style={{ fontSize:48, marginBottom:16 }}>🚫</div>
          <div style={{ fontWeight:800, fontSize:18, color:"#EF4444", marginBottom:8 }}>Access Blocked!</div>
          <div style={{ color:"#94A3B8", fontSize:14, lineHeight:1.7, marginBottom:20 }}>
            You switched tabs during practice.<br/>
            Fill in the Blanks is blocked for today.<br/>
            Come back tomorrow to continue.
          </div>
          <Btn onClick={onBack} color="#475569">← Go Back</Btn>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div style={{ ...S.pg, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ color:"#64748B", textAlign:"center" }}>
          <h3>No Fill in the Blank questions available</h3>
          <p>Please ask the admin to add questions for {level} level.</p>
        </div>
      </div>
    );
  }

  if (!q) {
    return (
      <div style={{ ...S.pg, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ color:"#64748B" }}>No questions available.</div>
      </div>
    );
  }

  return (
    <div style={S.pg}><div style={S.wrap}>
      <TopBar onBack={onBack} title="🔤 Fill in the Blanks" right={<Badge color={lc.accent}>{lc.emoji} {level}</Badge>} />
      <ProgressBar current={idx+1} total={questions.length} correct={score} color={lc.accent} />

      <div style={{ ...S.card, borderLeft:`5px solid ${lc.accent}` }}>
        <div style={{ ...S.lbl, color:lc.badge }}>Complete the Sentence</div>
        <div style={{ fontSize:17, color:"#E2E8F0", lineHeight:2.4, display:"flex", flexWrap:"wrap", alignItems:"center", gap:4 }}>
          {q.question?.split("___").map((part, i, arr) => (
            <span key={i}>{part}
              {i < arr.length-1 && (
                <span style={{ display:"inline-block", minWidth:88, textAlign:"center", padding:"0 8px", borderBottom:`2.5px solid ${checked?(isCorrect?"#22C55E":"#EF4444"):lc.accent}`, color:checked?(isCorrect?"#22C55E":"#EF4444"):lc.accent, fontWeight:800, fontSize:17 }}>
                  {selected || "___"}
                </span>
              )}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
        {q.options?.map(opt => {
          const optCorrect = opt?.trim().toLowerCase() === q.answer?.trim().toLowerCase();
          let bg="#1E293B", border="#334155", col="#94A3B8";
          if (checked) { if (optCorrect && locked) { bg="#14532D"; border="#22C55E"; col="#86EFAC"; } else if (opt===selected) { bg="#450A0A"; border="#EF4444"; col="#FCA5A5"; } }
          else if (opt===selected) { bg=`${lc.accent}22`; border=lc.accent; col=lc.accent; }
          return <button key={opt} onClick={()=>!checked&&!locked&&setSelected(opt)} disabled={checked||locked} style={{ padding:"14px 10px", borderRadius:11, border:`2px solid ${border}`, background:bg, color:col, fontWeight:700, fontSize:15, cursor:(checked||locked)?"default":"pointer", width:"100%" }}>{opt}</button>;
        })}
      </div>

      {checked && (
        <div style={{ background:isCorrect?"#14532D":"#450A0A", border:`1.5px solid ${isCorrect?"#22C55E":"#EF4444"}`, borderRadius:12, padding:"14px 18px", marginBottom:14 }}>
          <div style={{ color:isCorrect?"#86EFAC":"#FCA5A5", fontWeight:800, fontSize:15, marginBottom:6 }}>
            {isCorrect ? "✅ Correct! +1 point 🎉" : locked ? `❌ Wrong! Correct answer: "${q.answer}"` : "❌ Not quite — try once more!"}
          </div>
          {!isCorrect && !locked && (
            <div style={{ color:"#FCA5A5", fontSize:12 }}>You have 1 more attempt for this question.</div>
          )}
          {showHint && q.hint && (
            <div style={{ color:"#94A3B8", fontSize:13, marginTop:6 }}>💡 <strong style={{ color:"#CBD5E1" }}>Tip:</strong> {q.hint}</div>
          )}
        </div>
      )}

      {!checked && <Btn onClick={handleCheck} disabled={!selected} color={lc.accent} full>Check Answer ✓</Btn>}
      {checked && !locked && <Btn onClick={tryAgain} color="#EF4444" full>🔄 Try Again (1 attempt left)</Btn>}
      {checked && locked && <Btn onClick={next} color={lc.accent} full>Next Question →</Btn>}
    </div></div>
  );
}