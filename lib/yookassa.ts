import crypto from "crypto";
import { paymentMode, siteUrl } from "@/lib/payment-mode";

// Интеграция с ЮKassa (yookassa.ru).
// Режимы: mock (демо), test (тестовый магазин), live (боевой).
// ЮKassa не подписывает вебхуки — по рекомендации ЮKassa после уведомления
// платёж перезапрашивается по API, и доверяем только собственному ответу сервиса.

const API_BASE = "https://api.yookassa.ru/v3";

export { paymentMode, siteUrl };

function authHeader(shopId: string, secretKey: string): string {
  return "Basic " + Buffer.from(`${shopId}:${secretKey}`).toString("base64");
}

export type ReceiptItem = { title: string; price: number; qty: number };

export type InitArgs = {
  orderNumber: string;
  amount: number; // рубли
  description: string;
  phone?: string;
  email?: string;
  items: ReceiptItem[];
  deliveryCost?: number;
};

export type InitResult =
  | { ok: true; paymentUrl: string; paymentId?: string }
  | { ok: false; error: string };

// Создать платёж и получить ссылку на оплату (redirect на форму ЮKassa).
export async function initPayment(args: InitArgs): Promise<InitResult> {
  const mode = paymentMode();

  // Демо: имитируем платёжную страницу.
  if (mode === "mock") {
    return {
      ok: true,
      paymentUrl: `${siteUrl()}/checkout/mock?order=${encodeURIComponent(args.orderNumber)}`,
      paymentId: `mock-${args.orderNumber}`,
    };
  }

  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secretKey = process.env.YOOKASSA_SECRET_KEY;
  if (!shopId || !secretKey) {
    return { ok: false, error: "Не заданы ключи ЮKassa (YOOKASSA_SHOP_ID / YOOKASSA_SECRET_KEY)." };
  }
  if (!args.phone && !args.email) {
    return { ok: false, error: "Для чека по 54-ФЗ нужен телефон или email покупателя." };
  }

  // Чек 54-ФЗ: ИП на УСН/патенте, НДС не облагается.
  const receiptItems = args.items.map((i) => ({
    description: i.title.slice(0, 128),
    quantity: String(i.qty),
    amount: { value: i.price.toFixed(2), currency: "RUB" },
    vat_code: 1,
    payment_subject: "commodity",
    payment_mode: "full_payment",
  }));
  if (args.deliveryCost) {
    receiptItems.push({
      description: "Доставка",
      quantity: "1",
      amount: { value: args.deliveryCost.toFixed(2), currency: "RUB" },
      vat_code: 1,
      payment_subject: "service",
      payment_mode: "full_payment",
    });
  }

  const body = {
    amount: { value: args.amount.toFixed(2), currency: "RUB" },
    capture: true,
    confirmation: {
      type: "redirect",
      return_url: `${siteUrl()}/checkout/success?order=${encodeURIComponent(args.orderNumber)}`,
    },
    description: args.description,
    metadata: { orderNumber: args.orderNumber },
    receipt: {
      customer: { email: args.email || undefined, phone: args.phone || undefined },
      items: receiptItems,
    },
  };

  try {
    const res = await fetch(`${API_BASE}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader(shopId, secretKey),
        "Idempotence-Key": crypto.randomUUID(),
      },
      body: JSON.stringify(body),
    });
    const json = (await res.json()) as {
      id?: string;
      confirmation?: { confirmation_url?: string };
      description?: string;
    };
    if (res.ok && json.id && json.confirmation?.confirmation_url) {
      return { ok: true, paymentUrl: json.confirmation.confirmation_url, paymentId: json.id };
    }
    return { ok: false, error: json.description || "ЮKassa отклонила платёж." };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Ошибка связи с ЮKassa." };
  }
}

export type NotificationResult =
  | { ok: true; paid: boolean; orderNumber: string; paymentId: string }
  | { ok: false };

// Запрос платежа напрямую в API ЮKassa по его id (единый источник правды).
async function getPayment(
  paymentId: string,
): Promise<{ id: string; status?: string; metadata?: { orderNumber?: string } } | null> {
  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secretKey = process.env.YOOKASSA_SECRET_KEY;
  if (!shopId || !secretKey) return null;
  try {
    const res = await fetch(`${API_BASE}/payments/${paymentId}`, {
      headers: { Authorization: authHeader(shopId, secretKey) },
    });
    if (!res.ok) return null;
    return (await res.json()) as {
      id: string;
      status?: string;
      metadata?: { orderNumber?: string };
    };
  } catch {
    return null;
  }
}

// Обработка вебхука: тело уведомления не подписано, поэтому по id платежа
// перезапрашиваем его напрямую в API ЮKassa и верим только этому ответу.
export async function verifyAndFetchPayment(
  payload: Record<string, unknown>,
): Promise<NotificationResult> {
  const obj = payload.object as { id?: string } | undefined;
  const paymentId = obj?.id;
  if (!paymentId) return { ok: false };

  const json = await getPayment(paymentId);
  if (!json) return { ok: false };
  const orderNumber = json.metadata?.orderNumber;
  if (!orderNumber) return { ok: false };
  return { ok: true, paid: json.status === "succeeded", orderNumber, paymentId: json.id };
}

// Проверка статуса оплаты по id платежа (для страницы «спасибо»: вебхук мог
// не успеть прийти, поэтому спрашиваем ЮKassa напрямую). true = оплачен.
export async function isPaymentSucceeded(paymentId: string): Promise<boolean> {
  const json = await getPayment(paymentId);
  return json?.status === "succeeded";
}
