import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const userId = session.user.id;

    // Get or create conversation history
    let conversation = await prisma.mentorConversation.findFirst({
      where: { userId },
    });

    let history: { role: string; parts: { text: string }[] }[] = [];
    if (conversation) {
      history = (conversation.messages as any) || [];
    }

    // Append user message to history
    history.push({ role: "user", parts: [{ text: message }] });

    // Fetch user context for the AI
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        enrollments: { include: { course: { select: { title: true } } } },
        dailyGoals: { where: { date: new Date() } },
      },
    });

    const courses = user?.enrollments.map((e) => e.course.title).join(", ") || "None";
    const streak = user?.currentStreak || 0;
    const goals = user?.dailyGoals.map((g) => g.text).join(", ") || "None";

    const systemInstruction = `You are a helpful AI Personal Mentor for a student on the CodeOps Pro Learning Platform. 
Your goal is to guide them, answer their programming questions, and keep them motivated.
Student Context:
- Enrolled Courses: ${courses}
- Current Learning Streak: ${streak} days
- Today's Goals: ${goals}
Be concise, encouraging, and format code nicely using markdown.`;

    // Initialize Google GenAI
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

    // Send full history up to this point
    // We send previous messages manually by generating the conversation via chat.sendMessage
    // Actually the SDK supports sending the whole history, or we can just pass the latest message and it maintains history in memory. 
    // Since this is a stateless API, we must pass the history.
    // Workaround: We can format the history into a single prompt for simplicity if `ai.chats.create` with history isn't fully supported without `history` array in v0.1.1.
    // Looking at the SDK, we can pass `history` to `ai.chats.create({ model, history, config })`.
    const aiChat = ai.chats.create({
      model: "gemini-2.5-flash",
      history: history.slice(0, -1), // Everything except the latest message
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const response = await aiChat.sendMessage({ message });
    const replyText = response.text || "I'm sorry, I couldn't generate a response.";

    // Append model reply
    history.push({ role: "model", parts: [{ text: replyText }] });

    // Save back to DB
    if (conversation) {
      await prisma.mentorConversation.update({
        where: { id: conversation.id },
        data: { messages: history },
      });
    } else {
      await prisma.mentorConversation.create({
        data: {
          userId,
          messages: history,
        },
      });
    }

    return NextResponse.json({ reply: replyText }, { status: 200 });
  } catch (error) {
    console.error("Mentor Chat Error:", error);
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversation = await prisma.mentorConversation.findFirst({
      where: { userId: session.user.id },
    });

    const messages = conversation ? conversation.messages : [];
    return NextResponse.json({ messages }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
