import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { initPayment } from "@/lib/yookassa";
import { initInstallmentPayment } from "@/lib/tbank-installment";
import { getCurrentCustomerId } from "@/lib/customer-auth";
import { DELIVERY_METHODS, PAYMENT_METHODS, FREE_SHIPPING_THRESHOLD, isSupportDelivery } from "@/lib/constants";
import { notifyNewOrder } from "@/lib/telegram";
import { calcToCity } from "@/lib/cdek";
import { stickerPackPrice } from "@/lib/stickers";

type IncomingItem = {
  productId: number;
  size: string;
  qty: number;
  custom?: { name?: string; number?: string };
};
type Body = {
  items: IncomingItem[];
  customer: { name: string; phone: string; email?: string };
  delivery: {
    method: string;
    address?: string;
    // Для СДЭК: выбранный город и пункт выдачи.
    cityCode?: number;
    cityName?: string;
    pvzCode?: string;
    pvzAddress?: string;
  };
  paymentMethod: string;
  comment?: string;
  telegramId?: string;
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

  const { items, customer, delivery, paymentMethod, comment, telegramId } = body;

  // Валидация формы
  if (!items?.length) return NextResponse.json({ ok: false, error: "Корзина пуста." }, { status: 400 });
  if (!customer?.name?.trim()) return NextResponse.json({ ok: false, error: "Укажите имя." }, { status: 400 });
  if (!customer?.phone?.trim()) return NextResponse.json({ ok: false, error: "Укажите телефон." }, { status: 400 });

  const deliveryDef = DELIVERY_METHODS.find((d) => d.value === delivery?.method);
  if (!deliveryDef) return NextResponse.json({ ok: false, error: "Выберите способ доставки." }, { status: 400 });
  // Для СДЭК адрес не вводят вручную — нужен выбранный город + ПВЗ (см. ниже).
  if (delivery.method !== "pickup" && delivery.method !== "telegram" && delivery.method !== "cdek" && !delivery.address?.trim())
    return NextResponse.json({ ok: false, error: "Укажите адрес / пункт выдачи (для Беларуси и других стран — страну и город)." }, { status: 400 });

  const cityCode = Number(delivery.cityCode);
  if (delivery.method === "cdek" && (!Number.isFinite(cityCode) || cityCode <= 0 || !delivery.pvzCode?.trim()))
    return NextResponse.json({ ok: false, error: "Для доставки СДЭК выберите город и пункт выдачи." }, { status: 400 });

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
    if (product.releaseAt && product.releaseAt.getTime() > Date.now())
      return NextResponse.json(
        { ok: false, error: `«${product.title}» — старт продаж ${product.releaseAt.toLocaleString("ru-RU")}.` },
        { status: 400 },
      );
    const variant = product.variants.find((v) => v.size === it.size);
    if (!variant) return NextResponse.json({ ok: false, error: `Нет размера ${it.size}.` }, { status: 400 });
    const qty = Math.max(1, Math.floor(it.qty));
    if (variant.stock < qty)
      return NextResponse.json(
        { ok: false, error: `«${product.title}» (${it.size}): в наличии ${variant.stock} шт.` },
        { status: 409 },
      );
    // Персональное нанесение (имя/номер на спине) — фиксируем в снимке названия,
    // чтобы попало в заказ и в уведомление владельцу.
    const cn = it.custom?.name?.trim().slice(0, 14);
    const cnum = it.custom?.number?.trim().replace(/\D/g, "").slice(0, 3);
    const customSuffix =
      cn || cnum ? ` [нанесение: ${cn ?? ""}${cnum ? ` №${cnum}` : ""}]` : "";
    // Для стикеров цена зависит от размера пачки (50/100/500/1000 шт); иначе — цена товара.
    const unitPrice = stickerPackPrice(product.slug, it.size) ?? product.price;
    itemsTotal += unitPrice * qty;
    orderItems.push({
      productId: product.id,
      title: product.title + customSuffix,
      size: it.size,
      price: unitPrice,
      qty,
    });
  }

  // Стоимость доставки считаем на сервере (клиенту не доверяем).
  // Бесплатно от порога; для СДЭК — реальный тариф по API до ПВЗ; иначе базовый тариф.
  let deliveryCost: number;
  if (itemsTotal >= FREE_SHIPPING_THRESHOLD) {
    deliveryCost = 0;
  } else if (delivery.method === "cdek") {
    const totalQty = orderItems.reduce((s, i) => s + i.qty, 0);
    const quote = await calcToCity(cityCode, totalQty);
    if (!quote) {
      return NextResponse.json(
        { ok: false, error: "Не удалось рассчитать доставку СДЭК. Выберите пункт выдачи заново." },
        { status: 502 },
      );
    }
    deliveryCost = quote.cost;
  } else {
    deliveryCost = deliveryDef.cost;
  }

  // Для СДЭК сохраняем выбранный ПВЗ; иначе — введённый адрес.
  const storedAddress =
    delivery.method === "cdek"
      ? `СДЭК ПВЗ: ${delivery.pvzAddress ?? ""}${delivery.cityName ? `, ${delivery.cityName}` : ""} (${delivery.pvzCode})`
      : delivery.address?.trim() || null;

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
      deliveryAddress: storedAddress,
      cdekPvzCode: delivery.method === "cdek" ? delivery.pvzCode ?? null : null,
      deliveryCost,
      comment: comment?.trim() || null,
      telegramId: telegramId?.trim() || null,
      paymentMethod,
      itemsTotal,
      total,
      status: "new",
      items: { create: orderItems },
    },
  });

  // Уведомление владельцу — не блокируем оформление (шлём в фоне с ретраями).
  void notifyNewOrder({
    number,
    items: orderItems,
    itemsTotal,
    deliveryCost,
    total,
    customerName: order.customerName,
    phone: order.phone,
    email: order.email,
    deliveryMethod: order.deliveryMethod,
    deliveryAddress: order.deliveryAddress,
    paymentMethod: order.paymentMethod,
    comment: order.comment,
  }).catch(() => {});

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
    items: orderItems.map((i) => ({ title: i.title, price: i.price, qty: i.qty })),
    deliveryCost,
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
