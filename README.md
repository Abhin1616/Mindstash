# 🧠 MindStash

## 📘 Description
**MindStash** is a student-first academic platform to simplify access to learning materials.  
Originally built for **Kerala Technological University (KTU)**, it can be adapted to any university by editing a single configuration array.

Students can upload and discover academic resources like **PDFs and images**, categorized by **Program → Branch → Semester**, and filtered or searched via intelligent keyword matching.

Live at: [https://mindstash.vercel.app](https://mindstash.vercel.app)

---

## 🛠️ Tech Stack

- **Frontend**: React, Tailwind CSS, Vite
- **Backend**: Node.js, Express.js
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT, Passport.js, Google OAuth
- **File Storage**: Cloudinary
- **Validation**: Joi
- **AI Integration**: Gemini Pro (Google Generative AI API)

---

## 🚀 Features

| Feature                                      | Status |
|---------------------------------------------|--------|
| 🔑 Email-based Registration & Login         | ✅     |
| 🔐 JWT-based Auth with Role Support          | ✅     |
| 📁 Upload PDFs and Image Notes               | ✅     |
| 🔄 Program → Branch → Semester Filtering     | ✅     |
| 🔍 Smart Search (Title & Description)        | ✅     |
| ⬆️ Upvote System                             | ✅     |
| 🚨 Report Materials with Cooldown            | ✅     |
| 👨‍⚖️ Moderator Handling + Notification        | ✅     |
| 🧠 AI Chatbot (Gemini via Google API)        | ✅     |
| 🔔 Notification Center for User Feedback     | ✅     |
| 📄 PDF Preview & File Download Support       | ✅     |
| ✨ Easily Forkable for Any University         | ✅     |
| ❌ Ban/Unban Users via Moderator Panel         | ✅     |

---

## 📆 Configurable Architecture

Academic hierarchy is configured in `config/programs.js` like this:

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
```

---

## 🤖 AI Chat Integration

The chatbot is powered by **Gemini Pro**:

- Users can ask academic questions.
- Secured via JWT authentication.
- Integrated using `@google/generative-ai` with model `gemini-2.0-pro`.

---

## 📦 Local Setup

### 1. Clone the repo

```bash
git clone https://github.com/Abhin1616/MindStash.git
cd MindStash
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file:

```env
PORT=3000
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key
```

Start the backend:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd client
npm install
npm run dev
```

---

## 🌐 Live Demo

You can try it at: [https://mindstash.vercel.app](https://mindstash.vercel.app)

Login/Register required. Google OAuth supported.

---

## 📅 License

MIT License. Feel free to fork and adapt for your university!

---

## 👋 Author

Made with ❤️ by **Abhin Raj R**

GitHub: [@Abhin1616](https://github.com/Abhin1616)
