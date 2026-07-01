import { useState, useEffect } from "react";
import { fsGet, fsSet } from "../../utils/store";
import { LEVELS, LC, S } from "../../data/questions";
import { Btn, TopBar, LevelTabs, Msg, Field, Card } from "../shared/UI";

export default function QuestionManager({ onBack, adminId }) {
  const [tab, setTab]     = useState("fill");
  const [level, setLevel] = useState("Beginner");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState("");

  const [fQ, setFQ]       = useState("");
  const [fAns, setFAns]   = useState("");
  const [fOpts, setFOpts] = useState(["", "", "", ""]);
  const [fHint, setFHint] = useState("");

  const [hHindi, setHHindi] = useState("");
  const [hAns, setHAns]     = useState("");
  const [hHint, setHHint]   = useState("");

  const [wHindi, setWHindi] = useState("");
  const [wHint, setWHint]   = useState("");

  const lc = LC[level];
  // Scope questions to this admin's ID so each admin manages their own set
  const storageKey = `q_${adminId}_${tab}_${level}`;

  useEffect(() => { loadItems(); }, [tab, level]);

  async function loadItems() {
    setLoading(true);
    const data = await fsGet("questions", storageKey);
    setItems(data?.list || []);
    setLoading(false);
  }

  async function saveItems(newItems) {
    setSaving(true); setError("");
    const ok = await fsSet("questions", storageKey, { list: newItems });
    if (ok) { setItems(newItems); setSaved(true); setTimeout(() => setSaved(false), 2000); }
    else setError("Failed to save. Check Firebase connection.");
    setSaving(false);
  }

  async function addFill() {
    if (!fQ || !fAns || fOpts.some(o => !o)) { setError("Fill all required fields."); return; }
    await saveItems([...items, { id:`f_${Date.now()}`, question:fQ, answer:fAns, options:fOpts, hint:fHint }]);
    setFQ(""); setFAns(""); setFOpts(["", "", "", ""]); setFHint("");
  }
  async function addHindi() {
    if (!hHindi || !hAns) { setError("Fill all required fields."); return; }
    await saveItems([...items, { id:`h_${Date.now()}`, hindi:hHindi, answer:hAns, hint:hHint }]);
    setHHindi(""); setHAns(""); setHHint("");
  }
  async function addWriting() {
    if (!wHindi) { setError("Enter Hindi paragraph."); return; }
    await saveItems([...items, { id:`w_${Date.now()}`, hindi:wHindi, hint:wHint }]);
    setWHindi(""); setWHint("");
  }
  async function del(id) { await saveItems(items.filter(i => i.id !== id)); }

  const TABS = [["fill","🔤 Fill Blanks"],["hindi","🔄 Hindi→English"],["writing","✍️ Writing"]];

  return (
    <div style={S.pg}><div style={S.wrap}>
      <TopBar onBack={onBack} title="📝 Question Manager"
        right={saved && <span style={{ color:"#22C55E", fontSize:12, fontWeight:700 }}>✅ Saved!</span>} />

      <LevelTabs level={level} setLevel={setLevel} />

      <div style={{ display:"flex", borderBottom:"2px solid #1E293B", marginBottom:20, overflowX:"auto" }}>
        {TABS.map(([t, l]) => (
          <button key={t} onClick={() => { setTab(t); setError(""); }} style={{ padding:"9px 14px", border:"none", borderBottom:tab===t?`2px solid ${lc.accent}`:"2px solid transparent", marginBottom:-2, background:"none", cursor:"pointer", fontSize:12, fontWeight:tab===t?800:400, color:tab===t?lc.accent:"#475569", whiteSpace:"nowrap" }}>{l}</button>
        ))}
      </div>

      <Msg type="error" text={error} />

      {tab === "fill" && (
        <Card>
          <div style={{ fontSize:11, color:"#64748B", fontWeight:700, letterSpacing:1, marginBottom:14 }}>➕ ADD FILL IN THE BLANK</div>
          <Field label="English Sentence with ___ *" value={fQ} onChange={e => setFQ(e.target.value)} placeholder="She ___ to school every day." />
          <Field label="Correct Answer *" value={fAns} onChange={e => setFAns(e.target.value)} placeholder="goes" />
          <div style={{ fontSize:11, color:"#64748B", marginBottom:6 }}>4 Options * (include correct answer)</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:12 }}>
            {fOpts.map((o, i) => (
              <input key={i} value={o} onChange={e => { const a=[...fOpts]; a[i]=e.target.value; setFOpts(a); }}
                placeholder={`Option ${i+1}${i===0?" (correct)":""}`} style={S.inp} />
            ))}
          </div>
          <Field label="Grammar Hint (English only)" value={fHint} onChange={e => setFHint(e.target.value)} placeholder="Use 'goes' with He, She, It." />
          <Btn onClick={addFill} disabled={saving} color={lc.accent} full>{saving ? "Saving…" : "Add Question ✓"}</Btn>
        </Card>
      )}

      {tab === "hindi" && (
        <Card>
          <div style={{ fontSize:11, color:"#64748B", fontWeight:700, letterSpacing:1, marginBottom:14 }}>➕ ADD HINDI → ENGLISH</div>
          <Field label="Hindi Sentence *" value={hHindi} onChange={e => setHHindi(e.target.value)} placeholder="मेरा नाम राहुल है।" />
          <Field label="Model English Answer *" value={hAns} onChange={e => setHAns(e.target.value)} placeholder="My name is Rahul." />
          <Field label="Hint (English only)" value={hHint} onChange={e => setHHint(e.target.value)} placeholder="Use 'My' for first person possessive." />
          <Btn onClick={addHindi} disabled={saving} color={lc.accent} full>{saving ? "Saving…" : "Add Question ✓"}</Btn>
        </Card>
      )}

      {tab === "writing" && (
        <Card>
          <div style={{ fontSize:11, color:"#64748B", fontWeight:700, letterSpacing:1, marginBottom:14 }}>➕ ADD WRITING PROMPT</div>
          <Field label="Hindi Paragraph *" multiline value={wHindi} onChange={e => setWHindi(e.target.value)} placeholder="अपने परिवार के बारे में लिखो।" />
          <Field label="Tip for student (English only)" value={wHint} onChange={e => setWHint(e.target.value)} placeholder="Write about your family members." />
          <Btn onClick={addWriting} disabled={saving} color={lc.accent} full>{saving ? "Saving…" : "Add Prompt ✓"}</Btn>
        </Card>
      )}

      <div style={{ fontSize:11, color:"#64748B", fontWeight:700, letterSpacing:1, marginBottom:10 }}>
        EXISTING ({items.length}) {loading && "Loading…"}
      </div>
      {items.length === 0 && !loading && <div style={{ color:"#475569", fontSize:13, marginBottom:16 }}>No questions added yet for this level.</div>}
      {items.map(item => (
        <div key={item.id} style={{ ...S.card, position:"relative", paddingRight:72 }}>
          {tab === "fill" && <>
            <div style={{ fontWeight:700, fontSize:14, color:"#E2E8F0", marginBottom:4 }}>{item.question}</div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:4 }}>
              {item.options?.map(o => <span key={o} style={{ background:o===item.answer?"#14532D":"#1E293B", border:`1px solid ${o===item.answer?"#22C55E":"#334155"}`, borderRadius:6, padding:"2px 8px", fontSize:12, color:o===item.answer?"#86EFAC":"#94A3B8" }}>{o}</span>)}
            </div>
            {item.hint && <div style={{ color:"#64748B", fontSize:12 }}>💡 {item.hint}</div>}
          </>}
          {tab === "hindi" && <>
            <div style={{ fontWeight:700, fontSize:14, color:"#E2E8F0", marginBottom:4 }}>{item.hindi}</div>
            <div style={{ color:"#86EFAC", fontSize:13, marginBottom:4 }}>→ {item.answer}</div>
            {item.hint && <div style={{ color:"#64748B", fontSize:12 }}>💡 {item.hint}</div>}
          </>}
          {tab === "writing" && <>
            <div style={{ fontWeight:700, fontSize:14, color:"#E2E8F0", lineHeight:1.6, marginBottom:4 }}>{item.hindi}</div>
            {item.hint && <div style={{ color:"#64748B", fontSize:12 }}>💡 {item.hint}</div>}
          </>}
          <button onClick={() => del(item.id)} style={{ position:"absolute", top:14, right:14, background:"#450A0A", border:"1px solid #EF4444", color:"#FCA5A5", borderRadius:6, padding:"3px 8px", cursor:"pointer", fontSize:11, fontWeight:700 }}>Delete</button>
        </div>
      ))}
    </div></div>
  );
}
