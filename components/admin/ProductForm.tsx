"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SIZES, CATEGORIES } from "@/lib/constants";

type ImageItem = { url: string; alt?: string };

export type ProductFormData = {
  id?: number;
  title: string;
  slug: string;
  price: number;
  category: string;
  dropId: number | null;
  description: string;
  composition: string;
  limited: boolean;
  published: boolean;
  sortOrder: number;
  images: ImageItem[];
  variants: { size: string; stock: number }[];
};

export default function ProductForm({
  initial,
  drops,
}: {
  initial?: ProductFormData;
  drops: { id: number; title: string }[];
}) {
  const router = useRouter();
  const isEdit = !!initial?.id;

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [price, setPrice] = useState(String(initial?.price ?? ""));
  const [category, setCategory] = useState(initial?.category ?? CATEGORIES[0].value);
  const [dropId, setDropId] = useState<string>(initial?.dropId ? String(initial.dropId) : "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [composition, setComposition] = useState(initial?.composition ?? "");
  const [limited, setLimited] = useState(initial?.limited ?? false);
  const [published, setPublished] = useState(initial?.published ?? true);
  const [sortOrder, setSortOrder] = useState(String(initial?.sortOrder ?? 0));
  const [images, setImages] = useState<ImageItem[]>(initial?.images ?? []);

  const initialStock: Record<string, string> = {};
  (initial?.variants ?? []).forEach((v) => (initialStock[v.size] = String(v.stock)));
  const [stocks, setStocks] = useState<Record<string, string>>(initialStock);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.ok) {
        setImages((prev) => [...prev, { url: data.url, alt: title }]);
      } else {
        setError(data.error ?? "Ошибка загрузки.");
      }
    }
    setUploading(false);
    e.target.value = "";
  }

  function addByUrl() {
    const url = prompt("URL изображения:");
    if (url) setImages((prev) => [...prev, { url, alt: title }]);
  }

  function removeImage(i: number) {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) return setError("Укажите название.");

    const variants = SIZES.filter((s) => stocks[s] !== undefined && stocks[s] !== "").map((s) => ({
      size: s,
      stock: Number(stocks[s]) || 0,
    }));
    if (variants.length === 0) return setError("Добавьте хотя бы один размер с остатком.");

    setSaving(true);
    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      price: Number(price) || 0,
      category,
      dropId: dropId ? Number(dropId) : null,
      description,
      composition,
      limited,
      published,
      sortOrder: Number(sortOrder) || 0,
      images,
      variants,
    };

    const res = await fetch(isEdit ? `/api/admin/products/${initial!.id}` : "/api/admin/products", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      router.push("/admin/products");
      router.refresh();
    } else {
      setError(data.error ?? "Не удалось сохранить.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <div>
          <label className="lbl">Название *</label>
          <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="lbl">Slug (URL, латиницей)</label>
            <input
              className="field"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="оставьте пустым — сгенерируется"
            />
          </div>
          <div>
            <label className="lbl">Цена, ₽ *</label>
            <input
              className="field"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="lbl">Категория</label>
            <select className="field" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="lbl">Дроп</label>
            <select className="field" value={dropId} onChange={(e) => setDropId(e.target.value)}>
              <option value="">— без дропа —</option>
              {drops.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="lbl">Описание</label>
          <textarea
            className="field"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label className="lbl">Состав / уход</label>
          <input
            className="field"
            value={composition}
            onChange={(e) => setComposition(e.target.value)}
          />
        </div>

        {/* Размеры */}
        <div>
          <label className="lbl">Размеры и остатки</label>
          <p className="mono mb-2 text-[10px] uppercase tracking-widest text-fg-dim">
            Заполните остаток для нужных размеров. Пусто = размера нет.
          </p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {SIZES.map((s) => (
              <div key={s}>
                <div className="mono mb-1 text-center text-xs">{s}</div>
                <input
                  className="field text-center"
                  type="number"
                  min={0}
                  value={stocks[s] ?? ""}
                  onChange={(e) => setStocks((prev) => ({ ...prev, [s]: e.target.value }))}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Боковая колонка */}
      <div className="space-y-6">
        <div className="border border-line bg-bg-2 p-4">
          <label className="lbl">Фото</label>
          <div className="grid grid-cols-3 gap-2">
            {images.map((im, i) => (
              <div key={i} className="relative aspect-[4/5] overflow-hidden border border-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={im.url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="mono absolute right-0 top-0 bg-accent px-1.5 text-xs text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-col gap-2">
            <label className="btn btn-sm cursor-pointer text-center">
              {uploading ? "Загрузка…" : "Загрузить фото"}
              <input type="file" accept="image/*" multiple hidden onChange={onUpload} />
            </label>
            <button type="button" onClick={addByUrl} className="mono text-xs uppercase tracking-widest text-fg-dim hover:text-accent">
              + добавить по URL
            </button>
          </div>
        </div>

        <div className="space-y-3 border border-line bg-bg-2 p-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="accent-[var(--accent)]" />
            Опубликован
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={limited} onChange={(e) => setLimited(e.target.checked)} className="accent-[var(--accent)]" />
            Лимитированный тираж
          </label>
          <div>
            <label className="lbl">Порядок сортировки</label>
            <input className="field" type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
          </div>
        </div>

        {error && <p className="mono border border-accent bg-accent/10 p-3 text-xs text-accent">{error}</p>}

        <button type="submit" disabled={saving || uploading} className="btn btn-accent w-full">
          {saving ? "Сохранение…" : isEdit ? "Сохранить" : "Создать товар"}
        </button>
      </div>
    </form>
  );
}
