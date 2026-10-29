// Kishkentai Telegram bot (Supabase Edge Function "telegram-bot").
// 1) Telegram webhook: a parent opens t.me/<bot>?start=<user id> from the site -> the chat is linked to the family.
//    Commands: /report (send the report now), /stop (unsubscribe); for the owner also /pending (payments waiting).
// 2) Weekly: pg_cron calls  ...?task=weekly  with header x-cron-secret -> every linked parent gets the week's report.
// 3) Payments: a new row in pay_requests makes the database call  ...?task=payreq  (body {id}) -> the owner gets
//    the request with buttons "open forever / reject" (old month/year requests still work); a tap opens access in subscriptions and tells the parent.
//    The owner = the Telegram chat linked to an account whose subscriptions.plan is 'owner'.
// 4) Daily: pg_cron calls  ...?task=daily  -> parents whose access ends in 3 days get a reminder.
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
    body: JSON.stringify({ chat_id: chat, text, reply_markup: { inline_keyboard: [[{ text: "Kishkentai ↗", url: "https://kishkentai.com/" }]] } }),
  });
}
async function tg(method: string, body: unknown) {
  const r = await fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  return r.json().catch(() => ({}));
}

/* ---------- payments ---------- */
const PLAN_TEXT: Record<string, string> = { forever: "Біржола / Навсегда · 6 990 ₸", month: "1 ай / 1 месяц · 4 490 ₸", year: "1 жыл / 1 год · 44 900 ₸" };
const FOREVER = "2100-01-01T00:00:00Z";   /* "for good" = paid_until far in the future */
type PayReq = { id: number; user_id: string; email: string | null; plan: string; status: string; created_at: string };
async function ownerChats(): Promise<number[]> {
  const { data: owners } = await db.from("subscriptions").select("user_id").eq("plan", "owner");
  const ids = (owners ?? []).map((o) => o.user_id);
  if (!ids.length) return [];
  const { data } = await db.from("telegram_links").select("chat_id").in("user_id", ids);
  return (data ?? []).map((l) => Number(l.chat_id));
}
const reqText = (r: PayReq) => `💳 Төлем сұрауы / Запрос оплаты #${r.id}\n${r.email ?? r.user_id}\n${PLAN_TEXT[r.plan] ?? r.plan}\n${new Date(r.created_at).toLocaleString("ru-RU", { timeZone: "Asia/Almaty" })}\n\nKaspi-ден тексеріңіз, сосын ашыңыз. / Проверьте поступление в Kaspi и откройте доступ.`;
const reqButtons = (r: PayReq) => ({ inline_keyboard: [
  [{ text: "✅ Ашу біржола / Открыть навсегда", callback_data: `pay:${r.id}:forever` }],
  [{ text: "✖️ Жоқ / Отклонить", callback_data: `pay:${r.id}:no` }]] });
