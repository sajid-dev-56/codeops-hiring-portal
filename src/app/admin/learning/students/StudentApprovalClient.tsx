"use client";

import { useState } from "react";
import { format } from "date-fns";
import Link from "next/link";
import {
  Users,
  UserCheck,
  UserX,
  AlertTriangle,
  Clock,
  Search,
  Scan,
  RotateCcw,
  CheckCircle2,
  XCircle,
  MessageSquare,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

type StudentEnrollment = {
  id: string;
  courseId: string;
  courseTitle: string;
  status: "ACTIVE" | "DROPPED" | "COMPLETED";
  enrolledAt: string;
  droppedAt: string | null;
  dropReason: string | null;
  reactivatedAt: string | null;
};

type ReactivationRequestItem = {
  id: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  courseTitle: string;
  enrollmentId: string;
  adminNote?: string | null;
};

type Student = {
  id: string;
  name: string | null;
  email: string;
  accountStatus: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  currentStreak: number;
  lastActivityDate: string | null;
  latestActivityDate: string;
  inactiveDays: number;
  hasDroppedEnrollment: boolean;
  hasActiveEnrollment: boolean;
  enrollments: StudentEnrollment[];
  pendingRequestsCount: number;
  reactivationRequests: ReactivationRequestItem[];
};

type GlobalReactivationRequest = {
  id: string;
  userId: string;
  studentName: string;
  studentEmail: string;
  enrollmentId: string;
  courseTitle: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  adminNote?: string | null;
  createdAt: string;
};

export default function StudentApprovalClient({
  initialStudents,
  initialRequests,
}: {
  initialStudents: Student[];
  initialRequests: GlobalReactivationRequest[];
}) {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [requests, setRequests] = useState<GlobalReactivationRequest[]>(initialRequests);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"ALL" | "ACTIVE" | "WARNING" | "DROPPED" | "REQUESTS">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [dropModalStudent, setDropModalStudent] = useState<Student | null>(null);
  const [dropReason, setDropReason] = useState("Inactive for 7+ days (no task submissions, quiz attempts, or course progress)");
  const [isScanning, setIsScanning] = useState(false);
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [scanResults, setScanResults] = useState<any | null>(null);

  // Filter calculations
  const totalStudents = students.length;
  const activeCount = students.filter((s) => s.hasActiveEnrollment && !s.hasDroppedEnrollment).length;
  const warningCount = students.filter((s) => s.hasActiveEnrollment && s.inactiveDays >= 5 && s.inactiveDays < 7).length;
  const droppedCount = students.filter((s) => s.hasDroppedEnrollment || (s.hasActiveEnrollment && s.inactiveDays >= 7)).length;
  const pendingRequestsCount = requests.filter((r) => r.status === "PENDING").length;

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      (student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTab === "ACTIVE") {
      return student.hasActiveEnrollment && !student.hasDroppedEnrollment && student.inactiveDays < 5;
    }
    if (activeTab === "WARNING") {
      return student.hasActiveEnrollment && student.inactiveDays >= 5 && student.inactiveDays < 7;
    }
    if (activeTab === "DROPPED") {
      return student.hasDroppedEnrollment || (student.hasActiveEnrollment && student.inactiveDays >= 7);
    }
    return true;
  });

  // Account Approval Handler
  const handleUpdateAccountStatus = async (userId: string, status: "APPROVED" | "REJECTED") => {
    setLoadingAction(userId);
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
        toast.success(`Student account ${status.toLowerCase()}!`);
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    } finally {
      setLoadingAction(null);
    }
  };

  // Drop Student Handler
  const handleDropStudent = async () => {
    if (!dropModalStudent) return;
    setLoadingAction(dropModalStudent.id);
    try {
      const res = await fetch(`/api/admin/students/${dropModalStudent.id}/drop`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: dropReason.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Student dropped from course access.");
        setStudents((prev) =>
          prev.map((s) =>
            s.id === dropModalStudent.id
              ? {
                  ...s,
                  hasDroppedEnrollment: true,
                  hasActiveEnrollment: false,
                  enrollments: s.enrollments.map((e) => ({
                    ...e,
                    status: "DROPPED",
                    droppedAt: new Date().toISOString(),
                    dropReason,
                  })),
                }
              : s
          )
        );
        setDropModalStudent(null);
      } else {
        toast.error(data.error || "Failed to drop student.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to drop student.");
    } finally {
      setLoadingAction(null);
    }
  };

  // Reactivate Student Handler
  const handleReactivateStudent = async (studentId: string) => {
    setLoadingAction(studentId);
    try {
      const res = await fetch(`/api/admin/students/${studentId}/reactivate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNote: "Directly reactivated by Admin" }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Student course access successfully restored!");
        setStudents((prev) =>
          prev.map((s) =>
            s.id === studentId
              ? {
                  ...s,
                  hasDroppedEnrollment: false,
                  hasActiveEnrollment: true,
                  inactiveDays: 0,
                  enrollments: s.enrollments.map((e) => ({
                    ...e,
                    status: "ACTIVE",
                    droppedAt: null,
                    dropReason: null,
                    reactivatedAt: new Date().toISOString(),
                  })),
                  pendingRequestsCount: 0,
                }
              : s
          )
        );
        setRequests((prev) =>
          prev.map((r) =>
            r.userId === studentId && r.status === "PENDING"
              ? { ...r, status: "APPROVED", adminNote: "Directly reactivated by Admin" }
              : r
          )
        );
      } else {
        toast.error(data.error || "Failed to reactivate student.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to reactivate student.");
    } finally {
      setLoadingAction(null);
    }
  };

  // Process Reactivation Request (Approve / Reject)
  const handleProcessRequest = async (requestId: string, action: "APPROVE" | "REJECT") => {
    setLoadingAction(requestId);
    try {
      const res = await fetch("/api/admin/reactivation-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(action === "APPROVE" ? "Request approved & access restored!" : "Request rejected.");
        setRequests((prev) =>
          prev.map((r) => (r.id === requestId ? { ...r, status: action === "APPROVE" ? "APPROVED" : "REJECTED" } : r))
        );

        if (action === "APPROVE") {
          const req = requests.find((r) => r.id === requestId);
          if (req) {
            setStudents((prev) =>
              prev.map((s) =>
                s.id === req.userId
                  ? {
                      ...s,
                      hasDroppedEnrollment: false,
                      hasActiveEnrollment: true,
                      inactiveDays: 0,
                      enrollments: s.enrollments.map((e) =>
                        e.id === req.enrollmentId
                          ? { ...e, status: "ACTIVE", droppedAt: null, dropReason: null, reactivatedAt: new Date().toISOString() }
                          : e
                      ),
                    }
                  : s
              )
            );
          }
        }
      } else {
        toast.error(data.error || "Failed to process request.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred.");
    } finally {
      setLoadingAction(null);
    }
  };

  // Trigger Inactivity Scan Preview
  const handleRunInactivityPreview = async () => {
    setIsScanning(true);
    try {
      const res = await fetch("/api/admin/students/inactivity?thresholdDays=7");
      const data = await res.json();
      if (res.ok) {
        setScanResults(data);
        setScanModalOpen(true);
      } else {
        toast.error("Failed to run scan.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Scan error.");
    } finally {
      setIsScanning(false);
    }
  };

  // Confirm Inactivity Auto-Drop
  const handleConfirmAutoDrop = async () => {
    setIsScanning(true);
    try {
      const res = await fetch("/api/admin/students/inactivity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ thresholdDays: 7 }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Successfully auto-dropped ${data.droppedCount} inactive students!`);
        setScanModalOpen(false);
        window.location.reload();
      } else {
        toast.error(data.error || "Failed to execute auto-drop.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Auto drop failed.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-surface-900 rounded-2xl p-5 border border-surface-200 dark:border-surface-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-surface-500 font-medium">Total Students</p>
            <p className="text-2xl font-bold text-surface-900 dark:text-white mt-0.5">{totalStudents}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-900 rounded-2xl p-5 border border-surface-200 dark:border-surface-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-surface-500 font-medium">Active Learners</p>
            <p className="text-2xl font-bold text-surface-900 dark:text-white mt-0.5">{activeCount}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-900 rounded-2xl p-5 border border-surface-200 dark:border-surface-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-surface-500 font-medium">At Risk (5-6 Days)</p>
            <p className="text-2xl font-bold text-surface-900 dark:text-white mt-0.5">{warningCount}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-900 rounded-2xl p-5 border border-surface-200 dark:border-surface-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0">
            <UserX className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-surface-500 font-medium">Dropped / Inactive</p>
            <p className="text-2xl font-bold text-surface-900 dark:text-white mt-0.5">{droppedCount}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-900 rounded-2xl p-5 border border-surface-200 dark:border-surface-800 shadow-sm flex items-center gap-4 col-span-2 lg:col-span-1">
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-surface-500 font-medium">Pending Appeals</p>
            <p className="text-2xl font-bold text-surface-900 dark:text-white mt-0.5">{pendingRequestsCount}</p>
          </div>
        </div>
      </div>

      {/* Action Bar & Tabs */}
      <div className="bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === "ALL"
                ? "bg-primary-600 text-white shadow-md shadow-primary-500/20"
                : "text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800"
            }`}
          >
            All Students ({totalStudents})
          </button>
          <button
            onClick={() => setActiveTab("ACTIVE")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === "ACTIVE"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                : "text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800"
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setActiveTab("WARNING")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === "WARNING"
                ? "bg-amber-600 text-white shadow-md shadow-amber-500/20"
                : "text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800"
            }`}
          >
            At Risk ⚠️ ({warningCount})
          </button>
          <button
            onClick={() => setActiveTab("DROPPED")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === "DROPPED"
                ? "bg-red-600 text-white shadow-md shadow-red-500/20"
                : "text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800"
            }`}
          >
            Dropped 🔒 ({droppedCount})
          </button>
          <button
            onClick={() => setActiveTab("REQUESTS")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all relative ${
              activeTab === "REQUESTS"
                ? "bg-violet-600 text-white shadow-md shadow-violet-500/20"
                : "text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800"
            }`}
          >
            Reactivations ({pendingRequestsCount})
            {pendingRequestsCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 bg-red-500 text-white text-[10px] font-extrabold rounded-full">
                {pendingRequestsCount}
              </span>
            )}
          </button>
        </div>

        {/* Search and Scan Inactive Button */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student or email..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            />
          </div>

          <button
            onClick={handleRunInactivityPreview}
            disabled={isScanning}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-semibold text-xs transition-colors whitespace-nowrap"
          >
            <Scan className="w-3.5 h-3.5" />
            {isScanning ? "Scanning..." : "Scan Inactive (7d+)"}
          </button>
        </div>
      </div>

      {/* Main Content View */}
      {activeTab === "REQUESTS" ? (
        /* Reactivation Requests Tab */
        <div className="bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-surface-200 dark:border-surface-800">
            <h2 className="text-lg font-bold text-surface-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-violet-500" />
              Student Reactivation Appeals
            </h2>
            <p className="text-xs text-surface-500 mt-1">
              Review reasons submitted by dropped students and approve access restoration.
            </p>
          </div>

          {requests.length === 0 ? (
            <div className="p-12 text-center text-surface-500">
              <Sparkles className="w-12 h-12 mx-auto text-surface-300 dark:text-surface-600 mb-3" />
              <p className="font-medium text-base">No Reactivation Requests</p>
              <p className="text-xs text-surface-400 mt-1">There are no appeals pending review right now.</p>
            </div>
          ) : (
            <div className="divide-y divide-surface-200 dark:divide-surface-800">
              {requests.map((req) => (
                <div key={req.id} className="p-6 hover:bg-surface-50/50 dark:hover:bg-surface-800/20 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/learning/students/${req.userId}`}
                          className="font-bold text-surface-900 dark:text-white hover:text-primary-600 transition-colors"
                        >
                          {req.studentName}
                        </Link>
                        <span className="text-xs text-surface-500">{req.studentEmail}</span>
                        <span className="px-2.5 py-0.5 bg-primary-500/10 text-primary-600 dark:text-primary-400 text-xs font-semibold rounded-full">
                          {req.courseTitle}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
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

                      <div className="bg-surface-50 dark:bg-surface-800/80 rounded-2xl p-4 border border-surface-200/80 dark:border-surface-700/80 text-sm text-surface-700 dark:text-surface-300">
                        <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1">
                          Student Reason:
                        </p>
                        &quot;{req.reason}&quot;
                      </div>

                      <p className="text-xs text-surface-400">
                        Submitted on {format(new Date(req.createdAt), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {req.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => handleProcessRequest(req.id, "APPROVE")}
                            disabled={loadingAction === req.id}
                            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Approve & Restore Access
                          </button>
                          <button
                            onClick={() => handleProcessRequest(req.id, "REJECT")}
                            disabled={loadingAction === req.id}
                            className="flex items-center gap-1.5 px-4 py-2.5 bg-surface-100 dark:bg-surface-800 hover:bg-red-500/10 hover:text-red-500 text-surface-700 dark:text-surface-300 rounded-xl font-semibold text-xs transition-colors disabled:opacity-50"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Students Table */
        <div className="bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-50 dark:bg-surface-800/50 text-surface-500 dark:text-surface-400 text-xs uppercase tracking-wider border-b border-surface-200 dark:border-surface-800">
                  <th className="p-4 font-semibold">Student</th>
                  <th className="p-4 font-semibold">Enrolled Courses</th>
                  <th className="p-4 font-semibold">Inactivity Status</th>
                  <th className="p-4 font-semibold">Account Status</th>
                  <th className="p-4 font-semibold text-right">Course Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
                {filteredStudents.map((student) => {
                  const isDropped = student.hasDroppedEnrollment;
                  const isCriticalInactive = !isDropped && student.inactiveDays >= 7;
                  const isWarningInactive = !isDropped && student.inactiveDays >= 5 && student.inactiveDays < 7;

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-surface-50/50 dark:hover:bg-surface-800/30 transition-colors"
                    >
                      {/* Student Info */}
                      <td className="p-4">
                        <Link
                          href={`/admin/learning/students/${student.id}`}
                          className="font-bold text-surface-900 dark:text-white hover:text-primary-600 transition-colors block"
                        >
                          {student.name || "Unknown"}
                        </Link>
                        <span className="text-xs text-surface-500">{student.email}</span>
                        <div className="text-[11px] text-surface-400 mt-0.5">
                          Streak: {student.currentStreak} 🔥 • Joined: {format(new Date(student.createdAt), "MMM d, yyyy")}
                        </div>
                      </td>

                      {/* Enrolled Courses */}
                      <td className="p-4">
                        {student.enrollments.length === 0 ? (
                          <span className="text-xs text-surface-400 italic">No courses</span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {student.enrollments.map((enr) => (
                              <span
                                key={enr.id}
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  enr.status === "ACTIVE"
                                    ? "bg-primary-500/10 text-primary-600 dark:text-primary-400"
                                    : "bg-red-500/10 text-red-600 dark:text-red-400"
                                }`}
                              >
                                {enr.courseTitle} {enr.status === "DROPPED" ? "(Dropped)" : ""}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Inactivity Status */}
                      <td className="p-4">
                        {isDropped ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold rounded-full">
                            <ShieldAlert className="w-3.5 h-3.5" /> Dropped
                          </span>
                        ) : isCriticalInactive ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold rounded-full">
                            <AlertTriangle className="w-3.5 h-3.5" /> {student.inactiveDays}d Inactive (Drop Ready)
                          </span>
                        ) : isWarningInactive ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold rounded-full">
                            <Clock className="w-3.5 h-3.5" /> {student.inactiveDays}d Inactive (Warning)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Active ({student.inactiveDays}d ago)
                          </span>
                        )}
                      </td>

                      {/* Account Status */}
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            student.accountStatus === "APPROVED"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : student.accountStatus === "REJECTED"
                              ? "bg-red-500/10 text-red-600 dark:text-red-400"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {student.accountStatus}
                        </span>
                      </td>

                      {/* Course Actions */}
                      <td className="p-4 text-right">
                        {student.accountStatus === "PENDING" ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleUpdateAccountStatus(student.id, "APPROVED")}
                              disabled={loadingAction === student.id}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateAccountStatus(student.id, "REJECTED")}
                              disabled={loadingAction === student.id}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            {isDropped ? (
                              <button
                                onClick={() => handleReactivateStudent(student.id)}
                                disabled={loadingAction === student.id}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold text-xs rounded-xl transition-all disabled:opacity-50"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                {loadingAction === student.id ? "Restoring..." : "Reactivate Access"}
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setDropModalStudent(student);
                                  setDropReason(
                                    student.inactiveDays >= 7
                                      ? `Inactive for ${student.inactiveDays} days (no task submissions or course progress)`
                                      : "Manual drop by Instructor/Admin"
                                  );
                                }}
                                disabled={loadingAction === student.id}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-semibold text-xs rounded-xl transition-all disabled:opacity-50"
                              >
                                <UserX className="w-3.5 h-3.5" />
                                Drop Student
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-surface-400">
                      No students found for current filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Drop Student Modal */}
      {dropModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="max-w-md w-full bg-white dark:bg-surface-900 rounded-3xl p-6 border border-surface-200 dark:border-surface-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-surface-900 dark:text-white">Drop Student from Course</h3>
                <p className="text-xs text-surface-500">{dropModalStudent.name || dropModalStudent.email}</p>
              </div>
            </div>

            <p className="text-xs text-surface-600 dark:text-surface-400">
              Dropping this student will lock their dashboard and pause course access. They will be notified by email and can submit a reactivation appeal.
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
                onClick={() => setDropModalStudent(null)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 text-xs font-semibold hover:bg-surface-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDropStudent}
                disabled={loadingAction === dropModalStudent.id}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-lg shadow-red-600/20 disabled:opacity-50"
              >
                {loadingAction === dropModalStudent.id ? "Dropping..." : "Confirm Drop"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inactivity Scan Preview Modal */}
      {scanModalOpen && scanResults && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="max-w-2xl w-full bg-white dark:bg-surface-900 rounded-3xl p-6 border border-surface-200 dark:border-surface-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-surface-200 dark:border-surface-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center">
                  <Scan className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-surface-900 dark:text-white">Inactivity Scan Results</h3>
                  <p className="text-xs text-surface-500">Criteria: &ge; 7 consecutive days with no submissions or activity</p>
                </div>
              </div>
              <button
                onClick={() => setScanModalOpen(false)}
                className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-200"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-surface-50 dark:bg-surface-800 p-3 rounded-xl">
                <p className="text-xs text-surface-500">Scanned Enrollments</p>
                <p className="text-xl font-bold text-surface-900 dark:text-white">{scanResults.scannedCount}</p>
              </div>
              <div className="bg-amber-500/10 p-3 rounded-xl text-amber-600 dark:text-amber-400">
                <p className="text-xs">Inactive Students</p>
                <p className="text-xl font-bold">{scanResults.inactiveCount}</p>
              </div>
              <div className="bg-red-500/10 p-3 rounded-xl text-red-600 dark:text-red-400">
                <p className="text-xs">Eligible to Drop</p>
                <p className="text-xl font-bold">{scanResults.inactiveCount}</p>
              </div>
            </div>

            {scanResults.inactiveStudents && scanResults.inactiveStudents.length > 0 ? (
              <div className="max-h-60 overflow-y-auto rounded-2xl border border-surface-200 dark:border-surface-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-50 dark:bg-surface-800 text-surface-500 uppercase sticky top-0">
                    <tr>
                      <th className="p-3">Student</th>
                      <th className="p-3">Course</th>
                      <th className="p-3">Days Inactive</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
                    {scanResults.inactiveStudents.map((item: any) => (
                      <tr key={item.enrollmentId} className="hover:bg-surface-50/50">
                        <td className="p-3 font-semibold text-surface-900 dark:text-white">{item.studentName}</td>
                        <td className="p-3 text-surface-500">{item.courseTitle}</td>
                        <td className="p-3 font-bold text-red-600 dark:text-red-400">{item.inactiveDays} days</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center py-6 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                ✨ Great! No students are currently inactive for &ge; 7 days.
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setScanModalOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 text-xs font-semibold hover:bg-surface-200"
              >
                Close
              </button>
              {scanResults.inactiveCount > 0 && (
                <button
                  type="button"
                  onClick={handleConfirmAutoDrop}
                  disabled={isScanning}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-lg shadow-red-600/25 disabled:opacity-50"
                >
                  <UserX className="w-4 h-4" />
                  {isScanning ? "Processing..." : `Auto-Drop ${scanResults.inactiveCount} Inactive Students`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
