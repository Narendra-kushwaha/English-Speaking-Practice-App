import {
  doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, getDocs, addDoc, serverTimestamp, where, query, onSnapshot,
} from "firebase/firestore";
import {
  ref, push, onValue, off, remove, serverTimestamp as rts
} from "firebase/database";
import { db, rtdb } from "./setup";

// ── FIRESTORE ─────────────────────────────────────────────────────────────────
export async function fsGet(col, id) {
  try {
    const snap = await getDoc(doc(db, col, id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch { return null; }
}

// Firestore document ko live listen karna
export function fsListen(col, id, callback) {
  const documentRef = doc(db, col, id);

  const unsubscribe = onSnapshot(
    documentRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback({
          id: snapshot.id,
          ...snapshot.data(),
        });
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error("Firestore listener error:", error);
      callback(null);
    }
  );

  return unsubscribe;
}

export async function fsSet(col, id, data) {
  try { await setDoc(doc(db, col, id), { ...data, _at: serverTimestamp() }); return true; }
  catch (e) { console.error(e); return false; }
}

export async function fsUpdate(col, id, data) {
  try { await updateDoc(doc(db, col, id), { ...data, _at: serverTimestamp() }); return true; }
  catch (e) { console.error(e); return false; }
}

export async function fsDel(col, id) {
  try { await deleteDoc(doc(db, col, id)); return true; } catch { return false; }
}

export async function fsAll(col) {
  try {
    const snap = await getDocs(collection(db, col));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch { return []; }
}

export async function fsWhere(col, field, op, val) {
  try {
    const q    = query(collection(db, col), where(field, op, val));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch { return []; }
}

// ── REALTIME DB (chat) ────────────────────────────────────────────────────────
export function rtSend(groupId, msg) {
  return push(ref(rtdb, `g/${groupId}/msgs`), { ...msg, ts: rts() });
}

export function rtListen(groupId, cb) {
  const r = ref(rtdb, `g/${groupId}/msgs`);
  onValue(r, snap => {
    const d = snap.val();
    cb(d ? Object.entries(d).map(([k,v]) => ({ id:k, ...v })) : []);
  });
  return () => off(r);
}
