import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { User } from "@prisma/client";

export async function checkAdmin(): Promise<User> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user || (user as any).role !== "admin") {
    const error: any = new Error("Forbidden: Admin access required");
    error.status = 403;
    throw error;
  }

  return user;
}
