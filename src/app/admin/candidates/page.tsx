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
      <div>
        <h1 className="text-2xl font-bold text-surface-900">
          Candidates Pipeline
        </h1>
        <p className="text-surface-500 mt-1">
          Drag and drop candidates between stages • {candidates.length} total
          candidates
        </p>
      </div>

      <KanbanBoard candidates={serialized} />
    </div>
  );
}
