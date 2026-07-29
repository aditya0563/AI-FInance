import { seedTransactions } from "@/actions/seed";
import { NextResponse } from "next/server";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result = await seedTransactions();
  return NextResponse.json(result);
}
