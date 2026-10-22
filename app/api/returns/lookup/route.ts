import { NextRequest, NextResponse } from "next/server";
import { findReturnableOrder } from "../shared";

// Шаг 1 формы возврата: проверить заказ и отдать его позиции.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const res = await findReturnableOrder(String(body.orderNumber ?? ""), String(body.contact ?? ""));
  if ("error" in res) return NextResponse.json({ ok: false, error: res.error }, { status: 404 });
  const { order } = res;
  return NextResponse.json({
    ok: true,
    order: {
      number: order.number,
      date: order.createdAt.toLocaleDateString("ru-RU"),
      customerName: order.customerName,
      phone: order.phone,
      email: order.email ?? "",
      items: order.items.map((i) => ({ id: i.id, title: i.title, size: i.size, qty: i.qty, price: i.price })),
    },
  });
}
