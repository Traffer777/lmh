import crypto from "crypto";
import { paymentMode, siteUrl } from "@/lib/payment-mode";

// Оплата долями через Т-Банк («Долями») — отдельный сервис от обычного эквайринга,
// подключается по отдельной заявке и работает на отдельном терминале, но API —
// тот же Tinkoff Acquiring (Init/Notification), терминал просто настроен банком
// под сервис «Долями» (сумма делится на 4 платежа: первый сразу, остальные три —
// автоматически раз в две недели).
// Подпись: SHA-256 от значений корневых параметров, отсортированных по ключу,
// с добавлением Password. Вложенные объекты (Receipt, DATA) в подпись не входят.

const API_BASE = "https://securepay.tinkoff.ru/v2";

function signToken(params: Record<string, string | number>, password: string): string {
  const data: Record<string, string | number> = { ...params, Password: password };
  const concat = Object.keys(data)
    .sort()
    .map((k) => data[k])
    .join("");
  return crypto.createHash("sha256").update(concat).digest("hex");
}

export type InitArgs = {
  orderNumber: string;
  amount: number; // рубли
  description: string;
  phone?: string;
  email?: string;
};

export type InitResult =
  | { ok: true; paymentUrl: string; paymentId?: string }
  | { ok: false; error: string };

// Создать платёж «Долями» и получить ссылку на оплату.
export async function initInstallmentPayment(args: InitArgs): Promise<InitResult> {
  const mode = paymentMode();

  // Демо: имитируем платёжную страницу.
  if (mode === "mock") {
    return {
      ok: true,
      paymentUrl: `${siteUrl()}/checkout/mock?order=${encodeURIComponent(args.orderNumber)}`,
      paymentId: `mock-${args.orderNumber}`,
    };
  }

  const terminalKey = process.env.TBANK_DOLYAMI_TERMINAL_KEY;
  const password = process.env.TBANK_DOLYAMI_PASSWORD;
  if (!terminalKey || !password) {
    return {
      ok: false,
      error: "Не заданы ключи Т-Банк «Долями» (TBANK_DOLYAMI_TERMINAL_KEY / TBANK_DOLYAMI_PASSWORD).",
    };
  }

  const root: Record<string, string | number> = {
    TerminalKey: terminalKey,
    Amount: Math.round(args.amount * 100), // в копейках
    OrderId: args.orderNumber,
    Description: args.description,
    NotificationURL: `${siteUrl()}/api/payment/notify-tbank`,
    SuccessURL: `${siteUrl()}/checkout/success?order=${encodeURIComponent(args.orderNumber)}`,
    FailURL: `${siteUrl()}/checkout/fail?order=${encodeURIComponent(args.orderNumber)}`,
  };
  const Token = signToken(root, password);

  const body: Record<string, unknown> = { ...root, Token };
  if (args.phone || args.email) {
    body.DATA = { Phone: args.phone ?? "", Email: args.email ?? "" };
  }

  try {
    const res = await fetch(`${API_BASE}/Init`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await res.json()) as {
      Success?: boolean;
      PaymentURL?: string;
      PaymentId?: string;
      Message?: string;
      Details?: string;
    };
    if (json.Success && json.PaymentURL) {
      return { ok: true, paymentUrl: json.PaymentURL, paymentId: json.PaymentId };
    }
    return { ok: false, error: json.Details || json.Message || "Т-Банк «Долями» отклонил платёж." };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Ошибка связи с Т-Банк «Долями»." };
  }
}

// Проверка подписи входящего уведомления (Notification) от Т-Банк «Долями».
export function verifyInstallmentNotification(payload: Record<string, unknown>): boolean {
  const password = process.env.TBANK_DOLYAMI_PASSWORD;
  if (!password) return false;
  const { Token, Receipt, DATA, ...rest } = payload as Record<string, string | number>;
  void Receipt;
  void DATA;
  const expected = signToken(rest, password);
  return expected === Token;
}
