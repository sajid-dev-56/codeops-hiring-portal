"use client";

import { useState } from "react";
import { format } from "date-fns";

import Link from "next/link";

type Student = {
  id: string;
  name: string | null;
  email: string;
  accountStatus: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
};

export default function StudentApprovalClient({ initialStudents }: { initialStudents: Student[] }) {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpdateStatus = async (userId: string, status: "APPROVED" | "REJECTED") => {
    setLoading(userId);
    try {
      const res = await fetch("/api/admin/users/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status }),
      });

      if (res.ok) {
        setStudents((prev) =>
          prev.map((s) => (s.id === userId ? { ...s, accountStatus: status } : s))
        );
      } else {
        alert("Failed to update status");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-50 dark:bg-surface-800/50 text-surface-500 dark:text-surface-400 text-xs uppercase tracking-wider">
              <th className="p-4 font-medium">Student Name</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Joined</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-surface-50/50 dark:hover:bg-surface-800/30 transition-colors">
                <td className="p-4">
                  <Link href={`/admin/learning/students/${student.id}`} className="font-medium text-primary-600 dark:text-primary-400 hover:underline">
                    {student.name || "Unknown"}
                  </Link>
                </td>
                <td className="p-4 text-surface-500 dark:text-surface-400">
                  {student.email}
                </td>
                <td className="p-4 text-surface-500 dark:text-surface-400">
                  {format(new Date(student.createdAt), "MMM d, yyyy")}
                </td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      student.accountStatus === "APPROVED"
                        ? "bg-success-500/10 text-success-600 dark:text-success-400"
                        : student.accountStatus === "REJECTED"
                        ? "bg-danger-500/10 text-danger-600 dark:text-danger-400"
                        : "bg-warning-500/10 text-warning-600 dark:text-warning-400"
                    }`}
                  >
                    {student.accountStatus}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {student.accountStatus === "PENDING" && (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleUpdateStatus(student.id, "APPROVED")}
                        disabled={loading === student.id}
                        className="px-3 py-1.5 bg-success-500 hover:bg-success-600 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(student.id, "REJECTED")}
                        disabled={loading === student.id}
                        className="px-3 py-1.5 bg-danger-500 hover:bg-danger-600 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-surface-500 dark:text-surface-400">
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
