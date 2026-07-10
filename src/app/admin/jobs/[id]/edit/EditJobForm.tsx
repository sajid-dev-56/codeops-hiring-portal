"use client";

import { useActionState, useState } from "react";
import { updateJob } from "../../actions";
import type { Job } from "@prisma/client";
import { RichTextEditor } from "@/components/RichTextEditor";

export default function EditJobForm({ job }: { job: Job }) {
  const [description, setDescription] = useState(job.description);
  
  // Parse custom questions from job if available
  const initialCustomQuestions = job.customQuestions 
    ? (typeof job.customQuestions === "string" ? JSON.parse(job.customQuestions) : job.customQuestions) 
    : [];
  const [customQuestions, setCustomQuestions] = useState<{question: string, required: boolean, type: string}[]>(initialCustomQuestions as any);
  
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
          
          <div className="sm:col-span-2 pt-6 border-t border-surface-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-surface-900">Custom Questions</h3>
                <p className="text-sm text-surface-500">Add dynamic fields to the application form.</p>
              </div>
              <button
                type="button"
                onClick={() => setCustomQuestions([...customQuestions, { question: "", required: false, type: "text" }])}
                className="px-3 py-1.5 text-sm bg-surface-100 hover:bg-surface-200 rounded-lg text-surface-700 font-medium transition-colors"
              >
                + Add Question
              </button>
            </div>

            <input type="hidden" name="customQuestions" value={JSON.stringify(customQuestions)} />

            <div className="space-y-4">
              {customQuestions.map((q, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-xl border border-surface-200 bg-surface-50/50">
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-surface-700 mb-1">Question Text</label>
                      <input
                        type="text"
                        value={q.question}
                        onChange={(e) => {
                          const newQ = [...customQuestions];
                          newQ[idx].question = e.target.value;
                          setCustomQuestions(newQ);
                        }}
                        placeholder="e.g. Why do you want to work here?"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-surface-200 focus:border-primary-400 outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-6">
                      <div>
                        <label className="block text-xs font-medium text-surface-700 mb-1">Response Type</label>
                        <select
                          value={q.type}
                          onChange={(e) => {
                            const newQ = [...customQuestions];
                            newQ[idx].type = e.target.value;
                            setCustomQuestions(newQ);
                          }}
                          className="px-3 py-1.5 text-sm rounded-lg border border-surface-200 focus:border-primary-400 outline-none bg-white"
                        >
                          <option value="text">Short Text</option>
                          <option value="textarea">Long Text (Paragraph)</option>
                        </select>
                      </div>
                      <label className="flex items-center gap-2 mt-4 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={q.required}
                          onChange={(e) => {
                            const newQ = [...customQuestions];
                            newQ[idx].required = e.target.checked;
                            setCustomQuestions(newQ);
                          }}
                          className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm font-medium text-surface-700">Required</span>
                      </label>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCustomQuestions(customQuestions.filter((_, i) => i !== idx))}
                    className="p-2 text-surface-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
              {customQuestions.length === 0 && (
                <p className="text-sm text-surface-400 text-center py-4 border-2 border-dashed border-surface-200 rounded-xl">No custom questions added yet.</p>
              )}
            </div>
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
