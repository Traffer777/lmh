import { prisma } from "@/lib/prisma";
import { notifyOrderPaid, notifyTrackNumber } from "@/lib/telegram";
import { createShipment, getShipmentTrack } from "@/lib/cdek";
import { emailTrackNumber } from "@/lib/email";

// Регистрирует отправление СДЭК для оплаченного заказа и сохраняет трек-номер.
// Вызывается в фоне после оплаты; идемпотентно (не создаёт повторно).
async function registerCdekShipment(orderId: number): Promise<void> {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order || order.deliveryMethod !== "cdek" || !order.cdekPvzCode) return;
  if (order.trackNumber || order.cdekUuid) return; // уже создано

  const uuid = await createShipment({
    orderNumber: order.number,
    pvzCode: order.cdekPvzCode,
    recipientName: order.customerName,
    recipientPhone: order.phone,
    items: order.items.map((i) => ({ title: i.title, size: i.size, price: i.price, qty: i.qty })),
  });
  if (!uuid) return;
  await prisma.order.update({ where: { id: order.id }, data: { cdekUuid: uuid } });

  const track = await getShipmentTrack(uuid);
  if (track) {
    await prisma.order.update({ where: { id: order.id }, data: { trackNumber: track } });
    // Уведомляем владельца (Telegram) и покупателя (email, если указан).
    await notifyTrackNumber(order.number, track).catch(() => {});
    if (order.email) {
      await emailTrackNumber(order.email, order.number, track).catch(() => {});
    }
  }
}

// Помечает заказ оплаченным и списывает остатки по размерам.
// Идемпотентно: повторный вызов для уже оплаченного заказа ничего не делает.
// Возвращает true ТОЛЬКО при первом переходе new → paid (для side-effects:
// уведомления, начисление билетов конкурса и т.п.).
export async function markOrderPaid(orderNumber: string, paymentId?: string): Promise<boolean> {
  // Транзакция только пишет в БД; уведомление шлём после коммита (сеть внутри
  // транзакции держала бы её открытой).
  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { number: orderNumber },
      include: { items: true },
    });
    if (!order) return { status: "notfound" as const };
    if (order.status !== "new") return { status: "already" as const };

    for (const item of order.items) {
      if (item.productId == null) continue;
      const variant = await tx.productVariant.findFirst({
        where: { productId: item.productId, size: item.size },
      });
      if (variant) {
        await tx.productVariant.update({
          where: { id: variant.id },
          data: { stock: Math.max(0, variant.stock - item.qty) },
        });
      }
    }

    await tx.order.update({
      where: { id: order.id },
      data: { status: "paid", paymentId: paymentId ?? order.paymentId },
    });

    return { status: "paid" as const, order };
  });

  if (result.status !== "paid") return false;

  // Уведомляем владельца об оплате один раз — только при переходе new → paid.
  // В фоне, чтобы не задерживать ответ вебхука/страницы.
  {
    void notifyOrderPaid({
      number: result.order.number,
      items: result.order.items.map((i) => ({
        title: i.title,
        size: i.size,
        qty: i.qty,
        price: i.price,
      })),
      itemsTotal: result.order.itemsTotal,
      deliveryCost: result.order.deliveryCost,
      total: result.order.total,
      customerName: result.order.customerName,
      phone: result.order.phone,
      email: result.order.email,
      deliveryMethod: result.order.deliveryMethod,
      deliveryAddress: result.order.deliveryAddress,
      paymentMethod: result.order.paymentMethod,
      comment: result.order.comment,
    }).catch(() => {});

    // Регистрируем отправление СДЭК и получаем трек-номер (в фоне).
    void registerCdekShipment(result.order.id).catch(() => {});
  }

  return true;
}
