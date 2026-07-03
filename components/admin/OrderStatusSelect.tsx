"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ORDER_STATUSES } from "@/lib/constants";

export default function OrderStatusSelect({ id, status }: { id: number; status: string }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [busy, setBusy] = useState(false);

  async function change(next: string) {
    setBusy(true);
    setValue(next);
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (res.ok) router.refresh();
    setBusy(false);
  }

  return (
    <select
      className="field max-w-xs"
      value={value}
      disabled={busy}
      onChange={(e) => change(e.target.value)}
    >
      {ORDER_STATUSES.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}
