import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArrowRight, BookOpen, Trophy, GraduationCap, Sparkles, Users } from "lucide-react";
import { Suspense } from "react";
import CourseCard from "@/components/learn/CourseCard";

export const revalidate = 60;

async function FeaturedCourses() {
  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    take: 6,
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { lessons: true, enrollments: true } },
    },
  });

  if (courses.length === 0) {
    return (
      <div className="col-span-full text-center py-16 bg-surface-50 dark:bg-surface-800/50 rounded-2xl border border-surface-200 dark:border-surface-700">
        <BookOpen className="w-12 h-12 mx-auto text-surface-300 dark:text-surface-600 mb-4" />
        <p className="text-surface-500 dark:text-surface-400 text-lg">Courses coming soon!</p>
        <p className="text-surface-400 dark:text-surface-500 text-sm mt-2">We&apos;re preparing amazing learning content for you.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          slug={course.slug}
          title={course.title}
          description={course.description}
          thumbnail={course.thumbnail}
          category={course.category}
          difficulty={course.difficulty}
          lessonCount={course._count.lessons}
          enrollmentCount={course._count.enrollments}
        />
      ))}
    </div>
  );
}

async function LeaderboardPreview() {
  const submissions = await prisma.taskSubmission.findMany({
    where: { status: "GRADED", marks: { not: null } },
    select: {
      userId: true,
      marks: true,
      user: { select: { name: true } },
    },
  });

  const userMarks = new Map<string, { name: string; total: number; count: number }>();
  for (const sub of submissions) {
    const existing = userMarks.get(sub.userId);
    if (existing) {
      existing.total += sub.marks || 0;
      existing.count += 1;
    } else {
      userMarks.set(sub.userId, { name: sub.user.name || "Student", total: sub.marks || 0, count: 1 });
    }
  }

  const topStudents = Array.from(userMarks.entries())
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5);

  if (topStudents.length === 0) return null;

  return (
    <div className="space-y-3">
      {topStudents.map(([userId, data], index) => (
        <div key={userId} className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
            index === 0 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400" :
            index === 1 ? "bg-surface-200 text-surface-600 dark:bg-surface-700 dark:text-surface-300" :
            index === 2 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400" :
            "bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-400"
          }`}>
            #{index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-surface-900 dark:text-white truncate">{data.name}</p>
            <p className="text-xs text-surface-400">{data.count} tasks</p>
          </div>
          <div className="font-bold text-primary-600 dark:text-primary-400">{data.total} pts</div>
        </div>
      ))}
    </div>
  );
}

export default function LearnPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-44 lg:pb-28">
        <div className="absolute inset-0 bg-surface-50 dark:bg-surface-950 transition-colors duration-300" />
        <div className="absolute top-0 left-1/3 w-[800px] h-[400px] opacity-30 dark:opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-accent-400 via-primary-500 to-primary-400 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen" />
        </div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[300px] opacity-20 dark:opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-l from-success-400 to-accent-500 blur-[80px] rounded-full mix-blend-multiply dark:mix-blend-screen" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100/50 dark:bg-primary-900/30 backdrop-blur-md border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            Learn. Build. Compete. Rank Up.
          </div>

          <h1 className="text-4xl md:text-7xl font-extrabold text-surface-900 dark:text-white tracking-tight leading-tight mb-8">
            CodeOps Pro <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 via-accent-500 to-success-500">
              Learning Hub
            </span>
          </h1>

          <p className="text-lg md:text-xl text-surface-600 dark:text-surface-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Master cutting-edge skills through hands-on courses, real-world tasks, and compete with fellow students on the global leaderboard.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/learn/courses"
              className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold text-lg shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:-translate-y-1 transition-all duration-300"
            >
              Browse Courses
              <BookOpen className="w-5 h-5 ml-2" />
            </Link>
            <Link
              href="/learn/leaderboard"
              className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 rounded-xl bg-white dark:bg-surface-800 text-surface-900 dark:text-white font-semibold text-lg border border-surface-200 dark:border-surface-700 hover:border-primary-500 dark:hover:border-primary-500 hover:-translate-y-1 transition-all duration-300 shadow-sm"
            >
              <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
              Leaderboard
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-6 bg-white dark:bg-surface-900/50 border-y border-surface-200 dark:border-surface-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: <BookOpen className="w-6 h-6" />, label: "Courses", value: "Active" },
              { icon: <Users className="w-6 h-6" />, label: "Students", value: "Growing" },
              { icon: <GraduationCap className="w-6 h-6" />, label: "Tasks", value: "Hands-on" },
              { icon: <Trophy className="w-6 h-6" />, label: "Rankings", value: "Live" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center mx-auto mb-2">
                  {stat.icon}
                </div>
                <div className="text-lg font-bold text-surface-900 dark:text-white">{stat.value}</div>
                <div className="text-sm text-surface-500 dark:text-surface-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20 bg-surface-50 dark:bg-surface-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-surface-900 dark:text-white mb-4">
                Featured Courses
              </h2>
              <p className="text-lg text-surface-600 dark:text-surface-400 max-w-2xl">
                Enroll in our curated courses and start building real-world skills.
              </p>
            </div>
            <Link
              href="/learn/courses"
              className="inline-flex items-center text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              View all courses <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <Suspense fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[340px] bg-surface-100 dark:bg-surface-800/50 rounded-2xl animate-pulse" />
              ))}
            </div>
          }>
            <FeaturedCourses />
          </Suspense>
        </div>
      </section>

      {/* Leaderboard Preview + How It Works */}
      <section className="py-20 bg-white dark:bg-surface-900/50 border-t border-surface-200 dark:border-surface-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* How It Works */}
            <div>
              <h2 className="text-3xl font-bold text-surface-900 dark:text-white mb-8">How It Works</h2>
              <div className="space-y-6">
                {[
                  { step: "01", title: "Enroll in a Course", desc: "Browse our catalog and enroll in courses that match your learning goals." },
                  { step: "02", title: "Watch & Learn", desc: "Access video lessons directly from Google Drive. Download for offline viewing." },
                  { step: "03", title: "Complete Tasks", desc: "Submit assignments with links to your GitHub, LinkedIn, or deployed projects." },
                  { step: "04", title: "Get Graded & Rank Up", desc: "AI grades your work instantly. Climb the leaderboard as you earn more points!" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 font-bold text-sm flex items-center justify-center">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-surface-900 dark:text-white mb-1">{item.title}</h3>
                      <p className="text-sm text-surface-600 dark:text-surface-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Leaderboard Preview */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-surface-900 dark:text-white">🏆 Top Students</h2>
                <Link
                  href="/learn/leaderboard"
                  className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 transition-colors"
                >
                  View full leaderboard →
                </Link>
              </div>
              <Suspense fallback={
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-surface-100 dark:bg-surface-800/50 rounded-xl animate-pulse" />
                  ))}
                </div>
              }>
                <LeaderboardPreview />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="pb-20 pt-8 bg-white dark:bg-surface-900/50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-surface-900 via-primary-900/50 to-surface-900 dark:from-surface-950 dark:via-primary-950/50 dark:to-surface-950 p-12 sm:p-20 border border-primary-800/30 shadow-2xl text-center group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-accent-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-accent-500/15 rounded-full blur-3xl" />

            <div className="relative z-10 max-w-3xl mx-auto">
              <GraduationCap className="w-16 h-16 text-primary-400 mx-auto mb-6" />
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Level Up?
              </h2>
              <p className="text-xl text-surface-300 mb-10">
                Join CodeOps Pro Learning Hub and start your journey to becoming a top-ranked developer.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-10 py-5 rounded-2xl bg-white text-surface-900 font-bold text-lg hover:bg-surface-100 hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.2)]"
              >
                Get Started Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
