import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createCustomerSession } from "@/lib/customer-auth";

export async function POST(request: NextRequest) {
  let body: { login?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Некорректный запрос." }, { status: 400 });
  }

  const login = (body.login ?? "").trim();
  const password = body.password ?? "";
  if (!login || !password)
    return NextResponse.json({ ok: false, error: "Введите телефон/почту и пароль." }, { status: 400 });

  const email = login.toLowerCase();
  const phone = login.replace(/[^\d+]/g, "");

  const customer = await prisma.customer.findFirst({
    where: { OR: [{ email }, { phone }] },
  });
  if (!customer || !verifyPassword(password, customer.passwordHash)) {
    return NextResponse.json({ ok: false, error: "Неверный логин или пароль." }, { status: 401 });
  }

  await createCustomerSession(customer.id);
  return NextResponse.json({ ok: true });
}
