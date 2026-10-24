/* ---------- more games: 1–2 years (no wrong answers), 2–3 years (pick one of three), 3–6 years (thinking, counting, letters) ---------- */

/* every picture by key, first theme wins (the animal "duck" stays the animal) */
const ITEMS={};for(const th of THEMES)for(const it of th.items)if(!(it.key in ITEMS))ITEMS[it.key]=it;
const pick=(arr,n)=>shuffle(arr.slice()).slice(0,n);
const W=it=>cap(word(it));

/* game names and hints for the parent */
const GT={
 kk:{knock:"Тық-тық",bubbles:"Көпіршіктер",goodnight:"Қайырлы түн",shadow:"Кімнің көлеңкесі?",feed:"Тамақтандыр",dress:"Киіндір",color:"Қандай түс?",
  oddone:"Қайсысы артық?",count:"Санап көр",missing:"Не жоғалды?",letter:"Бірінші әріп",spell:"Сөз құра",repeat:"Қайтала",wordpair:"Сурет пен сөз",
  tapDoor:"Есікті бас",tapBubble:"Көпіршікті жар!",tapSleep:"Ойыншықты ұйықтат",ready:"Көрдім ✓",said:"Айтты ✓",again:"Тағы бір рет",next:"Келесі →"},
 ru:{knock:"Тук-тук",bubbles:"Пузырьки",goodnight:"Спокойной ночи",shadow:"Чья тень?",feed:"Покорми",dress:"Одень",color:"Какого цвета?",
  oddone:"Что лишнее?",count:"Посчитай",missing:"Что пропало?",letter:"Первая буква",spell:"Собери слово",repeat:"Повтори",wordpair:"Картинка и слово",
  tapDoor:"Нажми на дверь",tapBubble:"Лопай пузыри!",tapSleep:"Уложи игрушку спать",ready:"Запомнил ✓",said:"Сказал ✓",again:"Ещё раз",next:"Дальше →"}};
const gt=()=>GT[H()];
Object.assign(GAME_ART,{knock:"bear",bubbles:"bubbles",goodnight:"moon",shadow:"elephant",feed:"horse",dress:"hat",color:"c-red",
  oddone:"giraffe",count:"cherry",missing:"teddy",letter:"apple",spell:"cat",repeat:"sheep",wordpair:"socks"});
const GAME_RUN={find:()=>find(),who:()=>whoSays(),pair:()=>memory(3),listen:()=>listen(null,0),peek:()=>peek(null),
  knock:()=>knock(),bubbles:()=>bubbles(),goodnight:()=>goodnight(0),shadow:()=>shadow(),feed:()=>feed(),dress:()=>dress(),color:()=>colorGame(),
  oddone:()=>oddone(),count:()=>count(),missing:()=>missing(),letter:()=>letter(),spell:()=>spell(),repeat:()=>repeat(),wordpair:()=>wordpair()};
const gameName=g=>t()[g]||gt()[g]||g;

/* a three-choice round: right answer gets praise and a star, wrong one shakes and says its name */
function choiceRound({title,q,qHelp,ask,opts,ans,show=o=>`<img alt="" src="${art(o)}">`,label=o=>W(o),onRight,again}){
  view.innerHTML=`<div class="col">${topBar(title)}
   <div class="ask"><span class="en">${esc(q)}</span>${needTr()&&qHelp?`<span class="kz tr-opt">${esc(qHelp)}</span>`:""}<button class="listen" id="again">${t().again}</button></div>
   ${ask||""}
   <div class="choices">${opts.map((o,k)=>`<button class="choice" data-k="${k}" aria-label="${esc(label(o))}">${show(o)}</button>`).join("")}</div>
   <p class="cheer" id="cheer" aria-live="polite"></p></div>`;
  const speakQ=()=>say(q);$("#again").onclick=speakQ;setTimeout(speakQ,350);
  let done=false;view.querySelectorAll(".choice").forEach(b=>b.onclick=()=>{if(done)return;const o=opts[+b.dataset.k];
    if(o===ans){done=true;b.classList.add("right");const p=praise(),line=onRight?onRight():p.main;
      $("#cheer").innerHTML=`<b>${esc(line)}</b>${needTr()?`<span class="tr-opt">${p.help}</span>`:""}`;say(line);addStar();sparkle(b);later(again,2300)}
    else{b.classList.remove("wrong");void b.offsetWidth;b.classList.add("wrong");say(label(o))}})}

