// Извлечение текста и встроенных фото из прайс-листа (Telegram-экспорт PDF).
// Рендерим страницу (декодирует картинки), затем достаём image-XObject'ы.
// Запуск: node scripts/extract-pdf.mjs "/path/to/Лмх прайсы.pdf"
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createCanvas, ImageData } from "@napi-rs/canvas";
import { getDocument, OPS } from "pdfjs-dist/legacy/build/pdf.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PDF = process.argv[2] || "/Users/daniilmazur/Downloads/Лмх прайсы.pdf";
const OUT_DIR = path.join(ROOT, "public", "products", "pdf");
const PAGES_DIR = "/tmp/lmh-pages";
const PKG = path.join(ROOT, "node_modules", "pdfjs-dist");

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(PAGES_DIR, { recursive: true });

class NodeCanvasFactory {
  create(w, h) {
    const canvas = createCanvas(Math.max(1, w), Math.max(1, h));
    return { canvas, context: canvas.getContext("2d") };
  }
  reset(c, w, h) {
    c.canvas.width = Math.max(1, w);
    c.canvas.height = Math.max(1, h);
  }
  destroy(c) {
    c.canvas.width = 0;
    c.canvas.height = 0;
  }
}

function toRGBA(img) {
  const { width: w, height: h, kind, data } = img;
  const out = new Uint8ClampedArray(w * h * 4);
  if (kind === 3) out.set(data.subarray(0, out.length));
  else if (kind === 2) {
    for (let i = 0, j = 0; i < w * h; i++) {
      out[j++] = data[i * 3]; out[j++] = data[i * 3 + 1]; out[j++] = data[i * 3 + 2]; out[j++] = 255;
    }
  } else if (kind === 1) {
    const rb = Math.ceil(w / 8);
    let p = 0;
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const v = (data[y * rb + (x >> 3)] >> (7 - (x % 8))) & 1 ? 255 : 0;
        out[p++] = v; out[p++] = v; out[p++] = v; out[p++] = 255;
      }
  } else out.set(data.subarray(0, out.length));
  return out;
}

function lineize(tc) {
  const rows = new Map();
  for (const it of tc.items) {
    if (!it.str) continue;
    const y = Math.round(it.transform[5]);
    if (!rows.has(y)) rows.set(y, []);
    rows.get(y).push({ x: it.transform[4], s: it.str });
  }
  return [...rows.keys()]
    .sort((a, b) => b - a)
    .map((y) => rows.get(y).sort((a, b) => a.x - b.x).map((o) => o.s).join(" ").replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

const withTimeout = (p, ms) =>
  Promise.race([p, new Promise((r) => setTimeout(() => r(null), ms))]);

async function main() {
  const data = new Uint8Array(fs.readFileSync(PDF));
  const doc = await getDocument({
    data,
    standardFontDataUrl: path.join(PKG, "standard_fonts") + "/",
    cMapUrl: path.join(PKG, "cmaps") + "/",
    cMapPacked: true,
    useSystemFonts: true,
    verbosity: 0,
  }).promise;

  console.log("numPages:", doc.numPages);
  const cf = new NodeCanvasFactory();
  const result = [];

  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const tc = await page.getTextContent();
    const lines = lineize(tc);

    // рендер страницы (декодирует image-объекты) + сохранить превью
    const viewport = page.getViewport({ scale: 2 });
    const { canvas, context } = cf.create(viewport.width, viewport.height);
    try {
      await page.render({ canvasContext: context, viewport, canvasFactory: cf }).promise;
      fs.writeFileSync(path.join(PAGES_DIR, `page${String(p).padStart(2, "0")}.jpg`), canvas.toBuffer("image/jpeg", 0.7));
    } catch (e) {
      console.log(`  page ${p}: render fail: ${e.message}`);
    }

    // имена картинок из operator list
    const ops = await page.getOperatorList();
    const names = [];
    for (let i = 0; i < ops.fnArray.length; i++) {
      const fn = ops.fnArray[i];
      if (fn === OPS.paintImageXObject || fn === OPS.paintJpegXObject)
        if (typeof ops.argsArray[i][0] === "string") names.push(ops.argsArray[i][0]);
    }

    const images = [];
    let k = 0;
    for (const name of [...new Set(names)]) {
      const img = await withTimeout(
        new Promise((resolve) => { try { page.objs.get(name, resolve); } catch { resolve(null); } }),
        4000,
      );
      if (!img || !img.width || !img.height) continue;
      if (img.width < 250 || img.height < 250) continue; // отсечь иконки
      const canvas2 = createCanvas(img.width, img.height);
      canvas2.getContext("2d").putImageData(new ImageData(toRGBA(img), img.width, img.height), 0, 0);
      const file = `p${String(p).padStart(2, "0")}-${k}.jpg`;
      fs.writeFileSync(path.join(OUT_DIR, file), canvas2.toBuffer("image/jpeg", 0.92));
      images.push({ file: `/products/pdf/${file}`, w: img.width, h: img.height });
      k++;
    }

    page.cleanup();
    result.push({ page: p, lines, images });
    process.stdout.write(`page ${p}: ${images.length} img | ${lines[0] || ""} | ${lines.slice(1).join(" / ").slice(0, 80)}\n`);
  }

  fs.writeFileSync("/tmp/lmh-catalog.json", JSON.stringify(result, null, 2));
  console.log(`\nГотово: /tmp/lmh-catalog.json (${result.length} страниц), превью в ${PAGES_DIR}`);
}

main().catch((e) => { console.error("FATAL", e); process.exit(1); });
