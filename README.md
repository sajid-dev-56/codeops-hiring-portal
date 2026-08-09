<h1 align="center">
  <br>
  <img src="./public/logo.png" alt="CodeOps Pro Logo" width="80" />
  <br>
  CodeOps Pro
  <br>
</h1>

<h4 align="center">An AI-powered, full-stack platform featuring a smart Applicant Tracking System for modern HR teams, and a comprehensive Learning Academy with automated workflows.</h4>

<p align="center">
  <a href="https://codeopspro.vercel.app" target="_blank"><img src="https://img.shields.io/badge/🚀_LIVE_DEMO-codeopspro.vercel.app-6366f1?style=for-the-badge&labelColor=1e1b4b" alt="Live Demo" /></a>
  &nbsp;
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Gemini_AI-2.5_Flash-4285F4?style=for-the-badge&logo=google" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/Prisma-7-2D3748?style=for-the-badge&logo=prisma" alt="Prisma" />
</p>

<p align="center">
  <a href="#-the-problem">Problem</a> •
  <a href="#-live-demo">Live Demo</a> •
  <a href="#-features">Features</a> •
  <a href="#-ai-powered-resume-screening">AI Feature</a> •
  <a href="#-tech-stack--services">Tech Stack</a> •
  <a href="#-screenshots">Screenshots</a> •
  <a href="#%EF%B8%8F-how-to-run-the-project">Setup</a>
</p>

---

## 🔥 The Problem

**Hiring is broken for small-to-medium tech companies.** Most teams still juggle between email threads, Google Sheets, and calendar apps to manage candidates — leading to missed follow-ups, biased screening, and weeks-long hiring cycles. Enterprise ATS tools like Greenhouse or Lever cost $6,000+/year and are overkill for growing teams.

**CodeOps Pro** solves this by providing a **free, open-source, AI-first platform** combining both hiring and learning:

- **CodeOps Careers (For HR & Candidates):** An intelligent admin dashboard with drag-and-drop pipelines, AI-scored candidates, and a real-time tracking portal for applicants.
- **CodeOps Academy (For Students):** A comprehensive learning management system with course progression, automated deadline reminders, and an integrated mentor chatbot.

> **Who is this for?** Startups, software agencies, and any tech team that needs a professional hiring and learning workflow without the enterprise price tag.

---

## 🌐 Live Demo

### 🔗 **[https://codeopspro.vercel.app](https://codeopspro.vercel.app)**

The application is fully deployed and live on **Vercel** with a production PostgreSQL database on **Supabase**.

#### 🔑 Admin Access (for evaluators)

Use these credentials to explore the full admin dashboard:

