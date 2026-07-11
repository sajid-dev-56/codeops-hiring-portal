import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArrowRight, Briefcase, Zap, Globe, Shield, Star, CheckCircle2 } from "lucide-react";
import { Suspense } from "react";

export const revalidate = 60; // Revalidate every minute

async function FeaturedJobsList() {
  const featuredJobs = await prisma.job.findMany({
    where: { status: "OPEN" },
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {featuredJobs.map((job) => (
        <Link href={`/careers/${job.slug}`} key={job.id} className="group">
          <div className="h-full bg-surface-50 dark:bg-surface-800/80 rounded-2xl p-6 border border-surface-200 dark:border-surface-700 hover:border-primary-500/50 dark:hover:border-primary-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-500/10 flex flex-col">
            <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {job.title}
            </h3>
            <div className="flex items-center gap-3 text-sm text-surface-500 dark:text-surface-400 mb-6">
              <span className="px-2.5 py-1 rounded-md bg-surface-200 dark:bg-surface-700">{job.department}</span>
              <span>•</span>
              <span>{job.headcount} {job.headcount === 1 ? 'Opening' : 'Openings'}</span>
            </div>
            <div className="mt-auto pt-4 border-t border-surface-200 dark:border-surface-700 flex items-center justify-between text-sm font-medium text-surface-900 dark:text-white">
              Apply Now
              <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-primary-500" />
            </div>
          </div>
        </Link>
      ))}
      {featuredJobs.length === 0 && (
        <div className="col-span-full text-center py-12 bg-surface-50 dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700">
          <p className="text-surface-500 dark:text-surface-400">More amazing roles coming soon!</p>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-surface-50 dark:bg-surface-950 transition-colors duration-300" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-30 dark:opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-accent-500 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-200/50 dark:bg-surface-800/50 backdrop-blur-md border border-surface-300 dark:border-surface-700 text-surface-800 dark:text-surface-200 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-success-500 animate-[pulse-soft_2s_ease-in-out_infinite]" />
            We're actively hiring top talent
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-surface-900 dark:text-white tracking-tight leading-tight mb-8">
            Build the Future <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-accent-500">
              With CodeOps Pro
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-surface-600 dark:text-surface-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join our team of passionate builders and creators. We use AI-driven matching to connect you with roles where you'll do the best work of your life.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/careers"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold text-lg shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:-translate-y-1 transition-all duration-300"
            >
              View Open Roles
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white dark:bg-surface-800 text-surface-900 dark:text-white font-semibold text-lg border border-surface-200 dark:border-surface-700 hover:border-primary-500 dark:hover:border-primary-500 hover:-translate-y-1 transition-all duration-300 shadow-sm"
            >
              How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-24 bg-white dark:bg-surface-900/50 transition-colors duration-300 relative border-t border-surface-200 dark:border-surface-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-surface-900 dark:text-white mb-4">
                Featured Opportunities
              </h2>
              <p className="text-lg text-surface-600 dark:text-surface-400 max-w-2xl">
                Discover roles where your skills can make a massive impact.
              </p>
            </div>
            <Link
              href="/careers"
              className="inline-flex items-center text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              View all jobs <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <Suspense fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[280px] bg-surface-100 dark:bg-surface-800/50 rounded-2xl p-6 border border-surface-200 dark:border-surface-700 animate-pulse" />
              ))}
            </div>
          }>
            <FeaturedJobsList />
          </Suspense>
        </div>
      </section>

      {/* Why Choose Us (Bento Box) */}
      <section className="py-24 bg-surface-50 dark:bg-surface-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-surface-900 dark:text-white mb-4">
              Why Join CodeOps Pro?
            </h2>
            <p className="text-lg text-surface-600 dark:text-surface-400 max-w-2xl mx-auto">
              We provide the environment, tools, and culture you need to do the best work of your career.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[240px]">
            {/* Large Card */}
            <div className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-primary-500 to-accent-600 rounded-3xl p-8 sm:p-10 text-white flex flex-col justify-end relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/20 transition-colors duration-500" />
              <Zap className="w-12 h-12 mb-auto text-primary-200" />
              <h3 className="text-2xl sm:text-3xl font-bold mb-3">AI-Powered Matching</h3>
              <p className="text-primary-100 text-lg leading-relaxed">
                Our proprietary AI ensures your profile is highlighted for the roles where you naturally excel, skipping the resume black hole.
              </p>
            </div>

            {/* Small Cards */}
            <div className="md:col-span-2 bg-white dark:bg-surface-900 rounded-3xl p-8 border border-surface-200 dark:border-surface-800 hover:border-accent-500/50 dark:hover:border-accent-500/50 transition-colors group flex flex-col justify-center">
              <Globe className="w-10 h-10 text-accent-500 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-2">Work From Anywhere</h3>
              <p className="text-surface-600 dark:text-surface-400">100% remote culture built on trust, output, and seamless asynchronous collaboration.</p>
            </div>

            <div className="md:col-span-1 bg-white dark:bg-surface-900 rounded-3xl p-6 border border-surface-200 dark:border-surface-800 hover:border-success-500/50 transition-colors flex flex-col items-center text-center justify-center group">
              <Shield className="w-10 h-10 text-success-500 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-2">Top Tier Health</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400">Comprehensive coverage for you and your family.</p>
            </div>

            <div className="md:col-span-1 bg-surface-900 dark:bg-white rounded-3xl p-6 hover:shadow-xl transition-shadow flex flex-col items-center text-center justify-center group">
              <Star className="w-10 h-10 text-warning-400 dark:text-warning-500 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-bold text-white dark:text-surface-900 mb-2">Equity & Bonus</h3>
              <p className="text-sm text-surface-300 dark:text-surface-600">Be a true owner in the success we build together.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-white dark:bg-surface-900/50 transition-colors border-t border-surface-200 dark:border-surface-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-surface-900 dark:text-white mb-4">
              A Seamless Process
            </h2>
            <p className="text-lg text-surface-600 dark:text-surface-400 max-w-2xl mx-auto">
              We've engineered our hiring process to be fast, transparent, and respectful of your time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-primary-200 via-primary-500 to-accent-400 dark:from-surface-700 dark:via-primary-600 dark:to-surface-700 -translate-y-1/2" />
            
            {[
              { step: "01", title: "Apply Online", desc: "Submit your profile in under 2 minutes. No cover letters required." },
              { step: "02", title: "AI Screening", desc: "Our AI instantly evaluates your fit and moves you to the next round." },
              { step: "03", title: "Get Hired", desc: "Meet the team, show your skills, and receive an offer." }
            ].map((item, i) => (
              <div key={i} className="relative z-10 bg-white dark:bg-surface-900 p-8 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm hover:-translate-y-2 transition-transform duration-300">
                <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center mb-6 mx-auto md:mx-0 border-4 border-white dark:border-surface-900 shadow-sm">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-3 text-center md:text-left">{item.title}</h3>
                <p className="text-surface-600 dark:text-surface-400 text-center md:text-left">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="pb-24 pt-12 bg-white dark:bg-surface-900/50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-surface-900 dark:bg-surface-950 p-12 sm:p-20 border border-surface-800 dark:border-surface-800 shadow-2xl text-center group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-accent-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl" />
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to make your mark?
              </h2>
              <p className="text-xl text-surface-300 mb-10">
                Join hundreds of engineers building the future of software. Your next big career move is just a click away.
              </p>
              <Link
                href="/careers"
                className="inline-flex items-center justify-center px-10 py-5 rounded-2xl bg-white text-surface-900 font-bold text-lg hover:bg-surface-100 hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.3)]"
              >
                Browse Open Positions
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
