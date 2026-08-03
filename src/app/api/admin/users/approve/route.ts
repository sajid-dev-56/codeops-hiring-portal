import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, status } = await req.json();

    if (!userId || !["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { accountStatus: status },
    });

    return NextResponse.json({ message: "User status updated", user: updatedUser });
  } catch (error) {
    console.error("Failed to update user status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
