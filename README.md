# 🧠 MindStash

## 📘 Description
**MindStash** is a student-focused academic platform designed to simplify access to learning materials.  
Initially built for **Kerala Technological University (KTU)**, it’s easily adaptable for any institution by customizing a single configuration structure — making it ready to deploy across universities of any type.

MindStash supports **PDFs and image uploads** (e.g. screenshots, lecture slides), searchable via both **exact and fuzzy matches**. Resources are categorized by **Program → Branch → Semester**, ensuring clean relevance and discovery.

---

## 🧰 Tech Stack
- ⚙️ MERN (MongoDB, Express, React, Node.js)
- 🔐 JWT Authentication + Passport.js
- ☁️ Cloudinary for media hosting
- 🧮 Joi for backend validation
- 🔍 Regex-powered smart search (title & description)
- 🎚️ Dynamic 3-level dropdown filtering

---

## 🚀 Features (Planned)
- 🔑 User Authentication (email-based login)
- 📁 Upload/view study materials (PDFs or images)
- 🧭 Filter resources by Program → Branch → Semester
- 🔍 Smart search with fuzzy match support (title & description)
- 🔄 Dynamic dropdown logic (program change resets branch & semester)
- ⬆️ Upvote system to crowd-sort useful content
- 🚨 Report system for flagging poor/inappropriate resources
- 🧑‍⚖️ Moderator/admin tools with role-based access
- 📄 In-app PDF preview and file download support
- ✨ Ultra-forkable: update one array to match your university's academic structure

---

## 🧱 Architecture Overview

MindStash avoids over-engineering and uses a centralized, easy-to-edit array to define academic programs.  
You can modify this to suit **any university structure** by editing one array inside `config/programs.js`:

```js
const PROGRAMS = [
  {
    name: "B.Tech",
    branches: [
      { name: "CSE", semesters: 8 },
      { name: "ECE", semesters: 8 },
      { name: "EEE", semesters: 8 },
      { name: "ME", semesters: 8 },
      { name: "CE", semesters: 8 },
      { name: "IT", semesters: 8 }
    ]
  },
  {
    name: "M.Tech",
    branches: [
      { name: "CSE", semesters: 4 },
      { name: "ECE", semesters: 4 },
      { name: "Structural", semesters: 4 },
      { name: "Thermal", semesters: 4 }
    ]
  },
  {
    name: "MBA",
    branches: [
      { name: "General", semesters: 4 }
    ]
  }
];
