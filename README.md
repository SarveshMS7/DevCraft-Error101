#🌐 CollabSphere — Context-Aware Skill Matching Platform
An Intelligent Collaboration Platform that algorithmically matches people to projects based on verified skills, complementary expertise, availability, and compatibility.

A hackathon MVP for a platform that matches developers to projects based on skills, compatibility, and availability.

🚀 Quick Start
1️ Install Dependencies
npm install

2️ Configure Environment

Create .env.local:

VITE_SUPABASE_URL=https://zxuiqrdgmyvhhqnmkzfm.supabase.co
VITE_SUPABASE_ANON_KEY=your_key_here

3️ Run Development Server
npm run dev


## 🏗 Project Structure

- **src/features/**: Standalone feature modules (Auth, Projects, Chat, Profile).
- **src/services/**: Core business logic and external integrations (GitHub, Matching Engine).
- **src/components/ui/**: Reusable shadcn/ui components.
- **src/lib/**: Core utilities (Supabase client, utils).

## 🛠 Tech Stack

- **Frontend**: React, Vite, TypeScript, TailwindCSS
- **Backend**: Supabase (Auth, Postgres, Realtime)
- **UI**: shadcn/ui + Framer Motion
- **APIs**: GitHub Integration (Service Layer)

## 🧩 Extending Features

### Adding a New Service
1. Create \`src/services/service-name/\`
2. Define types and API methods.
3. Inject into hooks or components.

### Implementing AI Matching
Check \`src/services/matching/scoring.ts\`. The scaffolding is there to swap heuristic scoring with vector embeddings.

### Verified Skills
The GitHub service (\`src/services/github/api.ts\`) is ready to fetch user repos. You can extend this to calculate confidence scores based on repo stars and language usage.

## 🤝 Contribution (Hackathon Mode)

- Create a new feature folder for isolated work.
- Use \`task.md\` to track progress.
- Commit small, working chunks.
