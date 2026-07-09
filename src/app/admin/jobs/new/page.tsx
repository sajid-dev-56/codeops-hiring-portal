"use client";

import { useActionState, useState } from "react";
import { createJob } from "../actions";
import { RichTextEditor } from "@/components/RichTextEditor";

export default function NewJobPage() {
  const [description, setDescription] = useState("<h2>About the Role</h2><p>Describe the position...</p><h2>Requirements</h2><ul><li>Requirement 1</li></ul>");
  const [error, formAction, isPending] = useActionState(
    async (_prev: string | null, formData: FormData) => {
      const result = await createJob(formData);
      if (result?.error) return result.error;
      return null;
    },
    null
  );

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900">Create New Job</h1>
        <p className="text-surface-500 mt-1">
          Add a new position to your careers page
        </p>
      </div>

      <form action={formAction} className="space-y-6">
        <div className="bg-white rounded-xl border border-surface-100 shadow-sm p-6 sm:p-8 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label htmlFor="job-title" className="block text-sm font-medium text-surface-700 mb-1.5">
                Job Title *
              </label>
              <input
                type="text"
                id="job-title"
                name="title"
                required
                className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all outline-none text-surface-900"
                placeholder="Senior Frontend Engineer"
              />
            </div>

            <div>
              <label htmlFor="job-slug" className="block text-sm font-medium text-surface-700 mb-1.5">
                URL Slug *
              </label>
              <input
                type="text"
                id="job-slug"
                name="slug"
                required
                className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all outline-none text-surface-900"
                placeholder="senior-frontend-engineer"
              />
            </div>

            <div>
              <label htmlFor="job-department" className="block text-sm font-medium text-surface-700 mb-1.5">
                Department *
              </label>
              <input
                type="text"
                id="job-department"
                name="department"
                required
                className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all outline-none text-surface-900"
                placeholder="Engineering"
              />
            </div>

            <div>
              <label htmlFor="job-status" className="block text-sm font-medium text-surface-700 mb-1.5">
                Status
              </label>
              <select
                id="job-status"
                name="status"
                defaultValue="OPEN"
                className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all outline-none text-surface-900"
              >
                <option value="OPEN">Open</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            <div>
              <label htmlFor="job-priority" className="block text-sm font-medium text-surface-700 mb-1.5">
                Priority
              </label>
              <select
                id="job-priority"
                name="priority"
                defaultValue="MEDIUM"
                className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all outline-none text-surface-900"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label htmlFor="job-headcount" className="block text-sm font-medium text-surface-700 mb-1.5">
                Headcount
              </label>
              <input
                type="number"
                id="job-headcount"
                name="headcount"
                min={1}
                defaultValue={1}
                className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all outline-none text-surface-900"
              />
            </div>

            <div>
              <label htmlFor="job-startdate" className="block text-sm font-medium text-surface-700 mb-1.5">
                Target Start Date
              </label>
              <input
                type="date"
                id="job-startdate"
                name="targetStartDate"
                className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all outline-none text-surface-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="job-description" className="block text-sm font-medium text-surface-700 mb-1.5">
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
            {isPending ? "Creating..." : "Create Job"}
          </button>
        </div>
      </form>
    </div>
  );
}
