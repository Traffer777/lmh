import { NextRequest } from "next/server";

// Генератор фирменных плейсхолдеров (пока нет реальных фото).
// /api/placeholder?t=Сакура&i=1
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const text = (searchParams.get("t") ?? "LMH").slice(0, 40);
  const i = Number(searchParams.get("i") ?? "0");

  const tints = ["#e10600", "#ededed", "#c6ff00", "#8c8c8c"];
  const tint = tints[i % tints.length];
  const rot = (i * 7) % 12 - 6;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1125" viewBox="0 0 900 1125">
  <defs>
    <filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2"/><feColorMatrix type="saturate" values="0"/></filter>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#161616"/><stop offset="1" stop-color="#0a0a0a"/>
    </linearGradient>
  </defs>
  <rect width="900" height="1125" fill="url(#g)"/>
  <rect width="900" height="1125" filter="url(#n)" opacity="0.08"/>
  <g font-family="Arial Narrow, Oswald, sans-serif" font-weight="700" text-anchor="middle">
    <text x="450" y="520" font-size="220" fill="${tint}" opacity="0.16" transform="rotate(${rot} 450 520)">LMH</text>
    <text x="450" y="600" font-size="46" letter-spacing="6" fill="#ededed">${escapeXml(text.toUpperCase())}</text>
    <text x="450" y="650" font-size="20" letter-spacing="8" fill="#8c8c8c">ФОТО СКОРО</text>
  </g>
  <rect x="24" y="24" width="852" height="1077" fill="none" stroke="${tint}" stroke-opacity="0.35" stroke-width="2"/>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
}

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!,
  );
}
