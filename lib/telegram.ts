import { deliveryLabel, paymentLabel } from "@/lib/constants";

type OrderNotification = {
  number: string;
  items: { title: string; size: string; qty: number; price: number }[];
  itemsTotal: number;
  deliveryCost: number;
  total: number;
  customerName: string;
  phone: string;
  email?: string | null;
  deliveryMethod: string;
  deliveryAddress?: string | null;
  paymentMethod: string;
  comment?: string | null;
};

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Список chat_id получателей. TELEGRAM_CHAT_ID может содержать несколько id
// через запятую/пробел/точку с запятой — уведомление уйдёт на каждый аккаунт.
// (Каждый получатель должен сам нажать Start у бота, иначе Telegram не доставит.)
function chatIds(): string[] {
  const raw = process.env.TELEGRAM_CHAT_ID ?? "";
  return raw
    .split(/[\s,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// Отправка одному chat_id с повторами. Российский хостинг периодически
// подтормаживает связь с api.telegram.org, поэтому пробуем несколько раз и
// проверяем ответ (res.ok + result.ok), а не просто отсутствие исключения.
async function sendToChat(token: string, chatId: string, text: string): Promise<boolean> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    // Таймаут на попытку — чтобы зависший запрос к Telegram не держал вызов.
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
        signal: ctrl.signal,
      });
      if (res.ok) {
        const json = (await res.json().catch(() => null)) as { ok?: boolean } | null;
        if (json?.ok) return true;
      }
    } catch {
      // сеть недоступна / таймаут — пробуем ещё раз
    } finally {
      clearTimeout(timer);
    }
    if (attempt < 3) await new Promise((r) => setTimeout(r, 1000 * attempt));
  }
  return false;
}

// Рассылка на все настроенные аккаунты. Каждый получатель — независимо
// (со своими повторами), чтобы сбой одного не блокировал остальных.
async function sendTelegram(text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const ids = chatIds();
  if (!token || ids.length === 0) return false;
  const results = await Promise.all(ids.map((id) => sendToChat(token, id, text)));
  return results.some(Boolean);
}

function orderLines(order: OrderNotification): string[] {
  const itemsText = order.items
    .map((i) => `• ${escapeHtml(i.title)} (${i.size}) × ${i.qty} — ${i.price * i.qty}₽`)
    .join("\n");
  return [
    itemsText,
    "",
    `Товары: ${order.itemsTotal}₽`,
    order.deliveryCost > 0 ? `Доставка: ${order.deliveryCost}₽` : "Доставка: бесплатно",
    `<b>Итого: ${order.total}₽</b>`,
    "",
    `Клиент: ${escapeHtml(order.customerName)}`,
    `Телефон: ${escapeHtml(order.phone)}`,
    order.email ? `Email: ${escapeHtml(order.email)}` : null,
    `Доставка: ${escapeHtml(deliveryLabel(order.deliveryMethod))}`,
    order.deliveryAddress ? `Адрес: ${escapeHtml(order.deliveryAddress)}` : null,
    `Оплата: ${escapeHtml(paymentLabel(order.paymentMethod))}`,
    order.comment ? `Комментарий: ${escapeHtml(order.comment)}` : null,
  ].filter(Boolean) as string[];
}

// Уведомление владельцу о новом заказе (создан, ожидает оплату).
export async function notifyNewOrder(order: OrderNotification): Promise<void> {
  const text = [`🆕 <b>Новый заказ ${escapeHtml(order.number)}</b>`, "", ...orderLines(order)].join("\n");
  await sendTelegram(text);
}

// Уведомление владельцу об оплате заказа (деньги поступили).
export async function notifyOrderPaid(order: OrderNotification): Promise<void> {
  const text = [`💰 <b>Заказ оплачен ${escapeHtml(order.number)}</b>`, "", ...orderLines(order)].join("\n");
  await sendTelegram(text);
}

// Уведомление владельцу о трек-номере СДЭК по заказу.
export async function notifyTrackNumber(orderNumber: string, track: string): Promise<void> {
  const text = [
    `📦 <b>СДЭК: трек по заказу ${escapeHtml(orderNumber)}</b>`,
    "",
    `Трек-номер: <code>${escapeHtml(track)}</code>`,
    `Отслеживание: https://www.cdek.ru/ru/tracking?order_id=${encodeURIComponent(track)}`,
  ].join("\n");
  await sendTelegram(text);
}
