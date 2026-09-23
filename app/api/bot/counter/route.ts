import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await prisma.contestTicket.aggregate({
    _sum: { tickets: true },
    _count: true,
  });

  const uniqueUsers = await prisma.contestTicket.groupBy({ by: ["telegramId"] });

  return NextResponse.json({
    totalTickets: result._sum.tickets ?? 0,
    totalOrders: result._count,
    participants: uniqueUsers.length,
  });
}
