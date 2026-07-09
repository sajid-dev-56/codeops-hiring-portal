import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { ChatBox } from "@/components/ChatBox";

export default async function CandidateDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/candidate/login");

  const candidate = await prisma.candidate.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      job: true,
      interviews: {
        orderBy: { interviewDate: 'desc' }
      }
    }
  });

  if (!candidate) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-surface-200 p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">No Application Found</h2>
        <p className="text-surface-500">We couldn't find an application associated with your account.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-surface-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-surface-200 bg-surface-50/50">
          <h3 className="text-lg font-medium leading-6 text-surface-900">Application Status</h3>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-surface-500">Position</p>
              <p className="text-lg font-semibold text-surface-900">{candidate.job.title}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-surface-500">Current Stage</p>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 uppercase tracking-wider">
                {candidate.stage}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-surface-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-surface-200 bg-surface-50/50">
          <h3 className="text-lg font-medium leading-6 text-surface-900">Interviews</h3>
        </div>
        <div className="px-6 py-5">
          {candidate.interviews.length > 0 ? (
            <ul className="divide-y divide-surface-200">
              {candidate.interviews.map(interview => (
                <li key={interview.id} className="py-4 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-surface-900">{interview.round} Interview</p>
                    <p className="text-sm text-surface-500">
                      {format(new Date(interview.interviewDate), "MMMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-surface-500">No interviews scheduled yet.</p>
          )}
        </div>
      </div>

      <div className="mt-8">
        <ChatBox candidateId={candidate.id} currentRole="CANDIDATE" />
      </div>
    </div>
  );
}
