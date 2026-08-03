import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { startOfDay, differenceInDays } from "date-fns";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { lastActivityDate: true, currentStreak: true, longestStreak: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const today = startOfDay(new Date());
    const lastActivity = user.lastActivityDate ? startOfDay(user.lastActivityDate) : null;

    let { currentStreak, longestStreak } = user;
    let updated = false;

    if (!lastActivity) {
      // First time activity
      currentStreak = 1;
      longestStreak = 1;
      updated = true;
    } else {
      const daysDiff = differenceInDays(today, lastActivity);
      
      if (daysDiff === 1) {
        // Logged in the next consecutive day
        currentStreak += 1;
        if (currentStreak > longestStreak) {
          longestStreak = currentStreak;
        }
        updated = true;
      } else if (daysDiff > 1) {
        // Streak broken
        currentStreak = 1;
        updated = true;
      }
      // If daysDiff === 0, already logged in today, no streak update needed
      // but we still update lastActivityDate to now()
    }

    // Always update lastActivityDate
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        lastActivityDate: new Date(),
        currentStreak,
        longestStreak,
      },
    });

    return NextResponse.json({ currentStreak, longestStreak }, { status: 200 });
  } catch (error) {
    console.error("Failed to update activity:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
