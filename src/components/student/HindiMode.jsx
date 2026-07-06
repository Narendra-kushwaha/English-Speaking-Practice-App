import { useState, useEffect } from "react";
import { LC, S } from "../../data/questions";
import { fsGet } from "../../utils/store";
import { recordAttempt, getQuestionState, getProgress } from "../../utils/progress";
import { Btn, Badge, TopBar, ProgressBar } from "../shared/UI";

export default function HindiMode({ level, onBack, uid, adminId }) {
  const lc = LC[level];
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx]             = useState(0);
  const [typed, setTyped]         = useState("");
  const [result, setResult]       = useState(null);
  const [locked, setLocked]       = useState(false);
  const [showHint, setShowHint]   = useState(false);
  const [score, setScore]         = useState(0);

  useEffect(() => {
    (async () => {
      const data  = await fsGet("questions", `q_${adminId}_hindi_${level}`);
      const extra = data?.list || [];
      const all   = [...extra].sort(() => Math.random() - 0.5);
      setQuestions(all);
      setScore(0);
      setIdx(0);
      const p = await getProgress(uid);
      loadQuestionState(p, all[0]);
    })();
  }, [level, adminId]);

  function loadQuestionState(p, q) {
    if (!q) return;
    const state = getQuestionState(p, "hindi", level, q.id);
    if (state.locked) {
      setLocked(true);
      setShowHint(state.attempts >= 2 && !state.correct);
      setResult({ correct: state.correct, feedback: state.correct ? "You already answered this correctly." : "You used both attempts for this question.", model_answer: q.answer, hint: q.hint });
      setTyped("");
    } else {
      setLocked(false);
      setShowHint(false);
      setResult(null);
      setTyped("");
    }
  }

  async function checkTranslation() {
    if (!typed.trim() || !q || locked) return;

    // const correct = typed.trim().toLowerCase() === q.answer?.trim().toLowerCase();
    const normalize = str => str.trim().toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ");
    const correct = normalize(typed) === normalize(q.answer);
    const r = await recordAttempt(uid, "hindi", level, q.id, correct, 2);

    setLocked(r.locked);
    setShowHint(r.showHint);
    if (correct) setScore(s => s + 1);

    setResult({
      correct,
      feedback: correct
        ? "Great job! Your translation is correct."
        : r.locked
        ? "Both attempts used. Check the model answer below."
        : "Not quite right. Try once more!",
      model_answer: q.answer,
      hint: q.hint,
    });
  }

  function tryAgain() { setTyped(""); setResult(null); }

  async function next() {
    if (questions.length === 0) return;
    const newIdx = (idx + 1) % questions.length;
    setIdx(newIdx);
    const p = await getProgress(uid);
    loadQuestionState(p, questions[newIdx]);
  }

  if (questions.length === 0) {
    return (
      <div style={{ ...S.pg, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ color:"#64748B", textAlign:"center" }}>
          <h3>No Hindi questions available</h3>
          <p>Please ask the admin to add Hindi questions for {level} level.</p>
        </div>
      </div>
    );
  }

  const q = questions[idx];
  const isCorrect = result?.correct;

  return (
    <div style={S.pg}><div style={S.wrap}>
      <TopBar onBack={onBack} title="🔄 Hindi → English" right={<Badge color={lc.accent}>{lc.emoji} {level}</Badge>} />
      <ProgressBar current={idx+1} total={questions.length} correct={score} color={lc.accent} />

      <div style={{ ...S.card, borderLeft:`5px solid ${lc.accent}`, background:lc.light }}>
        <div style={{ ...S.lbl, color:lc.badge }}>Translate this Hindi sentence into English</div>
        <div style={{ fontSize:20, color:"#1A202C", fontWeight:700, lineHeight:1.7 }}>{q.hindi}</div>
      </div>

      {!result && !locked && (
        <>
          <textarea value={typed} onChange={e => setTyped(e.target.value)} placeholder="Type the English translation here…"
            style={{ ...S.inp, minHeight:100, resize:"vertical", lineHeight:1.8, fontSize:15, fontFamily:"Georgia,serif", padding:14 }} />
          <Btn onClick={checkTranslation} disabled={!typed.trim()} color={lc.accent} full>Check My Answer ✓</Btn>
        </>
      )}

      {result && (
        <>
          <div style={{ background:isCorrect?"#14532D":"#450A0A", border:`1.5px solid ${isCorrect?"#22C55E":"#EF4444"}`, borderRadius:12, padding:"16px 18px", marginBottom:12 }}>
            <div style={{ color:isCorrect?"#86EFAC":"#FCA5A5", fontWeight:800, fontSize:16, marginBottom:6 }}>
              {isCorrect ? "✅ Correct! +2 points 🎉" : locked ? "❌ Incorrect" : "❌ Not quite — try once more!"}
            </div>
            <div style={{ color:"#CBD5E1", fontSize:13, lineHeight:1.7, marginBottom:8 }}>{result.feedback}</div>
            {!isCorrect && !locked && <div style={{ color:"#FCA5A5", fontSize:12, marginBottom:8 }}>You have 1 more attempt for this question.</div>}
            {showHint && result.hint && (
              <div style={{ color:"#94A3B8", fontSize:13, marginBottom:8 }}>💡 <strong style={{ color:"#CBD5E1" }}>Tip:</strong> {result.hint}</div>
            )}
            {locked && (
              <div style={{ borderTop:"1px solid #334155", paddingTop:10 }}>
                <div style={{ color:"#64748B", fontSize:11, marginBottom:4 }}>Model Answer:</div>
                <div style={{ color:"#86EFAC", fontSize:14, fontWeight:600 }}>{result.model_answer}</div>
              </div>
            )}
          </div>
          {typed && (
            <div style={{ ...S.card, marginBottom:12 }}>
              <div style={S.lbl}>Your Answer</div>
              <div style={{ color:"#E2E8F0", fontSize:14, lineHeight:1.7 }}>{typed}</div>
            </div>
          )}
          {!locked && <Btn onClick={tryAgain} color="#EF4444" full>🔄 Try Again (1 attempt left)</Btn>}
          {locked  && <Btn onClick={next}     color={lc.accent} full>Next Sentence →</Btn>}
        </>
      )}
    </div></div>
  );
}