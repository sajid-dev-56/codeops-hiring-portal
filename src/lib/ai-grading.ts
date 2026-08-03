import { GoogleGenAI, Type } from "@google/genai";
import { prisma } from "@/lib/prisma";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function aiGradeSubmission(submissionId: string) {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is not set. Skipping AI grading.");
    return null;
  }

  try {
    const submission = await prisma.taskSubmission.findUnique({
      where: { id: submissionId },
      include: {
        task: {
          include: { course: true },
        },
        user: { select: { name: true, email: true } },
      },
    });

    if (!submission) return null;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        marks: {
          type: Type.INTEGER,
          description: `Score out of ${submission.task.maxMarks} based on the submission quality`,
        },
        feedback: {
          type: Type.STRING,
          description: "Detailed constructive feedback for the student about their submission",
        },
        strengths: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of strengths in the submission",
        },
        improvements: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of areas for improvement",
        },
      },
      required: ["marks", "feedback", "strengths", "improvements"],
    };

    const prompt = `
    You are an expert instructor evaluating a student's task submission for a coding course.
    
    Course: ${submission.task.course.title}
    Task: ${submission.task.title}
    Task Description: ${submission.task.description}
    Maximum Marks: ${submission.task.maxMarks}
    
    Student Submission:
    - Note/Description: ${submission.content || "No description provided"}
    - Submitted Link: ${submission.linkUrl || "No link provided"}
    
    Please evaluate this submission. Consider:
    1. Whether the submitted link is relevant to the task (GitHub repo, LinkedIn post, deployment URL, etc.)
    2. The quality of the student's description/notes
    3. Whether the submission appears to meet the task requirements
    4. If no link is provided, deduct significant marks
    
    Grade the submission out of ${submission.task.maxMarks} marks. Be fair but constructive.
    Provide detailed feedback that helps the student improve.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    if (response.text) {
      const result = JSON.parse(response.text);

      // Ensure marks don't exceed maxMarks
      const clampedMarks = Math.min(Math.max(0, result.marks), submission.task.maxMarks);

      const fullFeedback = [
        result.feedback,
        "",
        "**Strengths:**",
        ...result.strengths.map((s: string) => `• ${s}`),
        "",
        "**Areas for Improvement:**",
        ...result.improvements.map((i: string) => `• ${i}`),
      ].join("\n");

      await prisma.taskSubmission.update({
        where: { id: submissionId },
        data: {
          aiMarks: clampedMarks,
          aiFeedback: fullFeedback,
          status: "AI_GRADED",
        },
      });

      return { marks: clampedMarks, feedback: fullFeedback };
    }

    return null;
  } catch (error) {
    console.error("AI Grading failed:", error);
    return null;
  }
}
