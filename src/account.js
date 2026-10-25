/* ---------- parent account: email code sign-in, family sync (Supabase) ---------- */
const TG_BOT="KishkentaiKidsBot";   /* the bot username without @, e.g. "KishkentaiKidsBot"; empty = button hidden */
const SB_URL="https://ktrgvmuctcjyniptwvjl.supabase.co",SB_KEY="sb_publishable_LeR42wJ8_lBVI__Jq5bmHQ_NXqAcorm";
let sb=null,sbUser=null,syncTimer=0,syncState="";
const A={
 kk:{acc:"Ата-ана аккаунты",accSub:"Прогресс кез келген телефонда сақталады.",email:"Email",send:"Код жіберу",code:"Поштаға келген код",enter:"Кіру",
  sent:e=>`Хат ${e} поштасына жіберілді. Хаттағы кодты осында жазыңыз немесе хаттағы сілтемені басыңыз. Спам папкасын да қараңыз.`,signed:e=>`Кірдіңіз: ${e}`,out:"Шығу",synced:"Сақталды ✓",syncing:"Сақталуда…",
  offline:"Аккаунт қазір қолжетімсіз (интернет жоқ не превью режимі). Деректер осы телефонда сақталады.",bad:"Код дұрыс емес не ескірген. Қайта жіберіп көріңіз.",badMail:"Email дұрыс емес сияқты.",tg:"Telegram-ға қосу",tgSub:"Әр жексенбі бот баланың апта қорытындысын жібереді.",tgFirst:"✈️ Telegram-ға апта қорытындысын алу үшін алдымен кіріңіз."},
 ru:{acc:"Аккаунт родителя",accSub:"Прогресс сохранится на любом телефоне.",email:"Email",send:"Отправить код",code:"Код из письма",enter:"Войти",
  sent:e=>`Письмо отправлено на ${e}. Введите код из письма здесь или просто нажмите ссылку в письме. Проверьте и папку «Спам».`,signed:e=>`Вы вошли: ${e}`,out:"Выйти",synced:"Сохранено ✓",syncing:"Сохраняем…",
  offline:"Аккаунт сейчас недоступен (нет интернета или режим превью). Данные хранятся на этом телефоне.",bad:"Код неверный или устарел. Попробуйте отправить ещё раз.",badMail:"Похоже, email введён с ошибкой.",tg:"Подключить Telegram",tgSub:"Каждое воскресенье бот пришлёт итоги недели ребёнка.",tgFirst:"✈️ Чтобы получать итоги недели в Telegram, сначала войдите."}};
function initAccount(){
  try{if(!window.supabase)return;sb=window.supabase.createClient(SB_URL,SB_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})}catch(e){sb=null;return}
  sb.auth.getSession().then(({data})=>{sbUser=data&&data.session?data.session.user:null;if(sbUser)pullFamily()}).catch(()=>{});
  sb.auth.onAuthStateChange((ev,session)=>{const was=sbUser;sbUser=session?session.user:null;
    if(ev==="SIGNED_IN"&&sbUser&&!was){try{history.replaceState(null,"",location.pathname)}catch(e){}pullFamily()}})}
/* merge: keep every child; when both sides have one, keep the newer copy */
function mergeKids(local,remote){const m=new Map();for(const k of [...remote,...local]){const o=m.get(k.id);if(!o||(k.t||0)>(o.t||0))m.set(k.id,k)}return [...m.values()]}
async function pullFamily(){if(!sb||!sbUser)return;
  try{const {data,error}=await sb.from("families").select("kids").eq("user_id",sbUser.id).maybeSingle();if(error)throw error;
    const merged=mergeKids(kids,(data&&data.kids)||[]);kids=merged;if(!kids.find(k=>k.id===curId))curId=kids[0]?kids[0].id:null;
    store.set("kids",kids);store.set("kid",curId);paintHeader();await pushFamily(true);
    if(!view.querySelector("#kidform"))home()}catch(e){}}
async function pushFamily(now){if(!sb||!sbUser)return;clearTimeout(syncTimer);
  const go=async()=>{syncState="syncing";paintSync();
    try{const {error}=await sb.from("families").upsert({user_id:sbUser.id,kids,updated_at:new Date().toISOString()});if(error)throw error;syncState="synced"}catch(e){syncState=""}paintSync()};
  if(now)return go();syncTimer=setTimeout(go,1500)}
function paintSync(){const el=document.getElementById("syncNote");if(el)el.textContent=syncState?A[H()][syncState]:""}
function accountBlock(){const a=A[H()];
  if(!sb)return `<section class="acc"><h2>${a.acc}</h2><p class="sub">${a.offline}</p></section>`;
  if(sbUser)return `<section class="acc"><h2>${a.acc}</h2><p>${esc(a.signed(sbUser.email||""))} <span id="syncNote" class="sync"></span></p>
   ${TG_BOT?`<p class="sub">${a.tgSub}</p><a class="go small tg" target="_blank" rel="noopener" href="https://t.me/${TG_BOT}?start=${sbUser.id}">✈️ ${a.tg}</a>`:""}
   <button class="pill" id="signOut" type="button">${a.out}</button></section>`;
  return `<section class="acc"><h2>${a.acc}</h2><p class="sub">${a.accSub}${TG_BOT?" "+a.tgFirst:""}</p>
   <form id="otpForm" class="row"><input id="accEmail" type="email" inputmode="email" autocomplete="email" required placeholder="mama@mail.kz" aria-label="${a.email}"><button class="go small" type="submit">${a.send}</button></form>
   <form id="codeForm" class="row" hidden><input id="accCode" inputmode="numeric" autocomplete="one-time-code" maxlength="10" placeholder="12345678" aria-label="${a.code}"><button class="go small" type="submit">${a.enter}</button></form>
   <p class="sub" id="accMsg" aria-live="polite"></p></section>`}
function bindAccount(){if(!sb)return;const a=A[H()],msg=t=>{const m=$("#accMsg");if(m)m.textContent=t};
  if($("#signOut"))$("#signOut").onclick=async()=>{try{await sb.auth.signOut()}catch(e){}sbUser=null;paidOpen=false;store.set("paid",null);gate()};
  if($("#otpForm"))$("#otpForm").onsubmit=async e=>{e.preventDefault();const email=$("#accEmail").value.trim();if(!/^\S+@\S+\.\S+$/.test(email)){msg(a.badMail);return}
    try{const {error}=await sb.auth.signInWithOtp({email,options:{shouldCreateUser:true,emailRedirectTo:location.origin+location.pathname}});if(error)throw error;msg(a.sent(email));$("#codeForm").hidden=false;$("#accCode").focus()}catch(err){msg(/fetch|network/i.test(err.message||"")?a.offline:(err.message||a.offline))}};
  if($("#codeForm"))$("#codeForm").onsubmit=async e=>{e.preventDefault();const email=$("#accEmail").value.trim(),token=$("#accCode").value.trim();
    try{const {data,error}=await sb.auth.verifyOtp({email,token,type:"email"});if(error)throw error;sbUser=data.user;await pullFamily();gate()}catch(err){msg(a.bad)}};
  paintSync()}
