import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createCustomerSession } from "@/lib/customer-auth";

function normPhone(p: string): string {
  const digits = p.replace(/[^\d+]/g, "");
  return digits;
}

export async function POST(request: NextRequest) {
  let body: { name?: string; phone?: string; email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Некорректный запрос." }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const phone = normPhone(body.phone ?? "");
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";

  if (!name) return NextResponse.json({ ok: false, error: "Укажите имя." }, { status: 400 });
  if (phone.replace(/\D/g, "").length < 10)
    return NextResponse.json({ ok: false, error: "Укажите корректный телефон." }, { status: 400 });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return NextResponse.json({ ok: false, error: "Укажите корректный e-mail." }, { status: 400 });
  if (password.length < 6)
    return NextResponse.json({ ok: false, error: "Пароль — минимум 6 символов." }, { status: 400 });

  const exists = await prisma.customer.findFirst({ where: { OR: [{ phone }, { email }] } });
  if (exists) {
    return NextResponse.json(
      { ok: false, error: "Аккаунт с таким телефоном или почтой уже есть. Войдите." },
      { status: 409 },
    );
  }

  const customer = await prisma.customer.create({
    data: { name, phone, email, passwordHash: hashPassword(password) },
  });

  // Привязать прошлые заказы гостя с теми же контактами.
  await prisma.order.updateMany({
    where: { customerId: null, OR: [{ phone }, { email }] },
    data: { customerId: customer.id },
  });

  await createCustomerSession(customer.id);
  return NextResponse.json({ ok: true });
}
