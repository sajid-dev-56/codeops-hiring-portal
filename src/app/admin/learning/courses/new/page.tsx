"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function NewCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    category: "",
    difficulty: "BEGINNER" as "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
    thumbnail: "",
    isPublished: false,
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({ ...prev, title, slug: generateSlug(title) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/learn/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create course");
      }

      const course = await res.json();
      toast.success("Course created successfully!");
      router.push(`/admin/learning/courses/${course.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Create New Course</h1>
        <p className="text-surface-600 dark:text-surface-400 mt-1">Fill in the details to create a new course</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 space-y-5">
        {/* Title */}
        <div>
          <label htmlFor="course-title" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
            Course Title <span className="text-danger-500">*</span>
          </label>
          <input
            id="course-title"
            type="text"
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder:text-surface-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
            placeholder="e.g., Full Stack Web Development"
          />
        </div>

        {/* Slug */}
        <div>
          <label htmlFor="course-slug" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
            Slug <span className="text-danger-500">*</span>
          </label>
          <input
            id="course-slug"
            type="text"
            value={form.slug}
            onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
            required
            className="w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder:text-surface-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
            placeholder="full-stack-web-development"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="course-desc" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
            Description <span className="text-danger-500">*</span>
          </label>
          <textarea
            id="course-desc"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            required
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder:text-surface-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none resize-none"
            placeholder="Describe what students will learn..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Category */}
          <div>
            <label htmlFor="course-cat" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Category <span className="text-danger-500">*</span>
            </label>
            <input
              id="course-cat"
              type="text"
              value={form.category}
              onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
              required
              className="w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder:text-surface-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
              placeholder="e.g., Web Development"
            />
          </div>

          {/* Difficulty */}
          <div>
            <label htmlFor="course-diff" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Difficulty
            </label>
            <select
              id="course-diff"
              value={form.difficulty}
              onChange={(e) => setForm((prev) => ({ ...prev, difficulty: e.target.value as typeof form.difficulty }))}
              className="w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
            >
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>
        </div>

        {/* Thumbnail Image */}
        <div>
          <label htmlFor="course-thumb" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
            Course Thumbnail Image (optional)
          </label>
          <div className="flex items-center gap-4">
            {form.thumbnail && form.thumbnail.startsWith("data:image") && (
              <img src={form.thumbnail} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-surface-200 dark:border-surface-700 shadow-sm" />
            )}
            <input
              id="course-thumb"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (file.size > 2 * 1024 * 1024) {
                    toast.error("Image must be less than 2MB");
                    return;
                  }
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setForm((prev) => ({ ...prev, thumbnail: reader.result as string }));
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="w-full px-4 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary-50 dark:file:bg-primary-900/30 file:text-primary-700 dark:file:text-primary-400 hover:file:bg-primary-100 transition-all outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Published Toggle */}
        <div className="flex items-center gap-3">
          <input
            id="course-pub"
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => setForm((prev) => ({ ...prev, isPublished: e.target.checked }))}
            className="w-5 h-5 rounded bg-surface-50 dark:bg-surface-800 border-surface-300 dark:border-surface-600 text-primary-600 focus:ring-primary-500"
          />
          <label htmlFor="course-pub" className="text-sm font-medium text-surface-700 dark:text-surface-300">
            Publish immediately (visible to students)
          </label>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white font-semibold transition-all disabled:opacity-50 shadow-lg shadow-primary-500/20"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {loading ? "Creating..." : "Create Course"}
          </button>
        </div>
      </form>
    </div>
  );
}
