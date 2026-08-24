"use client";

import { useState, useEffect } from "react";
import { Lock, AlertOctagon, Send, CheckCircle2, Clock, Sparkles, LogOut, MessageSquare } from "lucide-react";
import { signOut } from "next-auth/react";
import toast from "react-hot-toast";

interface DroppedCourseInfo {
  id: string;
  course: {
    id: string;
    title: string;
    slug: string;
    thumbnail?: string | null;
  };
  droppedAt?: string | null;
  dropReason?: string | null;
  reactivationRequests?: Array<{
    id: string;
    reason: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    createdAt: string;
    adminNote?: string | null;
  }>;
}

const QUICK_REASONS = [
  { label: "🎓 University / College Exams", text: "I had university/college examinations and was unable to access the portal during that period. I am now free to resume my coursework actively." },
  { label: "🏥 Health / Medical Issue", text: "I experienced medical/health problems that prevented me from studying. I have recovered and am ready to catch up on all pending tasks." },
  { label: "🌐 Technical / Internet Issues", text: "I was facing severe internet connectivity/laptop hardware issues which have now been resolved." },
  { label: "💼 Heavy Work / Schedule", text: "I had unforeseen urgent professional/family commitments. My schedule is cleared now and I will submit pending assignments promptly." },
];

export default function DroppedAccessOverlay() {
  const [loading, setLoading] = useState(true);
  const [isDropped, setIsDropped] = useState(false);
  const [droppedEnrollments, setDroppedEnrollments] = useState<DroppedCourseInfo[]>([]);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string>("");
  const [reasonText, setReasonText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditingExisting, setIsEditingExisting] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/learn/reactivation-request");
      if (res.ok) {
        const data = await res.json();
        setIsDropped(data.isDropped);
        setDroppedEnrollments(data.droppedEnrollments || []);
        if (data.droppedEnrollments && data.droppedEnrollments.length > 0) {
          setSelectedEnrollmentId(data.droppedEnrollments[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to check dropped access status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  if (loading || !isDropped || droppedEnrollments.length === 0) {
    return null;
  }

  const currentEnrollment =
    droppedEnrollments.find((e) => e.id === selectedEnrollmentId) || droppedEnrollments[0];
  const latestRequest = currentEnrollment?.reactivationRequests?.[0] || null;
  const isPending = latestRequest?.status === "PENDING";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reasonText.trim() || reasonText.trim().length < 10) {
      toast.error("Please enter a detailed explanation (at least 10 characters).");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/learn/reactivation-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollmentId: currentEnrollment.id,
          reason: reasonText.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Reactivation request submitted successfully!");
        setIsEditingExisting(false);
        setReasonText("");
        await fetchStatus();
      } else {
        toast.error(data.error || "Failed to submit request.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 bg-surface-950/85 backdrop-blur-2xl overflow-y-auto animate-fade-in">
      <div className="max-w-xl w-full my-auto bg-white dark:bg-surface-900 border border-red-500/30 dark:border-red-500/20 shadow-2xl shadow-red-500/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden transition-all duration-300">
        {/* Glow background accent */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Lock Shield Icon */}
        <div className="relative flex justify-center mb-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white shadow-xl shadow-red-500/30 ring-8 ring-red-500/10 animate-bounce">
            <Lock className="w-8 h-8" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <AlertOctagon className="w-3.5 h-3.5" /> Course Access Paused
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-surface-900 dark:text-white tracking-tight">
            Account Locked Due to Inactivity
          </h2>
          <p className="text-surface-500 dark:text-surface-400 text-sm mt-2 leading-relaxed">
            Your course access has been suspended because you have had no task submissions, quiz attempts, or course progress for over 7 days.
          </p>
        </div>

        {/* Course Info Card */}
        <div className="bg-surface-50 dark:bg-surface-800/60 rounded-2xl p-4 border border-surface-200 dark:border-surface-700/60 mb-6">
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
              Enrolled Course
            </span>
            {currentEnrollment.droppedAt && (
              <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                Dropped: {new Date(currentEnrollment.droppedAt).toLocaleDateString()}
              </span>
            )}
          </div>
          <h3 className="font-bold text-base text-surface-900 dark:text-white">
            {currentEnrollment.course.title}
          </h3>
          {currentEnrollment.dropReason && (
            <p className="text-xs text-surface-500 dark:text-surface-400 mt-1 italic">
              &quot;{currentEnrollment.dropReason}&quot;
            </p>
          )}
        </div>

        {/* Request Status OR Form */}
        {isPending && !isEditingExisting ? (
          <div className="space-y-4 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-surface-900 dark:text-white">
                  Reactivation Request Under Review
                </h4>
                <p className="text-xs text-surface-500 dark:text-surface-400">
                  Submitted on {new Date(latestRequest.createdAt).toLocaleDateString()} at {new Date(latestRequest.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-surface-900/80 rounded-xl p-3.5 border border-amber-500/20 text-xs text-surface-700 dark:text-surface-300 leading-relaxed">
              <p className="font-medium text-surface-900 dark:text-white mb-1">Your Submitted Reason:</p>
              &quot;{latestRequest.reason}&quot;
            </div>

            <div className="flex items-center justify-between text-xs text-surface-500 dark:text-surface-400 pt-1">
              <span>The instructor is reviewing your case.</span>
              <button
                onClick={() => {
                  setReasonText(latestRequest.reason);
                  setIsEditingExisting(true);
                }}
                className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
              >
                Update Reason
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-surface-700 dark:text-surface-300 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-primary-500" />
                  Explain Your Reason for Reactivation
                </label>
                <span className="text-xs text-surface-400">Valid reason required</span>
              </div>

              {/* Quick Reasons Chips */}
              <div className="flex flex-wrap gap-1.5 pb-1">
                {QUICK_REASONS.map((qr, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setReasonText(qr.text)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-surface-100 hover:bg-surface-200 dark:bg-surface-800 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-300 transition-colors font-medium border border-surface-200/50 dark:border-surface-700/50"
                  >
                    {qr.label}
                  </button>
                ))}
              </div>

              <textarea
                value={reasonText}
                onChange={(e) => setReasonText(e.target.value)}
                placeholder="Write your explanation here (e.g., medical emergency, university exams, job constraints, or technical hurdles) and how you plan to catch up..."
                rows={4}
                required
                className="w-full px-4 py-3 rounded-2xl bg-surface-50 dark:bg-surface-800/80 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm transition-all resize-none"
              />
            </div>

            <div className="flex gap-2">
              {isEditingExisting && (
                <button
                  type="button"
                  onClick={() => setIsEditingExisting(false)}
                  className="px-4 py-3 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 text-sm font-medium hover:bg-surface-200 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting || !reasonText.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold text-sm shadow-lg shadow-red-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>Submitting Request...</>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Reactivation Request
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Footer actions */}
        <div className="pt-4 border-t border-surface-100 dark:border-surface-800 flex items-center justify-between text-xs text-surface-500 dark:text-surface-400">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary-500" />
            <span>CodeOps Pro Academic Integrity</span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-1 text-surface-600 dark:text-surface-400 hover:text-red-500 dark:hover:text-red-400 transition-colors font-medium"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