/* ===== 1–2 years ===== */
function knock(last){
  const pool=THEME.animals.items.filter(x=>SOUNDS[x.key]&&x!==last),it=pool[rand(pool.length)];
  view.innerHTML=`<div class="col">${topBar(gameName("knock"))}
   <button class="baby doorbox" id="door" aria-label="${gt().tapDoor}"><img alt="" src="${art(it)}"><span class="door" aria-hidden="true"><i></i></span><span class="bw">${esc(W(it))}</span></button>
   <div class="babynav"><span class="hint">${gt().tapDoor}</span><button class="next" id="next" aria-label="→" hidden>→</button></div></div>`;
  let open=false;const b=$("#door");
  b.onclick=()=>{if(!open){say(G[L()].knock);b.classList.add("knocking");later(()=>{open=true;b.classList.add("open");say(cardLine(it));$("#next").hidden=false;sparkle(b);addStar()},1400)}
    else{say(cardLine(it));b.classList.remove("hop");void b.offsetWidth;b.classList.add("hop")}};
  $("#next").onclick=()=>knock(it)}

function bubbles(){
  const pool=level().themes.filter(id=>!THEME[id].bare).flatMap(id=>THEME[id].items);
  view.innerHTML=`<div class="col">${topBar(gameName("bubbles"))}<div class="pond" id="pond" aria-label="${gt().tapBubble}"></div><p class="hint" style="text-align:center">${gt().tapBubble}</p></div>`;
  const pond=$("#pond");let popped=0;
  const spawn=()=>{if(!document.body.contains(pond))return;
    if(pond.children.length<6){const it=pool[rand(pool.length)],b=document.createElement("button");b.className="bubble";b.setAttribute("aria-label",W(it));
      const size=90+rand(40);b.style.width=b.style.height=size+"px";b.style.left=(5+rand(70))+"%";b.style.animationDuration=(7+rand(5))+"s";
      b.innerHTML=`<img alt="" src="${art(it)}">`;
      b.onclick=()=>{if(b.classList.contains("pop"))return;b.classList.add("pop");say(W(it));sparkle(b);if(++popped%5===0)addStar();setTimeout(()=>b.remove(),450)};
      b.addEventListener("animationend",e=>{if(e.animationName==="rise")b.remove()});pond.appendChild(b)}
    setTimeout(spawn,1100)};
  spawn()}

function goodnight(i){
  const toys=["teddy","cat","rabbit","bear","sheep","duck","owl"].map(k=>ITEMS[k]).filter(Boolean);
  if(i>=toys.length){view.innerHTML=`<div class="col night" style="--dim:.75">${topBar(gameName("goodnight"))}
     <div class="baby"><img alt="" src="${art(ITEMS.moon||toys[0])}"><span class="bw">${esc(G[L()].dreams)}</span></div>
     <div class="babynav"><span class="hint"></span><button class="next" id="next" aria-label="↺">↺</button></div></div>`;
    say(G[L()].dreams);addStar();$("#next").onclick=()=>goodnight(0);return}
  const it=toys[i];
  view.innerHTML=`<div class="col night" style="--dim:${(i/toys.length*.6).toFixed(2)}">${topBar(gameName("goodnight"))}
   <button class="baby" id="toy" aria-label="${esc(W(it))}"><img alt="" src="${art(it)}"><span class="bw">${esc(W(it))}</span></button>
   <div class="babynav"><span class="hint">${gt().tapSleep} · ${i+1}/${toys.length}</span><button class="next" id="next" aria-label="→" hidden>→</button></div></div>`;
  const b=$("#toy");b.onclick=()=>{say(G[L()].night(word(it)));b.classList.add("sleepy");$("#next").hidden=false};
  $("#next").onclick=()=>goodnight(i+1)}

