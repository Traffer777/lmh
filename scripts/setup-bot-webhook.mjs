// Регистрирует webhook Telegram бота на /api/bot/telegram
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const DOMAIN = process.env.BOT_DOMAIN || "xn--k1ac1a.com";

if (!TOKEN) { console.error("Set TELEGRAM_BOT_TOKEN"); process.exit(1); }

const url = `https://${DOMAIN}/api/bot/telegram`;
console.log(`Setting webhook → ${url}`);

const res = await fetch(`https://api.telegram.org/bot${TOKEN}/setWebhook`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ url }),
});
const data = await res.json();
console.log(data);
