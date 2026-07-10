"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { sendStageChangeEmail } from "@/lib/email";

export async function updateCandidateStage(candidateId: string, stage: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
    include: { job: true },
  });

  if (!candidate) throw new Error("Candidate not found");

  if (candidate.stage !== stage) {
    await prisma.candidate.update({
      where: { id: candidateId },
      data: { stage: stage as never },
    });

    await sendStageChangeEmail({
      candidateName: candidate.name,
      candidateEmail: candidate.email,
      jobTitle: candidate.job.title,
      newStage: stage,
    });
  }

  revalidatePath("/admin/candidates");
  revalidatePath("/admin");
}

export async function addNote(candidateId: string, content: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  await prisma.note.create({
    data: {
      candidateId,
      content,
      author: "Admin",
    },
  });

  revalidatePath(`/admin/candidates/${candidateId}`);
}

export async function createInterview(data: {
  candidateId: string;
  round: string;
  interviewer: string;
  interviewDate: string;
  score?: number | null;
  decision?: string | null;
  notes?: string;
}) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  await prisma.interview.create({
    data: {
      candidateId: data.candidateId,
      round: data.round,
      interviewer: data.interviewer,
      interviewDate: new Date(data.interviewDate),
      score: data.score || null,
      decision: (data.decision as never) || null,
      notes: data.notes || null,
    },
  });

  revalidatePath(`/admin/candidates/${data.candidateId}`);
  revalidatePath("/admin/interviews");
}

export async function updateInterview(
  interviewId: string,
  data: {
    score?: number | null;
    decision?: string | null;
    notes?: string;
  }
) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  await prisma.interview.update({
    where: { id: interviewId },
    data: {
      score: data.score,
      decision: (data.decision as never) || null,
      notes: data.notes,
    },
  });

  revalidatePath("/admin/interviews");
}

export async function runAiScreening(candidateId: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const { analyzeCandidateApplication } = await import("@/lib/ai");
  await analyzeCandidateApplication(candidateId);

  revalidatePath(`/admin/candidates/${candidateId}`);
}
