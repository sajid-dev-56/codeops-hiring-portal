import { prisma } from "@/lib/prisma";
import QuizzesClient from "./QuizzesClient";

export default async function AdminQuizzesPage() {
  const quizzes = await prisma.quiz.findMany({
    include: {
      course: { select: { id: true, title: true } },
      _count: { select: { questions: true, attempts: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Quizzes</h1>
        <p className="text-surface-600 dark:text-surface-400 mt-1">Manage quizzes across all courses</p>
      </div>

      <QuizzesClient initialQuizzes={quizzes} />
    </div>
  );
}

export const dynamic = "force-dynamic";
