!function(){"use strict";const e=["client/index.dfef896d.js","client/api.2d894ecb.js","client/client.91802df1.js","client/StreamerAutoComplete.78c19bae.js","client/index.b048bf20.js","client/hidden-links.78d4185d.js","client/[id].7dcd795c.js","client/map.998bca1b.js","client/apexcharts.esm.badd772e.js"].concat(["service-worker-index.html","favicon.png","global.css","index.css","manifest.json","tailwind.css"]),t=new Set(e);self.addEventListener("install",t=>{t.waitUntil(caches.open("cache1578264292735").then(t=>t.addAll(e)).then(()=>{self.skipWaiting()}))}),self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(async e=>{for(const t of e)"cache1578264292735"!==t&&await caches.delete(t);self.clients.claim()}))}),self.addEventListener("fetch",e=>{if("GET"!==e.request.method||e.request.headers.has("range"))return;const s=new URL(e.request.url);s.protocol.startsWith("http")&&(s.hostname===self.location.hostname&&s.port!==self.location.port||(s.host===self.location.host&&t.has(s.pathname)?e.respondWith(caches.match(e.request)):"only-if-cached"!==e.request.cache&&e.respondWith(caches.open("offline1578264292735").then(async t=>{try{const s=await fetch(e.request);return t.put(e.request,s.clone()),s}catch(s){const n=await t.match(e.request);if(n)return n;throw s}}))))})}();