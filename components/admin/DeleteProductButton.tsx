"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteProductButton({ id, title }: { id: number; title: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function del() {
    if (!confirm(`Удалить «${title}»? Действие необратимо.`)) return;
    setBusy(true);
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    } else {
      alert("Не удалось удалить.");
      setBusy(false);
    }
  }

  return (
    <button
      onClick={del}
      disabled={busy}
      className="mono text-xs uppercase tracking-widest text-fg-dim hover:text-accent"
    >
      {busy ? "…" : "Удалить"}
    </button>
  );
}
