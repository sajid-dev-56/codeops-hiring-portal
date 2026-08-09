import { NextRequest, NextResponse } from "next/server";
import { ai } from "@/lib/gemini";
import { auth } from "@/lib/auth";
import { Type, Schema } from "@google/genai";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { quizId } = await params;
    const body = await req.json();
    const { inputType, content, numQuestions } = body;

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const count = numQuestions || 12;

    const responseSchema: Schema = {
      type: Type.ARRAY,
      description: "List of multiple choice questions",
      items: {
        type: Type.OBJECT,
        properties: {
          text: {
            type: Type.STRING,
            description: "The text of the question",
          },
          options: {
            type: Type.ARRAY,
            description: "An array of exactly 4 strings representing the options",
            items: {
              type: Type.STRING,
            },
          },
          correctOption: {
            type: Type.INTEGER,
            description: "The index (0 to 3) of the correct option",
          },
        },
        required: ["text", "options", "correctOption"],
      },
    };

    let promptContents: any[] = [];
    const promptInstructions = `You are an expert educational assessment creator. Generate exactly ${count} highly challenging multiple choice questions based on the provided content. If the content is generic, test deep conceptual knowledge. Return ONLY a JSON array of objects, where each object has 'text', 'options' (array of 4 strings), and 'correctOption' (0-3 index). DO NOT include any other text.`;

    if (inputType === "pdf") {
      // content is base64 string
      promptContents = [
        {
          role: "user",
          parts: [
            { text: promptInstructions },
            {
              inlineData: {
                mimeType: "application/pdf",
                data: content,
              },
            },
          ],
        },
      ];
    } else {
      // content is plain text or HTML
      promptContents = [
        {
          role: "user",
          parts: [
            { text: promptInstructions + "\n\nContent:\n" + content },
          ],
        },
      ];
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: promptContents,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response from AI");
    }

    const questions = JSON.parse(responseText);

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate questions using AI" }, { status: 500 });
  }
}
