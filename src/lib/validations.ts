import { z } from "zod";

// Job schemas
export const createJobSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  slug: z
    .string()
    .min(2)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase with hyphens only"
    ),
  department: z.string().min(1, "Department is required"),
  status: z.enum(["OPEN", "ON_HOLD", "CLOSED"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  headcount: z.coerce.number().int().min(1, "Headcount must be at least 1"),
  targetStartDate: z.string().optional().nullable(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  customQuestions: z.string().optional(),
});

export const updateJobSchema = createJobSchema.partial();

// Application schema (public form)
export const applicationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  phone: z
    .string()
    .regex(/^\+?[0-9\s\-()]{7,20}$/, "Invalid phone number format")
    .optional()
    .or(z.literal("")),
  portfolioUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  expectedSalary: z.string().max(50).optional().or(z.literal("")),
  noticePeriod: z.string().max(50).optional().or(z.literal("")),
  coverLetter: z
    .string()
    .max(5000, "Cover letter must be under 5000 characters")
    .optional()
    .or(z.literal("")),
  cvFileKey: z.string().optional().or(z.literal("")),
  cvFileUrl: z.string().optional().or(z.literal("")),
  jobId: z.string().min(1, "Job ID is required"),
  customAnswers: z.record(z.string(), z.string()).optional(),
  // Honeypot field - should always be empty
  website: z.string().max(0, "Bot detected").optional().or(z.literal("")),
});

// Interview schema
export const createInterviewSchema = z.object({
  candidateId: z.string().min(1, "Candidate is required"),
  round: z.string().min(1, "Round is required"),
  interviewer: z.string().min(1, "Interviewer name is required"),
  interviewDate: z.string().min(1, "Interview date is required"),
  score: z.coerce.number().int().min(1).max(10).optional().nullable(),
  decision: z
    .enum(["STRONG_YES", "YES", "MAYBE", "NO", "STRONG_NO"])
    .optional()
    .nullable(),
  notes: z.string().optional().or(z.literal("")),
});

export const updateInterviewSchema = createInterviewSchema.partial();

// Note schema
export const createNoteSchema = z.object({
  candidateId: z.string().min(1),
  content: z.string().min(1, "Note content is required"),
});

// Presigned upload schema
export const presignUploadSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().refine(
    (type) =>
      [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ].includes(type),
    "Only PDF, DOC, and DOCX files are allowed"
  ),
  fileSize: z.number().max(5 * 1024 * 1024, "File size must be under 5MB"),
});

// Candidate stage update
export const updateStageSchema = z.object({
  candidateId: z.string().min(1),
  stage: z.enum([
    "APPLIED",
    "SCREENING",
    "INTERVIEW_1",
    "INTERVIEW_2",
    "TEST",
    "FINAL",
    "OFFER",
    "HIRED",
    "REJECTED",
  ]),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type ApplicationInput = z.infer<typeof applicationSchema>;
export type CreateInterviewInput = z.infer<typeof createInterviewSchema>;
export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type PresignUploadInput = z.infer<typeof presignUploadSchema>;
export type UpdateStageInput = z.infer<typeof updateStageSchema>;

// ═══════════════════════════════════════════
// LEARNING PORTAL SCHEMAS
// ═══════════════════════════════════════════

// Course schemas
export const createCourseSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(200),
  slug: z
    .string()
    .min(2)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase with hyphens only"
    ),
  description: z.string().min(10, "Description must be at least 10 characters"),
  thumbnail: z.string().url("Invalid URL").optional().or(z.literal("")),
  category: z.string().min(1, "Category is required"),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  isPublished: z.boolean().optional(),
});

export const updateCourseSchema = createCourseSchema.partial();

// Lesson schemas
export const createLessonSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
  title: z.string().min(2, "Title must be at least 2 characters").max(200),
  description: z.string().max(5000).optional().or(z.literal("")),
  videoUrl: z.string().url("Invalid video URL").optional().or(z.literal("")),
  videoType: z.enum(["DRIVE", "YOUTUBE", "EXTERNAL_LINK"]),
  order: z.coerce.number().int().min(0).optional(),
});

export const updateLessonSchema = createLessonSchema.partial().omit({ courseId: true });

// Task schemas
export const createTaskSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
  title: z.string().min(2, "Title must be at least 2 characters").max(200),
  description: z.string().min(10, "Description must be at least 10 characters"),
  maxMarks: z.coerce.number().int().min(1, "Max marks must be at least 1").max(1000),
  dueDate: z.string().optional().nullable(),
  order: z.coerce.number().int().min(0).optional(),
});

export const updateTaskSchema = createTaskSchema.partial().omit({ courseId: true });

// Task submission schema (student submits links + short notes)
export const taskSubmissionSchema = z.object({
  taskId: z.string().min(1, "Task ID is required"),
  content: z
    .string()
    .max(2000, "Note must be under 2000 characters")
    .optional()
    .or(z.literal("")),
  linkUrl: z
    .string()
    .url("Invalid URL")
    .optional()
    .or(z.literal("")),
});

// Grading schema (admin/instructor grades a submission)
export const gradeSubmissionSchema = z.object({
  submissionId: z.string().min(1, "Submission ID is required"),
  marks: z.coerce.number().int().min(0, "Marks cannot be negative"),
  feedback: z.string().max(5000).optional().or(z.literal("")),
  status: z.enum(["GRADED", "RESUBMIT"]),
});

// Announcement schema
export const createAnnouncementSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
  title: z.string().min(2, "Title must be at least 2 characters").max(200),
  content: z.string().min(5, "Content must be at least 5 characters"),
});

// Enrollment schema
export const enrollCourseSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
});

// Type exports
export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type TaskSubmissionInput = z.infer<typeof taskSubmissionSchema>;
export type GradeSubmissionInput = z.infer<typeof gradeSubmissionSchema>;
export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
export type EnrollCourseInput = z.infer<typeof enrollCourseSchema>;

