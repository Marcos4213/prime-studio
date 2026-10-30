// Rota da Educação. A casca da Central não é alterada aqui.
import { images } from "./media.js";
import { renderHome, renderDay, renderPrime, renderWeek, renderNotFound } from "./render.js";

const decoded = new Map();

function bytesFor(name) {
  const key = String(name || "").replace(/\.webp$/i, "");
  const b64 = images[key];
  if (!b64) return null;
  let bytes = decoded.get(key);
  if (!bytes) {
    const bin = atob(b64);
    bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    decoded.set(key, bytes);
  }
  return bytes;
}

function htmlResponse(html, status, method) {
  const headers = {
    "content-type": "text/html; charset=utf-8",
    "cache-control": "no-cache",
    "x-content-type-options": "nosniff",
    "referrer-policy": "same-origin",
  };
  if (method === "HEAD") return new Response(null, { status, headers });
  return new Response(html, { status, headers });
}

export function handleEducacao(request) {
  try {
    return routeEducacao(request);
  } catch (err) {
    console.log(JSON.stringify({ level: "error", msg: String(err?.message || err), feature: "educacao" }));
    return new Response("erro interno", { status: 500, headers: { "content-type": "text/plain; charset=utf-8" } });
  }
}

function routeEducacao(request) {
  const method = request.method;
  if (method !== "GET" && method !== "HEAD") {
    return new Response("método não permitido", { status: 405, headers: { allow: "GET, HEAD" } });
  }

  let path = new URL(request.url).pathname;
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);

  if (path.startsWith("/educacao/media/")) {
    const name = decodeURIComponent(path.slice("/educacao/media/".length));
    if (!/^[a-z]+\.webp$/i.test(name)) {
      return htmlResponse(renderNotFound(), 404, method);
    }
    const bytes = bytesFor(name);
    if (!bytes) return htmlResponse(renderNotFound(), 404, method);
    const headers = {
      "content-type": "image/webp",
      "cache-control": "public, max-age=604800",
      "x-content-type-options": "nosniff",
    };
    if (method === "HEAD") return new Response(null, { status: 200, headers });
    return new Response(bytes, { status: 200, headers });
  }

  let html = null;
  let status = 200;
  if (path === "/educacao") html = renderHome();
  else if (path === "/educacao/semana") html = renderWeek();
  else {
    const day = path.match(/^\/educacao\/dia\/([a-z]{3})$/);
    const prime = path.match(/^\/educacao\/prime\/([prime])$/);
    if (day) html = renderDay(day[1]);
    else if (prime) html = renderPrime(prime[1]);
  }
  if (!html) {
    html = renderNotFound();
    status = 404;
  }
  return htmlResponse(html, status, method);
}
