// Расчёт доставки СДЭК (api.cdek.ru/v2) — тариф до пункта выдачи (ПВЗ).
// Отправитель: Москва, ул. Шаболовка, 24 (код города СДЭК 44).
// Клиент выбирает город и конкретный ПВЗ; цена считается по коду города.

const API_BASE = "https://api.cdek.ru/v2";

// Тариф «Посылка склад–склад» — доставка до ПВЗ СДЭК (ходовой для интернет-магазинов).
const TARIFF_PVZ = 136;

// Отправитель — Москва (код города СДЭК). Адрес из реквизитов: Шаболовка, 24.
const FROM_CITY_CODE = 44;

// Точка сдачи отправлений СДЭК (ПВЗ, куда владелец привозит посылки).
// Задаётся в env CDEK_SHIPMENT_POINT; по умолчанию — центральный ПВЗ Москвы.
function shipmentPoint(): string {
  return process.env.CDEK_SHIPMENT_POINT || "MSK156";
}

// Данные отправителя (ИП) для накладной СДЭК.
const SENDER = { name: "Магула Марк Станиславович", phone: "+79998236892" };

// Вес одной единицы товара, граммы (одежда). СДЭК считает по весу посылки.
const UNIT_WEIGHT_G = 500;
// Габариты условной посылки, см.
const PKG = { length: 30, width: 25, height: 10 };

function creds(): { account: string; password: string } {
  return {
    account: process.env.CDEK_ACCOUNT || "",
    password: process.env.CDEK_PASSWORD || "",
  };
}

// Кэш OAuth-токена в памяти процесса (живёт ~1 час, берём с запасом).
let tokenCache: { token: string; expiresAt: number } | null = null;

