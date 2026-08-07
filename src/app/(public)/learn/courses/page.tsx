import { prisma } from "@/lib/prisma";
import CourseCard from "@/components/learn/CourseCard";
import { BookOpen, Search, Filter } from "lucide-react";
import { Suspense } from "react";
import { unstable_cache } from "next/cache";

// Remove force-dynamic to allow partial prerendering/caching of layout


interface Props {
  searchParams: Promise<{ category?: string; difficulty?: string; search?: string }>;
}

const getCourses = unstable_cache(
  async (category?: string, difficulty?: string, search?: string) => {
    const where: Record<string, unknown> = { isPublished: true };

    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    return prisma.course.findMany({
      where,
      include: {
        _count: { select: { lessons: true, enrollments: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },
  ['public-courses-list'],
  { revalidate: 60, tags: ['courses'] }
);

async function CourseGrid({ category, difficulty, search }: { category?: string; difficulty?: string; search?: string }) {
  const courses = await getCourses(category, difficulty, search);

  if (courses.length === 0) {
    return (
      <div className="col-span-full text-center py-20 bg-surface-50 dark:bg-surface-800/50 rounded-2xl border border-surface-200 dark:border-surface-700">
        <BookOpen className="w-16 h-16 mx-auto text-surface-300 dark:text-surface-600 mb-4" />
        <h3 className="text-xl font-semibold text-surface-900 dark:text-white mb-2">No Courses Found</h3>
        <p className="text-surface-500 dark:text-surface-400">Try adjusting your filters or check back later!</p>
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

const getCategoryList = unstable_cache(
  async () => {
    const courses = await prisma.course.findMany({
      where: { isPublished: true },
      select: { category: true },
      distinct: ["category"],
    });
    return courses.map((c) => c.category);
  },
  ['public-categories-list'],
  { revalidate: 3600, tags: ['courses'] }
);

async function CategoryList() {
  return getCategoryList();
}

export default async function CoursesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const categories = await CategoryList();

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-surface-900 dark:text-white mb-4">
            Course Catalog
          </h1>
          <p className="text-lg text-surface-600 dark:text-surface-400 max-w-2xl">
            Browse all available courses. Enroll to access lessons, submit tasks, and earn your ranking.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          {/* Search */}
          <form className="relative flex-1 max-w-md" action="/learn/courses" method="GET">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text"
              name="search"
              defaultValue={sp.search || ""}
              placeholder="Search courses..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder:text-surface-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none text-sm"
            />
            {sp.category && <input type="hidden" name="category" value={sp.category} />}
            {sp.difficulty && <input type="hidden" name="difficulty" value={sp.difficulty} />}
          </form>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-surface-400" />
            <div className="flex flex-wrap gap-2">
              <a
                href="/learn/courses"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  !sp.category
                    ? "bg-primary-600 text-white"
                    : "bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700"
                }`}
              >
                All
              </a>
              {categories.map((cat) => (
                <a
                  key={cat}
                  href={`/learn/courses?category=${encodeURIComponent(cat)}${sp.difficulty ? `&difficulty=${sp.difficulty}` : ""}${sp.search ? `&search=${sp.search}` : ""}`}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    sp.category === cat
                      ? "bg-primary-600 text-white"
                      : "bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700"
                  }`}
                >
                  {cat}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Difficulty Filter */}
        <div className="flex gap-2 mb-8">
          {[
            { value: "", label: "All Levels" },
            { value: "BEGINNER", label: "Beginner" },
            { value: "INTERMEDIATE", label: "Intermediate" },
            { value: "ADVANCED", label: "Advanced" },
          ].map((level) => (
            <a
              key={level.value}
              href={`/learn/courses?${sp.category ? `category=${sp.category}&` : ""}${level.value ? `difficulty=${level.value}` : ""}${sp.search ? `&search=${sp.search}` : ""}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                (sp.difficulty || "") === level.value
                  ? "bg-surface-900 dark:bg-white text-white dark:text-surface-900"
                  : "bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700"
              }`}
            >
              {level.label}
            </a>
          ))}
        </div>

        {/* Course Grid */}
        <Suspense fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-[340px] bg-surface-100 dark:bg-surface-800/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        }>
          <CourseGrid category={sp.category} difficulty={sp.difficulty} search={sp.search} />
        </Suspense>
      </div>
    </div>
  );
}
