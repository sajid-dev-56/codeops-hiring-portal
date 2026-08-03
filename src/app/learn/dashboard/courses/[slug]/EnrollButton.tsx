"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface EnrollButtonProps {
  courseId: string;
  courseTitle: string;
}

export default function EnrollButton({ courseId, courseTitle }: EnrollButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleEnroll = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/learn/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to enroll");
      }

      toast.success(`Enrolled in "${courseTitle}"!`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to enroll");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleEnroll}
      disabled={loading}
      className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white font-semibold text-lg transition-all disabled:opacity-50 shadow-lg shadow-primary-500/20 hover:-translate-y-0.5"
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Enrolling...
        </>
      ) : (
        <>
          <BookOpen className="w-5 h-5" />
          Enroll in This Course
        </>
      )}
    </button>
  );
}
