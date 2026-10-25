// Kishkentai Telegram bot (Supabase Edge Function "telegram-bot").
// 1) Telegram webhook: a parent opens t.me/<bot>?start=<user id> from the site -> the chat is linked to the family.
//    Commands: /report (send the report now), /stop (unsubscribe).
// 2) Weekly: pg_cron calls  ...?task=weekly  with header x-cron-secret -> every linked parent gets the week's report.
// Secrets (Edge Functions -> Secrets): TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET, CRON_SECRET.
// Deploy with "Verify JWT" switched OFF (Telegram does not send a Supabase token).
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") ?? "";
const HOOK = Deno.env.get("TELEGRAM_WEBHOOK_SECRET") ?? "";
const CRON = Deno.env.get("CRON_SECRET") ?? "";
const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

// theme order per level and theme names (same as PROGRAM / THEMES in src/content.js)
const PROGRAM: Record<string, string[]> = {
  sabi: ["animals", "kitchen", "clothes", "bath", "transport", "fruit", "walk", "sleep"],
  balapan: ["animals", "kitchen", "clothes", "bath", "transport", "fruit", "colors", "walk", "sleep"],
  qulynshaq: ["animals", "kitchen", "clothes", "bath", "transport", "fruit", "colors", "numbers", "walk", "sleep"],
  batyr: ["animals", "kitchen", "clothes", "bath", "transport", "fruit", "colors", "numbers", "walk", "sleep"],
};
const NAMES: Record<string, { kk: string; ru: string }> = {
  animals: { kk: "Жануарлар", ru: "Животные" }, transport: { kk: "Көлік", ru: "Транспорт" }, fruit: { kk: "Жемістер", ru: "Фрукты" },
  clothes: { kk: "Киім", ru: "Одежда" }, kitchen: { kk: "Ас үй", ru: "Кухня" }, bath: { kk: "Жуыну", ru: "Ванная" },
  walk: { kk: "Серуен", ru: "Прогулка" }, sleep: { kk: "Ұйқы", ru: "Сон" }, colors: { kk: "Түстер", ru: "Цвета" }, numbers: { kk: "Сандар", ru: "Числа" },
};
const levelOf = (age: number) => (age <= 1 ? "sabi" : age === 2 ? "balapan" : age === 3 ? "qulynshaq" : "batyr");

type Kid = { name: string; age: number; help?: string; stars?: number; prog?: { day?: number; w?: Record<string, number>; wt?: Record<string, number>; act?: Record<string, number> } };

function report(k: Kid): string {
  const p = k.prog ?? {}, wk = Date.now() - 7 * 864e5, w = p.w ?? {}, wt = p.wt ?? {};
  const days = Object.keys(p.act ?? {}).filter((d) => new Date(d + "T12:00").getTime() > wk).length;
  const ids = Object.keys(w), fresh = (id: string) => (wt[id] ?? 0) > wk;
  const und = ids.filter((id) => w[id] >= 1).length, undNew = ids.filter((id) => w[id] >= 1 && fresh(id)).length;
  const says = ids.filter((id) => w[id] >= 2).length, saysNew = ids.filter((id) => w[id] >= 2 && fresh(id)).length;
  const seq = PROGRAM[levelOf(k.age)], next = NAMES[seq[(p.day ?? 0) % seq.length]];
  const plus = (n: number) => (n ? ` (+${n})` : "");
  if (k.help === "ru")
    return `🌱 Kishkentai · ${k.name}, итоги недели\n✅ Дней занимались: ${days}/7\n🧠 Понимает слов: ${und}${plus(undNew)}\n🗣 Говорит слов: ${says}${plus(saysNew)}\n⭐ Звёзды: ${k.stars ?? 0}\n📚 Следующая тема: ${next.ru}` +
      (days < 3 ? "\n\n💡 Даже 5 минут в день помогают — откройте задание дня вместе." : "\n\n👏 Отличная неделя!");
  return `🌱 Kishkentai · ${k.name}, апта қорытындысы\n✅ Ойнаған күндер: ${days}/7\n🧠 Түсінетін сөздер: ${und}${plus(undNew)}\n🗣 Айтатын сөздер: ${says}${plus(saysNew)}\n⭐ Жұлдыздар: ${k.stars ?? 0}\n📚 Келесі тақырып: ${next.kk}` +
    (days < 3 ? "\n\n💡 Күніне 5 минут та көмектеседі — бүгінгі тапсырманы бірге ашыңыз." : "\n\n👏 Керемет апта!");
}

async function send(chat: number, text: string) {
  await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chat, text, reply_markup: { inline_keyboard: [[{ text: "Kishkentai ↗", url: "https://sagindikovaaya-hue.github.io/kishkentai/" }]] } }),
  });
}
async function sendReports(userId: string, chat: number) {
  const { data } = await db.from("families").select("kids").eq("user_id", userId).maybeSingle();
  const kids: Kid[] = data?.kids ?? [];
  if (!kids.length) return send(chat, "Әзірге бала профилі жоқ. Сайтта бала қосыңыз.\nПока нет профиля ребёнка — добавьте его на сайте.");
  for (const k of kids) await send(chat, report(k));
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  if (url.searchParams.get("task") === "weekly") {
    if (!CRON || req.headers.get("x-cron-secret") !== CRON) return new Response("forbidden", { status: 403 });
    const { data } = await db.from("telegram_links").select("user_id, chat_id");
    for (const l of data ?? []) { try { await sendReports(l.user_id, l.chat_id); } catch (_) { /* one family failing must not stop the rest */ } }
    return new Response(`sent to ${data?.length ?? 0}`);
  }
  if (!HOOK || req.headers.get("x-telegram-bot-api-secret-token") !== HOOK) return new Response("forbidden", { status: 403 });
  const upd = await req.json().catch(() => ({}));
  const msg = upd.message;
  if (!msg?.text) return new Response("ok");
  const chat: number = msg.chat.id, text: string = msg.text.trim();
  if (text.startsWith("/start")) {
    const uid = text.split(/\s+/)[1] ?? "";
    if (!/^[0-9a-f-]{36}$/i.test(uid)) {
      await send(chat, "Сәлем! Kishkentai сайтында «Telegram-ға қосу» батырмасын басыңыз.\nПривет! Нажмите «Подключить Telegram» на сайте Kishkentai.");
      return new Response("ok");
    }
    await db.from("telegram_links").upsert({ user_id: uid, chat_id: chat, created_at: new Date().toISOString() });
    await send(chat, "✅ Kishkentai қосылды! Әр жексенбі кешке апта қорытындысын жіберемін.\n✅ Подключено! Каждое воскресенье вечером пришлю итоги недели.\n\n/report — қазір / сейчас\n/stop — тоқтату / отключить");
    await sendReports(uid, chat);
  } else if (text.startsWith("/report")) {
    const { data } = await db.from("telegram_links").select("user_id").eq("chat_id", chat).maybeSingle();
    if (data) await sendReports(data.user_id, chat); else await send(chat, "Алдымен сайттан қосылыңыз. / Сначала подключитесь на сайте.");
  } else if (text.startsWith("/stop")) {
    await db.from("telegram_links").delete().eq("chat_id", chat);
    await send(chat, "Хабарламалар тоқтатылды. / Отчёты отключены.");
  }
  return new Response("ok");
});
