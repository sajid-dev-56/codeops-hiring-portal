import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Search, CheckCircle2 } from "lucide-react";

interface Props {
  params: Promise<{ id: string; quizId: string }>;
}

export default async function AdminQuizAttemptsPage({ params }: Props) {
  const { id, quizId } = await params;

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      course: true,
      attempts: {
        include: { user: { select: { name: true, email: true } } },
        orderBy: { completedAt: "desc" },
      },
    },
  });

  if (!quiz) notFound();

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 text-sm text-surface-500 mb-2">
            <Link href="/admin/learning/courses" className="hover:text-primary-600">Courses</Link>
            <span>/</span>
            <Link href={`/admin/learning/courses/${id}`} className="hover:text-primary-600 truncate max-w-[200px]">{quiz.course.title}</Link>
            <span>/</span>
            <Link href={`/admin/learning/courses/${id}/quizzes/${quizId}`} className="hover:text-primary-600 truncate max-w-[200px]">{quiz.title}</Link>
            <span>/</span>
            <span className="text-surface-900 dark:text-white font-medium">Attempts</span>
          </nav>
          <div className="flex items-center gap-3">
            <Link href={`/admin/learning/courses/${id}/quizzes/${quizId}`} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
              <ChevronLeft className="w-5 h-5 text-surface-600 dark:text-surface-400" />
            </Link>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Submissions: {quiz.title}</h1>
          </div>
          <p className="text-sm text-surface-500 mt-2 ml-11">
            Total attempts: {quiz.attempts.length}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden">
        {quiz.attempts.length === 0 ? (
          <div className="p-12 text-center text-surface-500">
            No submissions found for this quiz yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-800/50">
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-surface-500">Student</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold uppercase tracking-wider text-surface-500">Score</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold uppercase tracking-wider text-surface-500">Strikes</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold uppercase tracking-wider text-surface-500">Status</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-surface-500">Submitted At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                {quiz.attempts.map((attempt) => (
                  <tr key={attempt.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-surface-900 dark:text-white">{attempt.user.name || "Anonymous"}</span>
                        <span className="text-sm text-surface-500">{attempt.user.email}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                          attempt.score !== null && attempt.score >= 50 
                            ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400' 
                            : 'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400'
                        }`}>
                          {attempt.score !== null ? `${attempt.score}%` : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`text-sm font-medium ${attempt.strikes > 0 ? 'text-danger-500' : 'text-surface-500'}`}>
                        {attempt.strikes}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                       {attempt.status === "GRADED" ? (
                          <div className="inline-flex items-center gap-1.5 text-success-600 dark:text-success-500 text-sm font-medium">
                            <CheckCircle2 className="w-4 h-4" /> Graded
                          </div>
                       ) : (
                          <div className="inline-flex items-center gap-1.5 text-surface-500 text-sm font-medium">
                            <Search className="w-4 h-4" /> Pending
                          </div>
                       )}
                    </td>
                    <td className="px-5 py-4 text-right text-sm text-surface-600 dark:text-surface-400">
                      {attempt.completedAt ? attempt.completedAt.toLocaleString() : 'In Progress'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
