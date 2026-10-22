import { prisma } from "@/lib/prisma";
import { phoneKey } from "@/lib/returns";

// Найти заказ сайта по номеру + телефону (или e-mail) покупателя.
// Возвраты принимаются только по заказам, оформленным и оплаченным на сайте.
export async function findReturnableOrder(orderNumber: string, contact: string) {
  const number = orderNumber.trim().toUpperCase();
  if (!number) return { error: "Укажите номер заказа." } as const;
  const order = await prisma.order.findUnique({ where: { number }, include: { items: true } });
  const c = contact.trim().toLowerCase();
  const matches =
    order &&
    ((phoneKey(c).length === 10 && phoneKey(order.phone) === phoneKey(c)) ||
      (!!order.email && order.email.toLowerCase() === c));
  if (!order || !matches)
    return { error: "Заказ не найден. Проверьте номер заказа и телефон, указанный при оформлении." } as const;
  if (order.status === "new" || order.status === "canceled")
    return { error: "Этот заказ не был оплачен — возвращать по нему нечего." } as const;
  return { order } as const;
}
