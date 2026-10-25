/* ---------- gate: intro page + short demo for everyone, the app itself only for a signed-in parent with a paid plan ---------- */
const PRICE={month:"4 490 ₸",year:"44 900 ₸"};
const PAY_QR="kaspi-qr.png";   /* Kaspi QR picture (data:image/... or a file next to index.html); empty = "coming soon" note */
const GATE={
 kk:{other:"Русский",hero:"Балаңыз үш тілде сөйлей бастасын",
  heroSub:"Kishkentai — 1–6 жастағы балаларға ағылшын, қазақ және орыс тілдері. Күніне 5–15 минут, ойын арқылы, акварель суреттермен.",
  demoBtn:"▶ Тегін байқап көру · 2 минут",regBtn:"Тіркелу",
  howHead:"Қалай жұмыс істейді",
  how:[["Бала жасына сай","1 жастан 6 жасқа дейін төрт деңгей: Сәби, Балапан, Құлыншақ, Батыр. Тапсырмаларды платформа өзі таңдайды."],
   ["Күн сайын дайын жоспар","Әр тақырып — бір апта: жаңа сөздер, ойын, өмірдегі сөз тіркестері, қайталау."],
   ["Жанды дауыс","Әр сөзді тыңдауға болады. Ата-анаға аудармасы мен айтылуы жазылған."],
   ["Ата-анаға","Баланың прогресі, басып шығаратын карточкалар, үйде айтатын фразалар, Telegram-да апталық есеп."]],
  insideHead:"Ішінде не бар",
  inside:["10 тақырып: жануарлар, көлік, жемістер, киім, ас үй, жуыну, серуен, ұйқы, түстер, сандар",
   "19 ойын: «Тыңда», «Жасырынбақ», «Тауып бер», «Кім айтады?», «Жұбын тап» және басқалар",
   "4–6 жасқа: әріптер, сөз құрастыру, санау","Бірнеше бала — бір аккаунт, кез келген телефонда"],
  priceHead:"Бағасы",month:"ай",year:"жыл",yearNote:"2 ай тегін",
  priceNote:"Төлем Kaspi арқылы. Ақша автоматты түрде алынбайды — мерзімі біткенде өзіңіз ұзартасыз.",
  faqHead:"Сұрақтар",
  faq:[["Қай құрылғыда жұмыс істейді?","Телефон, планшет, компьютер — браузер арқылы. Телефонға қосымша ретінде орнатуға болады."],
   ["Бір аккаунтқа неше бала?","Бірнеше бала. Әрқайсысына жеке профиль мен прогресс."],
   ["Экран балаға зиян емес пе?","Күніне 5–15 минут, ата-анамен бірге. Ең бастысы — сөздерді күнделікті өмірде қайталау, ол үшін дайын фразалар бар."],
   ["Қалай төлеймін?","Тіркелгеннен кейін Kaspi QR шығады. Төлегеннен кейін бірнеше сағат ішінде толық қолжетімділік ашылады."]],
  regHead:"Тіркелу",regSub:"Email жазыңыз — поштаға кіру коды келеді. Сосын төлем, сосын толық қолжетімділік.",
  demoTag:"Демо",demoTap:"Суретті басыңыз — сөзді естисіз",demoClose:"✕ Шығу",
  demoEndHead:"Бұл — кішкене бөлігі ғана",demoEnd:"Ішінде 10 тақырып, 19 ойын, күн сайынғы жоспар, прогресс және Telegram-да апталық есеп.",
  payHead:"Толық қолжетімділік",paySub:e=>`Сіз кірдіңіз: ${e}. Жоспарды таңдап, Kaspi арқылы төлеңіз.`,expired:"Жазылым мерзімі бітті. Жалғастыру үшін ұзартыңыз.",
  payQr:p=>`Kaspi QR-ды сканерлеп, ${p} төлеңіз`,noQr:"Kaspi QR жақында осында шығады.",saveQr:"QR-ды сақтау",sameHint:"Сайт осы телефонда ашық болса: QR-ды сақтаңыз, сосын Kaspi сканерінде галереядан ашыңыз.",paid:"Мен төледім",check:"Тексеру",out:"Шығу",
  sent:"Рақмет! Төлемді тексеріп жатырмыз — әдетте бірнеше сағат ішінде ашылады. Ашылғанда бұл бет өзі жаңарады.",
  payErr:"Жіберу мүмкін болмады. Интернетті тексеріп, қайталаңыз.",offline:"Қазір тексеру мүмкін емес: интернет жоқ."},
 ru:{other:"Қазақша",hero:"Пусть ребёнок заговорит на трёх языках",
  heroSub:"Kishkentai — английский, казахский и русский для детей 1–6 лет. 5–15 минут в день, через игру, с акварельными картинками.",
  demoBtn:"▶ Попробовать бесплатно · 2 минуты",regBtn:"Регистрация",
  howHead:"Как это работает",
  how:[["По возрасту ребёнка","Четыре уровня от 1 до 6 лет: Сәби, Балапан, Құлыншақ, Батыр. Задания платформа подбирает сама."],
   ["Готовый план на каждый день","Каждая тема — неделя: новые слова, игра, фразы в жизни, повторение."],
   ["Живой голос","Каждое слово можно послушать. Для родителей — перевод и как произносить."],
   ["Для родителей","Прогресс ребёнка, карточки для печати, фразы для дома, итоги недели в Telegram."]],
  insideHead:"Что внутри",
  inside:["10 тем: животные, транспорт, фрукты, одежда, кухня, ванная, прогулка, сон, цвета, числа",
   "19 игр: «Слушай», «Прятки», «Найди», «Кто говорит?», «Найди пару» и другие",
   "Для 4–6 лет: буквы, собери слово, счёт","Несколько детей — один аккаунт, на любом телефоне"],
  priceHead:"Цена",month:"месяц",year:"год",yearNote:"2 месяца в подарок",
  priceNote:"Оплата через Kaspi. Деньги не списываются автоматически — когда срок закончится, продлите сами.",
  faqHead:"Вопросы",
  faq:[["На каких устройствах работает?","Телефон, планшет, компьютер — через браузер. На телефон можно установить как приложение."],
   ["Сколько детей в одном аккаунте?","Несколько. У каждого свой профиль и прогресс."],
   ["Не вредно ли ребёнку смотреть в экран?","5–15 минут в день, вместе с родителем. Главное — повторять слова в жизни, для этого есть готовые фразы."],
   ["Как оплатить?","После регистрации появится Kaspi QR. После оплаты полный доступ откроется в течение нескольких часов."]],
  regHead:"Регистрация",regSub:"Введите email — на почту придёт код для входа. Потом оплата, и сразу полный доступ.",
  demoTag:"Демо",demoTap:"Нажмите на картинку — услышите слово",demoClose:"✕ Выйти",
  demoEndHead:"Это только маленькая часть",demoEnd:"Внутри 10 тем, 19 игр, план на каждый день, прогресс и итоги недели в Telegram.",
  payHead:"Полный доступ",paySub:e=>`Вы вошли: ${e}. Выберите тариф и оплатите через Kaspi.`,expired:"Срок подписки закончился. Продлите, чтобы продолжить.",
  payQr:p=>`Отсканируйте Kaspi QR и оплатите ${p}`,noQr:"Kaspi QR скоро появится здесь.",saveQr:"Сохранить QR",sameHint:"Если сайт открыт на этом же телефоне: сохраните QR и откройте его в сканере Kaspi из галереи.",paid:"Я оплатил(а)",check:"Проверить",out:"Выйти",
  sent:"Спасибо! Проверяем оплату — обычно доступ открывается в течение нескольких часов. Эта страница обновится сама.",
  payErr:"Не получилось отправить. Проверьте интернет и попробуйте ещё раз.",offline:"Сейчас не проверить: нет интернета."}};
