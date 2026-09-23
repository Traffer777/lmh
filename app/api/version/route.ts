import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    commit: "b58f552",
    deployed: new Date().toISOString(),
    version: 2,
  });
}
