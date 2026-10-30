// Helpers HTTP e utilidades comuns.

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...headers },
  });
}

export function uid(prefix) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 20)}`;
}

export function nowIso() {
  return new Date().toISOString();
}

export function clean(v, max = 2000) {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, max);
}

export function parseCookies(request) {
  const header = request.headers.get("cookie") || "";
  const out = {};
  for (const part of header.split(/;\s*/)) {
    if (!part) continue;
    const i = part.indexOf("=");
    if (i < 0) continue;
    out[part.slice(0, i)] = decodeURIComponent(part.slice(i + 1));
  }
  return out;
}

export function sessionCookie(token, secure, maxAgeSeconds) {
  const bits = [
    `central_session=${encodeURIComponent(token)}`,
    "HttpOnly",
    "SameSite=Lax",
    "Path=/",
    `Max-Age=${maxAgeSeconds}`,
  ];
  if (secure) bits.push("Secure");
  return bits.join("; ");
}

export function clearCookie(secure) {
  const bits = ["central_session=", "HttpOnly", "SameSite=Lax", "Path=/", "Max-Age=0"];
  if (secure) bits.push("Secure");
  return bits.join("; ");
}

// Comparação de hashes em tempo constante.
export function timingSafeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
