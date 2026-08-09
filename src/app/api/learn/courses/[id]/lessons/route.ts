import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createLessonSchema } from "@/lib/validations";
import { sendNewLessonEmail } from "@/lib/email";

// GET /api/learn/courses/[id]/lessons
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const lessons = await prisma.lesson.findMany({
      where: { courseId: id },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(lessons);
  } catch (error) {
    console.error("Failed to fetch lessons:", error);
    return NextResponse.json({ error: "Failed to fetch lessons" }, { status: 500 });
  }
}

// POST /api/learn/courses/[id]/lessons
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = createLessonSchema.safeParse({ ...body, courseId: id });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Get next order value
    const lastLesson = await prisma.lesson.findFirst({
      where: { courseId: id },
      orderBy: { order: "desc" },
    });

    const lesson = await prisma.lesson.create({
      data: {
        courseId: id,
        title: parsed.data.title,
        description: parsed.data.description || null,
        videoUrl: parsed.data.videoUrl || null,
        videoType: parsed.data.videoType,
        order: parsed.data.order ?? (lastLesson ? lastLesson.order + 1 : 0),
      },
    });

    // Send email notification to enrolled students
    try {
      const course = await prisma.course.findUnique({
        where: { id },
        include: {
          enrollments: {
            include: { user: true }
          }
        }
      });

      if (course && course.enrollments.length > 0) {
        const emailPromises = course.enrollments
          .filter(e => e.user.email)
          .map(e => sendNewLessonEmail({
            studentName: e.user.name || "Student",
            studentEmail: e.user.email!,
            courseTitle: course.title,
            lessonTitle: lesson.title
          }));
        
        await Promise.allSettled(emailPromises);
      }
    } catch (emailError) {
      console.error("Failed to send new lesson notifications:", emailError);
      // We don't fail the request if emails fail
    }

    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    console.error("Failed to create lesson:", error);
    return NextResponse.json({ error: "Failed to create lesson" }, { status: 500 });
  }
}
