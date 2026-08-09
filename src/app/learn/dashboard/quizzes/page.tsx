import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { BookOpen, Clock, ChevronRight, FileText } from "lucide-react";

export const metadata = {
  title: "My Exams & Quizzes | CodeOps Academy",
};

export default async function StudentQuizzesPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  // Fetch all quizzes from courses the user is enrolled in
  const quizzes = await prisma.quiz.findMany({
    where: {
      course: {
        enrollments: {
          some: {
            userId: session.user.id,
          }
        }
      }
    },
    include: {
      course: {
        select: {
          title: true,
          slug: true,
        }
      },
      questions: {
        select: {
          id: true, // Just to get the count
        }
      },
      attempts: {
        where: {
          userId: session.user.id,
        },
      },
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white">
            Exams & Quizzes
          </h1>
          <p className="mt-2 text-surface-500 dark:text-surface-400">
            View and take quizzes from all your enrolled courses.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-surface-200 dark:border-surface-800">
          <h2 className="text-lg font-bold text-surface-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-500" />
            All Assessments ({quizzes.length})
          </h2>
        </div>

        {quizzes.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-surface-100 dark:bg-surface-800 text-surface-400 dark:text-surface-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">
              No Quizzes Found
            </h3>
            <p className="text-surface-500 dark:text-surface-400">
              There are currently no quizzes or exams available in your active courses.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-surface-100 dark:divide-surface-800">
            {quizzes.map((quiz) => {
              const attempt = quiz.attempts[0] || null;
              const status = attempt?.status;
              
              let statusLabel = "Not Attempted";
              let statusBg = "bg-surface-500/10";
              let statusColor = "text-surface-500 dark:text-surface-400";
              
              if (status === "GRADED") { 
                statusLabel = `Score: ${attempt?.score}%`; 
                statusBg = attempt?.score && attempt.score >= 50 ? "bg-success-500/10" : "bg-danger-500/10"; 
                statusColor = attempt?.score && attempt.score >= 50 ? "text-success-600 dark:text-success-400" : "text-danger-600 dark:text-danger-400"; 
              } else if (status === "PENDING") {
                statusLabel = "In Progress";
                statusBg = "bg-warning-500/10";
                statusColor = "text-warning-600 dark:text-warning-400";
              }

              const now = new Date();
              let isUpcoming = false;
              let isClosed = false;

              if (quiz.status === "CLOSED") {
                isClosed = true;
              } else if (quiz.status === "SCHEDULED") {
                if (quiz.startTime && new Date(quiz.startTime) > now) {
                  isUpcoming = true;
                } else if (quiz.endTime && new Date(quiz.endTime) < now) {
                  isClosed = true;
                }
              }

              const isLocked = isUpcoming || isClosed;
              
              if (isUpcoming) {
                statusLabel = `Opens at ${new Date(quiz.startTime!).toLocaleString()}`;
                statusBg = "bg-primary-500/10";
                statusColor = "text-primary-600 dark:text-primary-400";
              } else if (isClosed && !attempt) {
                statusLabel = "Closed";
                statusBg = "bg-surface-500/10";
                statusColor = "text-surface-600 dark:text-surface-400";
              }

              return (
                <div key={quiz.id} className={`group block p-6 ${isLocked ? 'opacity-75 cursor-not-allowed' : 'hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors'}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold text-surface-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {quiz.title}
                        </h3>
                        <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full flex-shrink-0 ${statusBg} ${statusColor}`}>
                          {statusLabel}
                        </span>
                      </div>
                      
                      <div className="text-sm font-medium text-primary-600 dark:text-primary-400 mb-2">
                        Course: {quiz.course.title}
                      </div>
                      
                      {quiz.description && (
                        <p className="text-sm text-surface-500 dark:text-surface-400 line-clamp-2 mb-3">
                          {quiz.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-surface-500 dark:text-surface-400">
                        <span className="inline-flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4" />
                          {quiz.questions.length} Questions
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {quiz.timeLimit}s per question
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-end sm:justify-start">
                      {isLocked ? (
                        <div className="w-10 h-10 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                          <span className="text-surface-400 text-xs font-bold uppercase">Locked</span>
                        </div>
                      ) : (
                        <Link href={`/learn/dashboard/courses/${quiz.course.slug}/quiz/${quiz.id}`}>
                          <div className="w-10 h-10 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center group-hover:bg-primary-50 dark:group-hover:bg-primary-500/10 group-hover:scale-110 transition-all duration-200">
                            <ChevronRight className="w-5 h-5 text-surface-400 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
                          </div>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
