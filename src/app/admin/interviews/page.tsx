import { prisma } from "@/lib/prisma";
import InterviewsClient from "./InterviewsClient";

export const dynamic = "force-dynamic";

export default async function InterviewsPage() {
  const interviews = await prisma.interview.findMany({
    orderBy: { interviewDate: "desc" },
    include: {
      candidate: {
        select: {
          name: true,
          email: true,
          job: { select: { title: true } },
        },
      },
    },
  });

  const serialized = interviews.map((i) => ({
    id: i.id,
    round: i.round,
    interviewer: i.interviewer,
    interviewDate: i.interviewDate.toISOString(),
    score: i.score,
    decision: i.decision,
    notes: i.notes,
    candidateId: i.candidateId,
    candidateName: i.candidate.name,
    candidateEmail: i.candidate.email,
    jobTitle: i.candidate.job.title,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Interviews</h1>
        <p className="text-surface-500 mt-1">
          {interviews.length} total interviews scheduled
        </p>
      </div>
      <InterviewsClient interviews={serialized} />
    </div>
  );
}
