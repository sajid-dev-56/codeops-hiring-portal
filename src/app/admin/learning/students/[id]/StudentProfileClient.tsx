"use client";

import { useState } from "react";
import {
  ArrowLeft,
  User,
  Calendar,
  Trash2,
  Edit,
  RotateCcw,
  UserX,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import GradeModal from "./GradeModal";
import TaskExtensionModal from "./TaskExtensionModal";
import toast from "react-hot-toast";

export default function StudentProfileClient({
  student,
  submissions,
  enrollments,
}: {
  student: any;
  submissions: any[];
  enrollments: any[];
}) {
  const router = useRouter();
  const [localSubmissions, setLocalSubmissions] = useState(submissions);
  const [localEnrollments, setLocalEnrollments] = useState(enrollments);
  const [editingSubmission, setEditingSubmission] = useState<any | null>(null);
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Drop modal state
  const [isDropModalOpen, setIsDropModalOpen] = useState(false);
  const [dropReason, setDropReason] = useState("Inactive for 7+ days (no task submissions, quiz attempts, or course progress)");

  const isDropped = localEnrollments.some((e: any) => e.status === "DROPPED");
  const hasPendingAppeal = localEnrollments.some((e: any) =>
    e.reactivationRequests?.some((r: any) => r.status === "PENDING")
  );

  const handleDeleteStudent = async () => {
    if (!window.confirm("Are you sure you want to delete this student and all their data? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/students/${student.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Student deleted successfully.");
        router.push("/admin/learning/students");
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error deleting student.");
      setIsDeleting(false);
    }
  };

  const handleDropStudent = async () => {
    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/admin/students/${student.id}/drop`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: dropReason.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Student dropped from course access.");
        setLocalEnrollments((prev) =>
          prev.map((e) => ({
            ...e,
            status: "DROPPED",
            droppedAt: new Date().toISOString(),
            dropReason,
          }))
        );
        setIsDropModalOpen(false);
      } else {
        toast.error(data.error || "Failed to drop student.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error dropping student.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReactivateStudent = async () => {
    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/admin/students/${student.id}/reactivate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNote: "Directly restored from profile" }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Student access reactivated successfully!");
        setLocalEnrollments((prev) =>
          prev.map((e) => ({
            ...e,
            status: "ACTIVE",
            droppedAt: null,
            dropReason: null,
            reactivatedAt: new Date().toISOString(),
          }))
        );
      } else {
        toast.error(data.error || "Failed to reactivate student.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error reactivating student.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleGradeUpdate = (updatedSub: any) => {
    setLocalSubmissions((prev) =>
      prev.map((sub) => (sub.id === updatedSub.id ? { ...sub, ...updatedSub } : sub))
    );
    setEditingSubmission(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/learning/students"
            className="p-2 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Student Profile</h1>
            <p className="text-surface-500 dark:text-surface-400 mt-1">Manage submissions, grades & course access</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {isDropped ? (
            <button
              onClick={handleReactivateStudent}
              disabled={isActionLoading}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all text-sm font-semibold shadow-md shadow-emerald-600/20 disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" />
              {isActionLoading ? "Restoring..." : "Reactivate Access"}
            </button>
          ) : (
            <button
              onClick={() => setIsDropModalOpen(true)}
              disabled={isActionLoading}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl transition-colors text-sm font-semibold disabled:opacity-50"
            >
              <UserX className="w-4 h-4" />
              Drop from Course
            </button>
          )}

          <button
            onClick={() => setIsExtensionModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-xl hover:bg-primary-100 dark:hover:bg-primary-500/20 transition-colors text-sm font-medium"
          >
            <Calendar className="w-4 h-4" />
            Extend Deadline
          </button>
          <button
            onClick={handleDeleteStudent}
            disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors text-sm font-medium disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      {/* Profile Summary */}
      <div className="bg-white dark:bg-surface-900 rounded-3xl p-6 border border-surface-200 dark:border-surface-800 shadow-sm space-y-6">
        <div className="flex flex-wrap gap-6 items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-500 text-white flex flex-shrink-0 items-center justify-center shadow-lg shadow-primary-500/20">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-1">{student.name || "Unnamed Student"}</h2>
            <p className="text-surface-500 dark:text-surface-400 text-sm">{student.email}</p>
          </div>
          <div className="ml-auto flex flex-wrap gap-6 items-center">
            <div>
              <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-1">Account</p>
              <span
                className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                  student.accountStatus === "APPROVED"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                }`}
              >
                {student.accountStatus}
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-1">Enrollment</p>
              <span
                className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                  isDropped
                    ? "bg-red-500/10 text-red-600 dark:text-red-400"
                    : "bg-primary-500/10 text-primary-600 dark:text-primary-400"
                }`}
              >
                {isDropped ? "DROPPED (Locked)" : "ACTIVE"}
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-1">Joined</p>
              <p className="text-surface-900 dark:text-white font-medium text-sm">
                {new Date(student.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-1">Streak</p>
              <p className="text-surface-900 dark:text-white font-bold text-sm">{student.currentStreak} 🔥</p>
            </div>
          </div>
        </div>

        {/* Activity & Inactivity Diagnostic Bar */}
        <div className="bg-surface-50 dark:bg-surface-800/60 rounded-2xl p-5 border border-surface-200/80 dark:border-surface-700/80">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h3 className="text-xs font-bold text-surface-700 dark:text-surface-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-primary-500" />
              Activity & Engagement Diagnostics
            </h3>
            <span
              className={`px-3 py-0.5 rounded-full text-xs font-bold ${
                student.inactiveDays >= 7
                  ? "bg-red-500/10 text-red-600 dark:text-red-400"
                  : student.inactiveDays >= 5
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {student.inactiveDays} Days Inactive
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="bg-white dark:bg-surface-900 p-3 rounded-xl border border-surface-200 dark:border-surface-800">
              <span className="text-surface-400">Last Login:</span>
              <p className="font-semibold text-surface-900 dark:text-white mt-0.5">
                {student.lastActivityDate ? new Date(student.lastActivityDate).toLocaleDateString() : "Never"}
              </p>
            </div>

            <div className="bg-white dark:bg-surface-900 p-3 rounded-xl border border-surface-200 dark:border-surface-800">
              <span className="text-surface-400">Last Task Submission:</span>
              <p className="font-semibold text-surface-900 dark:text-white mt-0.5">
                {submissions[0] ? new Date(submissions[0].submittedAt).toLocaleDateString() : "None"}
              </p>
            </div>

            <div className="bg-white dark:bg-surface-900 p-3 rounded-xl border border-surface-200 dark:border-surface-800">
              <span className="text-surface-400">Last Lesson Completed:</span>
              <p className="font-semibold text-surface-900 dark:text-white mt-0.5">
                {student.lastLesson ? new Date(student.lastLesson.completedAt).toLocaleDateString() : "None"}
              </p>
            </div>

            <div className="bg-white dark:bg-surface-900 p-3 rounded-xl border border-surface-200 dark:border-surface-800">
              <span className="text-surface-400">Last Quiz Attempt:</span>
              <p className="font-semibold text-surface-900 dark:text-white mt-0.5">
                {student.lastQuiz ? `${new Date(student.lastQuiz.date).toLocaleDateString()} (${student.lastQuiz.score}%)` : "None"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reactivation Appeals Section if Any */}
      {localEnrollments.some((e: any) => e.reactivationRequests && e.reactivationRequests.length > 0) && (
        <div className="bg-white dark:bg-surface-900 rounded-3xl p-6 border border-surface-200 dark:border-surface-800 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-surface-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-violet-500" />
            Reactivation Appeals & History
          </h2>
          <div className="space-y-3">
            {localEnrollments.flatMap((e: any) =>
              (e.reactivationRequests || []).map((req: any) => (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-primary-600 dark:text-primary-400">
                      Course: {e.course?.title}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        req.status === "PENDING"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : req.status === "APPROVED"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-red-500/10 text-red-600 dark:text-red-400"
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                  <p className="text-xs text-surface-700 dark:text-surface-300 italic">&quot;{req.reason}&quot;</p>
                  <p className="text-[11px] text-surface-400">Submitted: {new Date(req.createdAt).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Task Submissions List */}
      <div className="bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-surface-200 dark:border-surface-800">
          <h2 className="text-lg font-bold text-surface-900 dark:text-white">Task Submissions</h2>
        </div>

        {localSubmissions.length === 0 ? (
          <div className="p-12 text-center text-surface-500 dark:text-surface-400">
            This student has not submitted any tasks yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-50 dark:bg-surface-950/50 border-b border-surface-200 dark:border-surface-800 text-xs uppercase font-semibold text-surface-500 dark:text-surface-400">
                  <th className="p-4">Task</th>
                  <th className="p-4">Course</th>
                  <th className="p-4">Submitted At</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Marks</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
                {localSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors group">
                    <td className="p-4 font-semibold text-surface-900 dark:text-white">
                      {sub.task?.title}
                    </td>
                    <td className="p-4 text-xs text-surface-600 dark:text-surface-300">
                      {sub.task?.course?.title}
                    </td>
                    <td className="p-4 text-xs text-surface-600 dark:text-surface-300">
                      {new Date(sub.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          sub.status === "GRADED" || sub.status === "AI_GRADED"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : sub.status === "PENDING"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : "bg-red-500/10 text-red-600 dark:text-red-400"
                        }`}
                      >
                        {sub.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-bold text-surface-900 dark:text-white">
                      {sub.marks !== null ? `${sub.marks} / ${sub.task?.maxMarks}` : "-"}
                      {sub.aiMarks !== null && sub.marks === null && (
                        <span className="text-xs text-surface-400 ml-1 font-normal">(AI: {sub.aiMarks})</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setEditingSubmission(sub)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors text-xs font-semibold"
                      >
                        <Edit className="w-3.5 h-3.5" /> Review & Grade
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <GradeModal
        isOpen={!!editingSubmission}
        submission={editingSubmission}
        onClose={() => setEditingSubmission(null)}
        onSuccess={handleGradeUpdate}
      />

      <TaskExtensionModal
        isOpen={isExtensionModalOpen}
        onClose={() => setIsExtensionModalOpen(false)}
        studentId={student.id}
        enrollments={enrollments}
      />

      {/* Drop Modal */}
      {isDropModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="max-w-md w-full bg-white dark:bg-surface-900 rounded-3xl p-6 border border-surface-200 dark:border-surface-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-surface-900 dark:text-white">Drop Student</h3>
                <p className="text-xs text-surface-500">{student.name || student.email}</p>
              </div>
            </div>

            <p className="text-xs text-surface-600 dark:text-surface-400">
              This will pause the student&apos;s course access and lock their dashboard. They will be notified by email.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-surface-700 dark:text-surface-300">Drop Reason:</label>
              <textarea
                value={dropReason}
                onChange={(e) => setDropReason(e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-xs text-surface-900 dark:text-white focus:ring-2 focus:ring-red-500 resize-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDropModalOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 text-xs font-semibold hover:bg-surface-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDropStudent}
                disabled={isActionLoading}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-lg shadow-red-600/20 disabled:opacity-50"
              >
                {isActionLoading ? "Dropping..." : "Confirm Drop"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
