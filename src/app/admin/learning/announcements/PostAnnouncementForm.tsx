"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Megaphone, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  courses: { id: string; title: string }[];
}

export default function PostAnnouncementForm({ courses }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    courseId: courses[0]?.id || "",
    title: "",
    content: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/learn/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to post");
      }

      toast.success("Announcement posted!");
      setForm((prev) => ({ ...prev, title: "", content: "" }));
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to post");
    } finally {
      setLoading(false);
    }
  };

  if (courses.length === 0) {
    return (
      <div className="bg-warning-50 dark:bg-warning-900/20 rounded-xl p-4 border border-warning-200 dark:border-warning-800 text-sm text-warning-700 dark:text-warning-400">
        Create a course first before posting announcements.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 space-y-4">
      <h2 className="text-lg font-bold text-surface-900 dark:text-white flex items-center gap-2">
        <Megaphone className="w-5 h-5 text-primary-500" />
        Post New Announcement
      </h2>

      <select
        value={form.courseId}
        onChange={(e) => setForm((p) => ({ ...p, courseId: e.target.value }))}
        required
        className="w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white focus:border-primary-500 outline-none text-sm"
      >
        {courses.map((course) => (
          <option key={course.id} value={course.id}>{course.title}</option>
        ))}
      </select>

      <input
        type="text"
        value={form.title}
        onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
        required
        placeholder="Announcement title"
        className="w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder:text-surface-400 focus:border-primary-500 outline-none text-sm"
      />

      <textarea
        value={form.content}
        onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
        required
        placeholder="Write your announcement..."
        rows={3}
        className="w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder:text-surface-400 focus:border-primary-500 outline-none text-sm resize-none"
      />

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-medium text-sm transition-all disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Megaphone className="w-4 h-4" />}
        {loading ? "Posting..." : "Post Announcement"}
      </button>
    </form>
  );
}
