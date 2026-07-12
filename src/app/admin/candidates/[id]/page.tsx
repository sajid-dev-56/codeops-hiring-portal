import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import CandidateDetailClient from "./CandidateDetailClient";
import RunAiScreeningButton from "./RunAiScreeningButton";
import { ChatBox } from "@/components/ChatBox";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

const stageLabels: Record<string, string> = {
  APPLIED: "Applied",
  SCREENING: "Screening",
  INTERVIEW_1: "Interview 1",
  INTERVIEW_2: "Interview 2",
  TEST: "Test",
  FINAL: "Final",
  OFFER: "Offer",
  HIRED: "Hired",
  REJECTED: "Rejected",
};

const stageColors: Record<string, string> = {
  APPLIED: "bg-blue-50 text-blue-700 border-blue-200",
  SCREENING: "bg-indigo-50 text-indigo-700 border-indigo-200",
  INTERVIEW_1: "bg-violet-50 text-violet-700 border-violet-200",
  INTERVIEW_2: "bg-purple-50 text-purple-700 border-purple-200",
  TEST: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
  FINAL: "bg-pink-50 text-pink-700 border-pink-200",
  OFFER: "bg-amber-50 text-amber-700 border-amber-200",
  HIRED: "bg-green-50 text-green-700 border-green-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
};

const decisionLabels: Record<string, { label: string; class: string }> = {
  STRONG_YES: { label: "Strong Yes", class: "text-green-600" },
  YES: { label: "Yes", class: "text-green-500" },
  MAYBE: { label: "Maybe", class: "text-amber-500" },
  NO: { label: "No", class: "text-red-500" },
  STRONG_NO: { label: "Strong No", class: "text-red-600" },
};

export default async function CandidateDetailPage({ params }: Props) {
  const { id } = await params;

  const candidate = await prisma.candidate.findUnique({
    where: { id },
    include: {
      job: true,
      interviews: { orderBy: { interviewDate: "desc" } },
      notes: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!candidate) notFound();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-surface-400">
        <Link
          href="/admin/candidates"
          className="hover:text-primary-600 transition-colors"
        >
          Candidates
        </Link>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-surface-600">{candidate.name}</span>
      </nav>

      {/* Header */}
      <div className="bg-white dark:bg-surface-900/40 dark:backdrop-blur-xl rounded-xl border border-surface-100 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start gap-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {candidate.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
                {candidate.name}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  stageColors[candidate.stage]
                }`}
              >
                {stageLabels[candidate.stage]}
              </span>
            </div>
            <p className="text-surface-500">
              Applied for{" "}
              <Link
                href={`/admin/jobs/${candidate.job.id}/edit`}
                className="text-primary-600 hover:underline font-medium"
              >
                {candidate.job.title}
              </Link>{" "}
              • {candidate.job.department}
            </p>
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 pt-6 border-t border-surface-100">
          {[
            { label: "Email", value: candidate.email, icon: "✉️" },
            { label: "Phone", value: candidate.phone, icon: "📞" },
            {
              label: "Portfolio",
              value: candidate.portfolioUrl,
              icon: "🔗",
              isLink: true,
            },
            {
              label: "Expected Salary",
              value: candidate.expectedSalary,
              icon: "💰",
            },
            {
              label: "Notice Period",
              value: candidate.noticePeriod,
              icon: "⏰",
            },
            {
              label: "Applied On",
              value: new Date(candidate.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              }),
              icon: "📅",
            },
          ]
            .filter((f) => f.value)
            .map((field) => (
              <div key={field.label} className="flex items-start gap-3">
                <span className="text-lg">{field.icon}</span>
                <div>
                  <p className="text-xs text-surface-400 font-medium uppercase tracking-wider">
                    {field.label}
                  </p>
                  {field.isLink ? (
                    <a
                      href={field.value!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary-600 hover:underline"
                    >
                      {field.value}
                    </a>
                  ) : (
                    <p className="text-sm text-surface-900 dark:text-white">{field.value}</p>
                  )}
                </div>
              </div>
            ))}
        </div>

        {/* CV and Details Section */}
        <CandidateDetailClient
          candidateId={candidate.id}
          cvFileKey={candidate.cvFileKey}
          serializedNotes={candidate.notes.map((n) => ({
            id: n.id,
            content: n.content,
            author: n.author,
            createdAt: n.createdAt.toISOString(),
          }))}
          serializedInterviews={candidate.interviews.map((i) => ({
            id: i.id,
            round: i.round,
            interviewer: i.interviewer,
            interviewDate: i.interviewDate.toISOString(),
            score: i.score,
            decision: i.decision,
            notes: i.notes,
          }))}
          customAnswers={(candidate.customAnswers as Record<string, string>) || undefined}
        />

        {/* AI Screening Summary */}
        {candidate.aiScore !== null ? (
          <div className="mt-6 pt-6 border-t border-surface-100">
            <h3 className="text-sm font-semibold text-surface-700 mb-3 flex items-center gap-2">
              <span className="text-brand-600">✨</span> AI Screening Analysis
            </h3>
            <div className="bg-gradient-to-r from-brand-50 to-white border border-brand-100 rounded-xl p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                <div className={`text-2xl font-bold flex-shrink-0 ${candidate.aiScore >= 80 ? 'text-green-600' : candidate.aiScore >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                  {candidate.aiScore}/100
                </div>
                <div className="flex-1 text-sm text-surface-700">
                  {candidate.aiSummary}
                </div>
              </div>
              {candidate.aiSkills.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Key Skills Detected</h4>
                  <div className="flex flex-wrap gap-2">
                    {candidate.aiSkills.map(skill => (
                      <span key={skill} className="px-2.5 py-1 rounded-md bg-white dark:bg-surface-900/40 dark:backdrop-blur-xl border border-brand-200 text-xs font-medium text-brand-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <RunAiScreeningButton candidateId={candidate.id} />
        )}

        {/* Cover Letter */}
        {candidate.coverLetter && (
          <div className="mt-6 pt-6 border-t border-surface-100">
            <h3 className="text-sm font-semibold text-surface-700 mb-3">
              Cover Letter
            </h3>
            <div className="bg-surface-50 dark:bg-surface-800/50 rounded-xl p-4 text-sm text-surface-600 leading-relaxed whitespace-pre-wrap">
              {candidate.coverLetter}
            </div>
          </div>
        )}

        {/* Two-Way Chat */}
        <div className="mt-6 pt-6 border-t border-surface-100">
          <ChatBox candidateId={candidate.id} currentRole="ADMIN" />
        </div>
      </div>
    </div>
  );
}
