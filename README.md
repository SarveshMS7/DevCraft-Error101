# 🌐 CollabSphere — Context-Aware Skill Matching Platform

An Intelligent Collaboration Platform that algorithmically matches people to projects based on **verified skills, complementary expertise, availability, and compatibility**.

A hackathon MVP designed to help developers and creators form strong, skill-balanced teams efficiently.

---

## 🚀 Quick Start

### 1️⃣ Install Dependencies

```bash
npm install
```

---

### 2️⃣ Configure Environment

Create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_URL=https://zxuiqrdgmyvhhqnmkzfm.supabase.co
VITE_SUPABASE_ANON_KEY=your_key_here
```

---

### 3️⃣ Run Development Server

```bash
npm run dev
```

---

## 🏗 Project Structure

```
src/
├── features/        # Feature modules (Auth, Projects, Chat, Profile)
├── services/        # Business logic (GitHub API, Matching Engine)
├── components/ui/   # Reusable shadcn/ui components
├── lib/             # Core utilities (Supabase client, helpers)
```

---

## 🛠 Tech Stack

- **Frontend**: React, Vite, TypeScript, TailwindCSS  
- **Backend**: Supabase (Authentication, Postgres, Realtime)  
- **UI**: shadcn/ui + Framer Motion  
- **APIs**: GitHub Integration (Service Layer)  

---

## 🧩 Extending Features

### ➕ Adding a New Service

1. Create a new folder inside `src/services/`
2. Define types and API methods.
3. Inject the service into hooks or components.

Example:
```
src/services/new-service/
```

---

### 🤖 Implementing AI Matching

Check:

```
src/services/matching/scoring.ts
```

The scoring engine currently uses heuristic logic.  
You can extend it to:

- Replace heuristic scoring with vector embeddings
- Integrate AI-based semantic matching
- Add compatibility prediction models

---

### ✅ Verified Skills

The GitHub integration service:

```
src/services/github/api.ts
```

Currently supports:
- Fetching user repositories
- Detecting programming languages

You can extend it to:
- Calculate confidence scores
- Analyze repo stars and activity
- Generate verified skill badges

---

## 🤝 Contribution (Hackathon Mode)

- Create new feature folders for isolated development.
- Track progress using `task.md`.
- Commit small, working chunks frequently.
- Follow consistent TypeScript practices.

---

## 📌 Vision

CollabSphere moves beyond static profile listings and enables **context-aware intelligent matchmaking** to help teams form faster and more effectively.

---

## 📄 License

MIT License
