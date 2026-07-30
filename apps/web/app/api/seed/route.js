import { seedTransactions } from "@/actions/seed";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function GET() {
  if (env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result = await seedTransactions();
  return NextResponse.json(result);
}
