import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { serializeDecimal } from "@/lib/utils";

export async function updateDefaultAccount(
  accountId: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // First, unset any existing default account
    await db.account.updateMany({
      where: {
        userId: user.id,
        isDefault: true,
      },
      data: { isDefault: false },
    });

    // Then set the new default account
    const account = await db.account.update({
      where: {
        id: accountId,
        userId: user.id,
      },
      data: { isDefault: true },
    });

    revalidatePath("/dashboard");
    return { success: true, data: serializeDecimal(account) };
  } catch (error: any) {
    console.error("updateDefaultAccount error:", error);
    return { success: false, error: "An unexpected error occurred while updating the default account." };
  }
}
