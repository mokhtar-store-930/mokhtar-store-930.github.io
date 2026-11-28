/* Al-Mokhtar PWA service worker. One file, registered once per app: sw.js?app=customer|admin|rep */
var APP=(new URL(self.location.href).searchParams.get('app')||'customer');
var V='v33';var CACHE='mk-'+APP+'-'+V;
var PAGE={customer:'./index.html',admin:'./admin.html',rep:'./rep.html'}[APP]||'./index.html';
var SHELL=[PAGE,'./manifest-'+APP+'.json','./icons/'+({customer:'cust',admin:'admin',rep:'rep'}[APP])+'-192.png'];
self.addEventListener('install',function(e){e.waitUntil(caches.open(CACHE).then(function(c){return Promise.all(SHELL.map(function(u){return c.add(new Request(u,{cache:'reload'})).catch(function(){})}))}))});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k.indexOf('mk-'+APP+'-')===0&&k!==CACHE}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}))});
self.addEventListener('message',function(e){if(e.data==='skip')self.skipWaiting()});
self.addEventListener('fetch',function(e){var r=e.request;
 if(r.method!=='GET')return;
 var u=new URL(r.url);
 if(u.origin!==self.location.origin)return;            /* never touch Supabase or any other origin */
 if(/\/(rest|auth|storage|functions|realtime)\//.test(u.pathname))return;
 if(r.mode==='navigate'){
  var pg=u.pathname.replace(/[^\/]*$/,'')+PAGE.replace('./','');if(APP==='customer'&&!(u.pathname===pg||u.pathname===u.pathname.replace(/[^\/]*$/,'')))return;  /* customer scope is the folder: ignore admin.html and rep.html */
                                /* pages: network first so updates arrive, cache only as offline fallback */
  e.respondWith(fetch(r).then(function(res){if(res&&res.ok&&res.type==='basic'){var cp=res.clone();caches.open(CACHE).then(function(c){c.put(PAGE,cp)})}return res}).catch(function(){return caches.match(PAGE).then(function(m){return m||new Response('<meta charset=utf-8><body dir=rtl style="font-family:sans-serif;text-align:center;padding:40px"><h2>مفيش اتصال بالإنترنت</h2><p>افتح التطبيق تاني لما النت يرجع.</p>',{headers:{'Content-Type':'text/html; charset=utf-8'},status:503})})}));return}
 if(/\/icons\/|manifest-|brand\.js|logo(_sm)?\.png|zxing\.min\.js|leaflet\.(js|css)/.test(u.pathname)){            /* static assets: cache first, refresh in background */
  e.respondWith(caches.match(r).then(function(m){var f=fetch(r).then(function(res){if(res&&res.ok){var cp=res.clone();caches.open(CACHE).then(function(c){c.put(r,cp)})}return res}).catch(function(){return m});return m||f}))}
});
