import { NextResponse } from "next/server";
import { getGlobalLeaderboard } from "@/lib/leaderboard";

// GET /api/learn/leaderboard — global student leaderboard
export async function GET() {
  try {
    const leaderboard = await getGlobalLeaderboard();
    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error("Failed to fetch leaderboard:", error);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
