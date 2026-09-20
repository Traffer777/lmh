import { NextRequest, NextResponse } from "next/server";
import { searchCities } from "@/lib/cdek";

export const dynamic = "force-dynamic";

// Поиск города СДЭК по названию. GET /api/delivery/cdek/cities?q=Новосибирск
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  if (q.trim().length < 2) return NextResponse.json({ ok: true, cities: [] });
  const cities = await searchCities(q);
  return NextResponse.json({ ok: true, cities });
}
