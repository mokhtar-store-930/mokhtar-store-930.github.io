/* Role-specific registration and cache. Network first, no cross-role navigation capture. */
const ROLE='accountant',V='v52',CACHE='mk-role-'+ROLE+'-'+V;
const HOME=new URL('./',self.location.href).href;
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll([HOME,HOME+'manifest.json'])).catch(()=>{}))});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('mk-role-'+ROLE+'-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('message',e=>{if(e.data==='skip')self.skipWaiting()});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);if(u.origin!==self.location.origin)return;if(e.request.mode==='navigate'&&u.href.startsWith(HOME)){e.respondWith(fetch(new Request(e.request,{cache:'no-cache'})).then(r=>{if(r.ok)caches.open(CACHE).then(c=>c.put(HOME,r.clone()));return r}).catch(()=>caches.match(HOME).then(r=>r||new Response('Offline',{status:503}))));}});
