import PeelSticker from "@/components/PeelSticker";
import { MEDIA } from "@/lib/media";

export const metadata = { title: "Медиа — LMH" };

export default function MediaPage() {
  return (
    <div className="relative mx-auto max-w-7xl px-4 py-16 md:px-6">
      {/* пасхалка — верхний левый угол, выглядывает из-за края */}
      <PeelSticker
        src="/stickers/demo-lmh.png"
        alt="Стикеры LMH"
        href="/stickers"
        size={54}
        rotate={-9}
        className="absolute -left-2 top-6 z-10 hidden lg:inline-block"
      />
      <p className="mono text-xs uppercase tracking-[0.3em] text-accent">Медиа</p>
      <h1 className="display mt-3 text-5xl md:text-6xl">Фото и видео</h1>
      <p className="mt-4 max-w-2xl text-fg-dim">
        LMH со съёмок, дропов и турниров. Жизнь бренда.
      </p>

      {MEDIA.length === 0 ? (
        <p className="mono mt-20 text-center text-fg-dim">Скоро здесь появятся фото и видео.</p>
      ) : (
        <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
          {MEDIA.map((m, i) => (
            <figure
              key={i}
              className="break-inside-avoid overflow-hidden border-2 border-line bg-black"
            >
              {m.type === "photo" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.src} alt={m.alt ?? ""} className="block w-full" loading="lazy" />
              ) : (
                <video
                  className="block w-full"
                  src={m.src}
                  poster={m.poster}
                  controls
                  playsInline
                  preload="metadata"
                />
              )}
              {m.caption && (
                <figcaption className="mono border-t border-line px-3 py-2 text-xs uppercase tracking-widest text-fg-dim">
                  {m.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
