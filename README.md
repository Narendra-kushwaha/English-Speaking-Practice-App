# 📚 English Practice App — Complete Guide

## 🆕 Naye Features (is update mein)

1. **Admin ka Permanent 8-digit Unique ID** — register karte hi auto-generate hota hai, kabhi change nahi hota
2. **Student registration mein Admin ID zaroori** — student apne Admin ki ID daal kar uske under register hota hai
3. **Developer Panel** — ab sirf **Admins** ki list dikhati hai (students nahi)
4. **Account Settings (Fixed)** — Password / Email / Mobile change ab properly kaam karta hai (current password verify karke)
5. **Admin Dashboard — Student Tracking**:
   - Har student ka Total Attempted / Total Correct
   - Aaj (Today) ka Attempted / Correct
   - Level-wise (Beginner/Intermediate/Advanced) score
   - 🏆 Top 3 students aaj ke liye (badge/trophy)
6. **Student Dashboard** — apna khud ka score (Total + Today + Level-wise)
7. **Group Discussion** — real naam dikhta hai, baaki details private

---

## 🏗️ Project Structure

```
english-practice/
├── public/index.html
├── package.json
├── src/
│   ├── App.jsx                 ← Main router
│   ├── index.js
│   ├── keys.js                 ← 🔑 SAB KEYS YAHAN DAALO
│   ├── hooks/useAuth.js
│   ├── data/questions.js       ← Default questions + styles
│   ├── utils/
│   │   ├── setup.js            ← Firebase init
│   │   ├── store.js            ← Firestore + Realtime DB
│   │   ├── ai.js                ← Gemini AI
│   │   ├── auth.js             ← Login/Register/Password logic
│   │   └── progress.js         ← Score tracking
│   └── components/
│       ├── shared/UI.jsx
│       ├── auth/
│       │   ├── LoginScreen.jsx
│       │   ├── RegisterScreen.jsx
│       │   └── AccountSettings.jsx   ← Password/Email/Mobile (FIXED)
│       ├── student/
│       │   ├── StudentHome.jsx       ← Score dashboard yahan
│       │   ├── FillMode.jsx
│       │   ├── HindiMode.jsx
│       │   ├── WritingMode.jsx
│       │   └── StudentGroups.jsx
│       ├── admin/
│       │   ├── AdminPanel.jsx        ← Admin ID dikhta hai yahan
│       │   ├── QuestionManager.jsx
│       │   ├── UserManager.jsx       ← Student tracking + Top 3
│       │   └── GroupManager.jsx
│       └── developer/
│           ├── DeveloperAuth.jsx
│           └── DeveloperPanel.jsx    ← Sirf Admins dikhte hain
```

---

## 🚀 STEP BY STEP SETUP

### STEP 1 — Node.js Install Karo
👉 https://nodejs.org → LTS version → Install

```
node -v
npm -v
```

---

### STEP 2 — Google Gemini API Key (FREE)
👉 https://aistudio.google.com/apikey → **Create API Key** → Copy

---

### STEP 3 — Firebase Setup (FREE)

**A) Project Banao**
👉 https://console.firebase.google.com → Add Project → naam do → Create

**B) Web App Add Karo**
Project khol kar `</>` icon click karo → Register app → Config copy karo

**C) Authentication ON Karo**
Authentication → Get Started → Email/Password → Enable

**D) Firestore Database Banao**
Firestore Database → Create Database → Start in **test mode** → Done

**E) Realtime Database Banao**
Realtime Database → Create Database → **test mode** → Done

---

### STEP 4 — `src/keys.js` Mein Apni Keys Daalo

```js
export const GEMINI_KEY = "AIzaSy...";   // Step 2 wali key

export const FB = {
  apiKey:            "AIzaSy...",
  authDomain:        "your-project.firebaseapp.com",
  projectId:         "your-project-id",
  storageBucket:     "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123:web:abc",
  databaseURL:       "https://your-project-default-rtdb.firebaseio.com",
};

export const DEV_SECRET = "DEV@SECRET#2024";  // apna khud rakho
```

---

### STEP 5 — Install + Run

```bash
cd english-practice
npm install
npm start
```

👉 Browser mein khulega: **http://localhost:3000**

---

## 🔐 Pehli Baar Use Kaise Karo

### 1️⃣ Developer Account Banao (Sabse Pehle)
- Login screen → **"👨‍💻 Developer Panel"** click karo
- **Register** tab → Name, Email, Mobile, Password, **Secret Key** (keys.js wali) daalo
- Email verify karo → Login karo

### 2️⃣ Admin Account Banao
- Login screen → **"Admin"** select karo → **Create account**
- Details + **Developer Secret Key** daalo
- ✅ Register hote hi ek **8-digit Admin ID** milegi (screen pe dikhegi)
- **Yeh ID save karo!** — kabhi change nahi hogi
- Email verify karo → Login karo

### 3️⃣ Student Account Banao
- Login screen → **"Student"** select karo → **Create account**
- Name, Email, Mobile, Password + **Admin ki 8-digit ID** daalo
- Email verify karo → Login karo

---

## 📊 Admin Dashboard Features

- **Apni Admin ID** top pe dikhti hai — students ko share karo
- **Question Manager** — apne students ke liye custom questions add karo
- **Student Manager**:
  - Sirf apni Admin ID se jude students dikhenge
  - Har student ka: Total Tried, Total Correct, Today Tried, Today Correct, Level-wise score
  - **🏆 Top 3 Today** tab — aaj ke best performers (badge ke saath)
  - Block/Unblock option
- **Group Discussion** — apne students ke liye batch groups

---

## 🔑 Account Settings (Fixed!)

Ab teeno cheezein sahi se kaam karti hain:

- **Password Change**: Current password daalo → New password set karo
- **Email Change**: Current password verify karke → New email set karo
- **Mobile Change**: Seedha update ho jata hai

(Firebase security requirement: email/password change karne ke liye current password se re-verify karna padta hai — yeh ab automatically handle hota hai)

---

## ⚠️ Common Errors

| Error | Fix |
|-------|-----|
| Blank screen | `src/keys.js` mein sahi Firebase keys check karo |
| "Invalid Admin ID" | Admin se sahi 8-digit ID lo |
| Password change fail | Current password sahi daalo |
| AI feedback nahi aa raha | Gemini key check karo |
| Login nahi ho raha | Email verify karo pehle (inbox check karo) |

---

## 💡 Important Notes

- Admin ID **permanent** hai — kabhi change nahi hoga
- Ek student sirf **ek hi Admin** ke under register ho sakta hai
- Developer Panel mein **sirf Admins** dikhte hain, students nahi
- Top 3 leaderboard **daily reset** hota hai (aaj ke correct answers ke basis pe)
- Firestore "test mode" 30 din free hai — uske baad security rules set karni hongi production ke liye