let GL=store.get("ui",H()),paidOpen=false,payPoll=0;
const gx=()=>GATE[GL];
/* on the gate screens the "child" is a sample one speaking the page's language, so cards, voice and the sign-in form follow it */
function gateKid(){DEMO={...SAMPLE,help:GL}}
function gated(on){document.body.classList.toggle("gated",on);clearInterval(payPoll)}
function gateLang(){GL=GL==="kk"?"ru":"kk";store.set("ui",GL);gateKid();paintHeader()}

/* paid = a subscriptions row with paid_until in the future; the answer is kept on the phone so a paid family can play offline */
async function gate(){gateKid();paintHeader();
  if(!sb){const c=store.get("paid",null);return c&&new Date(c.until)>new Date()?unlock():intro()}
  let user=null;try{const {data}=await sb.auth.getSession();user=data&&data.session?data.session.user:null}catch(e){}
  sbUser=user;if(!user)return intro();
  try{const {data,error}=await sb.from("subscriptions").select("plan,paid_until").eq("user_id",user.id).maybeSingle();if(error)throw error;
    const until=data&&data.paid_until;store.set("paid",until?{uid:user.id,until}:null);
    return until&&new Date(until)>new Date()?unlock():paywall(!!until)}
  catch(e){const c=store.get("paid",null);return c&&c.uid===user.id&&new Date(c.until)>new Date()?unlock():paywall(false,gx().offline)}}
