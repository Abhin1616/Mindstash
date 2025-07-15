# 🧠 MindStash

## 📘 Description
**MindStash** is a student-first academic platform to simplify access to learning materials.  
Originally built for **Kerala Technological University (KTU)**, it can be adapted to any university by editing a single configuration array.

Students can upload and discover academic resources like **PDFs and images**, categorized by **Program → Branch → Semester**, and filtered or searched via intelligent keyword matching.

---

## 🧰 Tech Stack

- ⚙️ **Backend**: Node.js + Express + MongoDB + Mongoose  
- 🎨 **Frontend**: React + Tailwind CSS (Vite) *(coming soon)*  
- 🔐 **Auth**: JWT + Passport.js  
- ☁️ **Media**: Cloudinary  
- 🧮 **Validation**: Joi  
- 🧠 **AI Integration**: Gemini Pro (Google Generative AI API)  
- 🔎 **Search**: Regex + fuzzy title/description search  
- 🔄 **Filter**: Dynamic dropdown logic (Program → Branch → Semester)

---

## 🚀 Features

| Feature                                      | Status |
|---------------------------------------------|--------|
| 🔑 Email-based Registration & Login         | ✔️     |
| 🔐 JWT-based Auth with Role Support          | ✔️     |
| 📁 Upload PDFs and Image Notes               | ✔️     |
| 🔄 Program → Branch → Semester Filtering     | ✔️     |
| 🔍 Smart Search (Title & Description)        | ✔️     |
| ⬆️ Upvote System                             | ✔️     |
| 🚨 Report Materials with Cooldown            | ✔️     |
| 👨‍⚖️ Moderator Handling + Notification        | ✔️     |
| 🧠 AI Chatbot (Gemini via Google API)        | ✔️     |
| 🔔 Notification Center for User Feedback     | ✔️     |
| 📄 PDF Preview & File Download Support       | ✔️     |
| ✨ Easily Forkable for Any University         | ✔️     |

---

## 🌐 Live Demo

> ⚠️ *Frontend under development.* Demo link will be added after deployment.

---

## 🧱 Configurable Architecture

MindStash is powered by a central academic structure array inside `config/programs.js`.  
To support your own university, just edit the `PROGRAMS` array:

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

This controls both frontend dropdowns and backend validation.

---

## 🤖 AI Chat Integration

MindStash comes with a built-in AI Assistant powered by **Gemini Pro**.

- Users can ask academic questions to the chatbot.
- Secured via JWT — only logged-in users can access AI.
- Powered by `@google/generative-ai` and `gemini-2.0-flash`.

---

## 📦 Local Setup

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/mindstash.git
cd mindstash
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

Start the server:

```bash
npm run dev
```

### 3. Frontend Setup *(Coming Soon)*

> Frontend is being developed with React + Tailwind (Vite).  
> Setup and instructions will be added here once available.

---

## 🛡️ License

This project is open-source and MIT-licensed.  
Feel free to fork and modify for your university or organization!

---

## 🙌 Credits

Made with 💻 by Abhin Raj R 
