import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-accent-600 to-primary-800" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-400/20 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 sm:py-40">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium mb-8">
              <span className="w-2 h-2 rounded-full bg-success-400 animate-pulse" />
              We&apos;re hiring across multiple teams
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6">
              Build the Future
              <br />
              <span className="text-primary-200">With Us</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join our team of passionate builders, thinkers, and creators. We&apos;re
              on a mission to transform how companies hire and grow their teams.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/careers"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-primary-700 font-semibold text-lg shadow-lg shadow-primary-900/20 hover:shadow-xl hover:shadow-primary-900/30 hover:-translate-y-0.5 transition-all duration-300"
              >
                View Open Positions
                <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-surface-50 to-transparent" />
      </section>

      {/* Values Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-surface-900 mb-4">
            Why Join Us?
          </h2>
          <p className="text-lg text-surface-500 max-w-2xl mx-auto">
            We believe in creating an environment where everyone can do their best work.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: "🚀",
              title: "Growth & Impact",
              desc: "Work on challenging problems that make a real difference. Ship features used by thousands of companies worldwide.",
            },
            {
              icon: "🌍",
              title: "Remote-First Culture",
              desc: "Work from anywhere in the world. We value output and impact over hours spent in an office.",
            },
            {
              icon: "💎",
              title: "Competitive Benefits",
              desc: "Top-tier compensation, equity, unlimited PTO, learning budgets, and best-in-class health coverage.",
            },
          ].map((value, i) => (
            <div
              key={i}
              className="card-hover bg-white rounded-2xl p-8 border border-surface-100 shadow-sm"
            >
              <div className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center text-2xl mb-6">
                {value.icon}
              </div>
              <h3 className="text-xl font-semibold text-surface-900 mb-3">
                {value.title}
              </h3>
              <p className="text-surface-500 leading-relaxed">{value.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-surface-900 to-surface-800 p-12 sm:p-16">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="relative text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to make an impact?
            </h2>
            <p className="text-lg text-surface-300 mb-8 max-w-xl mx-auto">
              Explore our open positions and find the perfect role for your career.
            </p>
            <Link
              href="/careers"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-primary-500 text-white font-semibold text-lg hover:bg-primary-400 hover:-translate-y-0.5 transition-all duration-300 shadow-lg shadow-primary-500/25"
            >
              Browse Careers →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
