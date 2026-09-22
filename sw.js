/* のとのおと美術館デジタルマップ — オフライン対応
   現地は電波が不安定なので、一度読んだ画面と写真は圏外でも開けるようにする。
   投稿データだけは必ず新しいものを取りに行き、取れなければ控えを返す。 */

const VERSION = "noto-map-v1";
const SHELL = "noto-shell-v1";
const MEDIA = "noto-media-v1";

const SHELL_FILES = [
  "./",
  "./index.html",
  "./app.js",
  "./styles.css",
  "./manifest.webmanifest",
  "./icon.svg",
];

self.addEventListener("install", (ev) => {
  ev.waitUntil(caches.open(SHELL).then((c) => c.addAll(SHELL_FILES)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", (ev) => {
  ev.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => ![SHELL, MEDIA].includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (ev) => {
  const req = ev.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  /* GitHub API への書き込み・読み取りには一切触れない */
  if (url.hostname === "api.github.com") return;

  /* 投稿データだけは新しいものを優先し、圏外のときだけ控えを返す。
     同じ raw.githubusercontent.com でも写真は下の「一度読んだら使い回す」に回す。 */
  if (url.pathname.endsWith("/data/spots.json")) {
    ev.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(MEDIA).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match(req).then((hit) => hit || Response.error())),
    );
    return;
  }

  /* 写真と地図タイルは、一度読んだものをそのまま使う */
  if (/\.(jpg|jpeg|png|webp|svg)$/i.test(url.pathname) || url.hostname.includes("tile") || url.hostname.includes("cyberjapandata")) {
    ev.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(MEDIA).then((c) => c.put(req, copy)).catch(() => {}); }
        return res;
      }).catch(() => hit || Response.error())),
    );
    return;
  }

  /* 画面そのものは、まず取りに行き、駄目なら控えを返す */
  ev.respondWith(
    fetch(req).then((res) => {
      if (res.ok && url.origin === location.origin) {
        const copy = res.clone();
        caches.open(SHELL).then((c) => c.put(req, copy)).catch(() => {});
      }
      return res;
    }).catch(() => caches.match(req).then((hit) => hit || caches.match("./index.html"))),
  );
});
