/* List every phrase the app speaks for a theme, per language, exactly as say() receives it.
   node tools/voice_texts.js animals          -> JSON [{lang,text}]
   Keep in step with the say(...) call sites in src/app.js. */
const fs=require("fs"),path=require("path");
const src=fs.readFileSync(path.join(__dirname,"../src/content.js"),"utf8")+";globalThis.X={THEME,ITEM_PHRASE,LIFE,SOUNDS,SAY,PRAISE}";
(0,eval)(src);
const {THEME,ITEM_PHRASE,LIFE,SOUNDS,SAY,PRAISE}=X,cap=s=>s[0].toUpperCase()+s.slice(1);
const id=process.argv[2],th=THEME[id];if(!th){console.error("unknown theme",id);process.exit(1)}
const out=new Set(),add=(lang,t)=>t&&out.add(JSON.stringify({lang,text:t}));
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
console.log(JSON.stringify([...out].map(s=>JSON.parse(s)),null,1));
