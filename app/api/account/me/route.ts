import { NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customer-auth";

export async function GET() {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ ok: false });
  return NextResponse.json({
    ok: true,
    customer: { name: customer.name, phone: customer.phone, email: customer.email },
  });
}
