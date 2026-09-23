import { NextResponse } from "next/server";
import { getContestCounter } from "@/lib/contest-counter";

export const dynamic = "force-dynamic";

export async function GET() {
  const c = await getContestCounter();
  return NextResponse.json(c);
}