/* ===== 2–3 years ===== */
const SIL={};
function silhouette(it){if(SIL[it.key])return Promise.resolve(SIL[it.key]);
  return new Promise(res=>{const img=new Image();img.onload=()=>{const c=document.createElement("canvas");c.width=img.width;c.height=img.height;const x=c.getContext("2d");x.drawImage(img,0,0);
    const d=x.getImageData(0,0,c.width,c.height),p=d.data,bg=[p[0],p[1],p[2]];
    for(let i=0;i<p.length;i+=4){const dist=Math.abs(p[i]-bg[0])+Math.abs(p[i+1]-bg[1])+Math.abs(p[i+2]-bg[2]);
      if(dist<46){p[i+3]=0}else{p[i]=74;p[i+1]=60;p[i+2]=52;p[i+3]=235}}
    x.putImageData(d,0,0);res(SIL[it.key]=c.toDataURL("image/png"))};img.onerror=()=>res(art(it));img.src=art(it)})}
function shadow(){
  const th=THEME[pick(["animals","transport","fruit"].filter(id=>level().themes.includes(id)),1)[0]],opts=pick(th.items,3),ans=opts[rand(3)];
  silhouette(ans).then(src=>choiceRound({title:gameName("shadow"),q:G[L()].shadow,qHelp:G[H()].shadow,opts,ans,
    ask:`<div class="shadowbox"><img alt="" src="${src}"></div>`,onRight:()=>W(ans),again:shadow}))}

function feed(){
  const a=ITEMS[pick(Object.keys(FEED),1)[0]],food=ITEMS[FEED[a.key]],others=pick(Object.values(FEED).filter(k=>k!==food.key),2).map(k=>ITEMS[k]),opts=shuffle([food,...others]);
  choiceRound({title:gameName("feed"),q:G[L()].hungry(L()==="en"?a.en:cap(word(a))),qHelp:G[H()].hungry(H()==="en"?a.en:cap(helpWord(a))),
    ask:`<div class="feedbox"><img alt="" src="${art(a)}"></div>`,opts,ans:food,onRight:()=>G[L()].yum(word(a),word(food)),again:feed})}

function dress(){
  const opts=pick(THEME.clothes.items,3),ans=opts[rand(3)];
  choiceRound({title:gameName("dress"),q:G[L()].dress(ans),qHelp:G[H()].dress(ans),opts,ans,onRight:()=>ITEM_PHRASE[ans.key]?ITEM_PHRASE[ans.key][L()]:W(ans),again:dress})}

function colorName(c,lang){const it=THEME.colors.items.find(x=>x.en===c);return lang==="ru"?RU_NEUT[c]:it[lang]}
function colorGame(){
  const c=pick([...new Set(Object.values(COLOR_OF))],1)[0],ans=ITEMS[pick(Object.keys(COLOR_OF).filter(k=>COLOR_OF[k]===c),1)[0]];
  const others=pick(Object.keys(COLOR_OF).filter(k=>COLOR_OF[k]!==c),2).map(k=>ITEMS[k]),opts=shuffle([ans,...others]);
  choiceRound({title:gameName("color"),q:G[L()].colorQ(colorName(c,L())),qHelp:G[H()].colorQ(colorName(c,H())),
    ask:`<div class="swatchrow"><img alt="" src="${PAINTED["c-"+c]}"></div>`,opts,ans,onRight:()=>W(ans),again:colorGame})}

/* ===== 3–6 years ===== */
function oddone(){
  const ths=level().themes.filter(id=>!THEME[id].bare),[a,b]=pick(ths,2),three=pick(THEME[a].items,3),odd=pick(THEME[b].items,1)[0],opts=shuffle([...three,odd]);
  choiceRound({title:gameName("oddone"),q:G[L()].odd,qHelp:G[H()].odd,opts,ans:odd,onRight:()=>W(odd),again:oddone});
  view.querySelector(".choices").classList.add("four")}

