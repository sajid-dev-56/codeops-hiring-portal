"use client";

import { useActionState, useState } from "react";
import { updateJob } from "../../actions";
import type { Job } from "@prisma/client";
import { RichTextEditor } from "@/components/RichTextEditor";

export default function EditJobForm({ job }: { job: Job }) {
  const [description, setDescription] = useState(job.description);
  const updateJobWithId = updateJob.bind(null, job.id);

  const [error, formAction, isPending] = useActionState(
    async (_prev: string | null, formData: FormData) => {
      const result = await updateJobWithId(formData);
      if (result?.error) return result.error;
      return null;
    },
    null
  );

  return (
    <form action={formAction} className="space-y-6">
      <div className="bg-white rounded-xl border border-surface-100 shadow-sm p-6 sm:p-8 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <label htmlFor="edit-title" className="block text-sm font-medium text-surface-700 mb-1.5">
              Job Title *
            </label>
            <input
              type="text"
              id="edit-title"
              name="title"
              required
              defaultValue={job.title}
              className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all outline-none text-surface-900"
            />
          </div>

          <div>
            <label htmlFor="edit-slug" className="block text-sm font-medium text-surface-700 mb-1.5">
              URL Slug *
            </label>
            <input
              type="text"
              id="edit-slug"
              name="slug"
              required
              defaultValue={job.slug}
              className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all outline-none text-surface-900"
            />
          </div>

          <div>
            <label htmlFor="edit-department" className="block text-sm font-medium text-surface-700 mb-1.5">
              Department *
            </label>
            <input
              type="text"
              id="edit-department"
              name="department"
              required
              defaultValue={job.department}
              className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all outline-none text-surface-900"
            />
          </div>

          <div>
            <label htmlFor="edit-status" className="block text-sm font-medium text-surface-700 mb-1.5">
              Status
            </label>
            <select
              id="edit-status"
              name="status"
              defaultValue={job.status}
              className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all outline-none text-surface-900"
            >
              <option value="OPEN">Open</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          <div>
            <label htmlFor="edit-priority" className="block text-sm font-medium text-surface-700 mb-1.5">
              Priority
            </label>
            <select
              id="edit-priority"
              name="priority"
              defaultValue={job.priority}
              className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all outline-none text-surface-900"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div>
            <label htmlFor="edit-headcount" className="block text-sm font-medium text-surface-700 mb-1.5">
              Headcount
            </label>
            <input
              type="number"
              id="edit-headcount"
              name="headcount"
              min={1}
              defaultValue={job.headcount}
              className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all outline-none text-surface-900"
            />
          </div>

          <div>
            <label htmlFor="edit-startdate" className="block text-sm font-medium text-surface-700 mb-1.5">
              Target Start Date
            </label>
            <input
              type="date"
              id="edit-startdate"
              name="targetStartDate"
              defaultValue={
                job.targetStartDate
                  ? new Date(job.targetStartDate).toISOString().split("T")[0]
                  : ""
              }
              className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all outline-none text-surface-900"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="edit-description" className="block text-sm font-medium text-surface-700 mb-1.5">
              Description *
            </label>
            <input type="hidden" name="description" value={description} />
            <RichTextEditor content={description} onChange={setDescription} />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-danger-400/10 border border-danger-400/20 text-danger-600 text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        <a
          href="/admin/jobs"
          className="px-6 py-2.5 rounded-xl border border-surface-200 text-surface-600 font-medium text-sm hover:bg-surface-50 transition-colors"
        >
          Cancel
        </a>
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 rounded-xl bg-primary-500 text-white font-medium text-sm hover:bg-primary-600 transition-colors disabled:opacity-50 shadow-sm"
        >
          {isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
