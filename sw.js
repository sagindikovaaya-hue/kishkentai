/* Kishkentai offline cache: show the saved copy at once, refresh it in the background */
const CACHE="kishkentai-v19";
const CORE=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png","./apple-touch-icon.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const r=e.request;if(r.method!=="GET")return;
  const url=new URL(r.url);const ours=url.origin===location.origin,fonts=/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if(!ours&&!fonts)return;
  if(ours&&/\/audio\/.+\.mp3$/.test(url.pathname)){e.respondWith(audio(r));return}
  if(r.mode==="navigate"||(ours&&/\/(index\.html)?$/.test(url.pathname))){
    e.respondWith(caches.open(CACHE).then(c=>fetch(r).then(res=>{if(res&&res.ok)c.put(r,res.clone());return res}).catch(async()=>(await c.match(r,{ignoreSearch:true}))||c.match("./index.html"))));return}
  e.respondWith(caches.open(CACHE).then(async c=>{
    const hit=await c.match(r,{ignoreSearch:ours});
    const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==="opaque"))c.put(r,res.clone());return res}).catch(()=>hit);
    return hit||net;
  }));
});

/* voice clips: iPhone Safari only plays media that answers Range requests with 206, so serve our cached copy in slices */
async function audio(r){
  const c=await caches.open(CACHE);let hit=await c.match(r.url);
  if(!hit){const res=await fetch(r.url);if(!res.ok)return res;await c.put(r.url,res.clone());hit=res}
  const range=r.headers.get("range");if(!range)return hit;
  const buf=await hit.arrayBuffer(),m=/bytes=(\d*)-(\d*)/.exec(range)||[],a=+m[1]||0,b=m[2]?Math.min(+m[2],buf.byteLength-1):buf.byteLength-1;
  return new Response(buf.slice(a,b+1),{status:206,headers:{"Content-Type":"audio/mpeg","Content-Range":`bytes ${a}-${b}/${buf.byteLength}`,"Content-Length":String(b-a+1)}})}
