// 每次改版請同步更新 CACHE_NAME 與 index.html 內的 VERSION
const CACHE_NAME = "aurora-shell-v4";
const SHELL = ["./", "index.html", "manifest.json", "apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 只處理同網域的頁面檔案；NOAA、Open-Meteo、地圖圖磚一律直接連網，不快取，確保資料即時。
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req,{cache:"no-cache"}).then(res => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then(c => c.put(req, copy));
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match("index.html")))
  );
});
