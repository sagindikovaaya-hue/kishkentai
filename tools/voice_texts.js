/* List every phrase the app speaks, per language, exactly as say() receives it.
   node tools/voice_texts.js animals          -> JSON [{lang,text}] for one theme
   node tools/voice_texts.js games            -> the extra games (knock, feed, colours, counting, letters…)
   Keep in step with the say(...) call sites in src/app.js and src/games.js. */
const fs=require("fs"),path=require("path");
const src=fs.readFileSync(path.join(__dirname,"../src/content.js"),"utf8")+";globalThis.X={THEMES,THEME,ITEM_PHRASE,LIFE,SOUNDS,SAY,PRAISE,G,FEED,COLOR_OF,RU_NEUT,COUNTABLE,SHAPE_OF,WEAR,TOOL_OF,FLYERS}";
(0,eval)(src);
const {THEMES,THEME,ITEM_PHRASE,LIFE,SOUNDS,SAY,PRAISE,G,FEED,COLOR_OF,RU_NEUT,COUNTABLE,SHAPE_OF,WEAR,TOOL_OF,FLYERS}=X,cap=s=>s[0].toUpperCase()+s.slice(1);
const out=new Set(),add=(lang,t)=>t&&out.add(JSON.stringify({lang,text:t}));
const ITEMS={};for(const th of THEMES)for(const it of th.items)if(!(it.key in ITEMS))ITEMS[it.key]=it;
const id=process.argv[2];
if(id==="games"){
  for(const lang of ["en","kk","ru"]){const g=G[lang],W=it=>cap(it[lang]);
    for(const k of ["knock","dreams","shadow","odd","look","missing","spell","match"])add(lang,g[k]);
    for(const k of ["teddy","cat","rabbit","bear","sheep","duck","owl"])add(lang,g.night(ITEMS[k][lang]));
    for(const [a,f] of Object.entries(FEED)){add(lang,g.hungry(lang==="en"?ITEMS[a].en:W(ITEMS[a])));add(lang,g.yum(ITEMS[a][lang],ITEMS[f][lang]))}
    for(const it of THEME.clothes.items)add(lang,g.dress(it));
    for(const c of new Set(Object.values(COLOR_OF))){const ci=THEME.colors.items.find(x=>x.en===c);add(lang,g.colorQ(lang==="ru"?RU_NEUT[c]:ci[lang]))}
    for(const p of Object.values(COUNTABLE))add(lang,g.count(p));
    for(const th of THEMES)if(!th.bare)for(const it of th.items){const w=W(it);if(!/^\p{L}/u.test(w))continue;
      const l0=[...w][0].toUpperCase();add(lang,g.letterQ(w));add(lang,g.letterA(w,l0));add(lang,g.sayWith(w));add(lang,w)}
    /* games for the new themes */
    const line=it=>ITEM_PHRASE[it.key]?ITEM_PHRASE[it.key][lang]:W(it);
    for(const it of THEME.emotions.items){add(lang,g.feel(it[lang]));add(lang,line(it))}
    for(const [w,c] of Object.entries(WEAR)){add(lang,g.wearQ(line(ITEMS[w])));add(lang,line(ITEMS[c]))}
    for(const [o,sh] of Object.entries(SHAPE_OF)){add(lang,g.shapeQ(ITEMS[o]));add(lang,g.shapeA(ITEMS[o][lang],ITEMS[sh][lang]))}
    for(const k of ["fruit","veg"])for(const it of THEME[k].items){add(lang,g.sortQ(W(it)));add(lang,g.sortA(W(it),g[k]))}
    add(lang,g.fruit);add(lang,g.veg);
    for(const j of Object.keys(TOOL_OF)){add(lang,g.toolQ(ITEMS[j][lang]));add(lang,line(ITEMS[j]))}
    add(lang,g.flyQ);for(const f of FLYERS)add(lang,g.flyA(ITEMS[f][lang]));
    for(const p of PRAISE[lang])add(lang,p);
  }
}else{
  const th=THEME[id];if(!th){console.error("unknown theme",id);process.exit(1)}
  for(const lang of ["en","kk","ru"]){
    for(const it of th.items){
      const w=cap(it[lang]);
      add(lang,w);                                                       /* wrong answer / memory flip */
      if(ITEM_PHRASE[it.key])add(lang,`${w}! ${ITEM_PHRASE[it.key][lang]}`); /* cardLine */
      else if(SOUNDS[it.key])add(lang,`${w}! ${SAY[lang].sound(it)}`);
      add(lang,SAY[lang].where(it));add(lang,SAY[lang].peek(it));
      if(SOUNDS[it.key])for(const k of ["sound","soundShow","who","whoShow","yes","no"])add(lang,SAY[lang][k](it));
    }
    if(th.life)for(const p of LIFE[th.life].phrases)add(lang,p[lang]);
    for(const p of PRAISE[lang])add(lang,p);                             /* praise after a right answer, shared by every theme */
  }
}
console.log(JSON.stringify([...out].map(s=>JSON.parse(s)),null,1));