function count(){
  const max=level().id==="batyr"?10:5,n=1+rand(max),it=ITEMS[pick(Object.keys(COUNTABLE),1)[0]];
  const nums=THEME.numbers.items,ans=nums[n-1],opts=shuffle([ans,...pick(nums.filter(x=>x!==ans&&x.key<=max),2)]);
  choiceRound({title:gameName("count"),q:G[L()].count(COUNTABLE[it.key]),qHelp:G[H()].count(COUNTABLE[it.key]),
    ask:`<div class="countbox c${n>6?"many":""}">${Array.from({length:n},()=>`<img alt="" src="${art(it)}">`).join("")}</div>`,
    opts,ans,onRight:()=>W(ans),again:count})}

function missing(){
  const th=THEME[pick(level().themes.filter(id=>!THEME[id].bare),1)[0]],four=pick(th.items,4),gone=four[rand(4)];
  const others=pick(th.items.filter(x=>!four.includes(x)),2),opts=shuffle([gone,...(others.length===2?others:pick(four.filter(x=>x!==gone),2))]);
  view.innerHTML=`<div class="col">${topBar(gameName("missing"))}
   <div class="ask"><span class="en">${esc(G[L()].look)}</span>${needTr()?`<span class="kz tr-opt">${esc(G[H()].look)}</span>`:""}</div>
   <div class="choices four">${four.map(o=>`<div class="choice still"><img alt="" src="${art(o)}"></div>`).join("")}</div>
   <button class="go" id="ready" style="align-self:center">${gt().ready}</button></div>`;
  say(G[L()].look);
  $("#ready").onclick=()=>choiceRound({title:gameName("missing"),q:G[L()].missing,qHelp:G[H()].missing,
    ask:`<div class="choices four mini">${four.map(o=>`<div class="choice still">${o===gone?`<span class="qmark">?</span>`:`<img alt="" src="${art(o)}">`}</div>`).join("")}</div>`,
    opts,ans:gone,onRight:()=>W(gone),again:missing})}

const firstLetter=it=>[...word(it)][0].toUpperCase();
function letterPool(){return level().themes.filter(id=>!THEME[id].bare).flatMap(id=>THEME[id].items).filter(it=>/^\p{L}/u.test(word(it)))}
function letter(){
  const pool=letterPool(),ans=pool[rand(pool.length)],L0=firstLetter(ans);
  const letters=shuffle([L0,...pick([...new Set(pool.map(firstLetter))].filter(x=>x!==L0),2)]);
  const box=letters.map(x=>({x}));const right=box.find(b=>b.x===L0);
  choiceRound({title:gameName("letter"),q:G[L()].letterQ(W(ans)),qHelp:G[H()].letterQ(cap(helpWord(ans))),
    ask:`<div class="feedbox"><img alt="" src="${art(ans)}"></div>`,opts:box,ans:right,show:b=>`<span class="bigletter">${esc(b.x)}</span>`,label:b=>b.x,
    onRight:()=>G[L()].letterA(W(ans),L0),again:letter})}

function spell(){
  const pool=letterPool().filter(it=>/^\p{L}{2,5}$/u.test(word(it))),it=pool[rand(pool.length)],target=[...word(it).toLowerCase()];
  const tiles=shuffle(target.map((c,i)=>({c,i})));let pos=0;
  view.innerHTML=`<div class="col">${topBar(gameName("spell"))}
   <div class="ask"><span class="en">${esc(G[L()].spell)}</span>${needTr()?`<span class="kz tr-opt">${esc(helpWord(it))}</span>`:""}<button class="listen" id="again">${t().again}</button></div>
   <div class="feedbox"><img alt="" src="${art(it)}"></div>
   <div class="slots">${target.map(()=>`<span class="slot"></span>`).join("")}</div>
   <div class="tiles">${tiles.map((x,k)=>`<button class="tile" data-k="${k}">${esc(x.c)}</button>`).join("")}</div>
   <p class="cheer" id="cheer" aria-live="polite"></p></div>`;
  const sayW=()=>say(W(it));$("#again").onclick=sayW;setTimeout(sayW,350);
  const slots=[...view.querySelectorAll(".slot")];
  view.querySelectorAll(".tile").forEach(b=>b.onclick=()=>{const x=tiles[+b.dataset.k];
    if(x.c===target[pos]){slots[pos].textContent=x.c;slots[pos].classList.add("on");b.disabled=true;pos++;
      if(pos===target.length){const p=praise();$("#cheer").innerHTML=`<b>${esc(W(it))}</b>${needTr()?`<span class="tr-opt">${p.help}</span>`:""}`;say(`${W(it)}! ${p.main}`);addStar();sparkle($(".slots"));later(spell,2600)}}
    else{b.classList.remove("wrong");void b.offsetWidth;b.classList.add("wrong")}})}

