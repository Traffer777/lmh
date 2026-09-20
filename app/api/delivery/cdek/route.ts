import { NextRequest, NextResponse } from "next/server";
import { calcToCity } from "@/lib/cdek";

export const dynamic = "force-dynamic";

// Расчёт стоимости доставки СДЭК до ПВЗ по коду города назначения.
// GET /api/delivery/cdek?city=270&qty=2
export async function GET(request: NextRequest) {
  const city = Number(request.nextUrl.searchParams.get("city"));
  const qty = Math.max(1, Number(request.nextUrl.searchParams.get("qty") ?? "1") || 1);

  if (!Number.isFinite(city) || city <= 0) {
    return NextResponse.json({ ok: false, error: "Не указан город." }, { status: 400 });
  }

  const quote = await calcToCity(city, qty);
  if (!quote) {
    return NextResponse.json(
      { ok: false, error: "Не удалось рассчитать доставку для этого города." },
      { status: 502 },
    );
  }
  return NextResponse.json({ ok: true, ...quote });
}