function unlock(){paidOpen=true;DEMO=null;gated(false);paintHeader();navHist=[];navCur=-1;home()}

/* ---------- intro: what Kishkentai is, the price, sign-up ---------- */
function intro(){gated(true);const G1=gx();
  view.innerHTML=`<div class="col intro">
   <div class="row gtop"><span class="spacer"></span><button class="pill" id="gLang">${G1.other}</button></div>
   <section class="hero"><h1>${G1.hero}</h1><p class="sub">${G1.heroSub}</p>
    <div class="thumbs hero-art">${["cat","fox","bus","apple","mittens","duck"].filter(k=>PAINTED[k]).map(k=>`<figure><img alt="" src="${PAINTED[k]}"></figure>`).join("")}</div>
    <div class="row"><button class="go" id="gDemo">${G1.demoBtn}</button><button class="pill" id="gToReg">${G1.regBtn}</button></div></section>
   <h2 class="sec">${G1.howHead}</h2>
   <div class="feats">${G1.how.map(([h,p])=>`<div class="feat"><b>${h}</b><p class="sub">${p}</p></div>`).join("")}</div>
   <h2 class="sec">${G1.insideHead}</h2>
   <ul class="inside">${G1.inside.map(x=>`<li>${x}</li>`).join("")}</ul>
   <h2 class="sec">${G1.priceHead}</h2>${prices()}<p class="sub">${G1.priceNote}</p>
   <h2 class="sec">${G1.faqHead}</h2>
   <div class="faq">${G1.faq.map(([q,a])=>`<details><summary>${q}</summary><p class="sub">${a}</p></details>`).join("")}</div>
   <section class="reg" id="reg"><h2 class="sec">${G1.regHead}</h2><p class="sub">${G1.regSub}</p>${accountBlock()}</section></div>`;
  window.scrollTo(0,0);
  $("#gLang").onclick=()=>{gateLang();intro()};$("#gDemo").onclick=()=>demo(0);$("#gToReg").onclick=()=>$("#reg").scrollIntoView({behavior:"smooth"});bindAccount()}
const prices=sel=>`<div class="prices">${["month","year"].map(p=>`<${sel?`button type="button" data-plan="${p}" aria-pressed="${p===sel}"`:"div"} class="price"><b>${PRICE[p]}</b><span>/ ${gx()[p]}</span>${p==="year"?`<em>${gx().yearNote}</em>`:""}</${sel?"button":"div"}>`).join("")}</div>`;

/* ---------- demo: three cards to tap, one "where is…?" round, then the invitation; nothing is saved ---------- */
const DEMO_CARDS=["cat","rabbit","duck"].map(k=>THEME.animals.items.find(it=>it.key===k));
function demo(step){gated(true);const G1=gx(),n=DEMO_CARDS.length+1,head=`<div class="row gtop"><span class="eyebrow">${G1.demoTag} · ${Math.min(step+1,n)}/${n}</span><span class="spacer"></span><button class="pill" id="gClose">${G1.demoClose}</button></div>`;
  if(step<DEMO_CARDS.length){const it=DEMO_CARDS[step];
    view.innerHTML=`<div class="col">${head}
     <button class="baby" id="baby" aria-label="${esc(word(it))}"><img alt="" src="${art(it)}"><span class="bw">${esc(cap(word(it)))}</span><span class="bh">${esc(helpWord(it))}</span></button>
     <div class="babynav"><span class="hint">${G1.demoTap}</span><button class="next" id="next" aria-label="→">→</button></div></div>`;
    const b=$("#baby");b.onclick=()=>{say(cardLine(it));b.classList.remove("hop");void b.offsetWidth;b.classList.add("hop");sparkle(b)};
    $("#next").onclick=()=>demo(step+1)}
  else if(step===DEMO_CARDS.length){const ans=DEMO_CARDS[0],opts=shuffle([ans,...["bear","horse"].map(k=>THEME.animals.items.find(it=>it.key===k))]),q=SAY.en.where(ans);
    view.innerHTML=`<div class="col">${head}
     <div class="ask"><span class="en">${esc(q)}</span><span class="kz">${esc(SAY[GL].where(ans))}</span><button class="listen" id="again">${t().again}</button></div>
     <div class="choices">${opts.map((o,k)=>`<button class="choice" data-k="${k}" aria-label="${esc(word(o))}"><img alt="" src="${art(o)}"></button>`).join("")}</div>
     <p class="cheer" id="cheer" aria-live="polite"></p></div>`;
    $("#again").onclick=()=>say(q);setTimeout(()=>say(q),350);let done=false;
    view.querySelectorAll(".choice").forEach(b=>b.onclick=()=>{if(done)return;const o=opts[+b.dataset.k];
      if(o===ans){done=true;b.classList.add("right");const p=praise();$("#cheer").innerHTML=`<b>${p.main}</b><span>${p.help}</span>`;say(p.main);sparkle(b);setTimeout(()=>demo(step+1),2200)}
      else{b.classList.remove("wrong");void b.offsetWidth;b.classList.add("wrong");say(cap(word(o)))}})}
  else{view.innerHTML=`<div class="col">${head}
     <section class="today"><h1>${G1.demoEndHead}</h1><p class="sub">${G1.demoEnd}</p>${prices()}
      <div class="row"><button class="go" id="gReg">${G1.regBtn}</button></div></section></div>`;
    $("#gReg").onclick=()=>{intro();$("#reg").scrollIntoView()}}
  window.scrollTo(0,0);$("#gClose").onclick=()=>intro()}

