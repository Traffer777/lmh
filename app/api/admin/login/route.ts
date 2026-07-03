import { NextRequest, NextResponse } from "next/server";
import { checkCredentials, createSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  let login = "";
  let password = "";
  try {
    const body = await request.json();
    login = String(body.login ?? "");
    password = String(body.password ?? "");
  } catch {
    return NextResponse.json({ ok: false, error: "Некорректный запрос." }, { status: 400 });
  }
  if (!checkCredentials(login, password)) {
    return NextResponse.json({ ok: false, error: "Неверный логин или пароль." }, { status: 401 });
  }
  await createSession();
  return NextResponse.json({ ok: true });
}
