"use client";

import { useState } from "react";
import { ArrowLeft, User, Calendar, Trash2, Edit } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import GradeModal from "./GradeModal";
import TaskExtensionModal from "./TaskExtensionModal";

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
  const [editingSubmission, setEditingSubmission] = useState<any | null>(null);
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
        alert("Student deleted successfully.");
        router.push("/admin/learning/students");
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      console.error(error);
      alert("Error deleting student.");
      setIsDeleting(false);
    }
  };

  const handleGradeUpdate = (updatedSub: any) => {
    setLocalSubmissions(prev => prev.map(sub => sub.id === updatedSub.id ? { ...sub, ...updatedSub } : sub));
    setEditingSubmission(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/learning/students"
            className="p-2 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Student Profile</h1>
            <p className="text-surface-500 dark:text-surface-400 mt-1">Manage submissions and grades</p>
          </div>
        </div>
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
            className="flex items-center gap-2 px-4 py-2 bg-error-50 dark:bg-error-500/10 text-error-600 dark:text-error-400 rounded-xl hover:bg-error-100 dark:hover:bg-error-500/20 transition-colors text-sm font-medium disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? "Deleting..." : "Delete Student"}
          </button>
        </div>
      </div>

      {/* Profile Summary */}
      <div className="bg-white dark:bg-surface-900 rounded-2xl p-6 border border-surface-200 dark:border-surface-800 flex flex-wrap gap-8 items-center shadow-sm">
        <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex flex-shrink-0 items-center justify-center">
          <User className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-1">{student.name || "Unnamed Student"}</h2>
          <p className="text-surface-500 dark:text-surface-400">{student.email}</p>
        </div>
        <div className="ml-auto flex gap-6">
          <div>
            <p className="text-sm font-medium text-surface-500 dark:text-surface-400 mb-1">Status</p>
            <span className={`inline-flex px-2.5 py-1 rounded-md text-sm font-medium ${
              student.accountStatus === "APPROVED" 
                ? "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400"
                : "bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-400"
            }`}>
              {student.accountStatus}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-surface-500 dark:text-surface-400 mb-1">Joined</p>
            <p className="text-surface-900 dark:text-white font-medium flex items-center gap-1">
              <Calendar className="w-4 h-4 text-surface-400" />
              {new Date(student.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-surface-500 dark:text-surface-400 mb-1">Current Streak</p>
            <p className="text-surface-900 dark:text-white font-medium text-center">{student.currentStreak} 🔥</p>
          </div>
        </div>
      </div>

      {/* Task Submissions List */}
      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-surface-200 dark:border-surface-800">
          <h2 className="text-lg font-bold text-surface-900 dark:text-white">Task Submissions</h2>
        </div>
        
        {localSubmissions.length === 0 ? (
          <div className="p-8 text-center text-surface-500 dark:text-surface-400">
            This student has not submitted any tasks yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-50 dark:bg-surface-950/50 border-b border-surface-200 dark:border-surface-800 text-sm font-medium text-surface-500 dark:text-surface-400">
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
                    <td className="p-4 font-medium text-surface-900 dark:text-white">
                      {sub.task?.title}
                    </td>
                    <td className="p-4 text-sm text-surface-600 dark:text-surface-300">
                      {sub.task?.course?.title}
                    </td>
                    <td className="p-4 text-sm text-surface-600 dark:text-surface-300">
                      {new Date(sub.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                        sub.status === "GRADED" || sub.status === "AI_GRADED"
                          ? "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400"
                          : sub.status === "PENDING"
                          ? "bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-400"
                          : "bg-error-50 text-error-700 dark:bg-error-500/10 dark:text-error-400"
                      }`}>
                        {sub.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-medium text-surface-900 dark:text-white">
                      {sub.marks !== null ? `${sub.marks} / ${sub.task?.maxMarks}` : "-"}
                      {sub.aiMarks !== null && sub.marks === null && (
                        <span className="text-xs text-surface-400 ml-1">(AI: {sub.aiMarks})</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setEditingSubmission(sub)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors text-sm font-medium"
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
    </div>
  );
}
