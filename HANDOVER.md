# CodeOps Hiring Portal - Developer Handover Document

Welcome to the CodeOps Hiring Portal! This document contains everything you need to know to take over the backend and frontend development of this project.

## 🚀 Project Overview
This is a modern, full-stack Applicant Tracking System (ATS) built to manage jobs, receive applications, screen candidates with AI, and communicate with them via a unified portal. 

**Tech Stack:**
- **Framework:** Next.js 14 (App Router, Turbopack)
- **Database:** PostgreSQL (Supabase) + Prisma ORM
- **Authentication:** NextAuth.js (Custom Credentials Provider)
- **Styling:** Tailwind CSS + Radix UI Primitives
- **AI Integration:** Google Gemini API (for AI Resume Screening)
- **Email:** Nodemailer (Using Gmail SMTP)
- **Storage:** Cloudflare R2 (for CV/Resume uploads)

---

## 🛠️ Implemented Features
Here is a summary of the features that have already been built and are fully functional:

1. **Unified Authentication System**
   - Single login page (`/login`) for both Admin and Candidates.
   - Redirects users automatically to their respective dashboards based on their `role` (ADMIN or CANDIDATE).
   
2. **Admin Dashboard & Job Management**
   - Admin can Create, Read, Update, and Delete jobs.
   - Integrated a **Rich Text Editor** for beautiful job descriptions.

3. **Candidate Application Flow**
   - Public careers page listing open jobs.
   - Candidates apply via a multi-step form.
   - Honeypot fields implemented to prevent bot spam.
   
4. **Custom Email Notifications (Nodemailer)**
   - Switched from Resend to **Nodemailer (Gmail)**.
   - Sends a confirmation email to the candidate upon applying.
   - Sends an alert email to the Admin when a new application arrives.
   - Sends automated status update emails when candidate stages are changed (e.g., Interview, Offer, Rejected).

5. **AI-Powered Resume Screening**
   - Integrated with **Gemini API**.
   - Admin can click the "Run AI Screening" button on a candidate's profile to automatically generate a score (0-10) and a brief analysis based on the job requirements.

6. **Candidate Portal & Messaging**
   - Candidates can log in to view their application status.
   - Built-in chat interface for two-way communication between the Admin and the Candidate.

---

## 🗄️ Database Setup & Highlighted Issues
We are using **Supabase** for the PostgreSQL database. Prisma is the ORM.

> [!WARNING]
> **Database Highlight / Issue:**
> Please review the database connection pooling. Currently, we are connecting to Supabase. Make sure the `DATABASE_URL` is using the Transaction connection pooler (usually ends with port `6543` or `5432` with PgBouncer) so that Next.js Serverless functions don't exhaust the database connections. Also, we recently flushed/reset the data for production readiness. Ensure the schema stays in sync via `npx prisma db push` or `npx prisma migrate deploy`.

---

## 📋 Outstanding Tasks for the Backend Developer
The client has requested the following tasks to be completed as a priority:

### Task 1: Fix the `Failed to fetch` Error on Application Submit
**Error Log:**
```text
## Error Type: Console TypeError
## Error Message: Failed to fetch
    at handleSubmit (file:///.../.next/dev/static/chunks/_0m7sjh0._.js:132:45)
```
**Context & Solution:**
This error occurs sporadically when a candidate submits the application form (`src/app/(public)/careers/[slug]/apply/page.tsx`). 
- **Check 1:** It may be caused by the Cloudflare R2 upload fetch failing (`fetch(uploadUrl, { method: "PUT" })`) due to missing CORS configuration on the R2 Bucket. Please ensure the R2 bucket allows `PUT` methods from the production and localhost origins.
- **Check 2:** Ensure the `.env` variables for R2 (`R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, etc.) are correctly set.
- **Check 3:** Implement better error handling and fallback logic inside `handleSubmit` so that if the CV upload fails, the UI gracefully informs the user instead of throwing an unhandled `TypeError`.

### Task 2: Fix Candidate CV Visibility
Currently, the CV is successfully uploading to R2 and the key is being saved to the database (`cvFileKey`), but the file is **not displaying/downloadable** on the Admin's Candidate Detail Page.
- **Objective:** You need to implement the logic to generate a signed URL from Cloudflare R2 using the `cvFileKey` and pass it to the frontend so the Admin can view or download the candidate's resume.

### Task 3: Deployment
Prepare the application for production deployment.
- The client wants to deploy this to **Vercel** or **Railway**.
- Ensure all environment variables in `.env.example` are properly securely configured in the hosting environment before launching.

---

## 🔐 Environment Variables Required
To run this project locally, ensure the `.env` file contains:
```env
DATABASE_URL=""
NEXTAUTH_SECRET=""
NEXTAUTH_URL="http://localhost:3000"

# Admin Default Credentials
ADMIN_EMAIL="sajid@codeopspro.com"
ADMIN_PASSWORD="Sajid@143"

# Cloudflare R2 for File Uploads
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET="hiring-portal-uploads"
R2_PUBLIC_BASE_URL=""

# Nodemailer / Gmail SMTP
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="your-16-char-app-password"
ADMIN_NOTIFICATION_EMAIL="admin-receiving-alerts@gmail.com"

# Supabase details
NEXT_PUBLIC_SUPABASE_URL=''
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=''

# AI Integration
GEMINI_API_KEY=""
```

**Good luck! If you have any questions, refer to the Next.js and Prisma documentation.**
