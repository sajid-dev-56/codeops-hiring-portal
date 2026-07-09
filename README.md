<h1 align="center">
  <br>
  CodeOps Hiring Portal 🚀
  <br>
</h1>

<h4 align="center">A modern, AI-powered Applicant Tracking System (ATS) built for high-performance teams.</h4>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#environment-variables">Environment Variables</a> •
  <a href="#handover">Developer Handover</a>
</p>

---

## 🌟 Overview

**CodeOps Hiring Portal** is a production-ready, full-stack Next.js application designed to streamline the recruitment process. From beautiful, rich-text job postings to automated Gemini AI resume screening and real-time candidate messaging, this platform provides an end-to-end solution for modern HR workflows.

## ✨ Features

- **Unified Authentication:** A seamless, single-entry authentication flow powered by `NextAuth.js` with role-based access control (Admin vs. Candidate).
- **AI Resume Screening:** Deep integration with Google's Gemini API to automatically parse resumes, extract skills, and score candidates (0-10) against job requirements.
- **Rich Text Job Management:** Create visually appealing job listings using a robust WYSIWYG editor (TipTap/Radix).
- **Automated Email Workflows:** Transactional emails (application confirmations, stage updates, new messages) powered by `Nodemailer` via Gmail SMTP.
- **Cloud Storage Integration:** Scalable and secure CV/Resume uploads utilizing Cloudflare R2 (S3-compatible storage).
- **Interactive Kanban Pipeline:** Admins can visually track and move candidates through different hiring stages (Applied, Interview, Offer, Rejected).
- **Two-way Communication:** Built-in messaging portal allowing direct communication between the HR/Admin team and the candidate.

## 💻 Tech Stack

### Core
- **Framework:** [Next.js 14](https://nextjs.org/) (App Router, Server Actions, Turbopack)
- **Language:** [TypeScript](https://www.typescriptlang.org/) (Strict Mode)

### Backend & Data
- **Database:** [PostgreSQL](https://www.postgresql.org/) hosted on [Supabase](https://supabase.com/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Authentication:** [NextAuth.js](https://next-auth.js.org/) (Custom Credentials Provider)

### Frontend
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Components:** [Radix UI](https://www.radix-ui.com/) (Headless accessibility primitives)
- **Icons:** Heroicons

### Third-Party Services
- **AI Processing:** Google Gemini API
- **File Storage:** Cloudflare R2
- **Email:** Nodemailer (SMTP)

---

## 🏗️ Architecture

```text
├── prisma/                  # Database schema & migrations
├── src/
│   ├── app/                 # Next.js App Router (Pages, Layouts, API Routes)
│   │   ├── (public)/        # Public-facing routes (Login, Careers Board, Apply)
│   │   ├── admin/           # Protected Admin Dashboard & Workflows
│   │   ├── api/             # RESTful API endpoints (Uploads, Webhooks)
│   │   └── candidate/       # Protected Candidate Portal
│   ├── components/          # Reusable React components (UI, Forms, Modals)
│   ├── lib/                 # Core utilities (Auth, Prisma client, R2 logic, AI logic)
│   └── types/               # Global TypeScript definitions
├── HANDOVER.md              # Detailed backend developer documentation
└── .env.example             # Environment variable templates
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18.17.0 or higher)
- **npm** or **pnpm**
- A provisioned PostgreSQL database (Supabase recommended)
- Cloudflare R2 Bucket (or AWS S3)
- Google Gemini API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sajid-dev-56/codeops-hiring-portal.git
   cd codeops-hiring-portal
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Copy the example environment file and fill in your credentials.
   ```bash
   cp .env.example .env
   ```
   *(See the [Environment Variables](#environment-variables) section below for required keys).*

4. **Database Setup:**
   Generate the Prisma client and push the schema to your database.
   ```bash
   npx prisma generate
   npx prisma db push
   # Optional: Seed the database with initial Admin credentials
   npx prisma db seed
   ```

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

---

## 🔐 Environment Variables

Ensure the following variables are configured in your `.env` file before running the application:

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# NextAuth
NEXTAUTH_SECRET="your-secure-random-string"
NEXTAUTH_URL="http://localhost:3000"

# Storage (Cloudflare R2)
R2_ACCOUNT_ID="your-account-id"
R2_ACCESS_KEY_ID="your-access-key"
R2_SECRET_ACCESS_KEY="your-secret-key"
R2_BUCKET="your-bucket-name"
R2_PUBLIC_BASE_URL="https://your-public-r2-url.com"

# Communications (Nodemailer)
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="your-app-password"
ADMIN_NOTIFICATION_EMAIL="admin-alerts@gmail.com"

# AI Integration
GEMINI_API_KEY="your-google-gemini-api-key"
```

---

## 📜 Developer Handover & Contributing

For developers taking over or contributing to this project, please read the **`HANDOVER.md`** file located in the root directory. It contains critical information regarding open tasks, known network/CORS issues with R2, and exact steps for production deployment.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---
<p align="center">
  <i>Built with precision and passion for optimal hiring workflows.</i>
</p>
