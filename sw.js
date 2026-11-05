/* ProMAC: funcionamento sem internet depois da primeira visita.
   Página: rede primeiro (para receber atualizações) e cópia guardada quando não há conexão.
   Imagens, fontes, PDF e bibliotecas: cópia guardada primeiro, atualizada em segundo plano.
   Vídeos (mp4) não são guardados, porque ocupam muito espaço. */
const VERSAO = "promac-v0.9.31-1";
const BASE = ["./", "index.html",
  "img/fig1_usos.webp", "img/fig2_fluxo.webp", "img/fig3_cartoes.webp", "img/fig4_semaforo.webp",
  "img/fig5_mapa.webp", "img/fig6_resumo.webp", "img/fig7_decisao.webp", "img/fig8_relance.webp",
  "video/ProMAC_demo_mini.jpg", "video/ProMAC_classificar_mini.jpg", "video/ProMAC_privacidade_mini.jpg",
  "video/ProMAC_ciclo0_mini.jpg", "video/ProMAC_decidir_mini.jpg"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSAO).then(c => Promise.all(BASE.map(u => c.add(u).catch(() => null)))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSAO).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;
  const url = new URL(r.url);
  if (/\.(mp4|webm)$/i.test(url.pathname) || r.headers.has("range")) return;
  const guardavel = url.origin === location.origin || /fonts\.(googleapis|gstatic)\.com|cdnjs\.cloudflare\.com/.test(url.host);
  if (!guardavel) return;
  if (r.mode === "navigate") {
    e.respondWith(fetch(r).then(resp => { const cp = resp.clone(); caches.open(VERSAO).then(c => c.put("index.html", cp)); return resp; })
      .catch(() => caches.match("index.html").then(x => x || caches.match("./"))));
    return;
  }
  e.respondWith(caches.match(r).then(hit => {
    const rede = fetch(r).then(resp => { if (resp && (resp.ok || resp.type === "opaque")) { const cp = resp.clone(); caches.open(VERSAO).then(c => c.put(r, cp)); } return resp; }).catch(() => hit);
    return hit || rede;
  }));
});
