/* ---------- storage, profiles ---------- */
const $=s=>document.querySelector(s),view=$("#view");
const store={get(k,v){try{const x=localStorage.getItem(k);return x==null?v:JSON.parse(x)}catch(e){return v}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
let kids=store.get("kids",[]),curId=store.get("kid",null),showTr=store.get("tr",true);
/* until a parent sets up a profile, show a sample child so the page is complete at first glance */
const SAMPLE={id:"sample",name:"Айлин",age:2,learn:"en",help:"kk",stars:0,sample:true};
const kid=()=>kids.find(k=>k.id===curId)||kids[0]||SAMPLE;
const saveKids=()=>{const k=kids.find(x=>x.id===curId);if(k)k.t=Date.now();store.set("kids",kids);store.set("kid",curId);if(typeof pushFamily==="function")pushFamily()};
const L=()=>kid().learn, H=()=>kid().help, t=()=>T[H()];
const level=()=>LEVELS.find(l=>l.ages.includes(Math.min(kid().age,6)))||LEVELS[2];
const word=it=>it[L()];
const helpWord=it=>it[H()];
const needTr=()=>L()!==H();
/* English sounds written for a Russian reader */
const ruTr=s=>s.replace(/ә/g,"э").replace(/қ/g,"к").replace(/ө/g,"ё").replace(/ұ|ү/g,"у").replace(/і/g,"и").replace(/ң/g,"нг").replace(/ғ/g,"г").replace(/һ/g,"х");
const trans=it=>L()==="en"?`[${H()==="ru"?ruTr(it.tr):it.tr}]`:"";
const art=it=>THEME[it.theme].id==="numbers"?(DIGITS[it.key]||""):PAINTED[it.key];
const rand=n=>Math.floor(Math.random()*n);
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=rand(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

function addStar(){const k=kid();k.stars=(k.stars||0)+1;if(!k.sample)saveKids();paintHeader()}
function paintHeader(){const k=kid();
  $("#kidBtn").innerHTML=k.sample?`<b>${t().addKid}</b>`:`<b>${esc(k.name)}</b><span>${t().ageWord(k.age)} · ${LANGS[k.learn]}</span>`;
  $("#stars").textContent="★ "+(k.stars||0);$("#stars").hidden=k.age<2;
  $("#brandSub").textContent=t().sub;
  $("#trBtn").textContent=t().tr;$("#trBtn").setAttribute("aria-pressed",showTr);$("#trBtn").hidden=!needTr();
  document.body.classList.toggle("no-tr",!showTr||!needTr());
  document.documentElement.lang=H()}
$("#trBtn").onclick=()=>{showTr=!showTr;store.set("tr",showTr);paintHeader()};
$("#kidBtn").onclick=()=>profiles();

/* ---------- voice ---------- */
const player=new Audio();player.preload="auto";let unlocked=false;
document.addEventListener("pointerdown",()=>{if(unlocked)return;unlocked=true;try{player.muted=true;player.src=SILENT;player.play().then(()=>{player.pause();player.muted=false}).catch(()=>{player.muted=false})}catch(e){}},{capture:true});
const SILENT="data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";
let voices=[],sayTimer=0;
const FEMALE=/Serena|Kate|Stephanie|Martha|Moira|Tessa|Karen|Fiona|Samantha|Ava|Allison|Susan|Zoe|Nicky|Libby|Sonia|Maisie|Hazel|Aria|Jenny|Michelle|Emma|Milena|Katya|Svetlana|Dariya|Irina|Alena|Aigul|Female|female|x-gba|x-gbc|x-sfg|x-tpc/;
const MALE=/Daniel|Arthur|Oliver|Alex|Fred|Tom|Aaron|Gordon|Rishi|Ryan|George|Guy|Yuri|Maxim|Dmitry|Pavel|Male|male|x-gbd|x-rjs|x-iol|x-iom/;
function loadVoices(){if("speechSynthesis" in window)voices=speechSynthesis.getVoices()}
if("speechSynthesis" in window){loadVoices();speechSynthesis.onvoiceschanged=loadVoices}
function voiceFor(lang){
  const want={en:/^en([-_]|$)/i,kk:/^kk([-_]|$)/i,ru:/^ru([-_]|$)/i}[lang];
  let list=voices.filter(v=>want.test(v.lang));
  if(!list.length&&lang==="kk")list=voices.filter(v=>/^ru([-_]|$)/i.test(v.lang)); /* few phones have Kazakh: Russian reads Cyrillic closest */
  const sc=v=>(FEMALE.test(v.name)?50:0)-(MALE.test(v.name)?60:0)+(/Premium|Enhanced|Natural|Neural/i.test(v.name)?15:0)+(lang==="en"&&/^en[-_]GB/i.test(v.lang)?8:0);
  return list.sort((a,b)=>sc(b)-sc(a))[0]||null}
/* recorded voice: audio/index.json maps "lang|text" to a file in audio/; anything not recorded falls back to the phone voice */
let CLIPS={};
fetch("audio/index.json").then(r=>r.ok?r.json():{}).then(j=>{CLIPS=j}).catch(()=>{});
function say(text,lang=L()){
  const file=CLIPS[lang+"|"+text],clip=file?"audio/"+file:(lang==="en"&&VOICE_CLIPS[text]);
  if("speechSynthesis" in window)speechSynthesis.cancel();
  if(clip){try{player.pause();player.src=clip;player.currentTime=0;const p=player.play();if(p&&p.catch)p.catch(()=>speak(text,lang));return}catch(e){}}
  speak(text,lang)}
function speak(text,lang){if(!("speechSynthesis" in window))return;if(!voices.length)loadVoices();clearTimeout(sayTimer);
  sayTimer=setTimeout(()=>{const u=new SpeechSynthesisUtterance(text),v=voiceFor(lang);
    u.lang=v?v.lang:{en:"en-GB",kk:"kk-KZ",ru:"ru-RU"}[lang];if(v)u.voice=v;u.rate=lang==="en"?.78:.85;u.pitch=1.12;u.volume=.9;speechSynthesis.speak(u)},80)}
/* what a card says when tapped */
function cardLine(it){const l=L(),w=word(it);
  if(ITEM_PHRASE[it.key])return `${cap(w)}! ${ITEM_PHRASE[it.key][l]}`;
  if(SOUNDS[it.key])return `${cap(w)}! ${SAY[l].sound(it)}`;
  return cap(w)}

/* ---------- digits: real watercolour texture cut to number shapes ---------- */
const DIGITS={};
const DIGIT_COLS=["#B9653B","#D4A863","#7E9A6E","#5E7FA0","#B8473C","#7E5C7A","#D98A3E","#8E6142","#5E7FA0","#B9653B"];
function buildDigits(){return Promise.all(Array.from({length:10},(_,k)=>new Promise(res=>{const n=k+1,img=new Image();
  img.onload=()=>{const cv=document.createElement("canvas");cv.width=600;cv.height=800;const c=cv.getContext("2d");
    c.drawImage(img,-300,-380,1200,1600);c.globalCompositeOperation="destination-in";c.textAlign="center";
    c.font=`800 ${n===10?480:620}px Nunito, "Arial Rounded MT Bold", sans-serif`;c.fillText(String(n),300,n===10?560:600);
    DIGITS[n]=cv.toDataURL("image/png");res()};img.onerror=res;img.src=PAINTED["d-"+DIGIT_COLS[n-1]]})))}

/* ---------- profiles ---------- */
function profiles(editId){
  const editing=editId?kids.find(k=>k.id===editId):null,k=editing||{name:"",age:2,learn:"en",help:H()};
  const tt=T[k.help]||T.kk;
  view.innerHTML=`<div class="col">
   ${kids.length?`<div class="top">${navBtns()}</div>
   <div class="kids">${kids.map(x=>`<div class="kidrow${x.id===kid().id?" on":""}"><button class="kidpick" data-id="${x.id}"><b>${esc(x.name)}</b><span>${T[x.help].ageWord(x.age)} · ${LANGS[x.learn]} · ★ ${x.stars||0}</span></button><button class="pill" data-edit="${x.id}">${tt.edit}</button><button class="pill del" data-del="${x.id}" aria-label="${tt.del}">✕</button></div>`).join("")}</div>`:""}
   ${accountBlock()}
   <form class="kidform" id="kidform">
    <h1>${editing?esc(editing.name):kids.length?tt.addKid.replace("+ ",""):tt.kidTitle}</h1>
    <p class="sub">${tt.kidIntro}</p>
    <label class="fld"><span>${tt.who_name}</span><input id="kName" required maxlength="24" value="${esc(k.name)}" placeholder="Айлин" autocomplete="off"></label>
    <div class="fld"><span>${tt.age}</span><div class="seg" id="kAge">${[1,2,3,4,5,6].map(a=>`<button type="button" data-v="${a}" aria-pressed="${a===k.age}">${a}</button>`).join("")}</div></div>
    <div class="fld"><span>${tt.learn}</span><div class="seg" id="kLearn">${Object.entries(LANGS).map(([c,n])=>`<button type="button" data-v="${c}" aria-pressed="${c===k.learn}">${n}</button>`).join("")}</div></div>
    <div class="fld"><span>${tt.help}</span><div class="seg" id="kHelp">${["kk","ru"].map(c=>`<button type="button" data-v="${c}" aria-pressed="${c===k.help}">${LANGS[c]}</button>`).join("")}</div></div>
    <div class="row"><button class="go" type="submit">${tt.start}</button>${editing?`<button class="pill" type="button" id="kDel">${tt.del}</button>`:""}</div>
   </form></div>`;
  const seg=id=>{const box=$(id);box.querySelectorAll("button").forEach(b=>b.onclick=()=>{box.querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",x===b))})};
  ["#kAge","#kLearn","#kHelp"].forEach(seg);
  const val=id=>$(id).querySelector('[aria-pressed="true"]').dataset.v;
  function readForm(){return{name:$("#kName").value.trim(),age:+val("#kAge"),learn:val("#kLearn"),help:val("#kHelp")}}
  $("#kidform").onsubmit=e=>{e.preventDefault();const f=readForm();if(!f.name){$("#kName").focus();return}
    if(editing)Object.assign(editing,f);else{const nk={id:"k"+Date.now().toString(36),stars:0,...f};kids.push(nk);curId=nk.id}
    saveKids();paintHeader();home()};
  bindBack();bindAccount();
  view.querySelectorAll("[data-id]").forEach(b=>b.onclick=()=>{curId=b.dataset.id;saveKids();paintHeader();home()});
  view.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>profiles(b.dataset.edit));
  view.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>{const x=kids.find(k=>k.id===b.dataset.del);if(!x)return;
    if(!b.dataset.sure){b.dataset.sure=1;b.classList.add("sure");b.textContent=(H()==="ru"?`Удалить ${x.name}?`:`${x.name} өшірілсін бе?`);return}
    kids=kids.filter(k=>k!==x);if(curId===x.id)curId=kids[0]?kids[0].id:null;store.set("kids",kids);store.set("kid",curId);if(typeof pushFamily==="function")pushFamily(true);paintHeader();profiles()});
  if($("#kDel"))$("#kDel").onclick=()=>{const b=$("#kDel");if(!b.dataset.sure){b.dataset.sure=1;b.textContent=(H()==="ru"?"Точно удалить?":"Шынымен өшіру?");return}
    kids=kids.filter(x=>x!==editing);curId=kids[0]?kids[0].id:null;saveKids();paintHeader();kids.length?home():profiles()};
}

/* ---------- programme state ---------- */
const prog=()=>{const k=kid();k.prog=k.prog||{day:0,done:{},w:{}};return k.prog};
const saveProg=()=>{if(!kid().sample)saveKids()};
function dayPlan(d){
  const lv=level(),seq=PROGRAM[lv.id],th=THEME[seq[d%seq.length]],kind=DAY_KIND[Math.floor(d/seq.length)%5],it=th.items,n=it.length;
  const focus={words:it.slice(0,3),words2:it.slice(3,6),game:it.slice(0,6),life:[it[6%n],it[7%n],it[0]],review:it.slice(0,3)}[kind];
  return {d,lv,th,kind:kind==="life"&&!th.life?"hunt":kind,focus,week:Math.floor(d/5)+1,dayN:d%5+1}}
function stepsFor(p){const h=H(),PT=P[h],q=SAY[L()].where(p.focus[0]);
  switch(p.kind){case"words":return PT.how.words(q);case"words2":return PT.how.words2(SAY[L()].where(p.focus[1]||p.focus[0]));
   case"game":return PT.how.game();case"life":return PT.how.life(LIFE[p.th.life].phrases.slice(0,3).map(x=>x[L()]));
   case"hunt":return PT.how.hunt(q);default:return PT.how.review()}}
function startDay(p){const sub=p.th,start=Math.max(0,p.th.items.indexOf(p.focus[0]));
  if(p.kind==="game")return p.lv.id==="sabi"?peek(null,p.th.items):find(p.th);
  if(p.kind==="review")return progress(p.th.id);
  if(p.kind==="life"&&p.lv.id!=="sabi")return phrases(p.th);
  return p.lv.id==="sabi"?listen(sub,start):learn(sub,start)}
function phrases(th){view.innerHTML=`<div class="col">${topBar(th.name[H()])}${lifeBlock(th.life)}</div>`;bindBack();bindLife()}

/* ---------- home: today's plan ---------- */
function home(viewDay){if(typeof viewDay!=="number")viewDay=null;
  const k=kid(),tt=t(),PT=P[H()],pr=prog(),d=viewDay==null?pr.day:viewDay,p=dayPlan(d),thName=p.th.name[H()],done=!!pr.done[d];
  const wk0=Math.floor(pr.day/5)*5;
  view.innerHTML=`<div class="col">
   ${k.sample?`<button class="setup" id="setup"><b>${tt.kidTitle}</b><span>${tt.kidIntro}</span><em>${tt.start} →</em></button>`:""}
   <section class="today">
    <div class="today-head"><div><span class="eyebrow">${PT.academy}${k.sample?"":" · "+esc(k.name)}</span><h1>${PT.today}</h1></div><img class="mascot" alt="" src="${PAINTED.rabbit}"></div>
    <div class="plan">
     <span class="plan-meta">${PT.week(p.week)} · ${PT.day(p.dayN)} · ${p.th.name[L()]}${needTr()?`<i class="tr-opt"> · ${thName}</i>`:""}</span>
     <h2>${PT.title[p.kind](thName)}</h2>
     <span class="mins">${PT.mins(MINUTES[p.lv.id])}</span>
     <div class="thumbs all">${p.th.items.map((it,k)=>`<button class="thumb${p.focus.includes(it)?" focus":""}" data-t="${k}" aria-label="${esc(word(it))}"><img alt="" src="${art(it)}"><span>${esc(word(it))}</span></button>`).join("")}</div>
     <h3>${PT.steps}</h3>
     <ol class="steps">${stepsFor(p).map(x=>`<li>${esc(x)}</li>`).join("")}</ol>
    </div>
    <div class="actions">
     <button class="act main" id="go"><b>▶ ${PT.start}</b></button>
     <button class="act" id="cards"><b>${PT.cards}</b><span>${PT.cardsSub}</span></button>
     <button class="act${done?" isdone":""}" id="done"><b>${done?"✓":PT.done}</b><span>${done?PT.doneYet:PT.doneSub}</span></button>
    </div>
    <div class="weekstrip" aria-label="${PT.week(p.week)}">${[0,1,2,3,4].map(i=>{const dd=wk0+i;return `<button data-day="${dd}" class="${pr.done[dd]?"ok":""}${dd===d?" cur":""}" aria-label="${PT.day(i+1)}">${i+1}</button>`}).join("")}</div>
   </section>
   <h2 class="sec">${tt.gamesHead}</h2>
   <div class="cats games">${p.lv.games.map(g=>`<button class="cat play" data-hg="${g}"><img alt="" src="${PAINTED[GAME_ART[g]]}"><span class="en">${gameName(g)}</span></button>`).join("")}</div>
   <div class="cats two">
    <button class="cat play" id="lib"><img alt="" src="${PAINTED.owl}"><span class="en">${PT.library}</span></button>
    <button class="cat play" id="prog"><img alt="" src="${PAINTED.bear}"><span class="en">${PT.progress}</span><span class="kz">${PT.progressSub}</span></button>
   </div>
   <button class="parents" id="parents"><b>${tt.parents}</b><span>${tt.parentsSub}</span></button>
   <div class="note">${tt.tip[p.lv.tip]}</div></div>`;
  $("#go").onclick=()=>startDay(p);
  $("#cards").onclick=()=>parents(p.th.id);
  $("#done").onclick=()=>{pr.done[d]=true;if(d>=pr.day)pr.day=d+1;saveProg();addStar();sparkle($("#done"));setTimeout(()=>home(d),350)};
  view.querySelectorAll("[data-day]").forEach(b=>b.onclick=()=>home(+b.dataset.day));
  view.querySelectorAll("[data-t]").forEach(b=>b.onclick=()=>{const it=p.th.items[+b.dataset.t];say(cardLine(it));b.classList.remove("lift");void b.offsetWidth;b.classList.add("lift")});
  view.querySelectorAll("[data-hg]").forEach(b=>b.onclick=()=>GAME_RUN[b.dataset.hg]());
  $("#lib").onclick=library;$("#prog").onclick=()=>progress();
  $("#parents").onclick=()=>parents(p.th.id);
  if($("#setup"))$("#setup").onclick=()=>profiles();
  if(done&&d===pr.day-1){const nb=document.createElement("button");nb.className="pill nextday";nb.textContent=PT.next;nb.onclick=()=>home(pr.day);$("#done").closest(".today").appendChild(nb)}
}

/* ---------- progress ---------- */
function progress(onlyTheme){
  const PT=P[H()],pr=prog(),lv=level(),ths=onlyTheme?[THEME[onlyTheme]]:PROGRAM[lv.id].map(id=>THEME[id]);
  const all=PROGRAM[lv.id].flatMap(id=>THEME[id].items),und=all.filter(it=>(pr.w[it.key+"@"+it.theme]||0)>=1).length,sy=all.filter(it=>(pr.w[it.key+"@"+it.theme]||0)>=2).length;
  view.innerHTML=`<div class="col">${topBar(PT.progress)}
   <div class="stats"><div><b>${und}</b><span>${PT.understands}</span></div><div><b>${sy}</b><span>${PT.says}</span></div><div><b>${Object.keys(pr.done).length}</b><span>${PT.daysDone("").replace(/[: ]+$/,"")}</span></div></div>
   <p class="sub">${PT.tapWord}</p>
   ${ths.map(th=>`<section class="pgroup"><h2>${th.name[L()]}${needTr()?` <i class="tr-opt">· ${th.name[H()]}</i>`:""}</h2><div class="wchips">${th.items.map(it=>{const id=it.key+"@"+it.theme,v=pr.w[id]||0;
     return `<button class="wchip s${v}" data-w="${id}"><img alt="" src="${art(it)}"><b>${esc(word(it))}</b><span>${PT.status[v]}</span></button>`}).join("")}</div></section>`).join("")}</div>`;
  bindBack();
  view.querySelectorAll("[data-w]").forEach(b=>b.onclick=()=>{const v=((pr.w[b.dataset.w]||0)+1)%3;pr.w[b.dataset.w]=v;saveProg();
    b.className="wchip s"+v;b.querySelector("span").textContent=PT.status[v];if(v===2)sparkle(b)});
}

/* ---------- library (all games and themes) ---------- */
const GAME_ART={find:"owl",who:"duck",pair:"mittens",listen:"rabbit",peek:"fox"};
function library(){
  const lv=level(),k=kid(),tt=t(),ageNote=false?`<p class="soon">${tt.soon}</p>`:"";
  view.innerHTML=`<div class="col">
   ${topBar(P[H()].library)}${ageNote}
   <h2 class="sec">${tt.gamesHead}</h2>
   <div class="cats">${lv.games.map(g=>`<button class="cat play" data-g="${g}"><img alt="" src="${PAINTED[GAME_ART[g]]}"><span class="en">${gameName(g)}</span>${g==="listen"||g==="peek"?`<span class="kz">${tt[g+"Sub"]}</span>`:""}</button>`).join("")}</div>
   <h2 class="sec">${tt.themesHead}</h2>
   <div class="cats">${lv.themes.map(id=>{const th=THEME[id];return `<button class="cat" data-c="${id}"><img alt="" src="${art(th.items[0])}"><span class="en">${th.name[L()]}</span><span class="kz tr-opt">${th.name[H()]}</span></button>`}).join("")}</div>
   </div>`;bindBack();
  view.querySelectorAll("[data-c]").forEach(b=>b.onclick=()=>lv.id==="sabi"?listen(THEME[b.dataset.c],0):learn(THEME[b.dataset.c],0));
  view.querySelectorAll("[data-g]").forEach(b=>b.onclick=()=>GAME_RUN[b.dataset.g]());
}
const navBtns=()=>"";
const topBar=title=>`<div class="top">${navBtns()}${title?`<h1 class="h-sm">${title}</h1>`:""}</div>`;
const bindBack=()=>{};
function paintNav(){const b=$("#nBack"),f=$("#nFwd"),h=$("#nHome"),tt=t();if(!b)return;
  b.disabled=navCur<=0;f.disabled=navCur>=navHist.length-1;const atHome=navHist[navCur]&&navHist[navCur].fn===homeRaw;h.disabled=!!atHome;
  b.querySelector("span").textContent=tt.back.replace(/^←\s*/,"");h.querySelector("span").textContent=tt.home;f.querySelector("span").textContent=tt.fwd}
function praise(){const l=L(),i=rand(4);return{main:PRAISE[l][i],help:PRAISE[H()][i]}}

/* ---------- 1–2 years: listen (tap a big picture) ---------- */
function babyPool(theme){const lv=level();return theme?theme.items:lv.themes.filter(id=>!THEME[id].bare).flatMap(id=>THEME[id].items)}
function listen(theme,i){
  const pool=theme?theme.items:(listen.pool=listen.pool&&i?listen.pool:shuffle(babyPool(null).slice()));
  const it=pool[i%pool.length];
  view.innerHTML=`<div class="col">${topBar(theme?theme.name[L()]:t().listen)}
   <button class="baby" id="baby" aria-label="${esc(word(it))}"><img alt="" src="${art(it)}"><span class="bw">${esc(cap(word(it)))}</span><span class="tr-opt bh">${needTr()?esc(helpWord(it)):""}</span></button>
   <div class="babynav"><span class="hint">${t().tapHint}</span><button class="next" id="next" aria-label="→">→</button></div></div>`;
  bindBack();
  const b=$("#baby");b.onclick=()=>{say(cardLine(it));b.classList.remove("hop");void b.offsetWidth;b.classList.add("hop");sparkle(b)};
  $("#next").onclick=()=>listen(theme,i+1);
}
function sparkle(el){const r=el.getBoundingClientRect();for(let k=0;k<8;k++){const s=document.createElement("i");s.className="spark";
  s.style.left=(r.left+r.width*(.2+Math.random()*.6))+"px";s.style.top=(r.top+r.height*(.15+Math.random()*.5))+"px";
  s.style.setProperty("--x",(Math.random()*160-80)+"px");s.style.setProperty("--y",(-60-Math.random()*120)+"px");
  document.body.appendChild(s);setTimeout(()=>s.remove(),1000)}}

/* ---------- 1–2 years: peekaboo ---------- */
function peek(last,base){
  const pool=(base||babyPool(null)).filter(x=>x!==last),it=pool[rand(pool.length)];
  view.innerHTML=`<div class="col">${topBar(t().peek)}
   <button class="baby peekbox" id="peek" aria-label="${t().peek}"><img alt="" src="${art(it)}"><span class="cloud" aria-hidden="true"></span><span class="bw">${esc(cap(word(it)))}</span></button>
   <div class="babynav"><span class="hint">${t().peekSub}</span><button class="next" id="next" aria-label="→" hidden>→</button></div></div>`;
  bindBack();let open=false;const b=$("#peek");
  b.onclick=()=>{if(!open){open=true;b.classList.add("open");say(SAY[L()].peek(it));$("#next").hidden=false;sparkle(b);addStar()}else{say(cardLine(it));b.classList.remove("hop");void b.offsetWidth;b.classList.add("hop")}};
  $("#next").onclick=()=>peek(it,base);
}

/* ---------- 2+ years: learn cards ---------- */
function learn(th,i){
  const it=th.items[i],n=th.items.length,ph=ITEM_PHRASE[it.key];
  view.innerHTML=`<div class="col">${topBar(`${th.name[L()]} <span class="sub tr-opt" style="display:inline;font-family:var(--f-ui);font-size:1rem">· ${th.name[H()]}</span>`)}
   <div class="stage"><button class="nav" id="prev" aria-label="‹">‹</button>
    <button class="card" id="card"><img alt="${esc(word(it))}" src="${art(it)}"><span class="en">${esc(word(it))}</span>${trans(it)?`<span class="tr">${trans(it)}</span>`:""}<span class="kz tr-opt">${needTr()?esc(helpWord(it)):""}</span>${ph?`<span class="phr">“${esc(ph[L()])}”<i class="tr-opt">${needTr()?esc(ph[H()]):""}</i></span>`:""}</button>
    <button class="nav" id="next" aria-label="›">›</button></div>
   <div class="dots">${th.items.map((_,k)=>`<i class="${k===i?"on":""}"></i>`).join("")}</div>
   ${th.life&&level().id!=="sabi"?lifeBlock(th.life):""}</div>`;
  bindBack();bindLife();$("#prev").onclick=()=>learn(th,(i-1+n)%n);$("#next").onclick=()=>learn(th,(i+1)%n);
  const card=$("#card");card.onclick=()=>{say(cardLine(it));card.classList.remove("lift");void card.offsetWidth;card.classList.add("lift")};
}

/* ---------- phrases for parents ---------- */
function lifeBlock(id){const Lf=LIFE[id],h=H(),l=L();
  return `<section class="life" data-life="${id}"><h2>${Lf.title[h]}</h2><p>${Lf.intro[h]}</p><ul>${Lf.phrases.map((p,k)=>`<li><button class="play-ph" data-ph="${k}" aria-label="▶">▶</button><div><b>${esc(p[l])}</b>${l!==h?`<span>${esc(p[h])}</span>`:""}<em>${esc(p.when[h])}</em></div></li>`).join("")}</ul></section>`}
function bindLife(){view.querySelectorAll(".life[data-life]").forEach(sec=>{const Lf=LIFE[sec.dataset.life];
  sec.querySelectorAll("[data-ph]").forEach(b=>b.onclick=()=>say(Lf.phrases[+b.dataset.ph][L()]))})}

/* ---------- games ---------- */
function gamePool(filter){const lv=level();return lv.themes.map(id=>THEME[id]).filter(filter||(()=>true))}
function find(fixed){
  const ths=gamePool(),th=fixed||ths[rand(ths.length)],opts=shuffle(th.items.slice()).slice(0,3),ans=opts[rand(3)],q=SAY[L()].where(ans);
  view.innerHTML=`<div class="col">${topBar()}
   <div class="ask"><span class="en">${esc(q)}</span>${needTr()?`<span class="kz tr-opt">${esc(SAY[H()].where(ans))}</span>`:""}<button class="listen" id="again">${t().again}</button></div>
   <div class="choices">${opts.map((o,k)=>`<button class="choice" data-k="${k}" aria-label="${esc(word(o))}"><img alt="" src="${art(o)}"></button>`).join("")}</div>
   <p class="cheer" id="cheer" aria-live="polite"></p></div>`;
  bindBack();$("#again").onclick=()=>say(q);setTimeout(()=>say(q),350);
  let done=false;view.querySelectorAll(".choice").forEach(b=>b.onclick=()=>{if(done)return;const o=opts[+b.dataset.k];
    if(o===ans){done=true;b.classList.add("right");const p=praise();$("#cheer").innerHTML=`<b>${p.main}</b>${needTr()?`<span class="tr-opt">${p.help}</span>`:""}`;say(p.main);addStar();later(()=>find(fixed),2200)}
    else{b.classList.remove("wrong");void b.offsetWidth;b.classList.add("wrong");say(cap(word(o)))}});
}
function whoSays(){
  const pool=gamePool(th=>th.id==="animals"||th.id==="transport").flatMap(th=>th.items).filter(it=>SOUNDS[it.key]);
  const th=pool[rand(pool.length)].theme,same=pool.filter(x=>x.theme===th),opts=shuffle(same.slice()).slice(0,3),ans=opts[rand(3)],S=SAY[L()];
  view.innerHTML=`<div class="col">${topBar()}
   <div class="ask"><span class="en">${esc(S.whoShow(ans))}</span>${needTr()?`<span class="kz tr-opt">${esc(SAY[H()].whoShow(ans))}</span>`:""}<button class="listen" id="again">${t().again}</button></div>
   <div class="choices">${opts.map((o,k)=>`<button class="choice" data-k="${k}" aria-label="${esc(word(o))}"><img alt="" src="${art(o)}"></button>`).join("")}</div>
   <p class="cheer" id="cheer" aria-live="polite"></p></div>`;
  bindBack();const ask=()=>say(S.who(ans));$("#again").onclick=ask;setTimeout(ask,350);
  let done=false;view.querySelectorAll(".choice").forEach(b=>b.onclick=()=>{if(done)return;const o=opts[+b.dataset.k];
    if(o===ans){done=true;b.classList.add("right");const p=praise();
      $("#cheer").innerHTML=`<b>${esc(S.soundShow(ans))}</b>${needTr()?`<span class="tr-opt">${esc(SAY[H()].soundShow(ans))} ${p.help}</span>`:""}`;
      say(S.yes(ans));addStar();later(whoSays,2800)}
    else{b.classList.remove("wrong");void b.offsetWidth;b.classList.add("wrong");say(S.no(o))}});
}
function memory(pairs){
  const ths=gamePool(th=>th.id!=="numbers"),th=ths[rand(ths.length)];
  const picks=shuffle(th.items.slice()).slice(0,pairs),deck=shuffle([...picks,...picks]);
  view.innerHTML=`<div class="col">${topBar(t().pair)}
   <div class="mem m${deck.length}">${deck.map((it,k)=>`<button class="mcard" data-k="${k}" aria-label="?"><span class="back"></span><img alt="" src="${art(it)}"></button>`).join("")}</div>
   <p class="cheer" id="cheer" aria-live="polite"></p>
   <div class="memctl">${[3,4,6].map(n=>`<button class="pill" data-p="${n}" aria-pressed="${n===pairs}">${n} ${t().pairs}</button>`).join("")}</div></div>`;
  bindBack();view.querySelectorAll("[data-p]").forEach(b=>b.onclick=()=>memory(+b.dataset.p));
  let open=[],lock=false,found=0;const btns=[...view.querySelectorAll(".mcard")];
  btns.forEach(b=>b.onclick=()=>{const k=+b.dataset.k;if(lock||b.classList.contains("up"))return;
    b.classList.add("up");say(cap(word(deck[k])));open.push(k);if(open.length<2)return;const [a,c]=open;open=[];
    if(deck[a]===deck[c]){found++;setTimeout(()=>{btns[a].classList.add("done");btns[c].classList.add("done")},400);
      if(found===pairs){addStar();const p=praise();setTimeout(()=>{$("#cheer").innerHTML=`<b>${p.main}</b>${needTr()?`<span class="tr-opt">${p.help}</span>`:""}`;say(p.main)},900)}}
    else{lock=true;setTimeout(()=>{btns[a].classList.remove("up");btns[c].classList.remove("up");lock=false},1300)}});
}

/* ---------- parents ---------- */
function parents(sel){
  const th=THEME[sel]||THEMES[0],tt=t(),l=L(),h=H();
  view.innerHTML=`<div class="col">
   <div class="top noprint">${navBtns()}<h1 class="h-sm">${tt.parents}</h1></div>
   <p class="sub noprint">${tt.parentsIntro}</p>
   <div class="chips noprint">${THEMES.map(x=>`<button class="pill" data-s="${x.id}" aria-pressed="${x.id===th.id}">${x.name[h]}</button>`).join("")}</div>
   <div class="noprint row"><button class="listen" id="print">${tt.print}</button><span class="sub" style="font-size:.85rem">${tt.printNote}: sagindikovaaya-hue.github.io/kishkentai</span></div>
   <div class="sheet"><h2 class="printonly">${th.name[l]}${l!==h?" · "+th.name[h]:""}</h2>${th.items.map(it=>`<div class="pcard"><img alt="" src="${art(it)}"><b>${esc(word(it))}</b>${l!==h?`<span>${esc(helpWord(it))}</span>`:""}</div>`).join("")}</div>
   ${th.life?lifeBlock(th.life):""}
   <section class="life"><h2>${tt.chkTitle}</h2><p>${tt.chkIntro}</p>
    <div class="tablewrap"><table class="chk"><thead><tr><th>${tt.word}</th><th>${tt.understands}</th><th>${tt.says}</th></tr></thead><tbody>${th.items.map(it=>`<tr><td><b>${esc(word(it))}</b>${l!==h?" · "+esc(helpWord(it)):""}</td><td>☐</td><td>☐</td></tr>`).join("")}</tbody></table></div></section></div>`;
  bindBack();view.querySelectorAll("[data-s]").forEach(b=>b.onclick=()=>parents(b.dataset.s));
  $("#print").onclick=()=>{try{window.print()}catch(e){}};bindLife();
}

/* ---------- back / forward: every screen is a history entry, so the phone's back button, the iPhone swipe and the browser arrows all work ---------- */
let navHist=[],navCur=-1,navRestoring=false,screenTok=0;
/* a timer that only fires if the person is still on the same screen (no jumping back into a game they left) */
function later(f,ms){const tk=screenTok;setTimeout(()=>{if(tk===screenTok)f()},ms)}
function nav(fn){return function(...a){
  if(!navRestoring){const top=navHist[navCur];
    if(top&&top.fn===fn){navHist[navCur]={fn,a};try{history.replaceState({kd:navCur},"")}catch(e){}}   /* next card or next round: same screen */
    else{navHist=navHist.slice(0,navCur+1);navHist.push({fn,a});navCur=navHist.length-1;
      try{navCur===0?history.replaceState({kd:0},""):history.pushState({kd:navCur},"")}catch(e){}}}
  screenTok++;const r=fn.apply(this,a);window.scrollTo(0,0);paintNav();return r}}
function navShow(i){const e=navHist[i];if(!e)return;navCur=i;navRestoring=true;screenTok++;try{e.fn.apply(null,e.a)}finally{navRestoring=false}window.scrollTo(0,0);paintNav()}
function navBack(){if(navCur>0){try{history.back()}catch(e){navShow(navCur-1)}}else home()}
function navFwd(){if(navCur<navHist.length-1){try{history.forward()}catch(e){navShow(navCur+1)}}}
window.addEventListener("popstate",e=>{const i=e.state&&typeof e.state.kd==="number"?e.state.kd:0;if(navHist[i])navShow(i);else{navHist=[];navCur=-1;home()}});
const homeRaw=home;home=nav(home);library=nav(library);profiles=nav(profiles);parents=nav(parents);progress=nav(progress);phrases=nav(phrases);
learn=nav(learn);listen=nav(listen);peek=nav(peek);find=nav(find);whoSays=nav(whoSays);memory=nav(memory);
knock=nav(knock);bubbles=nav(bubbles);goodnight=nav(goodnight);shadow=nav(shadow);feed=nav(feed);dress=nav(dress);colorGame=nav(colorGame);
oddone=nav(oddone);count=nav(count);missing=nav(missing);letter=nav(letter);spell=nav(spell);repeat=nav(repeat);wordpair=nav(wordpair);

$("#nBack").onclick=navBack;$("#nFwd").onclick=navFwd;$("#nHome").onclick=()=>home();

/* ---------- start ---------- */
initAccount();paintHeader();
Promise.race([document.fonts.load('800 300px Nunito'),new Promise(r=>setTimeout(r,1500))]).then(buildDigits,buildDigits).then(()=>home(),()=>home());
