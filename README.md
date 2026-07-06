<div align="center">

# 📚 SpeakEase – AI Powered English Practice App

### 🚀 Learn • Practice • Improve • Track

An AI-powered English Learning Platform built with **React.js**, **Firebase**, **Tailwind CSS**, and **Groq AI**.

Practice English through interactive exercises, AI-powered writing evaluation, progress tracking, real-time collaboration, and role-based dashboards.

<br>

[

![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Visit_Now-3b82f6?style=for-the-badge)

](https://getspeakease.vercel.app/)

[

![GitHub](https://img.shields.io/badge/📂_Source_Code-GitHub-181717?style=for-the-badge&logo=github)

](https://github.com/Narendra-kushwaha/English-Speaking-Practice-App)

<br>



![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)





![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black)





![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=flat-square&logo=tailwindcss)





![Groq AI](https://img.shields.io/badge/Groq-AI-F55036?style=flat-square)





![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow?style=flat-square&logo=javascript)





![MIT License](https://img.shields.io/badge/License-MIT-green?style=flat-square)



</div>

---

# 📖 Table of Contents

- 🌟 About Project
- ✨ Features
- 👥 User Roles
- 📸 Screenshots
- 🛠 Tech Stack
- 📂 Project Structure
- 🚀 Installation
- 🔑 Environment Variables
- 🔐 Authentication Flow
- 📊 Dashboard Overview
- 🤖 AI Features
- 📈 Analytics
- ⚠️ Common Errors
- 🛣 Roadmap
- 👨‍💻 Author
- 📄 License

---

# 🌟 About the Project

SpeakEase is a modern AI-powered English learning platform designed to help students improve their English communication skills through interactive practice sessions, AI-assisted writing evaluation, and detailed performance analytics.

Unlike traditional practice websites, SpeakEase provides **role-based dashboards** for Students, Admins, and Developers, making it suitable for coaching institutes, schools, English learning communities, and individual learners.

The platform combines **Firebase Authentication**, **Cloud Firestore**, **Realtime Database**, and **Groq AI** to deliver a secure, scalable, and intelligent learning experience.

---

# 🚀 Why SpeakEase?

✔ AI-powered Writing Feedback

✔ Fill in the Blanks Practice

✔ Hindi to English Translation

✔ Writing Practice

✔ Daily Progress Tracking

✔ Permanent Admin ID

✔ Student Analytics

✔ Group Discussions

✔ Top 3 Leaderboard

✔ Role-Based Authentication

✔ Secure Firebase Backend

✔ Responsive UI

---

# 👥 User Roles

| Role | Description |
|------|-------------|
| 👨‍🎓 Student | Practice English, track progress, join discussions, receive AI feedback |
| 👨‍🏫 Admin | Manage students, create questions, monitor analytics, manage groups |
| 👨‍💻 Developer | Manage admin accounts, monitor platform, control administration |

---

# ✨ Features

## 👨‍🎓 Student Features

- Secure Email Authentication
- Email Verification
- Register using Permanent Admin ID
- Fill in the Blanks
- Hindi → English Practice
- Writing Practice
- AI Writing Evaluation
- Daily Progress
- Total Score
- Level-wise Progress
- Accuracy Tracking
- Group Discussion
- Account Settings
- Change Password
- Change Email
- Change Mobile Number

---

## 👨‍🏫 Admin Features

- Permanent 8-Digit Admin ID
- Question Manager
- Student Manager
- Student Analytics
- Today's Performance
- Total Performance
- Level-wise Reports
- Top 3 Leaderboard
- Block / Unblock Students
- Group Discussion
- Batch Management
- Account Settings

---

## 👨‍💻 Developer Features

- Hidden Developer Login
- Secret Authentication
- View All Admins
- Manage Admin Accounts
- Block / Unblock Admins
- Account Settings

---

# 📸 Screenshots

## 🔐 Authentication

| Student Login | Student Registration |
|----------------|----------------------|
| 

![](screenshots/student-login.png)

 | 

![](screenshots/student-register.png)

 |

---

## 👨‍🎓 Student Dashboard



![](screenshots/student-dashboard.png)



---

## 📚 Practice Modes

| Fill in the Blanks | Hindi → English |
|--------------------|-----------------|
| 

![](screenshots/fill-blanks.png)

 | 

![](screenshots/hindi-english.png)

 |

---

### ✍ Writing Practice



![](screenshots/writing-practice.png)



---

## 👨‍🏫 Admin Dashboard



![](screenshots/admin-dashboard.png)



---

## 📋 Question Manager



![](screenshots/question-manager.png)



---

## 👨‍🎓 Student Manager



![](screenshots/student-manager.png)



---

## 💬 Group Discussion



![](screenshots/group-discussion.png)



---

## ⚙ Account Settings



![](screenshots/account-settings.png)



---

## 👨‍💻 Developer Dashboard



![](screenshots/developer-dashboard.png)



---

## 🛡 All Admins



![](screenshots/all-admins.png)



---

# 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | React.js |
| Styling | Tailwind CSS |
| Authentication | Firebase Authentication |
| Database | Cloud Firestore |
| Realtime Database | Firebase Realtime Database |
| AI Integration | Groq AI |
| Routing | React Router DOM |
| State Management | React Hooks |
| Deployment | Vercel |
| Version Control | Git & GitHub |

---

# 🏗 Project Architecture

```text
                    +----------------------+
                    |      React App       |
                    +----------+-----------+
                               |
             +-----------------+-----------------+
             |                                   |
      Firebase Authentication              Groq AI
             |                                   |
             |                          Writing Feedback
             |
    +--------+---------+
    |                  |
 Cloud Firestore   Realtime Database
    |                  |
 Users / Questions   Group Discussions
 Progress            Live Chat
 Analytics
```

---

# 📂 Project Structure

```text
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
├── screenshots/
│
├── package.json
│
└── README.md
```

---

# 🚀 Getting Started

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/Narendra-kushwaha/English-Speaking-Practice-App.git
```

## 2️⃣ Navigate to Project Folder

```bash
cd English-Speaking-Practice-App
```

## 3️⃣ Install Dependencies

```bash
npm install
```

## 4️⃣ Start Development Server

```bash
npm start
```

Application will run at:

```
http://localhost:3000
```

---

# 🔑 Environment Variables

Create a file named:

```text
.env
```

Add the following configuration:

```env
REACT_APP_GROQ_KEY=YOUR_GROQ_API_KEY

REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
REACT_APP_FIREBASE_DATABASE_URL=

REACT_APP_DEV_SECRET=YOUR_DEVELOPER_SECRET
```

> ⚠️ Make sure `.env` is added to `.gitignore` so your keys are never pushed to GitHub.

---

# 🔥 Firebase Setup

## Step 1

Create Firebase Project

```
Firebase Console
      ↓
Add Project
      ↓
Create
```

## Step 2

Enable Authentication

```
Authentication
      ↓
Get Started
      ↓
Email/Password
      ↓
Enable
```

## Step 3

Create Firestore Database

```
Firestore Database
      ↓
Create Database
      ↓
Test Mode
```

## Step 4

Create Realtime Database

```
Realtime Database
      ↓
Create Database
      ↓
Test Mode
```

## Step 5

Register Web App

```
Project Settings
      ↓
Add Web App
      ↓
Copy Firebase Config
```

Paste the configuration inside your `.env` file using the `REACT_APP_FIREBASE_*` variables shown above.

---

# 🤖 Groq AI Setup

## Step 1

Visit

```
https://console.groq.com/keys
```

## Step 2

Generate a new API Key.

## Step 3

Paste it into your `.env` file:

```env
REACT_APP_GROQ_KEY=YOUR_GROQ_API_KEY
```

---

# ⚙ First Time Setup

```text
Developer Registration
          │
          ▼
Developer Login
          │
          ▼
Create Admin
          │
          ▼
Admin Receives Permanent Admin ID
          │
          ▼
Student Registration
          │
          ▼
Email Verification
          │
          ▼
Student Login
          │
          ▼
Practice English
```

---

# 📦 Production Build

```bash
npm run build
```

---

# ☁ Deployment

The application is deployed on **Vercel**.

```bash
npm install -g vercel
```

```bash
vercel
```

Follow the on-screen instructions to complete deployment.

---

# 📱 Browser Support

✅ Google Chrome

✅ Microsoft Edge

✅ Mozilla Firefox

✅ Brave Browser

✅ Opera

---

# 🔒 Security Features

- Firebase Authentication
- Email Verification
- Protected Routes
- Role-Based Access Control
- Permanent Admin ID Verification
- Developer Secret Authentication
- Secure Firestore Access
- Current Password Verification for Sensitive Changes

---

# 🔐 Authentication Flow

```text
                    👨‍💻 Developer
                           │
                           ▼
              Register using Developer Secret
                           │
                           ▼
                   Developer Dashboard
                           │
                           ▼
                  Create / Manage Admins
                           │
                           ▼
             👨‍🏫 Admin Registration
                           │
                           ▼
        Permanent 8-Digit Admin ID Generated
                           │
                           ▼
              👨‍🎓 Student Registration
             (Using Admin's Permanent ID)
                           │
                           ▼
                Email Verification Required
                           │
                           ▼
                      Student Login
                           │
                           ▼
                  Student Dashboard
```

---

# 📊 Dashboard Overview

## 👨‍🎓 Student Dashboard

Features: 🏆 Total Score, 📅 Today's Performance, 📈 Accuracy Percentage, 🎯 Attempted Questions, ✅ Correct Answers, ❌ Wrong Answers, 📚 Level-wise Progress, 📝 Practice Modes, 💬 Group Discussion, ⚙ Account Settings

## 👨‍🏫 Admin Dashboard

Features: 🔑 Permanent Admin ID, 📚 Question Manager, 👨‍🎓 Student Manager, 📊 Student Analytics, 🥇 Daily Top 3 Students, 💬 Group Discussion, ⚙ Account Settings

## 👨‍💻 Developer Dashboard

Features: 👨‍🏫 View All Admins, 🚫 Block / Unblock Admins, 🔒 Developer Authentication, ⚙ Account Settings

---

# 📚 Practice Modes

## 🔤 Fill in the Blanks

Multiple Choice Questions, Instant Result, Score Tracking, Level-wise Questions, Grammar Hints, Progress Update

## 🌍 Hindi → English

Translation Practice, Grammar Improvement, Vocabulary Building, Instant Evaluation, Level-wise Questions

## ✍ Writing Practice

Students write English paragraphs based on Hindi prompts. Groq AI analyzes the response and provides intelligent feedback: Grammar Corrections, Better Sentence Formation, Vocabulary Suggestions, Writing Quality, Overall Feedback

---

# 🤖 AI Features

SpeakEase uses **Groq AI** to make learning smarter: Grammar Checking, Writing Evaluation, Sentence Improvement, Writing Suggestions, Constructive Feedback

---

# 📈 Student Analytics

**Overall:** Total Questions Attempted, Total Correct Answers, Total Wrong Answers, Overall Accuracy, Total Score

**Daily:** Today's Attempts, Today's Correct Answers, Today's Wrong Answers, Daily Accuracy

**Level-wise:** 🌱 Beginner, 🔥 Intermediate, ⚡ Advanced — each with Attempted, Correct, Progress

---

# 🏆 Daily Leaderboard

Admins can view the Top 3 students based on today's performance, ranked by Correct Answers, Daily Performance, and Accuracy.

🥇 Rank 1 · 🥈 Rank 2 · 🥉 Rank 3

---

# 💬 Group Discussion

Batch-wise Groups, Real-time Messaging, Student Name Visibility, Private Progress, Secure Communication

---

# 📂 Firebase Collections

```text
Firestore

users
│
├── student
├── admin
└── developer

questions
│
├── beginner
├── intermediate
└── advanced

progress

attempts

groups
```

---

# 🔄 Data Flow

```text
Student
     │
     ▼
Practice Question
     │
     ▼
Answer Submission
     │
     ▼
Firestore
     │
     ▼
Progress Updated
     │
     ▼
Dashboard Updated
     │
     ▼
Leaderboard Updated
```

---

# 🔒 Security

Firebase Authentication, Email Verification, Role-Based Authorization, Protected Routes, Developer Secret, Permanent Admin ID Validation, Password Reauthentication, Firestore Access Control

---

# ⚠ Common Errors

| Error | Cause | Solution |
|--------|-------|----------|
| Blank Screen | Firebase Config Missing | Check `.env` file |
| Invalid Admin ID | Wrong Admin ID | Enter a valid 8-digit ID |
| Login Failed | Email Not Verified | Verify your email |
| AI Feedback Not Working | Invalid Groq API Key | Update `REACT_APP_GROQ_KEY` in `.env` |
| Password Change Failed | Incorrect Current Password | Re-enter the current password |
| Firebase Permission Error | Firestore Rules | Check Firebase Rules |

---

# 💡 Best Practices

- Verify email before logging in.
- Keep your Firebase keys secure.
- Never upload `.env` to GitHub.
- Use environment variables for production.
- Enable Firebase Security Rules before deployment.
- Regularly back up Firestore data.
- Rotate Developer Secret periodically.

---

# ⚡ Performance Optimizations

Lazy Loading Components, Optimized React Hooks, Firebase Real-time Updates, Efficient Firestore Queries, Responsive UI, Fast Page Navigation, Lightweight Component Structure

---

# 🛣️ Roadmap

- [ ] 🎙 Voice Practice Mode
- [ ] 🔊 Pronunciation Checker
- [ ] 🤖 AI Speaking Assistant
- [ ] 📜 Downloadable Certificates
- [ ] 🏅 Achievement Badges
- [ ] 🔥 Daily Challenges
- [ ] 📱 Android Application
- [ ] 🍎 iOS Application
- [ ] 🌙 Dark Mode
- [ ] 🔔 Push Notifications
- [ ] 📊 Advanced Analytics
- [ ] 🎥 Live Speaking Room
- [ ] 👥 Video Group Discussion
- [ ] 🌍 Multi-language Support
- [ ] 📈 Weekly & Monthly Reports

---

# 📈 Project Highlights

✔ AI Powered English Learning ✔ Three Role Based System ✔ Firebase Authentication ✔ Firestore Database ✔ Realtime Group Discussion ✔ Groq AI Integration ✔ Student Progress Tracking ✔ Daily Leaderboard ✔ Responsive Design ✔ Modern UI

---

# 🎯 Use Cases

English Coaching Institutes, Schools & Colleges, Individual Learners, Online English Trainers, Speaking Practice Communities, Educational Startups

---

# 🌍 Responsive Design

💻 Desktop · 💼 Laptop · 📱 Mobile · 📟 Tablet

---

# 🚀 Deployment

Live Website: 🌐 https://getspeakease.vercel.app/

---

# 📦 Repository

https://github.com/Narendra-kushwaha/English-Speaking-Practice-App

---

# 🤝 Contributing

1. Fork the repository
2. Create a new feature branch

```bash
git checkout -b feature/YourFeature
```

3. Commit your changes

```bash
git commit -m "Add new feature"
```

4. Push the branch

```bash
git push origin feature/YourFeature
```

5. Create a Pull Request

---

# 🐞 Found a Bug?

Please create a new Issue in the GitHub repository.

---

# ⭐ Support

If you found this project useful, please consider giving it a ⭐ Star.

---

# 📬 Contact

**Narendra Kushwaha**

📧 narendra626315@gmail.com

💼 https://linkedin.com/in/narendra-kushwaha-38232a237

🌐 https://narendra-kushwaha-portfolio.vercel.app/

🐙 https://github.com/Narendra-kushwaha

---

# 🙏 Acknowledgements

React Team, Firebase Team, Groq, Tailwind CSS, Open Source Community

---

# 📄 License

This project is licensed under the **MIT License**. You are free to use, modify, and distribute this project with proper attribution.

---

<div align="center">

## 🌟 Thank You for Visiting!

If you like this project, please don't forget to ⭐ the repository.

### Made with ❤️ using React, Firebase & Groq AI

</div>
