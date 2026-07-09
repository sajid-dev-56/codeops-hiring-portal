import { GoogleGenAI, Type } from "@google/genai";
import { prisma } from "@/lib/prisma";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeCandidateApplication(candidateId: string) {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is not set. Skipping AI screening.");
    return;
  }

  try {
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      include: { job: true },
    });

    if (!candidate) return;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        score: {
          type: Type.INTEGER,
          description: "Match score out of 100 based on how well the candidate fits the job requirements",
        },
        summary: {
          type: Type.STRING,
          description: "A brief 2-3 sentence summary evaluating the candidate's fit.",
        },
        skills: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of key skills identified in the application.",
        },
      },
      required: ["score", "summary", "skills"],
    };

    const prompt = `
    You are an expert technical recruiter analyzing a candidate application for the role of ${candidate.job.title} (${candidate.job.department}).
    
    Job Description:
    ${candidate.job.description}
    
    Candidate Application Details:
    Name: ${candidate.name}
    Expected Salary: ${candidate.expectedSalary || "Not specified"}
    Notice Period: ${candidate.noticePeriod || "Not specified"}
    Portfolio: ${candidate.portfolioUrl || "Not provided"}
    Cover Letter/Experience:
    ${candidate.coverLetter || "No cover letter provided."}
    
    Analyze the candidate's application against the job description. Return a match score (0-100), a short summary of their fit, and a list of key skills.
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
      
      await prisma.candidate.update({
        where: { id: candidateId },
        data: {
          aiScore: result.score,
          aiSummary: result.summary,
          aiSkills: result.skills,
        },
      });
    }

  } catch (error) {
    console.error("AI Screening failed:", error);
  }
}
