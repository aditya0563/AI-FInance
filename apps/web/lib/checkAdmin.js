import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function checkAdmin() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user || user.role !== "admin") {
    const error = new Error("Forbidden: Admin access required");
    error.status = 403;
    throw error;
  }

  return user;
}
