import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditJobForm from "./EditJobForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditJobPage({ params }: Props) {
  const { id } = await params;
  const job = await prisma.job.findUnique({ where: { id } });

  if (!job) notFound();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900">Edit Job</h1>
        <p className="text-surface-500 mt-1">Update job listing details</p>
      </div>
      <EditJobForm job={job} />
    </div>
  );
}
