// Медиа-галерея LMH: фото и видео со съёмок, дропов, турниров.
// Файлы лежат в /public/media. Добавляй сюда по мере поступления — порядок = порядок на странице.

export type MediaItem =
  | { type: "photo"; src: string; alt?: string; caption?: string }
  | { type: "video"; src: string; poster?: string; caption?: string };

export const MEDIA: MediaItem[] = [
  { type: "video", src: "/media/lmh-clip-01.mp4", poster: "/media/lmh-clip-01.jpg" },
  { type: "video", src: "/media/lmh-clip-02.mp4", poster: "/media/lmh-clip-02.jpg" },
  { type: "video", src: "/media/lmh-clip-03.mp4", poster: "/media/lmh-clip-03.jpg" },
  { type: "video", src: "/media/lmh-clip-04.mp4", poster: "/media/lmh-clip-04.jpg" },
  { type: "video", src: "/media/lmh-clip-05.mp4", poster: "/media/lmh-clip-05.jpg" },
  { type: "video", src: "/media/lmh-clip-06.mp4", poster: "/media/lmh-clip-06.jpg" },
];
