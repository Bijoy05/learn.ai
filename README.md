# LearnAI — Adaptive AI-Powered Learning Platform

LearnAI is an adaptive learning platform that uses AI agents to provide personalised tutoring across subjects. Each subject has its own AI tutor that understands the student's strengths, weaknesses, and learning style, delivering tailored explanations, quizzes, and progress tracking.

**Live URL**: https://larning-ai.lovable.app

---

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui component library
- **Animations**: Framer Motion
- **Charts**: Recharts, D3.js
- **State Management**: TanStack React Query
- **Routing**: React Router v6
- **Backend**: Lovable Cloud (Supabase) — authentication, database, edge functions
- **AI**: Lovable AI Gateway for conversational tutoring

---

## Project Structure

```
src/
├── components/
│   ├── dashboard/          # Sidebar navigation
│   ├── KnowledgeGraph/     # D3-powered force-directed knowledge graph
│   ├── onboarding/         # Onboarding chat, VAK profile, questions
│   └── ui/                 # shadcn/ui components
├── contexts/
│   └── AuthContext.tsx      # Authentication state & session management
├── hooks/
│   ├── useAIChat.ts         # AI chat streaming integration
│   ├── useChatMessages.ts   # Chat message persistence
│   ├── useData.ts           # Schedule & report mock data
│   ├── useNotes.ts          # Notes CRUD operations
│   ├── useSubjects.ts       # Subject & topic progress management
│   └── useReviewNotifications.ts  # Spaced repetition reminders
├── lib/
│   ├── buildGraphData.ts    # Knowledge graph data builder
│   ├── extracurricularCourses.ts  # EC course definitions
│   └── mockData.ts          # Mock/seed data
├── pages/                   # All route pages (see below)
└── integrations/
    └── supabase/            # Auto-generated Supabase client & types
```

---

## Pages & Routes

### `/` — Landing Page
Marketing homepage with hero section, feature highlights (Personalised AI Agents, Shared Learning Memory, Skill Graph Tracking), "How it works" steps, and CTAs to sign up or log in.

### `/auth` — Authentication
Login and signup forms with email/password. Supports role selection (student, teacher, admin) during signup. Includes an SSO flow for institutional sign-in. Query param `?tab=signup` opens the signup tab by default.

### `/onboarding` — Onboarding *(auth required)*
A guided conversational onboarding experience that builds the student's learning profile:
1. **Celebration animation** — confetti-style welcome
2. **Welcome screen** — personalised greeting
3. **Chat-based questionnaire** — collects learning preferences, study habits, subject interests
4. **VAK Profile** — computes and displays the student's Visual/Auditory/Kinesthetic learning style profile
5. Saves responses and selected subjects to the database, then redirects to the dashboard

### `/dashboard` — Dashboard Layout *(auth required)*
Main authenticated shell with collapsible sidebar navigation and top header bar showing user info and notification bell. Contains the following child routes:

#### `/dashboard` (index) — Dashboard Home
Overview page showing:
- **My Courses** grid with progress bars for each enrolled subject
- **My Notes** preview (latest 4 notes)
- Quick link to extra-curricular courses

#### `/dashboard/courses` — Courses Page
Full listing of the student's enrolled subjects with progress tracking. Separated into two sections:
- **My Courses** — subjects selected during onboarding/settings
- **Extra-Curricular** — free courses available to all students (AI Literacy, Online Safety, Financial Literacy, Critical Thinking, Mental Health & Wellbeing)

#### `/dashboard/courses/:id` — Course Learning
The core learning experience with a three-panel layout:
- **Left panel**: Topic sidebar with progress bar, topic list (completed/unlocked/locked states), and mark-complete functionality
- **Right panel**: AI chat interface with the subject's tutor. Supports:
  - Markdown-rendered messages with rich formatting
  - Interactive quizzes (multiple choice with instant feedback)
  - Chart rendering (line, bar, pie charts embedded in conversation)
  - Callout/highlight messages
  - Streaming AI responses with typing indicator
  - New chat session creation
  - Auto-initiation of AI sessions for new topics
  - Spaced repetition review sessions (triggered from notifications)