async function getToken(): Promise<string | null> {
  if (tokenCache && tokenCache.expiresAt > Date.now()) return tokenCache.token;
  const { account, password } = creds();
  if (!account || !password) return null;
  try {
    const res = await fetch(`${API_BASE}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: account,
        client_secret: password,
      }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { access_token?: string; expires_in?: number };
    if (!json.access_token) return null;
    const ttlMs = (json.expires_in ?? 3600) * 1000;
    tokenCache = { token: json.access_token, expiresAt: Date.now() + ttlMs - 60_000 };
    return json.access_token;
  } catch {
    return null;
  }
}

async function apiGet(path: string): Promise<unknown | null> {
  const token = await getToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export type CdekCity = { code: number; city: string; region: string };

// Поиск города по названию (СДЭК ищет по полному имени, не по префиксу).
// Схлопываем дубликаты одного города, оставляя канонический (наименьший) код.
export async function searchCities(query: string): Promise<CdekCity[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const data = (await apiGet(
    `/location/cities?country_codes=RU&size=25&city=${encodeURIComponent(q)}`,
  )) as Array<{ code?: number; city?: string; region?: string }> | null;
  if (!Array.isArray(data)) return [];

  const byKey = new Map<string, CdekCity>();
  for (const c of data) {
    if (typeof c.code !== "number" || !c.city) continue;
    const key = `${c.city}|${c.region ?? ""}`.toLowerCase();
    const prev = byKey.get(key);
    if (!prev || c.code < prev.code) {
      byKey.set(key, { code: c.code, city: c.city, region: c.region ?? "" });
    }
  }
  return [...byKey.values()].slice(0, 12);
}

export type CdekPoint = { code: string; address: string; name: string };

// Список пунктов выдачи (ПВЗ) в городе по его коду.
export async function listPvz(cityCode: number): Promise<CdekPoint[]> {
  const data = (await apiGet(
    `/deliverypoints?type=PVZ&size=1000&city_code=${cityCode}`,
  )) as Array<{ code?: string; name?: string; location?: { address?: string } }> | null;
  if (!Array.isArray(data)) return [];
  return data
    .filter((p) => p.code && p.location?.address)
    .map((p) => ({ code: p.code!, address: p.location!.address!, name: p.name ?? "" }));
}

export type CdekQuote = { cost: number; minDays?: number; maxDays?: number };

// Стоимость доставки до ПВЗ по коду города назначения и числу единиц товара.
export async function calcToCity(cityCode: number, totalQty: number): Promise<CdekQuote | null> {
  if (!Number.isFinite(cityCode) || cityCode <= 0) return null;
  const token = await getToken();
  if (!token) return null;

  const weight = Math.max(UNIT_WEIGHT_G, UNIT_WEIGHT_G * Math.max(1, totalQty));
  try {
    const res = await fetch(`${API_BASE}/calculator/tariff`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        tariff_code: TARIFF_PVZ,
        from_location: { code: FROM_CITY_CODE },
        to_location: { code: cityCode },
        packages: [{ weight, ...PKG }],
      }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      total_sum?: number;
      delivery_sum?: number;
      period_min?: number;
      period_max?: number;
      errors?: unknown;
    };
    const sum = json.total_sum ?? json.delivery_sum;
    if (json.errors || typeof sum !== "number") return null;
    return { cost: Math.round(sum), minDays: json.period_min, maxDays: json.period_max };
  } catch {
    return null;
  }
}

// --- Регистрация отправления (накладной) в СДЭК и получение трек-номера ---

export type ShipmentInput = {
  orderNumber: string;
  pvzCode: string; // код ПВЗ получателя
  recipientName: string;
  recipientPhone: string;
  items: { title: string; size: string; price: number; qty: number }[];
};

// Создать заказ в СДЭК (тариф до ПВЗ). Возвращает UUID заказа СДЭК или null.
export async function createShipment(input: ShipmentInput): Promise<string | null> {
  const token = await getToken();
  if (!token) return null;

  const totalQty = input.items.reduce((s, i) => s + i.qty, 0);
  const weight = Math.max(UNIT_WEIGHT_G, UNIT_WEIGHT_G * Math.max(1, totalQty));

  const cdekItems = input.items.map((i, idx) => ({
    name: `${i.title} (${i.size})`.slice(0, 255),
    ware_key: `${idx + 1}-${i.size}`.slice(0, 50),
    payment: { value: 0 }, // заказ предоплачен на сайте
    cost: i.price,
    weight: UNIT_WEIGHT_G,
    amount: i.qty,
  }));

  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        type: 1, // интернет-магазин
        number: input.orderNumber,
        tariff_code: TARIFF_PVZ,
        shipment_point: shipmentPoint(),
        delivery_point: input.pvzCode,
        sender: { name: SENDER.name, phones: [{ number: SENDER.phone }] },
        recipient: {
          name: input.recipientName,
          phones: [{ number: input.recipientPhone.replace(/[^\d+]/g, "") }],
        },
        packages: [
          {
            number: "1",
            weight,
            length: PKG.length,
            width: PKG.width,
            height: PKG.height,
            items: cdekItems,
          },
        ],
      }),
    });
    const json = (await res.json()) as {
      entity?: { uuid?: string };
      requests?: { state?: string; errors?: unknown }[];
    };
    const uuid = json.entity?.uuid;
    if (!uuid) return null;
    return uuid;
  } catch {
    return null;
  }
}

// Запросить трек-номер (cdek_number) по UUID заказа СДЭК. Создание асинхронное,
// поэтому вызываем с повторами. Возвращает трек-номер или null.
export async function getShipmentTrack(uuid: string): Promise<string | null> {
  for (let attempt = 1; attempt <= 5; attempt++) {
    const data = (await apiGet(`/orders/${uuid}`)) as {
      entity?: { cdek_number?: string | number };
    } | null;
    const num = data?.entity?.cdek_number;
    if (num) return String(num);
    if (attempt < 5) await new Promise((r) => setTimeout(r, 2000 * attempt));
  }
  return null;
}