function repeat(){
  const pool=level().themes.filter(id=>!THEME[id].bare).flatMap(id=>THEME[id].items),it=pool[rand(pool.length)],line=G[L()].sayWith(W(it)),id=it.key+"@"+it.theme;
  view.innerHTML=`<div class="col">${topBar(gameName("repeat"))}
   <button class="baby" id="pic"><img alt="" src="${art(it)}"><span class="bw">${esc(W(it))}</span><span class="tr-opt bh">${needTr()?esc(helpWord(it)):""}</span></button>
   <div class="row" style="justify-content:center"><button class="go" id="said">${gt().said}</button><button class="pill" id="again2">${gt().again}</button><button class="pill" id="skip">${gt().next}</button></div></div>`;
  setTimeout(()=>say(line),350);$("#pic").onclick=()=>say(W(it));$("#again2").onclick=()=>say(line);$("#skip").onclick=repeat;
  $("#said").onclick=()=>{const pr=prog();pr.w[id]=2;saveProg();addStar();sparkle($("#said"));const p=praise();say(p.main);later(repeat,1500)}}

function wordpair(){
  const th=THEME[pick(level().themes.filter(id=>!THEME[id].bare),1)[0]],picks=pick(th.items,4);
  const pics=shuffle(picks.slice()),words=shuffle(picks.slice());let sel=null,found=0;
  view.innerHTML=`<div class="col">${topBar(gameName("wordpair"))}
   <div class="ask"><span class="en">${esc(G[L()].match)}</span>${needTr()?`<span class="kz tr-opt">${esc(G[H()].match)}</span>`:""}</div>
   <div class="wp"><div class="wpcol">${words.map((w,k)=>`<button class="wword" data-w="${k}">${esc(W(w))}</button>`).join("")}</div>
   <div class="wpcol">${pics.map((p,k)=>`<button class="wpic" data-p="${k}"><img alt="" src="${art(p)}"></button>`).join("")}</div></div>
   <p class="cheer" id="cheer" aria-live="polite"></p></div>`;
  setTimeout(()=>say(G[L()].match),350);
  view.querySelectorAll(".wword").forEach(b=>b.onclick=()=>{if(b.disabled)return;view.querySelectorAll(".wword").forEach(x=>x.classList.remove("sel"));b.classList.add("sel");sel=+b.dataset.w;say(W(words[sel]))});
  view.querySelectorAll(".wpic").forEach(b=>b.onclick=()=>{if(sel==null||b.disabled)return;const p=pics[+b.dataset.p],wb=view.querySelector(`[data-w="${sel}"]`);
    if(p===words[sel]){b.disabled=wb.disabled=true;b.classList.add("ok");wb.classList.add("ok");wb.classList.remove("sel");sel=null;sparkle(b);
      if(++found===picks.length){const pr=praise();$("#cheer").innerHTML=`<b>${pr.main}</b>${needTr()?`<span class="tr-opt">${pr.help}</span>`:""}`;say(pr.main);addStar();later(wordpair,2400)}}
    else{b.classList.remove("wrong");void b.offsetWidth;b.classList.add("wrong");say(W(p))}})}
