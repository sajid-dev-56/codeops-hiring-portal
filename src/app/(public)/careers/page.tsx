import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Careers — CodeOps Hiring Portal",
  description:
    "Browse our open positions and find your next career opportunity. Join our team of talented professionals.",
};

const departmentColors: Record<string, string> = {
  Engineering: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
  Design: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
  Infrastructure: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
  Marketing: "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800",
  Sales: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
  Product: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800",
  HR: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800",
  Finance: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
};

const priorityConfig: Record<string, { label: string; class: string }> = {
  URGENT: { label: "Urgent", class: "bg-danger-500 text-white" },
  HIGH: { label: "High Priority", class: "bg-warning-500 text-white" },
  MEDIUM: { label: "", class: "" },
  LOW: { label: "", class: "" },
};

export default async function CareersPage() {
  const jobs = await prisma.job.findMany({
    where: { status: "OPEN" },
    orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
    include: {
      _count: {
        select: { candidates: true },
      },
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-surface-900 dark:text-white mb-4">
          Open <span className="gradient-text">Positions</span>
        </h1>
        <p className="text-lg text-surface-500 max-w-2xl mx-auto">
          {jobs.length > 0
            ? `We have ${jobs.length} open position${jobs.length === 1 ? "" : "s"}. Find the perfect role for you.`
            : "No open positions right now. Check back soon!"}
        </p>
      </div>

      {/* Department filter chips */}
      {jobs.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {Array.from(new Set(jobs.map((j) => j.department))).map((dept) => (
            <span
              key={dept}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border ${
                departmentColors[dept] || "bg-surface-50 text-surface-600 border-surface-200 dark:bg-surface-800 dark:text-surface-300 dark:border-surface-700"
              }`}
            >
              {dept} ({jobs.filter((j) => j.department === dept).length})
            </span>
          ))}
        </div>
      )}

      {/* Job Cards */}
      <div className="grid gap-4 max-w-4xl mx-auto">
        {jobs.map((job, index) => (
          <Link
            key={job.id}
            href={`/careers/${job.slug}`}
            className="animate-fade-in card-hover group"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-100 dark:border-surface-800 p-6 sm:p-8 shadow-sm transition-colors duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-semibold text-surface-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {job.title}
                    </h2>
                    {priorityConfig[job.priority]?.label && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          priorityConfig[job.priority].class
                        }`}
                      >
                        {priorityConfig[job.priority].label}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-surface-500">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        departmentColors[job.department] ||
                        "bg-surface-50 text-surface-600 border-surface-200 dark:bg-surface-800 dark:text-surface-300 dark:border-surface-700"
                      }`}
                    >
                      {job.department}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {job.headcount} position{job.headcount > 1 ? "s" : ""}
                    </span>
                    {job.targetStartDate && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Start:{" "}
                        {new Date(job.targetStartDate).toLocaleDateString(
                          "en-US",
                          { month: "short", year: "numeric" }
                        )}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 font-medium text-sm group-hover:bg-primary-500 group-hover:text-white transition-all duration-300">
                    Apply Now
                    <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {jobs.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
            <svg className="w-10 h-10 text-surface-400 dark:text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-surface-700 dark:text-surface-300 mb-2">
            No open positions right now
          </h3>
          <p className="text-surface-500 dark:text-surface-400">
            We&apos;re not currently hiring, but check back soon for new opportunities.
          </p>
        </div>
      )}
    </div>
  );
}
