import nodemailer from "nodemailer";

// Транзакционные письма покупателю через SMTP. Настройки берём из env; если они
// не заданы — модуль работает как no-op (писем не шлём, ошибок не роняем), чтобы
// отсутствие почты не ломало оформление/оплату.
// Требуемые env: SMTP_HOST, SMTP_USER, SMTP_PASS. Опц.: SMTP_PORT (по умолч. 465),
// SMTP_FROM (адрес отправителя, по умолч. = SMTP_USER).

function transport(): nodemailer.Transporter | null {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  const port = Number(process.env.SMTP_PORT || 465);
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 465 = implicit TLS; 587 = STARTTLS
    auth: { user, pass },
  });
}

function fromAddress(): string {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "";
  // Красивое имя отправителя, если задан голый адрес.
  return /</.test(from) ? from : `LMH <${from}>`;
}

// Базовая отправка. Возвращает true при успехе, false — если почта не настроена
// или отправка не удалась (не бросает).
export async function sendMail(to: string, subject: string, html: string): Promise<boolean> {
  const t = transport();
  if (!t || !to) return false;
  try {
    await t.sendMail({ from: fromAddress(), to, subject, html });
    return true;
  } catch {
    return false;
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Письмо покупателю с трек-номером СДЭК.
export async function emailTrackNumber(
  to: string,
  orderNumber: string,
  track: string,
): Promise<boolean> {
  const url = `https://www.cdek.ru/ru/tracking?order_id=${encodeURIComponent(track)}`;
  const on = escapeHtml(orderNumber);
  const tr = escapeHtml(track);
  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;color:#111">
    <h2 style="font-size:20px;margin:0 0 12px">Заказ ${on} передан в СДЭК</h2>
    <p style="margin:0 0 8px;font-size:15px">Ваш заказ отправлен. Трек-номер для отслеживания:</p>
    <p style="font-size:22px;font-weight:700;letter-spacing:1px;margin:0 0 16px">${tr}</p>
    <p style="margin:0 0 20px">
      <a href="${url}" style="display:inline-block;background:#e5321b;color:#fff;text-decoration:none;padding:12px 20px;border-radius:6px;font-weight:600">Отследить на сайте СДЭК</a>
    </p>
    <p style="font-size:13px;color:#666;margin:0">Спасибо, что выбрали LMH. Если ссылка не открывается, скопируйте трек-номер и введите его на cdek.ru.</p>
  </div>`;
  return sendMail(to, `LMH · заказ ${orderNumber} — трек-номер СДЭК`, html);
}
