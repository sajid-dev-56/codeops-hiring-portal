import { NextRequest, NextResponse } from "next/server";
import { ai } from "@/lib/gemini";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();
    const { messages, role } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Determine context based on role
    let systemInstruction = "You are JIYA, a helpful AI assistant for the Hiring Portal.";
    if (role === "ADMIN") {
      systemInstruction = "You are JIYA, an advanced AI HR Assistant for the admin dashboard. You help parse resumes, draft emails, and evaluate candidates. You should be professional, concise, and helpful to the HR team.";
    } else if (role === "CANDIDATE") {
      systemInstruction = "You are JIYA, a friendly AI assistant for job candidates. You help them understand the hiring process, give tips on interviews, and answer questions about the company. Be encouraging and polite.";
    }

    // Convert chat history for Gemini
    const contents = messages.map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    return NextResponse.json({
      role: "assistant",
      content: response.text,
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
