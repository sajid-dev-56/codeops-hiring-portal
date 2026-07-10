"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createJobSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createJob(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const raw = {
    title: formData.get("title") as string,
    slug: formData.get("slug") as string,
    department: formData.get("department") as string,
    status: formData.get("status") as string,
    priority: formData.get("priority") as string,
    headcount: Number(formData.get("headcount")),
    targetStartDate: formData.get("targetStartDate") as string || null,
    description: formData.get("description") as string,
    customQuestions: formData.get("customQuestions") as string || "[]",
  };

  const validated = createJobSchema.safeParse(raw);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  await prisma.job.create({
    data: {
      ...validated.data,
      customQuestions: validated.data.customQuestions ? JSON.parse(validated.data.customQuestions) : [],
      targetStartDate: validated.data.targetStartDate
        ? new Date(validated.data.targetStartDate)
        : null,
    },
  });

  revalidatePath("/admin/jobs");
  revalidatePath("/careers");
  redirect("/admin/jobs");
}

export async function updateJob(id: string, formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const raw = {
    title: formData.get("title") as string,
    slug: formData.get("slug") as string,
    department: formData.get("department") as string,
    status: formData.get("status") as string,
    priority: formData.get("priority") as string,
    headcount: Number(formData.get("headcount")),
    targetStartDate: formData.get("targetStartDate") as string || null,
    description: formData.get("description") as string,
    customQuestions: formData.get("customQuestions") as string || "[]",
  };

  const validated = createJobSchema.safeParse(raw);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  await prisma.job.update({
    where: { id },
    data: {
      ...validated.data,
      customQuestions: validated.data.customQuestions ? JSON.parse(validated.data.customQuestions) : [],
      targetStartDate: validated.data.targetStartDate
        ? new Date(validated.data.targetStartDate)
        : null,
    },
  });

  revalidatePath("/admin/jobs");
  revalidatePath("/careers");
  redirect("/admin/jobs");
}

export async function deleteJob(id: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  await prisma.job.delete({ where: { id } });

  revalidatePath("/admin/jobs");
  revalidatePath("/careers");
}
