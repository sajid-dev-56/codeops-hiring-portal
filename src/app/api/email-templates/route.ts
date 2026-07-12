import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const templates = await prisma.emailTemplate.findMany();
    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { type, subject, body } = await req.json();

    const template = await prisma.emailTemplate.upsert({
      where: { type },
      update: { subject, body },
      create: { type, subject, body },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error("Error saving template:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
