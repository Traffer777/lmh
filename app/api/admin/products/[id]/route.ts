import { NextRequest, NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthed())) return NextResponse.json({ ok: false, error: "401" }, { status: 401 });
  const { id } = await params;
  const productId = Number(id);
  const body = await request.json();

  const title = String(body.title ?? "").trim();
  if (!title) return NextResponse.json({ ok: false, error: "Укажите название." }, { status: 400 });

  const images: { url: string; alt?: string }[] = Array.isArray(body.images) ? body.images : [];
  const variants: { size: string; stock: number }[] = Array.isArray(body.variants) ? body.variants : [];

  // Полная замена изображений и вариантов.
  await prisma.$transaction([
    prisma.productImage.deleteMany({ where: { productId } }),
    prisma.productVariant.deleteMany({ where: { productId } }),
    prisma.product.update({
      where: { id: productId },
      data: {
        title,
        description: String(body.description ?? "") || null,
        composition: String(body.composition ?? "") || null,
        price: Math.max(0, Math.round(Number(body.price) || 0)),
        category: String(body.category ?? "accessory"),
        dropId: body.dropId ? Number(body.dropId) : null,
        published: Boolean(body.published),
        limited: Boolean(body.limited),
        sortOrder: Number(body.sortOrder) || 0,
        images: {
          create: images
            .filter((im) => im.url)
            .map((im, i) => ({ url: im.url, alt: im.alt ?? title, sortOrder: i })),
        },
        variants: {
          create: variants
            .filter((v) => v.size)
            .map((v) => ({ size: v.size, stock: Math.max(0, Math.round(Number(v.stock) || 0)) })),
        },
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthed())) return NextResponse.json({ ok: false, error: "401" }, { status: 401 });
  const { id } = await params;
  await prisma.product.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