async function notifyOwner(r: PayReq) {
  for (const chat of await ownerChats()) await tg("sendMessage", { chat_id: chat, text: reqText(r), reply_markup: reqButtons(r) });
}
/* the owner tapped a button: extend from today or from the current end date, whichever is later */
async function decide(cb: { id: string; from: { id: number }; data: string; message?: { chat: { id: number }; message_id: number } }) {
  const answer = (text: string) => tg("answerCallbackQuery", { callback_query_id: cb.id, text });
  if (!(await ownerChats()).includes(cb.from.id)) return answer("Тек иесі / Только владелец");
  const [, idStr, choice] = cb.data.split(":");
  const { data: r } = await db.from("pay_requests").select("*").eq("id", Number(idStr)).maybeSingle();
  if (!r) return answer("Табылмады / Не найдено");
  const edit = (text: string) => cb.message && tg("editMessageText", { chat_id: cb.message.chat.id, message_id: cb.message.message_id, text });
  if (r.status !== "new") { await edit(reqText(r).split("\n\n")[0] + `\n\nБұрын шешілген / Уже обработано: ${r.status}`); return answer("Бұрын шешілген / Уже обработано"); }
  const { data: link } = await db.from("telegram_links").select("chat_id").eq("user_id", r.user_id).maybeSingle();
  if (choice === "no") {
    await db.from("pay_requests").update({ status: "rejected" }).eq("id", r.id);
    await edit(reqText(r).split("\n\n")[0] + "\n\n✖️ Қабылданбады / Отклонено");
    if (link) await send(Number(link.chat_id), "Төлем табылмады. Сұрақ болса, жазыңыз.\nОплата не найдена. Если есть вопрос — напишите нам.");
    return answer("✖️");
  }
  const { data: sub } = await db.from("subscriptions").select("plan, paid_until").eq("user_id", r.user_id).maybeSingle();
  const now = new Date(), cur = sub?.paid_until ? new Date(sub.paid_until) : now, from = cur > now ? cur : now, until = new Date(from);
  if (choice === "forever") until.setTime(Date.parse(FOREVER)); else until.setMonth(until.getMonth() + (choice === "year" ? 12 : 1));
  const { error } = await db.from("subscriptions").upsert({ user_id: r.user_id, plan: sub?.plan === "owner" ? "owner" : choice, paid_until: until.toISOString() });
  if (error) return answer("Қате / Ошибка: " + error.message);
  await db.from("pay_requests").update({ status: "done" }).eq("id", r.id);
  const forever = choice === "forever", day = forever ? "∞" : until.toLocaleDateString("ru-RU", { timeZone: "Asia/Almaty" });
  await edit(reqText(r).split("\n\n")[0] + (forever ? "\n\n✅ Біржола ашылды / Открыто навсегда" : `\n\n✅ Ашылды / Открыто до ${day}`));
  if (link) await send(Number(link.chat_id), forever ? "✅ Kishkentai біржола ашылды. Рақмет!\n✅ Полный доступ открыт навсегда. Спасибо!" : `✅ Kishkentai толық ашылды, ${day} дейін. Рақмет!\n✅ Полный доступ открыт до ${day}. Спасибо!`);
  return answer("✅ " + day);
}
async function remind() {
  const from = new Date(Date.now() + 2 * 864e5).toISOString(), to = new Date(Date.now() + 3 * 864e5).toISOString();
  const { data } = await db.from("subscriptions").select("user_id, paid_until").neq("plan", "owner").gt("paid_until", from).lte("paid_until", to);
  let n = 0;
  for (const s of data ?? []) {
    const { data: link } = await db.from("telegram_links").select("chat_id").eq("user_id", s.user_id).maybeSingle();
    if (!link) continue;
    const day = new Date(s.paid_until).toLocaleDateString("ru-RU", { timeZone: "Asia/Almaty" });
    try { await send(Number(link.chat_id), `⏰ Kishkentai ${day} дейін ашық. Жалғастыру үшін сайтта төлем жасаңыз.\n⏰ Доступ открыт до ${day}. Чтобы продолжить, оплатите на сайте.`); n++; } catch (_) { /* skip */ }
  }
  return n;
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
  if (url.searchParams.get("task") === "daily") {
    if (!CRON || req.headers.get("x-cron-secret") !== CRON) return new Response("forbidden", { status: 403 });
    return new Response(`reminded ${await remind()}`);
  }
  /* called by the database trigger on pay_requests; needs no secret: it only announces a request that is still new and not announced yet */
  if (url.searchParams.get("task") === "payreq") {
    const { id } = await req.json().catch(() => ({ id: 0 }));
    const { data: r } = await db.from("pay_requests").update({ notified_at: new Date().toISOString() }).eq("id", Number(id)).eq("status", "new").is("notified_at", null).select("*").maybeSingle();
    if (r) await notifyOwner(r);
    return new Response(r ? "notified" : "skip");
  }
  if (!HOOK || req.headers.get("x-telegram-bot-api-secret-token") !== HOOK) return new Response("forbidden", { status: 403 });
  const upd = await req.json().catch(() => ({}));
  if (upd.callback_query?.data?.startsWith("pay:")) { await decide(upd.callback_query); return new Response("ok"); }
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
  } else if (text.startsWith("/pending")) {
    if (!(await ownerChats()).includes(chat)) return new Response("ok");
    const { data } = await db.from("pay_requests").select("*").eq("status", "new").order("created_at");
    if (!data?.length) await send(chat, "Күтіп тұрған төлем жоқ. / Нет ожидающих оплат.");
    for (const r of data ?? []) await tg("sendMessage", { chat_id: chat, text: reqText(r), reply_markup: reqButtons(r) });
  } else if (text.startsWith("/stop")) {
    await db.from("telegram_links").delete().eq("chat_id", chat);
    await send(chat, "Хабарламалар тоқтатылды. / Отчёты отключены.");
  }
  return new Response("ok");
});
