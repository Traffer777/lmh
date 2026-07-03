import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { initPayment } from "@/lib/yookassa";
import { initInstallmentPayment } from "@/lib/tbank-installment";
import { getCurrentCustomerId } from "@/lib/customer-auth";
import { DELIVERY_METHODS, PAYMENT_METHODS, FREE_SHIPPING_THRESHOLD, isSupportDelivery } from "@/lib/constants";

type IncomingItem = { productId: number; size: string; qty: number };
type Body = {
  items: IncomingItem[];
  customer: { name: string; phone: string; email?: string };
  delivery: { method: string; address?: string };
  paymentMethod: string;
  comment?: string;
};

function orderNumber(): string {
  return `LMH-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
}

export async function POST(request: NextRequest) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Некорректный запрос." }, { status: 400 });
  }

  const { items, customer, delivery, paymentMethod, comment } = body;

  // Валидация формы
  if (!items?.length) return NextResponse.json({ ok: false, error: "Корзина пуста." }, { status: 400 });
  if (!customer?.name?.trim()) return NextResponse.json({ ok: false, error: "Укажите имя." }, { status: 400 });
  if (!customer?.phone?.trim()) return NextResponse.json({ ok: false, error: "Укажите телефон." }, { status: 400 });

  const deliveryDef = DELIVERY_METHODS.find((d) => d.value === delivery?.method);
  if (!deliveryDef) return NextResponse.json({ ok: false, error: "Выберите способ доставки." }, { status: 400 });
  if (delivery.method !== "pickup" && delivery.method !== "telegram" && !delivery.address?.trim())
    return NextResponse.json({ ok: false, error: "Укажите адрес / пункт выдачи (для Беларуси и других стран — страну и город)." }, { status: 400 });

  if (!PAYMENT_METHODS.some((p) => p.value === paymentMethod))
    return NextResponse.json({ ok: false, error: "Выберите способ оплаты." }, { status: 400 });

  // Пересчёт на сервере (цены и остатки берём из БД, клиенту не доверяем)
  const ids = [...new Set(items.map((i) => i.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: ids }, published: true },
    include: { variants: true, images: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });

  const orderItems: { productId: number; title: string; size: string; price: number; qty: number }[] = [];
  let itemsTotal = 0;

  for (const it of items) {
    const product = products.find((p) => p.id === it.productId);
    if (!product) return NextResponse.json({ ok: false, error: "Товар недоступен." }, { status: 400 });
    const variant = product.variants.find((v) => v.size === it.size);
    if (!variant) return NextResponse.json({ ok: false, error: `Нет размера ${it.size}.` }, { status: 400 });
    const qty = Math.max(1, Math.floor(it.qty));
    if (variant.stock < qty)
      return NextResponse.json(
        { ok: false, error: `«${product.title}» (${it.size}): в наличии ${variant.stock} шт.` },
        { status: 409 },
      );
    itemsTotal += product.price * qty;
    orderItems.push({ productId: product.id, title: product.title, size: it.size, price: product.price, qty });
  }

  const deliveryCost = itemsTotal >= FREE_SHIPPING_THRESHOLD ? 0 : deliveryDef.cost;
  const total = itemsTotal + deliveryCost;
  const number = orderNumber();
  const customerId = await getCurrentCustomerId();

  const order = await prisma.order.create({
    data: {
      number,
      customerId,
      customerName: customer.name.trim(),
      phone: customer.phone.trim(),
      email: customer.email?.trim() || null,
      deliveryMethod: delivery.method,
      deliveryAddress: delivery.address?.trim() || null,
      deliveryCost,
      comment: comment?.trim() || null,
      paymentMethod,
      itemsTotal,
      total,
      status: "new",
      items: { create: orderItems },
    },
  });

  // Доставка через поддержку (Беларусь / другие страны / нет СДЭК и Почты) —
  // оформляем без онлайн-оплаты: стоимость доставки и оплату согласуем в Telegram.
  if (isSupportDelivery(delivery.method)) {
    return NextResponse.json({ ok: true, number, support: true });
  }

  // Инициализация оплаты. «Разделить платёж на 4 части» — отдельный терминал
  // Т-Банк «Долями», остальные способы — ЮKassa.
  const initArgs = {
    orderNumber: number,
    amount: total,
    description: `Заказ ${number} в LMH`,
    phone: customer.phone,
    email: customer.email,
  };
  const pay =
    paymentMethod === "installment" ? await initInstallmentPayment(initArgs) : await initPayment(initArgs);

  if (!pay.ok) {
    return NextResponse.json({ ok: false, error: pay.error, number }, { status: 502 });
  }

  if (pay.paymentId) {
    await prisma.order.update({ where: { id: order.id }, data: { paymentId: pay.paymentId } });
  }

  return NextResponse.json({ ok: true, number, paymentUrl: pay.paymentUrl });
}
