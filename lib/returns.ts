import { COMPANY } from "@/lib/company";

// Возвраты и обмены принимаются только письменным заявлением на почту.
// Форма на /returns регистрирует заявку (номер В-0001) и собирает текст заявления,
// который покупатель отправляет со своей почты на RETURNS_EMAIL.

export const RETURNS_EMAIL = COMPANY.email;
export const RETURN_DAYS = 14;

export const RETURN_KINDS = [
  { value: "refund", label: "Возврат денег", hint: "товар надлежащего качества — не подошёл размер, не понравился" },
  { value: "exchange", label: "Обмен", hint: "на другой размер или модель" },
  { value: "defect", label: "Брак / недостаток", hint: "дефект, повреждение, пришло не то" },
] as const;

export const RETURN_STATUSES = [
  { value: "new", label: "Новая — ждём письмо" },
  { value: "review", label: "На рассмотрении" },
  { value: "approved", label: "Одобрена — ждём товар" },
  { value: "rejected", label: "Отказ" },
  { value: "done", label: "Завершена (деньги возвращены / обмен отправлен)" },
] as const;

export function returnKindLabel(v: string): string {
  return RETURN_KINDS.find((k) => k.value === v)?.label ?? v;
}

export function returnStatusLabel(v: string): string {
  return RETURN_STATUSES.find((s) => s.value === v)?.label ?? v;
}

export function returnNumber(id: number): string {
  return `В-${String(id).padStart(4, "0")}`;
}

// Последние 10 цифр телефона — чтобы +7 999…, 8 (999)… и 999… совпадали.
export function phoneKey(phone: string): string {
  return phone.replace(/\D/g, "").slice(-10);
}

export type ReturnLetterInput = {
  number: string;
  orderNumber: string;
  orderDate: string;
  kind: string;
  customerName: string;
  phone: string;
  email: string;
  items: string;
  amount: number;
  reason: string;
};

// Текст заявления — уходит письмом на почту магазина.
export function buildReturnLetter(r: ReturnLetterInput): { subject: string; body: string } {
  const subject = `Заявление ${r.number} — ${returnKindLabel(r.kind).toLowerCase()} по заказу ${r.orderNumber}`;
  const demand =
    r.kind === "exchange"
      ? "Прошу обменять товар, указанный ниже."
      : r.kind === "defect"
        ? "В товаре обнаружен недостаток. Прошу вернуть уплаченные за него денежные средства / заменить товар (ст. 18 Закона РФ «О защите прав потребителей»)."
        : "Прошу принять возврат товара надлежащего качества и вернуть уплаченные за него денежные средства (ст. 26.1 Закона РФ «О защите прав потребителей»).";
  const body = [
    `${COMPANY.status} ${COMPANY.legalName}`,
    `ИНН ${COMPANY.inn}, ОГРНИП ${COMPANY.ogrnip}`,
    `от: ${r.customerName}, тел. ${r.phone}, e-mail ${r.email}`,
    "",
    `ЗАЯВЛЕНИЕ ${r.number}`,
    `${returnKindLabel(r.kind)} по заказу ${r.orderNumber} от ${r.orderDate}`,
    "",
    demand,
    "",
    "Товар:",
    r.items,
    `Сумма: ${r.amount} ₽`,
    "",
    "Причина:",
    r.reason,
    "",
    "Денежные средства прошу вернуть тем же способом, которым был оплачен заказ.",
    "",
    "Фото товара и бирок прилагаю к письму.",
    "",
    `Дата: ${new Date().toLocaleDateString("ru-RU")}`,
    `${r.customerName}`,
  ].join("\n");
  return { subject, body };
}

export function mailtoHref(subject: string, body: string): string {
  return `mailto:${RETURNS_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
