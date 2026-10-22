"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RETURN_STATUSES } from "@/lib/returns";

export default function ReturnControls({ id, status, note }: { id: number; status: string; note: string }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [text, setText] = useState(note);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save(patch: { status?: string; adminNote?: string }) {
    setBusy(true);
    setSaved(false);
    const res = await fetch(`/api/admin/returns/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      setSaved(true);
      router.refresh();
    }
    setBusy(false);
  }

  return (
    <div className="space-y-4">
      <select
        className="field max-w-md"
        value={value}
        disabled={busy}
        onChange={(e) => {
          setValue(e.target.value);
          save({ status: e.target.value });
        }}
      >
        {RETURN_STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <div>
        <textarea
          className="field min-h-24"
          placeholder="Заметка: что решили, трек обратной отправки, дата возврата денег…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          type="button"
          className="btn btn-sm mt-2 border border-line"
          disabled={busy}
          onClick={() => save({ adminNote: text })}
        >
          {saved ? "Сохранено ✓" : "Сохранить заметку"}
        </button>
      </div>
    </div>
  );
}
