"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MockPay({ number }: { number: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function pay() {
    setLoading(true);
    const res = await fetch("/api/payment/mock-confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ number }),
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      router.push(`/checkout/success?order=${encodeURIComponent(number)}`);
    } else {
      router.push(`/checkout/fail?order=${encodeURIComponent(number)}`);
    }
  }

  return (
    <div className="mt-8 flex flex-col gap-3">
      <button onClick={pay} disabled={loading} className="btn btn-accent w-full">
        {loading ? "Обработка…" : "Оплатить (демо)"}
      </button>
      <button
        onClick={() => router.push(`/checkout/fail?order=${encodeURIComponent(number)}`)}
        disabled={loading}
        className="btn w-full"
      >
        Отменить оплату
      </button>
    </div>
  );
}
