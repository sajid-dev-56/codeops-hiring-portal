import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BookOpen, ListTodo, Plus, ChevronLeft } from "lucide-react";
import AddQuestionForm from "./AddQuestionForm";

interface Props {
  params: Promise<{ id: string; quizId: string }>;
}

export default async function AdminQuizManagePage({ params }: Props) {
  const { id, quizId } = await params;

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      course: true,
      questions: { orderBy: { order: "asc" } },
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
            <span className="text-surface-900 dark:text-white font-medium truncate max-w-[200px]">{quiz.title}</span>
          </nav>
          <div className="flex items-center gap-3">
            <Link href={`/admin/learning/courses/${id}`} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
              <ChevronLeft className="w-5 h-5 text-surface-600 dark:text-surface-400" />
            </Link>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Manage Quiz: {quiz.title}</h1>
          </div>
          <p className="text-sm text-surface-500 mt-2 ml-11">
            Time limit: {quiz.timeLimit} seconds per question.
          </p>
        </div>
      </div>

      <div className="max-w-3xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
            Questions ({quiz.questions.length})
          </h2>
        </div>

        {quiz.questions.length > 0 && (
          <div className="space-y-4 mb-8">
            {quiz.questions.map((question, index) => {
              const options = JSON.parse(question.options);
              return (
                <div key={question.id} className="p-4 rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-surface-900 dark:text-white">{question.text}</p>
                    </div>
                  </div>
                  <div className="pl-10 space-y-2">
                    {options.map((opt: string, i: number) => (
                      <div key={i} className={`text-sm px-3 py-2 rounded-lg border ${question.correctOption === i ? 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800 text-success-700 dark:text-success-400 font-medium' : 'bg-surface-50 dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400'}`}>
                        {String.fromCharCode(65 + i)}. {opt}
                        {question.correctOption === i && " (Correct)"}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <AddQuestionForm quizId={quiz.id} />
      </div>
    </div>
  );
}
