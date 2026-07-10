import { prisma } from "@/lib/prisma";
import KanbanBoard from "./KanbanBoard";

export const dynamic = "force-dynamic";

export default async function CandidatesPage() {
  const candidates = await prisma.candidate.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      job: {
        select: { title: true, department: true },
      },
    },
  });

  const serialized = candidates.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    stage: c.stage,
    createdAt: c.createdAt.toISOString(),
    job: c.job,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">
            Candidates Pipeline
          </h1>
          <p className="text-surface-500 mt-1">
            Drag and drop candidates between stages • {candidates.length} total
            candidates
          </p>
        </div>
        <a
          href="/api/candidates/export"
          target="_blank"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-surface-100 hover:bg-surface-200 text-surface-700 text-sm font-medium rounded-xl border border-surface-200 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </a>
      </div>

      <KanbanBoard candidates={serialized} />
    </div>
  );
}
