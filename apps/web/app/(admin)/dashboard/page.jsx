import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";

export default async function AdminDashboard() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.clerkUserId, userId),
  });

  if (user?.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
      <p className="text-muted-foreground">Welcome to the restricted admin area.</p>
    </div>
  );
}