| Field    | Value                    |
|----------|--------------------------|
| **URL**  | [codeopspro.vercel.app/login](https://codeopspro.vercel.app/login) |
| **Email** | `..........`  |
| **Password** | `......`         |

> **Note:** After logging in, you will be redirected to the Admin Dashboard where you can manage jobs, view AI-analyzed candidates, use the Kanban pipeline, schedule interviews, and send messages.

---

## ✨ Features

### 🎯 For Admins / HR Teams
| Feature | Description |
|---------|-------------|
| **📊 Analytics Dashboard** | Real-time stats — open positions, total candidates, weekly interviews, and hires at a glance |
| **🤖 AI Resume Screening** | Google Gemini automatically scores every applicant (0–100), extracts skills, and writes a fit summary |
| **📋 Kanban Pipeline** | 9-stage drag-and-drop board (Applied → Screening → Interview 1 → Interview 2 → Test → Final → Offer → Hired / Rejected) |
| **📝 Rich Text Job Editor** | Create beautiful job descriptions with a WYSIWYG editor (TipTap) — supports headings, lists, links, and formatting |
| **📅 Interview Scheduling** | Schedule interviews with round names, interviewer assignments, dates, and candidate scoring |
| **💬 Two-Way Messaging** | Built-in real-time chat system between admin and each candidate |
| **📧 Automated Emails** | Transactional email system with customizable templates for application confirmations, interview invites, offers, and rejections |
| **📎 CV/Resume Management** | Secure file uploads via Supabase Storage with presigned URLs for viewing and downloading |
| **📋 Custom Questions** | Add custom screening questions per job posting that candidates must answer |
| **🗑️ Candidate Management** | View, filter, update stage, delete candidates, and add internal notes |
| **🎨 Email Template Editor** | Customize all automated email templates with variable interpolation ({{candidateName}}, {{jobTitle}}, etc.) |

### 🎓 For Students (CodeOps Academy)
| Feature | Description |
|---------|-------------|
| **📚 Course Catalog** | Browse featured courses and view detailed curricula |
| **🎯 Learning Dashboard** | Track daily goals, overall progress, and recent announcements |
| **⏳ Automated Reminders** | **Vercel Cron Jobs** automatically send email warnings 1 day before assignment deadlines |
| **🛡️ Smart Anti-Cheating Quizzes** | Secure quiz module with strict timers, tab-switch detection (Visibility API), copy-paste traps, and adversarial prompt injections (AI-breaking watermarks) |
| **🤖 Mentor Chat Widget** | AI chatbot to assist students with course-related doubts |
| **🏆 Leaderboards** | Gamified learning experience to compete with other students |

### 👤 For Candidates
| Feature | Description |
|---------|-------------|
| **🏠 Careers Page** | Browse all open positions with department filters and detailed job descriptions |
| **📄 Smart Application Form** | Apply with resume upload, cover letter, salary expectations, portfolio URL, and custom question responses |
| **📍 Application Tracker** | Visual progress timeline showing exactly where they are in the pipeline |
| **💬 Direct Messaging** | Chat with the hiring team directly from their portal |
| **📅 Interview Visibility** | See all scheduled interviews with dates, times, and round details |
| **🔔 Email Notifications** | Automatic email updates on every stage change (interview invite, offer, rejection) |

### 🛡️ Platform-Wide
| Feature | Description |
|---------|-------------|
| **🐈 JIYA AI Assistant** | Global, context-aware chatbot (Floating Cat Icon) that assists Admins with HR tasks and Candidates with portal navigation |
| **🔐 Role-Based Auth** | NextAuth.js with JWT sessions, role-based middleware (Admin vs Candidate routes) |
| **🌙 Dark Mode** | Full dark mode support across all pages with smooth transitions |
| **📱 Responsive Design** | Works flawlessly on mobile, tablet, and desktop |
| **⚡ Rate Limiting** | Upstash Redis rate limiting in production, in-memory fallback for development |
| **🔍 SEO Optimized** | Dynamic sitemap, robots.txt, meta tags, and Open Graph support |
| **📈 Analytics** | Vercel Analytics and Speed Insights integration |

---

## 🐈 JIYA — The Global AI Assistant

**JIYA** is an intelligent, floating chatbot built directly into the portal to provide real-time, context-aware assistance to both the hiring team and the applicants.

### Dynamic Context Switching
JIYA automatically understands who she is talking to based on the active route:

- **For Admins / HR:** When logged into the admin dashboard, JIYA acts as an **Expert HR Assistant**. She can help you draft professional rejection or offer emails, generate custom interview questions based on a specific candidate's resume, and provide best practices for tech interviews.
- **For Candidates / Public:** When browsing jobs or checking application status, JIYA acts as a **Friendly Guide**. She helps candidates understand the hiring process, provides tips on how to prepare for interviews, and answers general queries about the company culture in a polite, encouraging tone.

### Technical Highlights
- **Powered by Google Gemini 2.5 Flash:** Ensures lightning-fast, high-quality conversational responses.
- **Session-Based Memory:** Chat history is maintained securely within the active browser session and clears automatically upon closing the page for maximum privacy.
- **Global Availability:** Integrated at the root layout level (`src/app/layout.tsx`), making the floating cat icon accessible from any page without redundant code.

---

## 🤖 AI-Powered Resume Screening

### What It Does

Every time a candidate submits an application, the system **automatically triggers an AI analysis** using **Google Gemini 2.5 Flash**. The AI acts as an expert technical recruiter and evaluates the candidate's application against the specific job description.

The AI returns three things:
1. **Match Score (0–100)** — How well the candidate fits the role
2. **Summary** — A 2–3 sentence professional evaluation of the candidate's fit
3. **Extracted Skills** — A list of key skills identified from the application

These results are stored in the database and displayed on the candidate's detail page in the admin dashboard, giving recruiters an instant signal of who to prioritize.

### The System Prompt

```
You are an expert technical recruiter analyzing a candidate application
for the role of {JOB_TITLE} ({JOB_DEPARTMENT}).

Job Description:
{FULL_JOB_DESCRIPTION}

Candidate Application Details:
Name: {CANDIDATE_NAME}
Expected Salary: {EXPECTED_SALARY}
Notice Period: {NOTICE_PERIOD}
Portfolio: {PORTFOLIO_URL}
Cover Letter/Experience:
{COVER_LETTER}

Analyze the candidate's application against the job description.
Return a match score (0-100), a short summary of their fit,
and a list of key skills.
```

### Technical Implementation

- **Model:** `gemini-2.5-flash` via the `@google/genai` SDK
- **Output Format:** Structured JSON using Gemini's `responseSchema` feature with Zod-like type definitions
- **Trigger:** Asynchronous — fires after application submission without blocking the user
- **Storage:** Results saved to PostgreSQL via Prisma (`aiScore`, `aiSummary`, `aiSkills` fields on the Candidate model)

```typescript
// Structured output schema enforced on the AI response
const responseSchema = {
  type: Type.OBJECT,
  properties: {
    score: {
      type: Type.INTEGER,
      description: "Match score out of 100 based on candidate fit",
    },
    summary: {
      type: Type.STRING,
      description: "A brief 2-3 sentence summary evaluating the candidate's fit",
    },
    skills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of key skills identified in the application",
    },
  },
  required: ["score", "summary", "skills"],
};
```

---

## 🛠️ Tech Stack & Services

### Core Framework
| Technology | Purpose |
|-----------|---------|
| **Next.js 16** | Full-stack React framework (App Router, Server Actions, Server Components) |
| **TypeScript 5** | Type-safe development with strict mode |
| **React 19** | UI library with latest concurrent features |

### Backend & Database
| Technology | Purpose |
|-----------|---------|
| **PostgreSQL** | Relational database for all application data |
| **Supabase** | Managed PostgreSQL hosting + Storage (S3-compatible) for CV uploads |
| **Prisma 7** | Type-safe ORM with migrations, seeding, and schema management |
| **NextAuth.js v5** | Authentication with JWT sessions, role-based access control |
| **bcrypt.js** | Secure password hashing |

### AI & Intelligence
| Technology | Purpose |
|-----------|---------|
| **Google Gemini 2.5 Flash** | AI resume screening, skill extraction, and candidate scoring |
| **@google/genai SDK** | Official Google GenAI client with structured output support |

### Frontend & UI
| Technology | Purpose |
|-----------|---------|
| **Tailwind CSS 4** | Utility-first CSS framework |
| **TipTap Editor** | Rich text / WYSIWYG editor for job descriptions |
| **Hello Pangea DnD** | Drag-and-drop library for the Kanban pipeline |
| **Lucide Icons** | Modern icon library |
| **next-themes** | Dark mode / theme switching |
| **react-hot-toast** | Toast notification system |

### Infrastructure & DevOps
| Technology | Purpose |
|-----------|---------|
| **Vercel** | Deployment, edge functions, and hosting |
| **Upstash Redis** | Distributed rate limiting in production |
| **Nodemailer + Gmail SMTP** | Transactional email delivery |
| **Vercel Analytics** | Performance monitoring and web analytics |
| **Vercel Cron Jobs** | Scheduled automated tasks for sending deadline reminders |
| **Zod** | Runtime schema validation for forms and API inputs |

---

## 📸 Screenshots

### 1. Landing Page — Hero Section
> The public-facing homepage with animated gradients, a live "We're hiring" badge, and CTAs for browsing open roles.

![Landing Page Hero](./public/screenshots/01-landing-hero.png)

---

### 2. Featured Opportunities & Bento Grid
> Showcases open positions dynamically from the database, with a "Why Join Us" bento-box section highlighting AI-powered matching, remote culture, and benefits.

![Featured Jobs Section](./public/screenshots/02-featured-jobs.png)

---

### 3. Careers Page — Job Listings
> All open positions displayed as interactive cards with department tags, headcount, and one-click apply navigation.

![Careers Page](./public/screenshots/03-careers-page.png)

---

### 4. Unified Login Page
> Single login form for both Admin and Candidate roles. NextAuth.js handles routing based on role after authentication.

![Login Page](./public/screenshots/04-login-page.png)

---

### 5. Admin Dashboard — Analytics Overview
> Real-time statistics cards (Open Positions, Total Candidates, Weekly Interviews, Hired), pipeline distribution chart, and recent applications feed.

![Admin Dashboard](./public/screenshots/05-admin-dashboard.png)

---

### 6. Kanban Pipeline — Candidate Management
> 9-column drag-and-drop board for visually managing candidates through every hiring stage. Each card shows candidate name, position, and application date.

![Kanban Pipeline](./public/screenshots/06-kanban-pipeline.png)

---

## 🏗️ Project Architecture

```
hiring-portal/
├── prisma/
│   ├── schema.prisma          # Database models, enums, and relations
│   └── seed.ts                # Admin user + sample jobs seeder
├── public/
│   ├── logo.png               # Brand logo
│   └── screenshots/           # README screenshots
├── src/
│   ├── app/
│   │   ├── (public)/          # Public routes — Landing, Careers, Login
│   │   │   ├── page.tsx       # Landing page with hero + featured jobs
│   │   │   ├── careers/       # Job listings and individual job pages
│   │   │   ├── candidate/     # Public-facing application form
│   │   │   └── login/         # Unified authentication page
│   │   ├── admin/             # Protected Admin Dashboard
│   │   │   ├── page.tsx       # Dashboard with stats + pipeline chart
│   │   │   ├── candidates/    # Kanban board + candidate detail pages
│   │   │   ├── jobs/          # Job CRUD with rich text editor
│   │   │   ├── interviews/    # Interview scheduling & management
│   │   │   └── settings/      # Email template customization
│   │   ├── candidate/         # Protected Candidate Portal
│   │   │   └── page.tsx       # Progress tracker + messaging + interviews
│   │   └── api/               # RESTful API routes
│   │       ├── chat/          # JIYA AI Assistant chat endpoint
│   │       ├── applications/  # Application submission endpoint
│   │       ├── candidates/    # Candidate CRUD + stage updates
│   │       ├── jobs/          # Job management endpoints
│   │       ├── messages/      # Real-time messaging API
│   │       ├── upload/        # Presigned URL generation for CV uploads
│   │       └── email-templates/ # Template CRUD
│   ├── components/
│   │   ├── chat/
│   │   │   └── FloatingChatbot.tsx # JIYA Global AI Assistant widget
│   │   ├── ChatBox.tsx        # Two-way messaging component
│   │   ├── RichTextEditor.tsx # TipTap WYSIWYG editor
│   │   ├── theme-provider.tsx # Dark mode context provider
│   │   └── theme-toggle.tsx   # Theme switch button
│   ├── lib/
│   │   ├── ai.ts              # Gemini AI screening logic + prompts
│   │   ├── auth.ts            # NextAuth configuration + credentials provider
│   │   ├── auth.config.ts     # Auth callbacks (JWT + session)
│   │   ├── email.ts           # Nodemailer transporter + email templates
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── rate-limit.ts      # Upstash Redis / in-memory rate limiter
│   │   ├── supabase-storage.ts # Presigned upload/download URL generation
│   │   └── validations.ts     # Zod schemas for form validation
│   ├── middleware.ts           # Route protection (Admin/Candidate guards)
│   └── types/                 # Global TypeScript type definitions
├── .env.example               # Environment variable template
├── next.config.ts             # Next.js configuration
├── package.json               # Dependencies and scripts
└── tsconfig.json              # TypeScript configuration
```

---

## ⚙️ How to Run the Project

### Prerequisites

- **Node.js** v18.17.0 or higher
- **npm** (comes with Node.js)
- A **PostgreSQL** database (we recommend [Supabase](https://supabase.com/) — free tier works)
- A **Google Gemini API Key** ([Get one free](https://aistudio.google.com/apikey))
- A **Gmail App Password** for email notifications ([Guide](https://support.google.com/accounts/answer/185833))

### Step 1 — Clone the Repository

```bash
git clone https://github.com/sajid-dev-56/codeops-hiring-portal.git
cd codeops-hiring-portal
```

### Step 2 — Install Dependencies

```bash
npm install
```

### Step 3 — Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and fill in the following:

```env
# ──── Database ────
DATABASE_URL="postgresql://user:password@host:port/database"

# ──── Authentication ────
NEXTAUTH_SECRET="your-secure-random-string"
NEXTAUTH_URL="http://localhost:3000"

# ──── Admin Seed Credentials ────
ADMIN_EMAIL="admin@yourcompany.com"
ADMIN_PASSWORD="your-secure-password"

# ──── Supabase Storage (for CV uploads) ────
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# ──── Email Notifications (Gmail SMTP) ────
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="your-16-char-app-password"
ADMIN_NOTIFICATION_EMAIL="alerts@yourcompany.com"

# ──── AI Integration ────
GEMINI_API_KEY="your-google-gemini-api-key"
```

### Step 4 — Set Up the Database

```bash
# Generate the Prisma client
npx prisma generate

# Push the schema to your database
npx prisma db push

# Seed the admin user and sample jobs
npx prisma db seed
```

### Step 5 — Start the Development Server

```bash
npm run dev
```

The application will be available at **[http://localhost:3000](http://localhost:3000)**.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server with Turbopack |
| `npm run build` | Create an optimized production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint for code quality checks |
| `npm run db:push` | Push Prisma schema changes to the database |
| `npm run db:seed` | Seed the database with admin user and sample jobs |
| `npm run db:studio` | Open Prisma Studio (visual database browser) |

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <br>
  <b>Built with ❤️ by <a href="https://github.com/sajid-dev-56">Sajid Rehman</a></b>
  <br>
  <i>Full-stack developer passionate about building AI-powered solutions that solve real problems.</i>
  <br><br>
  <a href="https://codeopspro.vercel.app">🌐 Live Demo</a> •
  <a href="https://github.com/sajid-dev-56/codeops-hiring-portal">📂 GitHub Repository</a>
</p>
