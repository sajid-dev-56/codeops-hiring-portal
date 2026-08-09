import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import QuizPlayer from "./QuizPlayer";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface Props {
  params: Promise<{ slug: string; quizId: string }>;
}

export default async function StudentQuizPage({ params }: Props) {
  const { slug, quizId } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const course = await prisma.course.findUnique({
    where: { slug },
  });

  if (!course) notFound();

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          text: true,
          options: true,
          // Exclude correctOption to prevent clientside cheating
        }
      },
      attempts: {
        where: { userId: session.user.id },
      },
    },
  });

  if (!quiz) notFound();

  const attempt = quiz.attempts[0];

  const now = new Date();
  if (quiz.startTime && quiz.startTime > now) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-6">
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Quiz Locked</h1>
        <p className="text-surface-500">This quiz opens on {quiz.startTime.toLocaleString()}</p>
        <Link 
          href={`/learn/dashboard/courses/${slug}`}
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Course
        </Link>
      </div>
    );
  }

  if (quiz.endTime && quiz.endTime < now && attempt?.status !== "GRADED") {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-6">
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Quiz Closed</h1>
        <p className="text-surface-500">This quiz is no longer accepting submissions.</p>
        <Link 
          href={`/learn/dashboard/courses/${slug}`}
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Course
        </Link>
      </div>
    );
  }

  if (attempt?.status === "GRADED") {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 animate-fade-in text-center space-y-6">
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Quiz Completed</h1>
        <div className="p-8 rounded-2xl bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xl">
          <p className="text-surface-500 mb-2">Your Score</p>
          <p className={`text-6xl font-black ${attempt.score && attempt.score >= 50 ? 'text-success-500' : 'text-danger-500'}`}>
            {attempt.score}%
          </p>
          <div className="mt-6 pt-6 border-t border-surface-200 dark:border-surface-800">
            <p className="text-sm text-surface-400">
              Violations recorded: {attempt.strikes}
            </p>
          </div>
        </div>
        <Link 
          href={`/learn/dashboard/courses/${slug}`}
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Course
        </Link>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-surface-50 dark:bg-black overflow-hidden flex flex-col items-center justify-center p-4">
      <QuizPlayer quiz={quiz} courseSlug={slug} />
    </div>
  );
}
