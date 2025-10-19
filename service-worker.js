const CACHE="rehabit-light-cal-v1";
const ASSETS=[
  "./","./index.html","./styles.css","./app.js","./manifest.webmanifest",
  "./assets/icon-192.png","./assets/icon-512.png","./assets/favicon.png",
  "./assets/tech.png","./assets/smoking.png","./assets/alcohol.png","./assets/gambling.png","./assets/drugs.png"
];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>k!==CACHE?caches.delete(k):null))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const req=e.request;
  e.respondWith(caches.match(req).then(c=>c||fetch(req).then(res=>{
    if(req.method==="GET" && new URL(req.url).origin===self.location.origin){ const clone=res.clone(); caches.open(CACHE).then(cc=>cc.put(req,clone)); }
    return res;
  }).catch(()=>caches.match("./index.html"))));
});
