import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import QuizAttemptsClient from "./QuizAttemptsClient";

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
        include: { user: { select: { id: true, name: true, email: true } } },
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

      <QuizAttemptsClient attempts={quiz.attempts} />
    </div>
  );
}

export const dynamic = "force-dynamic";
