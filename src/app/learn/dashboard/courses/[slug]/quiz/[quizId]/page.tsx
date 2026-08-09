import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import QuizPlayer from "./QuizPlayer";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface Props {
  params: Promise<{ slug: string; quizId: string }>;
  searchParams: Promise<{ reattempt?: string }>;
}

export default async function StudentQuizPage({ params, searchParams }: Props) {
  const { slug, quizId } = await params;
  const { reattempt } = await searchParams;
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
        }
      },
      attempts: {
        where: { userId: session.user.id },
        orderBy: { completedAt: "desc" },
      },
    },
  });

  if (!quiz) notFound();

  const activeAttempt = quiz.attempts.find((a) => a.status === "PENDING");
  const gradedAttempt = quiz.attempts.find((a) => a.status === "GRADED");

  const now = new Date();
  
  let isLocked = false;
  let isClosed = false;
  let lockedMessage = "";

  if (quiz.status === "CLOSED") {
    isClosed = true;
  } else if (quiz.status === "SCHEDULED") {
    if (quiz.startTime && quiz.startTime > now) {
      isLocked = true;
      lockedMessage = `This quiz opens on ${quiz.startTime.toLocaleString()}`;
    } else if (quiz.endTime && quiz.endTime < now) {
      isClosed = true;
    }
  }

  if (isLocked) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-6">
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Quiz Locked</h1>
        <p className="text-surface-500">{lockedMessage}</p>
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

  if (isClosed && !activeAttempt && (!gradedAttempt || (gradedAttempt && !reattempt))) {
    // If closed, they can only see their graded score, they cannot start a new attempt.
    if (gradedAttempt) {
       return (
        <div className="max-w-2xl mx-auto py-12 px-4 animate-fade-in text-center space-y-6">
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Quiz Completed</h1>
          <div className="p-8 rounded-2xl bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xl">
            <p className="text-surface-500 mb-2">Your Score (Most Recent)</p>
            <p className={`text-6xl font-black ${gradedAttempt.score && gradedAttempt.score >= 50 ? 'text-success-500' : 'text-danger-500'}`}>
              {gradedAttempt.score}%
            </p>
            <div className="mt-6 pt-6 border-t border-surface-200 dark:border-surface-800">
              <p className="text-sm text-surface-400">
                Violations recorded: {gradedAttempt.strikes}
              </p>
            </div>
          </div>
          <p className="text-danger-500 mt-4">This quiz is now closed for reattempts.</p>
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

  // If they have a graded attempt, they aren't explicitly reattempting, and there's no active PENDING attempt
  if (gradedAttempt && !reattempt && !activeAttempt) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 animate-fade-in text-center space-y-6">
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Quiz Completed</h1>
        <div className="p-8 rounded-2xl bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xl">
          <p className="text-surface-500 mb-2">Your Score (Most Recent)</p>
          <p className={`text-6xl font-black ${gradedAttempt.score && gradedAttempt.score >= 50 ? 'text-success-500' : 'text-danger-500'}`}>
            {gradedAttempt.score}%
          </p>
          <div className="mt-6 pt-6 border-t border-surface-200 dark:border-surface-800">
            <p className="text-sm text-surface-400">
              Violations recorded: {gradedAttempt.strikes}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-4 mt-8">
          <Link 
            href={`/learn/dashboard/courses/${slug}`}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-surface-600 bg-surface-100 hover:bg-surface-200 dark:text-surface-300 dark:bg-surface-800 dark:hover:bg-surface-700 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Course
          </Link>
          
          <Link 
            href={`/learn/dashboard/courses/${slug}/quiz/${quizId}?reattempt=true`}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors"
          >
            Reattempt Quiz
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-surface-50 dark:bg-black overflow-hidden flex flex-col items-center justify-center p-4">
      <QuizPlayer quiz={quiz} courseSlug={slug} />
    </div>
  );
}
