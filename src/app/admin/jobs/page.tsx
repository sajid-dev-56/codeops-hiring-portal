import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteJob } from "./actions";

export const dynamic = "force-dynamic";

const statusConfig: Record<string, { label: string; class: string }> = {
  OPEN: { label: "Open", class: "bg-success-400/10 text-success-600 border-success-400/20" },
  ON_HOLD: { label: "On Hold", class: "bg-warning-400/10 text-warning-600 border-warning-400/20" },
  CLOSED: { label: "Closed", class: "bg-surface-100 text-surface-500 border-surface-200" },
};

const priorityConfig: Record<string, { label: string; class: string }> = {
  URGENT: { label: "Urgent", class: "bg-danger-400/10 text-danger-600" },
  HIGH: { label: "High", class: "bg-orange-50 text-orange-600" },
  MEDIUM: { label: "Medium", class: "bg-blue-50 text-blue-600" },
  LOW: { label: "Low", class: "bg-surface-100 text-surface-500" },
};

export default async function JobsPage() {
  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { candidates: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Jobs</h1>
          <p className="text-surface-500 mt-1">{jobs.length} total positions</p>
        </div>
        <Link
          href="/admin/jobs/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 text-white font-medium text-sm hover:bg-primary-600 transition-colors shadow-sm dark:shadow-[0_0_15px_rgba(255,255,255,0.02)] dark:border-t-surface-700/50"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Job
        </Link>
      </div>

      <div className="bg-white dark:bg-surface-900/40 dark:backdrop-blur-xl rounded-xl border border-surface-100 dark:border-surface-800/50 shadow-sm dark:shadow-[0_0_15px_rgba(255,255,255,0.02)] dark:border-t-surface-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-100 dark:border-surface-800/50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">
                  Applicants
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-surface-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {jobs.map((job) => (
                <tr
                  key={job.id}
                  className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-surface-900 dark:text-white">{job.title}</p>
                      <p className="text-xs text-surface-400 mt-0.5">
                        /{job.slug}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-surface-600">
                    {job.department}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${
                        statusConfig[job.status]?.class
                      }`}
                    >
                      {statusConfig[job.status]?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        priorityConfig[job.priority]?.class
                      }`}
                    >
                      {priorityConfig[job.priority]?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-surface-600">
                    {job._count.candidates}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/jobs/${job.id}/edit`}
                        className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-400 hover:text-surface-600 transition-colors"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <form
                        action={async () => {
                          "use server";
                          await deleteJob(job.id);
                        }}
                      >
                        <button
                          type="submit"
                          className="p-2 rounded-lg hover:bg-danger-400/10 text-surface-400 hover:text-danger-500 transition-colors"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
