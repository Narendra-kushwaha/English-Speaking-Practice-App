import { initializeApp }  from "firebase/app";
import { getAuth }        from "firebase/auth";
import { getFirestore }   from "firebase/firestore";
import { getDatabase }    from "firebase/database";
import { getStorage }     from "firebase/storage";
import { FB } from "../keys";

const app  = initializeApp(FB);
export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const rtdb    = getDatabase(app);
export const storage = getStorage(app);