/* ---------- paywall: signed in, not paid yet ---------- */
function paywall(expired,note){gated(true);const G1=gx();let plan=store.get("plan","month");
  view.innerHTML=`<div class="col intro">
   <div class="row gtop"><span class="spacer"></span><button class="pill" id="gLang">${G1.other}</button></div>
   <section class="today"><h1>${G1.payHead}</h1><p class="sub">${esc(G1.paySub(sbUser&&sbUser.email||""))}</p>
    ${expired?`<p class="note">${G1.expired}</p>`:""}
    <div id="gPrices">${prices(plan)}</div>
    <div class="qr">${PAY_QR?`<img alt="Kaspi QR" src="${PAY_QR}"><p class="sub" id="gQrNote"></p><a class="pill" href="${PAY_QR}" download="kishkentai-kaspi-qr.png">${G1.saveQr}</a><p class="sub qrhint">${G1.sameHint}</p>`:`<p class="note">${G1.noQr}</p>`}</div>
    <div class="row"><button class="go" id="gPaid">${G1.paid}</button><button class="pill" id="gCheck">${G1.check}</button><button class="pill" id="gOut">${G1.out}</button></div>
    <p class="sub" id="gMsg" aria-live="polite">${note||""}</p></section></div>`;
  window.scrollTo(0,0);
  const qrNote=()=>{const e=$("#gQrNote");if(e)e.textContent=G1.payQr(PRICE[plan])};qrNote();
  const bindPlans=()=>view.querySelectorAll("[data-plan]").forEach(b=>b.onclick=()=>{plan=b.dataset.plan;store.set("plan",plan);$("#gPrices").innerHTML=prices(plan);bindPlans();qrNote()});bindPlans();
  const msg=t=>{$("#gMsg").textContent=t};
  const poll=()=>{clearInterval(payPoll);payPoll=setInterval(()=>{if(!document.hidden)gate()},60000)};
  $("#gLang").onclick=()=>{gateLang();paywall(expired,note)};
  $("#gCheck").onclick=()=>gate();
  $("#gOut").onclick=async()=>{try{await sb.auth.signOut()}catch(e){}sbUser=null;store.set("paid",null);intro()};
  $("#gPaid").onclick=async()=>{const b=$("#gPaid");b.disabled=true;
    try{const {error}=await sb.from("pay_requests").insert({user_id:sbUser.id,email:sbUser.email,plan});if(error)throw error;msg(G1.sent);poll()}
    catch(e){b.disabled=false;msg(G1.payErr)}};
  /* a request already waiting: say so and keep checking */
  sb&&sbUser&&sb.from("pay_requests").select("id").eq("user_id",sbUser.id).eq("status","new").limit(1).then(({data})=>{if(data&&data.length&&$("#gMsg")){msg(G1.sent);poll()}},()=>{})}

/* every way back to the app's home goes through the gate until the family is paidOpen */
const appHome=home;home=(...a)=>paidOpen?appHome(...a):gate();
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&!paidOpen&&sbUser&&$("#gPaid"))gate()});

/* ---------- start ---------- */
initAccount();gateKid();paintHeader();
Promise.race([document.fonts.load('800 300px Nunito'),new Promise(r=>setTimeout(r,1500))]).then(buildDigits,buildDigits).then(()=>gate(),()=>gate());
