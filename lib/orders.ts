import { prisma } from "@/lib/prisma";

// Помечает заказ оплаченным и списывает остатки по размерам.
// Идемпотентно: повторный вызов для уже оплаченного заказа ничего не делает.
export async function markOrderPaid(orderNumber: string, paymentId?: string): Promise<boolean> {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { number: orderNumber },
      include: { items: true },
    });
    if (!order) return false;
    if (order.status !== "new") return true; // уже обработан

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

    // TODO (фаза 2): отправить уведомление в Telegram/на почту.
    return true;
  });
}
