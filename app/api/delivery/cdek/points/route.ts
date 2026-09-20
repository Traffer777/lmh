import { NextRequest, NextResponse } from "next/server";
import { listPvz } from "@/lib/cdek";

export const dynamic = "force-dynamic";

// Список ПВЗ СДЭК в городе. GET /api/delivery/cdek/points?city=270
export async function GET(request: NextRequest) {
  const city = Number(request.nextUrl.searchParams.get("city"));
  if (!Number.isFinite(city) || city <= 0) {
    return NextResponse.json({ ok: false, error: "Не указан город." }, { status: 400 });
  }
  const points = await listPvz(city);
  return NextResponse.json({ ok: true, points });
}
