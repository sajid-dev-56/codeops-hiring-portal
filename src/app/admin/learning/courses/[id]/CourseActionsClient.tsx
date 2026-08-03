"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Eye, EyeOff, Image as ImageIcon, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  courseId: string;
  isPublished: boolean;
  thumbnail: string | null;
}

export default function CourseActionsClient({ courseId, isPublished, thumbnail }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const togglePublish = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/learn/courses/${courseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !isPublished }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast.success(isPublished ? "Course unpublished" : "Course published");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error updating course");
    } finally {
      setLoading(false);
    }
  };

  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setLoading(true);
      try {
        const res = await fetch(`/api/learn/courses/${courseId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ thumbnail: base64 }),
        });
        if (!res.ok) throw new Error("Failed to update thumbnail");
        toast.success("Thumbnail updated successfully");
        router.refresh();
      } catch (error) {
        toast.error("Error updating thumbnail");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const deleteCourse = async () => {
    if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) return;
    
    setDeleting(true);
    try {
      const res = await fetch(`/api/learn/courses/${courseId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete course");
      toast.success("Course deleted");
      router.push("/admin/learning/courses");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error deleting course");
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleThumbnailChange} 
      />
      
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={loading || deleting}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors disabled:opacity-50"
      >
        <ImageIcon className="w-4 h-4" />
        Change Thumbnail
      </button>

      <button
        onClick={togglePublish}
        disabled={loading || deleting}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 ${
          isPublished 
            ? "bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700" 
            : "bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-900/70"
        }`}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />)}
        {isPublished ? "Unpublish" : "Publish"}
      </button>

      <button
        onClick={deleteCourse}
        disabled={loading || deleting}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-danger-50 dark:bg-danger-500/10 text-danger-600 dark:text-danger-400 hover:bg-danger-100 dark:hover:bg-danger-500/20 transition-colors disabled:opacity-50"
      >
        {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        Delete
      </button>
    </div>
  );
}
