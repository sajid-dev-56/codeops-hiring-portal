import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const job = await prisma.job.findUnique({ where: { slug } });
  if (!job) return { title: "Job Not Found" };
  
  const title = `${job.title} at CodeOps Pro`;
  const description = `Apply for ${job.title} in ${job.department}. ${job.description.replace(/<[^>]+>/g, '').substring(0, 160)}...`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://codeopspro.vercel.app/careers/${slug}`,
      images: [
        {
          url: "/logo.jpg",
          width: 800,
          height: 600,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/logo.jpg"],
    },
  };
}

export default async function JobDetailPage({ params }: Props) {
  const { slug } = await params;
  const job = await prisma.job.findUnique({ where: { slug } });

  if (!job || job.status !== "OPEN") {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-surface-400 mb-8">
        <Link href="/careers" className="hover:text-primary-600 transition-colors">
          Careers
        </Link>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-surface-600">{job.title}</span>
      </nav>

      {/* Job Header */}
      <div className="animate-fade-in mb-10">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-sm font-medium border border-primary-200">
            {job.department}
          </span>
          <span className="px-3 py-1 rounded-full bg-success-400/10 text-success-600 text-sm font-medium border border-success-400/20">
            ● Open
          </span>
          {job.headcount > 1 && (
            <span className="px-3 py-1 rounded-full bg-surface-100 text-surface-600 text-sm font-medium">
              {job.headcount} positions
            </span>
          )}
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-surface-900 dark:text-white mb-4">
          {job.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-surface-500">
          {job.targetStartDate && (
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Target start:{" "}
              {new Date(job.targetStartDate).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Posted{" "}
            {new Date(job.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Job Description */}
      <div className="animate-fade-in bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm p-8 sm:p-10 mb-8">
        <div
          className="prose prose-lg dark:prose-invert max-w-none text-surface-700 dark:text-surface-300
            prose-headings:font-semibold prose-headings:text-surface-900 dark:prose-headings:text-white
            prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
            prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
            prose-p:text-surface-700 dark:prose-p:text-surface-300 prose-p:leading-relaxed
            prose-li:text-surface-700 dark:prose-li:text-surface-300
            prose-strong:text-surface-900 dark:prose-strong:text-white
            prose-ul:mt-2 prose-li:mt-1"
          dangerouslySetInnerHTML={{
            __html: job.description
          }}
        />
      </div>

      {/* Apply CTA */}
      <div className="animate-fade-in bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl p-8 sm:p-10 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">
          Interested in this role?
        </h2>
        <p className="text-primary-100 mb-6">
          Submit your application and we&apos;ll get back to you within 5 business
          days.
        </p>
        <Link
          href={`/careers/${job.slug}/apply`}
          className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-primary-700 font-semibold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
        >
          Apply for this Position
          <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