#### `/dashboard/courses/:id/skillgraph` — Skill Graph
Per-course SVG skill tree showing topic dependencies as a node graph. Nodes are color-coded by status (completed, unlocked, locked).

#### `/dashboard/knowledge-graph` — Knowledge Graph
A full-screen D3 force-directed graph visualising the student's entire knowledge universe:
- Central "You" node connected to all subjects
- Subject nodes connected to their individual topic nodes
- Nodes colored by subject with status indicators
- Hover tooltips showing topic name, subject, and status
- Left panel with legend, subject filters, and aggregate stats
- Extra-curricular courses shown with dashed outlines
- Dark grey background with white center node

#### `/dashboard/notes` — Notes
CRUD interface for study notes:
- Grid view of color-coded note cards (purple/green)
- Create new notes with title, content, and color picker
- Delete notes on hover
- Persisted to database per user

#### `/dashboard/reports` — Reports
Monthly analytics dashboard with:
- Summary cards: Study Streak, Topics Completed, Average Quiz Score
- Weekly Study Time line chart
- Quiz Scores by Subject bar chart

#### `/dashboard/schedule` — Schedule
Timetable view showing daily schedule with time, lesson, teacher (with avatar initials), and location columns.

#### `/dashboard/chat` — Chat Hub
Quick-access page listing all enrolled courses as cards. Clicking a course navigates to its learning session (`/dashboard/courses/:id`).

#### `/dashboard/settings` — Settings
User configuration page with:
- **Profile**: Edit first name, last name (email read-only)
- **My Subjects**: Toggle subjects on/off (changes reflect across dashboard, courses, and knowledge graph)
- **Notifications**: Toggle push notifications and spaced repetition reminders
- **Logout**: Sign out button

---

## Key Features

### 🤖 AI Tutoring
Each subject has a dedicated AI tutor powered by Lovable AI. The tutor adapts to the student's learning style (determined during onboarding) and provides contextual explanations, examples, and assessments. Chat history is persisted per topic.

### 📊 Interactive Quizzes & Charts
AI tutors can generate inline quizzes with multiple-choice questions and visual charts (line, bar, pie) directly in the conversation. Quiz results feed back into the AI for adaptive follow-up.

### 🔄 Spaced Repetition
Completed topics are tracked for review scheduling. The notification bell shows topics due for review, and clicking a notification navigates directly to a review session with the AI tutor.

### 🧠 VAK Learning Profile
During onboarding, the system computes the student's Visual, Auditory, and Kinesthetic learning preferences. This profile influences how the AI tutor presents material.

### 🌐 Knowledge Graph
A force-directed graph (built with D3) visualises the student's entire learning journey. It shows relationships between subjects and topics, with real-time progress reflected in node states.

### 📚 Extra-Curricular Courses
Five free courses available to all students:
- **AI Literacy** — Understanding AI, LLMs, bias, and careers
- **Online Safety & Security** — Passwords, phishing, digital footprint
- **Financial Literacy** — Budgeting, saving, investing, debt
- **Critical Thinking** — Logic, source evaluation, fake news
- **Mental Health & Wellbeing** — Stress, burnout, anxiety, routines

### 🔐 Authentication & Authorization
Email/password authentication with email verification. Supports role-based profiles (student, teacher, admin). All user data is protected with Row Level Security policies.

---

## Database Schema

| Table | Purpose |
|-------|---------|
| `profiles` | User profile data (name, role, onboarding status) |
| `subjects` | Available subjects with topics and display config |
| `user_subjects` | User-subject enrollment with per-topic progress |
| `chat_messages` | Persisted AI chat history per user/subject/topic |
| `notes` | User-created study notes |
| `onboarding_responses` | Onboarding questionnaire answers and VAK profile |

---

## Getting Started

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Deployment

The app is deployed via Lovable. Frontend changes require clicking "Update" in the publish dialog. Backend changes (edge functions, database migrations) deploy automatically.

---

## License

© 2025 LearnAI. All rights reserved.
