"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type FormState = {
  name: string;
  email: string;
  password: string;
  phone: string;
  portfolioUrl: string;
  expectedSalary: string;
  noticePeriod: string;
  coverLetter: string;
  customAnswers: Record<string, string>;
  website: string; // honeypot
};

type CustomQuestion = {
  question: string;
  required: boolean;
  type: string;
};

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
    phone: "",
    portfolioUrl: "",
    expectedSalary: "",
    noticePeriod: "",
    coverLetter: "",
    customAnswers: {},
    website: "",
  });

  const [jobId, setJobId] = useState<string | null>(null);
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
  const [loadingJob, setLoadingJob] = useState(true);

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    fetch(`/api/jobs/by-slug?slug=${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data.jobId) {
          setJobId(data.jobId);
          setCustomQuestions(data.customQuestions || []);
          
          // Initialize custom answers
          const initialAnswers: Record<string, string> = {};
          (data.customQuestions || []).forEach((q: CustomQuestion) => {
            initialAnswers[q.question] = "";
          });
          setForm(prev => ({ ...prev, customAnswers: initialAnswers }));
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoadingJob(false));
  }, [slug]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    if (name.startsWith("custom_")) {
      const qName = name.replace("custom_", "");
      setForm((prev) => ({
        ...prev,
        customAnswers: {
          ...prev.customAnswers,
          [qName]: value
        }
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleFileSelect = (file: File) => {
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        cv: "Only PDF, DOC, and DOCX files are allowed",
      }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        cv: "File size must be under 10MB",
      }));
      return;
    }
    setCvFile(file);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.cv;
      return next;
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    try {
      if (!jobId) {
        setErrors({ form: "This position is no longer available." });
        setSubmitting(false);
        return;
      }

      let cvFileKey = "";
      let cvFileUrl = "";

      // Upload CV if provided
      if (cvFile) {
        setUploading(true);
        try {
          const presignRes = await fetch("/api/upload/presign", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              filename: cvFile.name,
              contentType: cvFile.type,
              fileSize: cvFile.size,
            }),
          });

          if (!presignRes.ok) {
            const err = await presignRes.json();
            throw new Error(err.error || "Failed to prepare upload");
          }

          const { uploadUrl, token, path, fileKey } = await presignRes.json();

          // We use standard fetch with the Supabase REST API
          // Supabase's uploadToSignedUrl expects a PUT to the signedUrl
          const uploadRes = await fetch(uploadUrl, {
            method: "PUT",
            body: cvFile,
            headers: { 
              "Content-Type": cvFile.type,
              "Authorization": `Bearer ${token}` 
            },
          });

          if (!uploadRes.ok) {
            const errBody = await uploadRes.text();
            throw new Error("Failed to upload file to Supabase: " + errBody);
          }

          cvFileKey = fileKey;
          cvFileUrl = fileKey;
        } catch (err) {
          console.error("Upload error:", err);
          // Continue without CV - don't block submission
          cvFileKey = "";
          cvFileUrl = "";
        }
        setUploading(false);
      }

      // Submit application
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          jobId,
          cvFileKey,
          cvFileUrl,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setErrors({ form: err.error || "Failed to submit application" });
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setErrors({ form: "Something went wrong. Please try again." });
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="animate-scale-in">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success-400/10 flex items-center justify-center">
            <svg className="w-10 h-10 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-surface-900 dark:text-surface-50 mb-3">
            Application Submitted! 🎉
          </h1>
          <p className="text-lg text-surface-500 mb-8">
            Thank you for your interest. Our hiring team will review your
            application and get back to you within 5 business days.
          </p>
          <Link
            href="/careers"
            className="inline-flex items-center px-6 py-3 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-colors"
          >
            ← Back to Careers
          </Link>
        </div>
      </div>
    );
  }

  if (loadingJob) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex justify-center">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-surface-400 mb-8">
        <Link href="/careers" className="hover:text-primary-600 transition-colors">
          Careers
        </Link>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <Link
          href={`/careers/${slug}`}
          className="hover:text-primary-600 transition-colors"
        >
          Position
        </Link>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-surface-600">Apply</span>
      </nav>

      <div className="animate-fade-in">
        <h1 className="text-3xl font-extrabold text-surface-900 dark:text-surface-50 mb-2">
          Submit Your Application
        </h1>
        <p className="text-surface-500 mb-8">
          Fill in the form below. Fields marked with * are required.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Honeypot - hidden from humans */}
          <div className="absolute opacity-0 pointer-events-none" aria-hidden="true" tabIndex={-1}>
            <label htmlFor="website">Website</label>
            <input
              type="text"
              id="website"
              name="website"
              value={form.website}
              onChange={handleChange}
              autoComplete="off"
              tabIndex={-1}
            />
          </div>

          {/* Personal Info */}
          <div className="bg-white dark:bg-surface-900/40 rounded-2xl border border-surface-100 dark:border-surface-800 shadow-sm p-6 sm:p-8 space-y-5">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-50 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 text-sm font-bold">
                1
              </span>
              Personal Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900/50 focus:bg-white dark:focus:bg-surface-900 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all outline-none text-surface-900 dark:text-surface-50 placeholder:text-surface-400"
                  placeholder="John Doe"
                />
                {errors.name && <p className="mt-1 text-sm text-danger-500">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900/50 focus:bg-white dark:focus:bg-surface-900 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all outline-none text-surface-900 dark:text-surface-50 placeholder:text-surface-400"
                  placeholder="john@example.com"
                />
                {errors.email && <p className="mt-1 text-sm text-danger-500">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                  Account Password *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900/50 focus:bg-white dark:focus:bg-surface-900 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all outline-none text-surface-900 dark:text-surface-50 placeholder:text-surface-400"
                  placeholder="Create a password"
                  minLength={8}
                />
                {form.password && (
                  <div className="mt-2 space-y-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => {
                        const score = [
                          form.password.length >= 8,
                          /[A-Z]/.test(form.password),
                          /[0-9]/.test(form.password),
                          /[^A-Za-z0-9]/.test(form.password)
                        ].filter(Boolean).length;
                        return (
                          <div 
                            key={i} 
                            className={`h-1.5 flex-1 rounded-full transition-colors ${
                              i <= score 
                                ? (score < 3 ? 'bg-amber-400' : 'bg-success-500')
                                : 'bg-surface-200'
                            }`} 
                          />
                        );
                      })}
                    </div>
                    <ul className="text-xs space-y-1 text-surface-500">
                      <li className={form.password.length >= 8 ? "text-success-500 flex gap-1" : "flex gap-1"}>
                        {form.password.length >= 8 ? "✓" : "○"} At least 8 characters
                      </li>
                      <li className={/[A-Z]/.test(form.password) ? "text-success-500 flex gap-1" : "flex gap-1"}>
                        {/[A-Z]/.test(form.password) ? "✓" : "○"} 1 uppercase letter
                      </li>
                      <li className={/[0-9]/.test(form.password) ? "text-success-500 flex gap-1" : "flex gap-1"}>
                        {/[0-9]/.test(form.password) ? "✓" : "○"} 1 number
                      </li>
                      <li className={/[^A-Za-z0-9]/.test(form.password) ? "text-success-500 flex gap-1" : "flex gap-1"}>
                        {/[^A-Za-z0-9]/.test(form.password) ? "✓" : "○"} 1 special character
                      </li>
                    </ul>
                  </div>
                )}
                {errors.password && <p className="mt-1 text-sm text-danger-500">{errors.password}</p>}
                {!form.password && <p className="mt-1 text-xs text-surface-400">Used to login to Candidate Portal later.</p>}
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900/50 focus:bg-white dark:focus:bg-surface-900 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all outline-none text-surface-900 dark:text-surface-50 placeholder:text-surface-400"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <label htmlFor="portfolioUrl" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                  Portfolio / LinkedIn URL
                </label>
                <input
                  type="url"
                  id="portfolioUrl"
                  name="portfolioUrl"
                  value={form.portfolioUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900/50 focus:bg-white dark:focus:bg-surface-900 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all outline-none text-surface-900 dark:text-surface-50 placeholder:text-surface-400"
                  placeholder="https://linkedin.com/in/johndoe"
                />
              </div>
            </div>
          </div>

          {/* Role Details */}
          <div className="bg-white dark:bg-surface-900/40 rounded-2xl border border-surface-100 dark:border-surface-800 shadow-sm p-6 sm:p-8 space-y-5">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-50 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 text-sm font-bold">
                2
              </span>
              Role Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="expectedSalary" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                  Expected Salary
                </label>
                <input
                  type="text"
                  id="expectedSalary"
                  name="expectedSalary"
                  value={form.expectedSalary}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900/50 focus:bg-white dark:focus:bg-surface-900 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all outline-none text-surface-900 dark:text-surface-50 placeholder:text-surface-400"
                  placeholder="$120,000 - $150,000"
                />
              </div>
              <div>
                <label htmlFor="noticePeriod" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                  Notice Period
                </label>
                <input
                  type="text"
                  id="noticePeriod"
                  name="noticePeriod"
                  value={form.noticePeriod}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900/50 focus:bg-white dark:focus:bg-surface-900 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all outline-none text-surface-900 dark:text-surface-50 placeholder:text-surface-400"
                  placeholder="2 weeks"
                />
              </div>
            </div>

            <div>
              <label htmlFor="coverLetter" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Cover Letter
              </label>
              <textarea
                id="coverLetter"
                name="coverLetter"
                rows={5}
                value={form.coverLetter}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900/50 focus:bg-white dark:focus:bg-surface-900 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all outline-none text-surface-900 dark:text-surface-50 placeholder:text-surface-400 resize-none"
                placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                maxLength={5000}
              />
              <p className="mt-1 text-xs text-surface-400">
                {form.coverLetter.length}/5000 characters
              </p>
            </div>
            
            {customQuestions.length > 0 && (
              <div className="pt-6 border-t border-surface-200 dark:border-surface-700 space-y-5">
                <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-50">Additional Questions</h3>
                {customQuestions.map((q, idx) => (
                  <div key={idx}>
                    <label htmlFor={`custom_${q.question}`} className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                      {q.question} {q.required && "*"}
                    </label>
                    {q.type === "textarea" ? (
                      <textarea
                        id={`custom_${q.question}`}
                        name={`custom_${q.question}`}
                        required={q.required}
                        value={form.customAnswers[q.question] || ""}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900/50 focus:bg-white dark:focus:bg-surface-900 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all outline-none text-surface-900 dark:text-surface-50 placeholder:text-surface-400 resize-none"
                      />
                    ) : (
                      <input
                        type="text"
                        id={`custom_${q.question}`}
                        name={`custom_${q.question}`}
                        required={q.required}
                        value={form.customAnswers[q.question] || ""}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900/50 focus:bg-white dark:focus:bg-surface-900 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all outline-none text-surface-900 dark:text-surface-50 placeholder:text-surface-400"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CV Upload */}
          <div className="bg-white dark:bg-surface-900/40 rounded-2xl border border-surface-100 dark:border-surface-800 shadow-sm p-6 sm:p-8 space-y-5">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-50 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 text-sm font-bold">
                3
              </span>
              Resume / CV
            </h2>

            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                dragActive
                  ? "border-primary-400 bg-primary-50"
                  : cvFile
                    ? "border-success-400 bg-success-400/5"
                    : "border-surface-200 dark:border-surface-700 hover:border-primary-300 hover:bg-primary-50/50"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
                }}
              />
              {cvFile ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-success-400/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-surface-900 dark:text-surface-50">{cvFile.name}</p>
                    <p className="text-sm text-surface-500">
                      {(cvFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCvFile(null);
                    }}
                    className="ml-4 p-2 rounded-lg hover:bg-surface-100 transition-colors text-surface-400 hover:text-surface-600"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary-50 flex items-center justify-center">
                    <svg className="w-7 h-7 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="font-medium text-surface-700 dark:text-surface-300 mb-1">
                    Drop your resume here or click to browse
                  </p>
                  <p className="text-sm text-surface-400">
                    PDF, DOC, or DOCX — Max 10MB
                  </p>
                </>
              )}
            </div>
            {errors.cv && <p className="text-sm text-danger-500">{errors.cv}</p>}
          </div>

          {/* Error / Submit */}
          {errors.form && (
            <div className="p-4 rounded-xl bg-danger-400/10 border border-danger-400/20 text-danger-600 text-sm">
              {errors.form}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || uploading}
            className="w-full py-4 px-8 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold text-lg shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
          >
            {uploading
              ? "Uploading resume..."
              : submitting
                ? "Submitting application..."
                : "Submit Application"}
          </button>
        </form>
      </div>
    </div>
  );
}
