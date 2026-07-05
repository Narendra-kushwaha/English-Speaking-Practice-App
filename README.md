# 📚 English Practice App

> An AI-powered English Learning Platform built with **React**, **Firebase**, and **Google Gemini AI**.

The English Practice App helps students improve their English through interactive exercises, AI-powered writing evaluation, progress tracking, and real-time collaboration. The platform supports three different roles—**Student**, **Admin**, and **Developer**—each with dedicated dashboards and permissions.

---

## 🌟 Key Features

### 👨‍🎓 Student

* Secure Email & Password Authentication
* Email Verification
* Register using Admin's Permanent 8-Digit ID
* Fill in the Blanks Practice
* Hindi to English Translation
* English Writing Practice
* AI-powered Writing Feedback (Gemini AI)
* Daily & Overall Progress Tracking
* Level-wise Performance (Beginner, Intermediate, Advanced)
* Group Discussion
* Account Settings
* Change Password
* Change Email
* Change Mobile Number

---

### 👨‍🏫 Admin

* Permanent Auto-generated 8-Digit Admin ID
* Manage Questions
* View Student Analytics
* Total Attempted Questions
* Total Correct Answers
* Today's Performance
* Level-wise Student Scores
* Daily Top 3 Leaderboard
* Student Block / Unblock
* Batch & Group Management
* Send Announcements

---

### 👨‍💻 Developer

* Hidden Developer Login
* Developer Secret Authentication
* Manage Admin Accounts
* Block / Delete Admins
* View All Registered Admins
* Student Accounts Hidden from Developer Panel

---

# 🏗️ Tech Stack

| Category          | Technology                 |
| ----------------- | -------------------------- |
| Frontend          | React.js                   |
| Styling           | Tailwind CSS               |
| Authentication    | Firebase Authentication    |
| Database          | Cloud Firestore            |
| Realtime Features | Firebase Realtime Database |
| AI                | Google Gemini API          |
| Routing           | React Router               |
| State Management  | React Hooks                |

---

# 📂 Project Structure

```
english-practice/
│
├── public/
│   └── index.html
│
├── src/
│   ├── App.jsx
│   ├── index.js
│   ├── keys.js
│   │
│   ├── hooks/
│   │   └── useAuth.js
│   │
│   ├── data/
│   │   └── questions.js
│   │
│   ├── utils/
│   │   ├── setup.js
│   │   ├── auth.js
│   │   ├── ai.js
│   │   ├── progress.js
│   │   └── store.js
│   │
│   └── components/
│       ├── auth/
│       ├── student/
│       ├── admin/
│       ├── developer/
│       └── shared/
│
└── package.json
```

---

# 🔐 Authentication Flow

```
Developer
      │
      ▼
Create Admin
      │
      ▼
Admin receives Permanent 8-Digit ID
      │
      ▼
Student registers using Admin ID
      │
      ▼
Email Verification
      │
      ▼
Login
      │
      ▼
Dashboard
```

---

# 📊 Dashboard Overview

## Student Dashboard

* Today's Score
* Overall Score
* Level-wise Progress
* AI Feedback
* Practice History
* Group Discussion

---

## Admin Dashboard

* Student Analytics
* Today's Performance
* Overall Performance
* Question Management
* Top 3 Students
* Group Manager
* Announcements

---

## Developer Dashboard

* Admin Management
* Admin Monitoring
* Account Control

---

# 🤖 AI Features

Google Gemini AI is used to:

* Evaluate Writing
* Improve Grammar
* Suggest Better Sentences
* Provide Writing Feedback

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/Java-Bhagwan/english-practice.git
```

## Move into Project

```bash
cd english-practice
```

## Install Dependencies

```bash
npm install
```

## Start Development Server

```bash
npm start
```

---

# 🔑 Configuration

Create a **src/keys.js** file.

```javascript
export const GEMINI_KEY = "YOUR_GEMINI_API_KEY";

export const FB = {
  apiKey:"",
  authDomain:"",
  projectId:"",
  storageBucket:"",
  messagingSenderId:"",
  appId:"",
  databaseURL:""
};

export const DEV_SECRET = "YOUR_DEVELOPER_SECRET";
```

---

# 👨‍💻 First Time Setup

## Step 1

Create Developer Account

↓

## Step 2

Create Admin Account

↓

## Step 3

Admin receives Permanent 8-Digit ID

↓

## Step 4

Students register using Admin ID

↓

## Step 5

Students start practicing English

---

# 📈 Student Analytics

Admin can monitor:

* Total Attempted Questions
* Total Correct Answers
* Today's Attempts
* Today's Correct Answers
* Beginner Score
* Intermediate Score
* Advanced Score
* Daily Top 3 Students

---

# 🏆 Leaderboard

Every day the application automatically displays:

🥇 Rank 1

🥈 Rank 2

🥉 Rank 3

based on today's correct answers.

---

# ⚠️ Common Errors

| Error                  | Solution                                  |
| ---------------------- | ----------------------------------------- |
| Blank Screen           | Check Firebase configuration in `keys.js` |
| Invalid Admin ID       | Enter a valid 8-digit Admin ID            |
| Login Failed           | Verify email before login                 |
| AI Not Working         | Verify Gemini API Key                     |
| Password Update Failed | Enter the current password correctly      |

---

# 🔮 Future Improvements

* Voice Conversation Practice
* Pronunciation Checker
* Speaking Test
* AI Chat Teacher
* Daily Challenges
* Achievement Badges
* Certificates
* Push Notifications
* Dark Mode
* Mobile Application
* Live Video Speaking Room

---

# 👨‍💻 Author

**Raja**

GitHub: **Java-Bhagwan**

---

# ⭐ Support

If you found this project helpful, please consider giving it a ⭐ on GitHub.

It helps others discover the project and motivates future development.

---

# 📄 License

This project is licensed under the MIT License.
