"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export default function EnrollButton({ courseId, isEnrolled }: { courseId: string; isEnrolled: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (isEnrolled) {
    return (
      <button
        onClick={() => router.push(`/learn/dashboard`)}
        className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-surface-200 dark:bg-surface-800 text-surface-900 dark:text-white font-semibold transition-all hover:bg-surface-300 dark:hover:bg-surface-700"
      >
        Go to Dashboard
        <ArrowRight className="w-4 h-4" />
      </button>
    );
  }

  const handleEnroll = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/learn/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      if (res.ok) {
        router.push("/learn/dashboard");
        router.refresh();
      } else {
        alert("Failed to enroll");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleEnroll}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white font-semibold transition-all shadow-lg shadow-primary-500/20 hover:-translate-y-0.5 disabled:opacity-50"
    >
      {loading ? "Enrolling..." : "Enroll Now"}
      <ArrowRight className="w-4 h-4" />
    </button>
  );
}
